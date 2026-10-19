"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const WebSocket = require("ws");
const http = require("http");
const socket_1 = require("../../socket");
const server_1 = require("../server");
function noop() { }
test.onFinish(() => process.exit(0));
test('server initial state', (t) => {
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    t.equal(socketServer.state(), socket_1.MuSocketServerState.INIT, 'should be INIT');
    t.end();
});
test('socketServer.start() - when INIT', (t) => {
    t.plan(2);
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    socketServer.start({
        ready: () => {
            t.pass('should invoke ready handler');
            t.equal(socketServer.state(), socket_1.MuSocketServerState.RUNNING, 'should change server state to RUNNING');
        },
        connection: noop,
        close: noop,
    });
});
test('socketServer.start() - when RUNNING', (t) => {
    t.plan(1);
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    socketServer.start({
        ready: () => {
            t.throws(() => socketServer.start({
                ready: noop,
                connection: noop,
                close: noop,
            }));
        },
        connection: noop,
        close: noop,
    });
});
test('socketServer.start() - when SHUTDOWN', (t) => {
    t.plan(1);
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    socketServer.start({
        ready: () => {
            socketServer.close();
            t.throws(() => socketServer.start({
                ready: noop,
                connection: noop,
                close: noop,
            }));
        },
        connection: noop,
        close: noop,
    });
});
test('when a client connects', (t) => {
    t.plan(3);
    function id() {
        return Math.random().toString(36).substr(2);
    }
    let url = '';
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    socketServer.start({
        ready: () => {
            t.pass('should invoke ready handler');
            let numSockets = 0;
            const numSocketsToOpen = 5;
            const sessionId = id();
            function openSocket() {
                const socket = new WebSocket(`${url}?sid=${sessionId}`);
                socket.binaryType = 'arraybuffer';
                socket.onopen = () => {
                    socket.onmessage = (ev) => {
                        if (typeof ev.data === 'string') {
                            const firstSocket = numSockets === 0;
                            if (firstSocket && JSON.parse(ev.data).reliable) {
                                ++numSockets;
                                t.pass('server should indicate first socket as reliable one');
                            }
                            if (!firstSocket && !JSON.parse(ev.data).reliable) {
                                ++numSockets;
                            }
                            if (numSockets === numSocketsToOpen) {
                                t.pass('server should indicate other sockets as unreliable ones');
                            }
                            if (numSockets > numSocketsToOpen) {
                                t.fail(`should not open more than ${numSocketsToOpen} sockets`);
                            }
                        }
                    };
                };
            }
            for (let i = 0; i < numSocketsToOpen; ++i) {
                openSocket();
            }
        },
        connection: noop,
        close: noop,
    });
    server.listen(() => {
        const addr = server.address();
        if (typeof addr === 'string') {
            url = `ws://${addr}`;
        }
        else {
            url = `ws://127.0.0.1:${addr.port}`;
        }
    });
});
test('socketServer.close() - when INIT', (t) => {
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    socketServer.close();
    t.equal(socketServer.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change server state to SHUTDOWN');
    t.end();
});
test('socketServer.close() - when RUNNING', (t) => {
    t.plan(1);
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    socketServer.start({
        ready: () => {
            socketServer.close();
            t.equal(socketServer.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change server state to SHUTDOWN');
        },
        connection: noop,
        close: noop,
    });
});
//# sourceMappingURL=server.js.map