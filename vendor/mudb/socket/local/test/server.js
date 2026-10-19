"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const __1 = require("../");
const __2 = require("../");
const socket_1 = require("../../socket");
function noop() { }
function id() {
    return Math.random().toString(36).substr(2);
}
test('server initial state', (t) => {
    const server = (0, __1.createLocalSocketServer)();
    t.equal(server.state(), socket_1.MuSocketServerState.INIT, 'should be INIT');
    t.end();
});
test('server.start() - when INIT', (t) => {
    t.plan(4);
    const server = (0, __1.createLocalSocketServer)();
    server.start({
        ready: () => {
            t.equal(server.state(), socket_1.MuSocketServerState.RUNNING, 'should change server state to RUNNING');
            setTimeout(() => {
                t.equal(server.clients.length, 1, 'should handle pending connections');
                server.close();
            }, 0);
        },
        connection: (socket) => t.true(socket instanceof __2.MuLocalSocket, 'should set message handler'),
        close: (error) => t.equal(error, undefined, 'should set close handler'),
    });
    (0, __1.createLocalSocket)({
        sessionId: id(),
        server,
    }).open({
        ready: noop,
        message: noop,
        close: noop,
    });
});
test('server.start() - when RUNNING', (t) => {
    t.plan(1);
    const server = (0, __1.createLocalSocketServer)();
    server.start({
        ready: () => {
            server.start({
                ready: noop,
                connection: noop,
                close: () => t.fail('should not call spec.close()'),
            });
        },
        connection: noop,
        close: (error) => t.equal(typeof error, 'string', 'should invoke close handler with error message'),
    });
});
test('server.start() - when SHUTDOWN', (t) => {
    t.plan(2);
    const server = (0, __1.createLocalSocketServer)();
    server.start({
        ready: () => {
            server.close();
            server.start({
                ready: noop,
                connection: noop,
                close: () => t.fail('should not call spec.close()'),
            });
        },
        connection: noop,
        close: (error) => {
            if (error) {
                t.equal(typeof error, 'string', 'should invoke close handler with error message');
                t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should not change server state');
            }
        },
    });
});
test('server.close() - when RUNNING', (t) => {
    t.plan(5);
    const server = (0, __1.createLocalSocketServer)();
    const clientSocket = (0, __1.createLocalSocket)({
        sessionId: id(),
        server,
    });
    server.start({
        ready: noop,
        connection: (socket) => socket.open({
            ready: () => server.close(),
            message: noop,
            close: noop,
        }),
        close: (error) => {
            t.equal(error, undefined, 'should invoke close handler without error message');
            t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change server state to SHUTDOWN');
            t.equal(server.clients.length, 0, 'should remove connection from server');
            t.equal(clientSocket.state(), socket_1.MuSocketState.CLOSED, 'should close client socket');
            t.equal(clientSocket._duplex.state(), socket_1.MuSocketState.CLOSED, 'should close server socket');
        },
    });
    clientSocket.open({
        ready: noop,
        message: noop,
        close: noop,
    });
});
test('server.close() - when RUNNING, sockets not OPEN', (t) => {
    t.plan(5);
    const server = (0, __1.createLocalSocketServer)();
    const clientSocket = (0, __1.createLocalSocket)({
        sessionId: id(),
        server,
    });
    server.start({
        ready: () => server.close(),
        connection: noop,
        close: (error) => {
            t.equal(error, undefined, 'should invoke close handler without error message');
            t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change server state to SHUTDOWN');
            t.equal(server.clients.length, 0, 'should remove connection from server');
            setTimeout(() => {
                t.equal(clientSocket.state(), socket_1.MuSocketState.CLOSED, 'should close client socket');
                t.equal(clientSocket._duplex.state(), socket_1.MuSocketState.CLOSED, 'should close server socket');
            }, 0);
        },
    });
    clientSocket.open({
        ready: noop,
        message: noop,
        close: noop,
    });
});
test('server.close() - when INIT', (t) => {
    const server = (0, __1.createLocalSocketServer)();
    server.close();
    t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change server state to SHUTDOWN');
    t.end();
});
test('server.close() - when SHUTDOWN', (t) => {
    t.plan(1);
    let callsToOnClose = 0;
    const server = (0, __1.createLocalSocketServer)();
    server.start({
        ready: () => {
            server.close();
            server.close();
            t.equal(callsToOnClose, 1, 'should not invoke close handler');
        },
        connection: noop,
        close: () => ++callsToOnClose,
    });
});
//# sourceMappingURL=server.js.map