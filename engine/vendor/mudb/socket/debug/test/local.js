"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const server_1 = require("../../../server");
const client_1 = require("../../../client");
const local_1 = require("../../local");
const index_1 = require("../index");
const schema_1 = require("./_/schema");
const PING_OPCODE = 0x9;
const PONG_OPCODE = 0xA;
function randomId() {
    return Math.random().toString(36).substr(2);
}
test('LocalSocket - simulating network latency on client side', (t) => {
    t.plan(3);
    let timestamp;
    const upstreamLatency = 75;
    const downstreamLatency = 25;
    const socketServer = (0, local_1.createLocalSocketServer)();
    const muServer = new server_1.MuServer(socketServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                if (data === PING_OPCODE) {
                    const delay = Date.now() - timestamp;
                    t.ok(delay >= upstreamLatency, `server should receive opcode after >=${upstreamLatency} ms`);
                    client.message.pong(PONG_OPCODE);
                }
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const debugSocket = new index_1.MuDebugSocket({
                socket,
                outLatency: upstreamLatency,
                inLatency: downstreamLatency,
            });
            const muClient = new client_1.MuClient(debugSocket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        const delay = Date.now() - timestamp;
                        const latency = upstreamLatency + downstreamLatency;
                        t.equal(data, PONG_OPCODE);
                        t.ok(delay >= latency, `client should receive opcode after >=${latency} ms`);
                    },
                },
            });
            muClient.start({
                ready: () => {
                    clientProtocol.server.message.ping(PING_OPCODE);
                    timestamp = Date.now();
                },
            });
        },
    });
});
test('LocalSocket - simulating network latency on server side', (t) => {
    t.plan(3);
    let timestamp;
    const upstreamLatency = 75;
    const downstreamLatency = 25;
    const socketServer = (0, local_1.createLocalSocketServer)();
    const debugServer = new index_1.MuDebugServer({
        socketServer,
        inLatency: upstreamLatency,
        outLatency: downstreamLatency,
    });
    const muServer = new server_1.MuServer(debugServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                if (data === PING_OPCODE) {
                    const delay = Date.now() - timestamp;
                    t.ok(delay >= upstreamLatency, `server should receive opcode after >=${upstreamLatency}`);
                    client.message.pong(PONG_OPCODE);
                }
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const muClient = new client_1.MuClient(socket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        const delay = Date.now() - timestamp;
                        const latency = upstreamLatency + downstreamLatency;
                        t.equal(data, PONG_OPCODE);
                        t.ok(delay >= latency, `client should receive opcode after >=${latency} ms`);
                    },
                },
            });
            muClient.start({
                ready: () => {
                    clientProtocol.server.message.ping(PING_OPCODE);
                    timestamp = Date.now();
                },
            });
        },
    });
});
test('LocalSocket - simulating network latency on both sides', (t) => {
    t.plan(3);
    let timestamp;
    const upstreamLatency = 75;
    const downstreamLatency = 25;
    const socketServer = (0, local_1.createLocalSocketServer)();
    const debugServer = new index_1.MuDebugServer({
        socketServer,
        inLatency: upstreamLatency,
        outLatency: downstreamLatency,
    });
    const muServer = new server_1.MuServer(debugServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                if (data === PING_OPCODE) {
                    const delay = Date.now() - timestamp;
                    t.ok(delay >= 2 * upstreamLatency, `server should receive opcode after >=${2 * upstreamLatency} ms`);
                    client.message.pong(PONG_OPCODE);
                }
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const debugSocket = new index_1.MuDebugSocket({
                socket,
                outLatency: upstreamLatency,
                inLatency: downstreamLatency,
            });
            const muClient = new client_1.MuClient(debugSocket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        const delay = Date.now() - timestamp;
                        const latency = upstreamLatency + downstreamLatency;
                        t.equal(data, PONG_OPCODE);
                        t.ok(delay >= 2 * latency, `client should receive opcode after >=${2 * latency} ms`);
                    },
                },
            });
            muClient.start({
                ready: () => {
                    clientProtocol.server.message.ping(PING_OPCODE);
                    timestamp = Date.now();
                },
            });
        },
    });
});
test('LocalSocket - maintaining order of messages from client side', (t) => {
    let head = 0;
    const end = 32;
    t.plan(end - head);
    const socketServer = (0, local_1.createLocalSocketServer)();
    const muServer = new server_1.MuServer(socketServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                client.message.pong(data);
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const debugSocket = new index_1.MuDebugSocket({
                socket,
                outLatency: 75,
                outJitter: 10,
                inLatency: 25,
                inJitter: 10,
            });
            const muClient = new client_1.MuClient(debugSocket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        t.equal(data, head++);
                    },
                },
            });
            muClient.start({
                ready: () => {
                    for (let i = head; i < end; ++i) {
                        clientProtocol.server.message.ping(i, false);
                    }
                },
            });
        },
    });
});
test('LocalSocket - maintaining order of messages from server side', (t) => {
    let head = 0;
    const end = 32;
    t.plan(end - head);
    const socketServer = (0, local_1.createLocalSocketServer)();
    const debugServer = new index_1.MuDebugServer({
        socketServer,
        inLatency: 75,
        inJitter: 10,
        outLatency: 25,
        outJitter: 10,
    });
    const muServer = new server_1.MuServer(debugServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                client.message.pong(data);
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const muClient = new client_1.MuClient(socket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        t.equal(data, head++);
                    },
                },
            });
            muClient.start({
                ready: () => {
                    for (let i = head; i < end; ++i) {
                        clientProtocol.server.message.ping(i, false);
                    }
                },
            });
        },
    });
});
test('LocalSocket - maintaining order of messages from both sides', (t) => {
    let head = 0;
    const end = 32;
    t.plan(end - head);
    const socketServer = (0, local_1.createLocalSocketServer)();
    const debugServer = new index_1.MuDebugServer({
        socketServer,
        inLatency: 75,
        inJitter: 10,
        outLatency: 25,
        outJitter: 10,
    });
    const muServer = new server_1.MuServer(debugServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                client.message.pong(data);
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const debugSocket = new index_1.MuDebugSocket({
                socket,
                outLatency: 75,
                outJitter: 10,
                inLatency: 25,
                inJitter: 10,
            });
            const muClient = new client_1.MuClient(debugSocket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        t.equal(data, head++);
                    },
                },
            });
            muClient.start({
                ready: () => {
                    for (let i = head; i < end; ++i) {
                        clientProtocol.server.message.ping(i, false);
                    }
                },
            });
        },
    });
});
test('LocalSocket - simulating packet loss on client side', (t) => {
    t.plan(1);
    const socketServer = (0, local_1.createLocalSocketServer)();
    const muServer = new server_1.MuServer(socketServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                if (data === PING_OPCODE) {
                    t.pass('server should receive opcode');
                    client.message.pong(PONG_OPCODE, true);
                }
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const debugSocket = new index_1.MuDebugSocket({
                socket,
                inPacketLoss: 100,
            });
            const muClient = new client_1.MuClient(debugSocket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        if (data === PONG_OPCODE) {
                            t.fail('client should not receive opcode');
                        }
                    },
                },
            });
            muClient.start({
                ready: () => {
                    clientProtocol.server.message.ping(PING_OPCODE);
                },
            });
        },
    });
});
test('LocalSocket - simulating packet loss on server side', (t) => {
    t.plan(1);
    const socketServer = (0, local_1.createLocalSocketServer)();
    const debugServer = new index_1.MuDebugServer({
        socketServer,
        outPacketLoss: 100,
    });
    const muServer = new server_1.MuServer(debugServer);
    const serverProtocol = muServer.protocol(schema_1.protocolSchema);
    serverProtocol.configure({
        message: {
            ping: (client, data) => {
                if (data === PING_OPCODE) {
                    t.pass('server should receive opcode');
                    client.message.pong(PONG_OPCODE, true);
                }
            },
        },
    });
    muServer.start({
        ready: () => {
            const socket = (0, local_1.createLocalSocket)({
                sessionId: randomId(),
                server: socketServer,
            });
            const muClient = new client_1.MuClient(socket);
            const clientProtocol = muClient.protocol(schema_1.protocolSchema);
            clientProtocol.configure({
                message: {
                    pong: (data) => {
                        if (data === PONG_OPCODE) {
                            t.fail('client should not receive opcode');
                        }
                    },
                },
            });
            muClient.start({
                ready: () => {
                    clientProtocol.server.message.ping(PING_OPCODE);
                },
            });
        },
    });
});
//# sourceMappingURL=local.js.map