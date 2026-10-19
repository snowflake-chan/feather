"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tcp = require("net");
const udp = require("dgram");
const test = require("tape");
const server_1 = require("../server");
const socket_1 = require("../../socket");
function noop() { }
test('server initial state', (t) => {
    const server = new server_1.MuNetSocketServer({
        tcpServer: tcp.createServer(),
        udpServer: udp.createSocket({
            type: 'udp4',
        }),
    });
    t.equal(server.state(), socket_1.MuSocketServerState.INIT, 'should be INIT');
    t.end();
});
test('server.start() - when INIT', (t) => {
    t.plan(2);
    const server = new server_1.MuNetSocketServer({
        tcpServer: tcp.createServer(),
        udpServer: udp.createSocket({
            type: 'udp4',
        }),
    });
    server.start({
        ready: () => {
            t.ok(true, 'should invoke ready handler');
            t.equal(server.state(), socket_1.MuSocketServerState.RUNNING, 'should change state to RUNNING');
        },
        connection: noop,
        close: noop,
    });
});
test('server.start() - when RUNNING', (t) => {
    t.plan(1);
    const server = new server_1.MuNetSocketServer({
        tcpServer: tcp.createServer(),
        udpServer: udp.createSocket({
            type: 'udp4',
        }),
    });
    server.start({
        ready: () => t.throws(() => server.start({
            ready: noop,
            connection: noop,
            close: noop,
        }), /started/),
        connection: noop,
        close: noop,
    });
});
test('server.start() - when SHUTDOWN', (t) => {
    t.plan(1);
    const server = new server_1.MuNetSocketServer({
        tcpServer: tcp.createServer(),
        udpServer: udp.createSocket({
            type: 'udp4',
        }),
    });
    server.start({
        ready: () => server.close(),
        connection: noop,
        close: () => t.throws(() => server.start({
            ready: noop,
            connection: noop,
            close: noop,
        }), /started/),
    });
});
test('server.close() - when INIT', (t) => {
    const server = new server_1.MuNetSocketServer({
        tcpServer: tcp.createServer(),
        udpServer: udp.createSocket({
            type: 'udp4',
        }),
    });
    server.close();
    t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change state to SHUTDOWN');
    t.end();
});
test('server.close() - when RUNNING', (t) => {
    t.plan(2);
    const tcpServer = tcp.createServer();
    const server = new server_1.MuNetSocketServer({
        tcpServer,
        udpServer: udp.createSocket({
            type: 'udp4',
        }),
    });
    tcpServer.listen();
    server.start({
        ready: () => server.close(),
        connection: noop,
        close: (error) => {
            t.equal(error, undefined, 'should not invoke close handler with an error');
            t.equal(server.state(), socket_1.MuSocketServerState.SHUTDOWN, 'should change state to SHUTDOWN');
        },
    });
});
test('server.close() - when SHUTDOWN', (t) => {
    t.plan(1);
    const tcpServer = tcp.createServer();
    const server = new server_1.MuNetSocketServer({
        tcpServer,
        udpServer: udp.createSocket({
            type: 'udp4',
        }),
    });
    tcpServer.listen();
    server.start({
        ready: () => server.close(),
        connection: noop,
        close: () => {
            server.close();
            t.ok(true, 'should not invoke close handler');
        },
    });
});
//# sourceMappingURL=server.js.map