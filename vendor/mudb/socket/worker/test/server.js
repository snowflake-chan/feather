"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const server_1 = require("../server");
const socket_1 = require("../../socket");
function noop() { }
test('workerSocketServer initial state', (t) => {
    const server = (0, server_1.createWorkerSocketServer)();
    t.equal(server.state(), socket_1.MuSocketServerState.INIT, 'should be MuSocketServerState.INIT');
    t.end();
});
test('workerSocketServer.start() - when INIT', (t) => {
    t.plan(2);
    const server = (0, server_1.createWorkerSocketServer)();
    server.start({
        ready: () => {
            t.ok(true, 'should invoke ready handler');
            t.equal(server.state(), socket_1.MuSocketServerState.RUNNING, 'should change state to MuSocketServerState.RUNNING');
        },
        connection: noop,
        close: noop,
    });
});
test('workerSocketServer.start() - when RUNNING', (t) => {
    t.plan(1);
    const server = (0, server_1.createWorkerSocketServer)();
    server.start({
        ready: () => t.throws(() => server.start({
            ready: noop,
            connection: noop,
            close: noop,
        })),
        connection: noop,
        close: noop,
    });
});
test('workerSocketServer.start() - when SHUTDOWN', (t) => {
    t.plan(1);
    const server = (0, server_1.createWorkerSocketServer)();
    server.start({
        ready: () => server.close(),
        connection: noop,
        close: () => t.throws(() => server.start({
            ready: noop,
            connection: noop,
            close: noop,
        })),
    });
});
test('workerSocketServer.close() - when RUNNING', (t) => {
    t.plan(2);
    const server = (0, server_1.createWorkerSocketServer)();
    server.start({
        ready: () => server.close(),
        connection: noop,
        close: (error) => {
            t.equal(error, undefined, 'should invoke close handler with no error message');
            t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change state to MuSocketServerState.SHUTDOWN');
        },
    });
});
test('workerSocketServer.close() - when INIT', (t) => {
    const server = (0, server_1.createWorkerSocketServer)();
    server.close();
    t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change state to MuSocketServerState.SHUTDOWN');
    t.end();
});
test('workerSocketServer.close() - when SHUTDOWN', (t) => {
    const server = (0, server_1.createWorkerSocketServer)();
    server.start({
        ready: () => server.close(),
        connection: noop,
        close: () => {
            server.close();
            t.ok(true, 'should not invoke close handler');
            t.end();
        },
    });
});
//# sourceMappingURL=server.js.map