"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const http = require("http");
const server_1 = require("../../web/server");
const index_1 = require("../index");
const server_2 = require("../../../server");
const client_1 = require("../../web/client");
const index_2 = require("../index");
const client_2 = require("../../../client");
const schema_1 = require("./_/schema");
const port_1 = require("../../../util/port");
function randStr() {
    return Math.random().toString(36).substring(2);
}
test.onFinish(() => process.exit(0));
test.onFailure(() => process.exit(1));
const PING_OPCODE = 0x9;
const PONG_OPCODE = 0xA;
const server = http.createServer();
const socketServer = new server_1.MuWebSocketServer({ server });
const debugSocketServer = new index_1.MuDebugServer({ socketServer });
const muServer = new server_2.MuServer(debugSocketServer);
muServer.protocol(schema_1.protocolSchema).configure({
    message: {
        ping: (client, data, unreliable) => {
            const response = data === PING_OPCODE ? PONG_OPCODE : data;
            client.message.pong(response, !!unreliable);
        },
    },
});
muServer.start();
(0, port_1.findPort)((port) => {
    server.listen(port);
    const url = `ws://127.0.0.1:${port}`;
    test('WebSocket - simulating network latency on client side', (t) => {
        t.plan(2);
        let timestamp;
        const upstreamLatency = 75;
        const downstreamLatency = 25;
        const socket = new client_1.MuWebSocket({
            sessionId: randStr(),
            url,
        });
        const debugSocket = new index_2.MuDebugSocket({
            socket,
            outLatency: upstreamLatency,
            inLatency: downstreamLatency,
        });
        const muClient = new client_2.MuClient(debugSocket);
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
    });
    test('WebSocket - maintaining order of messages from client side', (t) => {
        let head = 10;
        const end = 64;
        t.plan(end - head);
        const socket = new client_1.MuWebSocket({
            sessionId: randStr(),
            url,
        });
        const debugSocket = new index_2.MuDebugSocket({
            socket,
            outLatency: 75,
            outJitter: 10,
            inLatency: 25,
            inJitter: 10,
        });
        const muClient = new client_2.MuClient(debugSocket);
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
                    clientProtocol.server.message.ping(i);
                }
            },
        });
    });
});
//# sourceMappingURL=web.js.map