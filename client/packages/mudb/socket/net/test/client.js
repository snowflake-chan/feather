"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const tcp = require("net");
const udp = require("dgram");
const port_1 = require("../../../util/port");
const server_1 = require("../server");
const client_1 = require("../client");
const socket_1 = require("../../socket");
function noop() { }
function randomId() {
    return Math.random().toString(36).substr(2);
}
test.onFinish(() => process.exit(0));
const tcpServer = tcp.createServer();
const udpServer = udp.createSocket({
    type: 'udp4',
});
const socketServer = new server_1.MuNetSocketServer({
    tcpServer,
    udpServer,
});
const UDP_HOST_ADDR = '127.0.0.1';
let tcpServerPort;
tcpServer.listen(() => {
    const addr = tcpServer.address();
    if (typeof addr === 'string') {
        tcpServerPort = +addr;
        console.log(`TCP server running on ${addr}`);
    }
    else {
        tcpServerPort = addr.port;
        console.log(`TCP server running on ${addr.address}:${addr.port}`);
    }
});
(0, port_1.findPort)((port) => {
    udpServer.bind({
        port,
        address: UDP_HOST_ADDR,
    }, () => console.log(`UDP server running on ${'' + udpServer.address()}`));
});
socketServer.start({
    ready: () => {
        (0, port_1.findPort)((udpPort) => {
            test('socket initial state', (t) => {
                const socket = new client_1.MuNetSocket({
                    sessionId: randomId(),
                    connectOpts: {
                        port: tcpServerPort,
                    },
                    bindOpts: {
                        port: udpPort,
                    },
                });
                t.equal(socket.state(), socket_1.MuSocketState.INIT, 'should be INIT');
                t.end();
            });
        });
        (0, port_1.findPort)((udpPort) => {
            test('socket.open() - when INIT', (t) => {
                t.plan(2);
                const socket = new client_1.MuNetSocket({
                    sessionId: randomId(),
                    connectOpts: {
                        port: tcpServerPort,
                    },
                    bindOpts: {
                        port: udpPort,
                    },
                });
                socket.open({
                    ready: () => {
                        t.ok(true, 'should invoke ready handler');
                        t.equal(socket.state(), socket_1.MuSocketState.OPEN, 'should change state to OPEN');
                    },
                    message: noop,
                    close: noop,
                });
            });
        });
        (0, port_1.findPort)((udpPort) => {
            test('socket.open() - when OPEN', (t) => {
                t.plan(1);
                const socket = new client_1.MuNetSocket({
                    sessionId: randomId(),
                    connectOpts: {
                        port: tcpServerPort,
                    },
                    bindOpts: {
                        port: udpPort,
                    },
                });
                socket.open({
                    ready: () => t.throws(() => socket.open({
                        ready: noop,
                        message: noop,
                        close: noop,
                    }), /opened/),
                    message: noop,
                    close: noop,
                });
            });
        });
        (0, port_1.findPort)((udpPort) => {
            test('socket.open() - when CLOSED', (t) => {
                t.plan(1);
                const socket = new client_1.MuNetSocket({
                    sessionId: randomId(),
                    connectOpts: {
                        port: tcpServerPort,
                    },
                    bindOpts: {
                        port: udpPort,
                    },
                });
                socket.open({
                    ready: () => socket.close(),
                    message: noop,
                    close: () => t.throws(() => socket.open({
                        ready: noop,
                        message: noop,
                        close: noop,
                    }), /opened/),
                });
            });
        });
        (0, port_1.findPort)((udpPort) => {
            test('socket.close() - when INIT', (t) => {
                const socket = new client_1.MuNetSocket({
                    sessionId: randomId(),
                    connectOpts: {
                        port: tcpServerPort,
                    },
                    bindOpts: {
                        port: udpPort,
                    },
                });
                socket.close();
                t.equal(socket.state(), socket_1.MuSocketState.CLOSED, 'should change state to CLOSED');
                t.end();
            });
        });
        (0, port_1.findPort)((udpPort) => {
            test('socket.close() - when OPEN', (t) => {
                t.plan(2);
                const socket = new client_1.MuNetSocket({
                    sessionId: randomId(),
                    connectOpts: {
                        port: tcpServerPort,
                    },
                    bindOpts: {
                        port: udpPort,
                    },
                });
                socket.open({
                    ready: () => socket.close(),
                    message: noop,
                    close: () => {
                        t.ok(true, 'should invoke close handler');
                        t.equal(socket.state(), socket_1.MuSocketState.CLOSED, 'should change state to CLOSED');
                    },
                });
            });
        });
        (0, port_1.findPort)((udpPort) => {
            test('socket.close() - when CLOSED', (t) => {
                t.plan(1);
                const socket = new client_1.MuNetSocket({
                    sessionId: randomId(),
                    connectOpts: {
                        port: tcpServerPort,
                    },
                    bindOpts: {
                        port: udpPort,
                    },
                });
                socket.open({
                    ready: () => socket.close(),
                    message: noop,
                    close: () => {
                        socket.close();
                        t.ok(true, 'should not invoke close handler');
                    },
                });
            });
        });
    },
    connection: noop,
    close: noop,
});
//# sourceMappingURL=client.js.map