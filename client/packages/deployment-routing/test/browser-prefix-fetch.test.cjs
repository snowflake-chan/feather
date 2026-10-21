'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const test = require('node:test');
const bootstrap = require('@box/deployment-routing/browser');

function adaptedFetch() {
    const calls = [];
    class TrackedRequest extends Request {
        constructor(input, init) {
            super(input, init);
            this.streamingUpload = init instanceof Request && init.body !== null;
        }
    }
    const window = {
        location: { origin: 'http://engine.test' },
        open() {},
        fetch: async (input, options) => {
            calls.push({ input, options });
            return { status: 200 };
        },
    };
    vm.runInNewContext(bootstrap({ basePath: '/abc', peerPaths: ['/voxa'] }), {
        window,
        Request: TrackedRequest,
        URL,
        Blob,
        navigator: {},
        XMLHttpRequest: class {
            open() {}
        },
        history: { pushState() {}, replaceState() {} },
        document: { readyState: 'loading', documentElement: {}, addEventListener() {} },
        MutationObserver: class {
            observe() {}
        },
    });
    return { fetch: window.fetch, calls, Request: TrackedRequest };
}

test('prefixed Request uploads retain a buffered body and request options', async () => {
    for (const method of ['POST', 'PATCH']) {
        const adapted = adaptedFetch();
        const abort = new AbortController();
        const request = new adapted.Request('http://engine.test/api/local/blob', {
            method,
            body: 'model-data',
            headers: { 'content-type': 'application/octet-stream' },
            credentials: 'include',
            signal: abort.signal,
        });
        await adapted.fetch(request);
        const sent = adapted.calls[0].input;
        assert.equal(sent.url, 'http://engine.test/abc/api/local/blob');
        assert.equal(
            sent.streamingUpload,
            false,
            'rewriting must not turn a buffered upload into a stream',
        );
        assert.equal(sent.method, method);
        assert.equal(sent.credentials, 'include');
        assert.equal(sent.headers.get('content-type'), 'application/octet-stream');
        assert.equal(await sent.text(), 'model-data');
        abort.abort();
        assert.equal(sent.signal.aborted, true);
    }
});

test('fetch init can override a Request body during prefix rewriting', async () => {
    const adapted = adaptedFetch();
    const request = new adapted.Request('http://engine.test/api/play-library', {
        method: 'POST',
        body: 'old',
    });
    await adapted.fetch(request, { method: 'PATCH', body: 'new' });
    const { input, options } = adapted.calls[0];
    const sent = new Request(input, options);
    assert.equal(sent.method, 'PATCH');
    assert.equal(await sent.text(), 'new');
});

test('already prefixed and foreign Requests pass through unchanged', async () => {
    const adapted = adaptedFetch();
    for (const url of [
        'http://engine.test/abc/api/test',
        'http://engine.test/voxa/api/test',
        'http://other.test/api/test',
    ]) {
        const request = new adapted.Request(url, { method: 'POST', body: 'data' });
        await adapted.fetch(request);
        assert.equal(adapted.calls.at(-1).input, request);
        assert.equal(request.bodyUsed, false);
    }
});
