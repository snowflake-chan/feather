"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const test = require("tape");
const client_1 = require("../client");
const socket_1 = require("../../socket");
function noop() { }
function createChildProcess() {
    return (0, child_process_1.fork)((0, path_1.join)(__dirname, './child_process.ts'), undefined, {
        execArgv: ['-r', 'ts-node/register'],
        stdio: 'inherit',
    });
}
function sessionId() {
    return Math.random().toString(36).substring(0, 2);
}
test('socket initial state', (t) => {
    const socket = new client_1.MuChildProcessSocket(sessionId(), createChildProcess());
    t.equal(socket.state(), socket_1.MuSocketState.INIT, 'should be MuSocketState.INIT');
    t.end();
});
test('socket.open() - when INIT', (t) => {
    t.plan(2);
    const socket = new client_1.MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        ready: () => {
            t.ok(true, 'should invoke ready handler');
            t.equal(socket.state(), socket_1.MuSocketState.OPEN, 'should change state to MuSocketState.OPEN');
        },
        message: noop,
        close: noop,
    });
});
test('socket.open() - when OPEN', (t) => {
    t.plan(1);
    const socket = new client_1.MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        ready: () => t.throws(() => socket.open({
            ready: noop,
            message: noop,
            close: noop,
        })),
        message: noop,
        close: noop,
    });
});
test('socket.open() - when CLOSED', (t) => {
    t.plan(1);
    const socket = new client_1.MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        ready: () => socket.close(),
        message: noop,
        close: () => t.throws(() => socket.open({
            ready: noop,
            message: noop,
            close: noop,
        })),
    });
});
test('socket.close() - when OPEN', (t) => {
    t.plan(2);
    const socket = new client_1.MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        ready: () => socket.close(),
        message: noop,
        close: (error) => {
            t.equal(error, undefined, 'should invoke close handler without error message');
            t.equal(socket.state(), socket_1.MuSocketState.CLOSED, 'should change state to MuSocketState.CLOSED');
        },
    });
});
test('socket.close() - when INIT', (t) => {
    const socket = new client_1.MuChildProcessSocket(sessionId(), createChildProcess());
    socket.close();
    t.equal(socket.state(), socket_1.MuSocketState.CLOSED, 'should change state to MuSocketState.CLOSED');
    t.end();
});
test('socket.close() - when CLOSED', (t) => {
    const socket = new client_1.MuChildProcessSocket(sessionId(), createChildProcess());
    socket.open({
        ready: () => socket.close(),
        message: noop,
        close: () => {
            socket.close();
            t.ok(true, 'should not invoke close handler');
            t.end();
        },
    });
});
//# sourceMappingURL=client.js.map