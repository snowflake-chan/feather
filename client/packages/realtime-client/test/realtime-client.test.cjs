'use strict';
const { afterEach, expect, jest: jestTimers, test } = require('@jest/globals');
const { subscribeRealtime, createRealtimeClient } = require('@box/realtime-client');
class Socket {
    url;
    static instances = [];
    onopen;
    onmessage;
    onclose;
    sent = [];
    constructor(url) {
        this.url = url;
        Socket.instances.push(this);
    }
    send(value) {
        this.sent.push(JSON.parse(value));
    }
    close() {
        this.onclose?.();
    }
    event(value) {
        this.onmessage?.({ data: JSON.stringify(value) });
    }
}
const flush = async () => {
    for (let i = 0; i < 8; i++) {
        await Promise.resolve();
    }
};

test('client factories isolate identical keys and use injected handshake and socket adapters', async () => {
    Socket.instances = [];
    const requestSession = jestTimers.fn(async () => ({
        ticket: 'isolated-ticket',
        socketPath: '/socket',
    }));
    const config = {
        requestSession,
        pageURL: () => 'https://example.test/prefix/',
        createSocket: (url) => new Socket(url),
    };
    const first = createRealtimeClient(config);
    const second = createRealtimeClient(config);
    const one = first.subscribeRealtime('same-key', { body: {} }, () => {});
    const two = second.subscribeRealtime('same-key', { body: {} }, () => {});
    try {
        await flush();
        expect(requestSession).toHaveBeenCalledTimes(2);
        expect(Socket.instances).toHaveLength(2);
        expect(Socket.instances[0].url).toBe('wss://example.test/socket');
    } finally {
        one();
        two();
    }
});

test('custom handshake adapters cannot attach a ticket to a cross-origin socket', async () => {
    jestTimers.useFakeTimers();
    const createSocket = jestTimers.fn();
    const events = [];
    const client = createRealtimeClient({
        requestSession: async () => ({
            ticket: 'private-ticket',
            socketPath: 'https://other.test/socket',
        }),
        pageURL: () => 'https://example.test/',
        createSocket,
    });
    const stop = client.subscribeRealtime('origin', { body: {} }, (event) => events.push(event));
    try {
        await flush();
        expect(createSocket).not.toHaveBeenCalled();
        expect(events).toEqual([{ type: 'disconnected' }]);
    } finally {
        stop();
    }
});
afterEach(() => {
    jestTimers.useRealTimers();
    delete globalThis.window;
    delete globalThis.WebSocket;
});
test('shared connection authenticates, reconnects and stops without idle HTTP reads', async () => {
    jestTimers.useFakeTimers();
    Socket.instances = [];
    globalThis.window = {
        location: { href: 'https://engine.test/', origin: 'https://engine.test' },
    };
    globalThis.WebSocket = Socket;
    const fetchMock = jestTimers.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ ticket: 'ticket', socketPath: '/api/realtime/socket' }),
    }));
    globalThis.fetch = fetchMock;
    const events = [];
    const first = subscribeRealtime(
        'fixture',
        { body: { kind: 'presence-watch', maps: ['map-a'] } },
        (e) => events.push(e),
    );
    const second = subscribeRealtime(
        'fixture',
        { body: { kind: 'presence-watch', maps: ['map-a'] } },
        () => {},
    );
    try {
        await flush();
        (0, expect)(fetchMock).toHaveBeenCalledTimes(1);
        const ws = Socket.instances[0];
        (0, expect)(ws.url).toBe('wss://engine.test/api/realtime/socket');
        ws.onopen?.();
        (0, expect)(ws.sent).toEqual([{ type: 'connect', ticket: 'ticket' }]);
        ws.event({ type: 'ready' });
        jestTimers.advanceTimersByTime(60_000);
        await flush();
        (0, expect)(fetchMock).toHaveBeenCalledTimes(1);
        first();
        ws.event({ type: 'change', topic: 'players' });
        (0, expect)(events).toEqual([{ type: 'ready' }]);
        ws.close();
        jestTimers.advanceTimersByTime(1000);
        await flush();
        (0, expect)(fetchMock).toHaveBeenCalledTimes(2);
        second();
        jestTimers.advanceTimersByTime(60_000);
        await flush();
        (0, expect)(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
        first();
        second();
    }
});
test('unauthorized bootstrap stops retries and immediate unsubscribe cancels bootstrap', async () => {
    jestTimers.useFakeTimers();
    const fetchMock = jestTimers.fn(async () => ({ ok: false, status: 403 }));
    globalThis.fetch = fetchMock;
    const events = [];
    const stop = subscribeRealtime('forbidden', { body: { kind: 'admin-events' } }, (e) =>
        events.push(e),
    );
    try {
        await flush();
        (0, expect)(events).toEqual([{ type: 'unauthorized' }]);
        jestTimers.advanceTimersByTime(60_000);
        await flush();
        (0, expect)(fetchMock).toHaveBeenCalledTimes(1);
        const cancel = subscribeRealtime('cancel', { body: {} }, () => {});
        cancel();
        await flush();
        (0, expect)(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
        stop();
    }
});
