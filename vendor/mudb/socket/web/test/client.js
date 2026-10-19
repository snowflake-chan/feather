"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const http = require("http");
const port_1 = require("../../../util/port");
const server_1 = require("../server");
const client_1 = require("../client");
const socket_1 = require("../../socket");
function noop() { }
function sessionId() {
    return Math.random().toString(36).substring(2);
}
tape('session id', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    const sid = 'abc`1234567890-=~!@#$%^&*()_+[]\;\',./{}|:"<>?xyz';
    const port = yield (0, port_1.findPortAsync)();
    const socket = new client_1.MuWebSocket({
        sessionId: sid,
        url: `ws://127.0.0.1:${port}`,
    });
    socketServer.start({
        ready: () => {
            socket.open({
                ready: noop,
                message: noop,
                close: noop,
            });
        },
        connection: (sock) => {
            t.equal(sock.sessionId, sid, `should be escaped`);
            t.end();
        },
        close: () => { },
    });
    server.listen(port);
}));
(0, port_1.findPort)((port) => {
    const server = http.createServer();
    const socketServer = new server_1.MuWebSocketServer({ server });
    socketServer.start({
        ready: noop,
        connection: noop,
        close: noop,
    });
    server.listen(port);
    const url = `ws://127.0.0.1:${port}`;
    tape('socket.open() - when INIT', (t) => {
        t.plan(2);
        let callsToReady = 0;
        const socket = new client_1.MuWebSocket({
            sessionId: sessionId(),
            url,
        });
        t.equal(socket.state(), socket_1.MuSocketState.INIT, 'initial state should be INIT');
        socket.open({
            ready: () => {
                ++callsToReady;
                if (callsToReady > 1) {
                    t.fail('should not call ready handler more than once');
                }
                t.equal(socket.state(), socket_1.MuSocketState.OPEN, 'should change socket state to OPEN');
            },
            message: noop,
            close: noop,
        });
    });
    tape('socket.open() - when OPEN', (t) => {
        t.plan(1);
        const socket = new client_1.MuWebSocket({
            sessionId: sessionId(),
            url,
        });
        socket.open({
            ready: () => {
                t.throws(() => socket.open({
                    ready: noop,
                    message: noop,
                    close: noop,
                }));
            },
            message: noop,
            close: noop,
        });
    });
    tape('socket.open() - when CLOSED', (t) => {
        t.plan(1);
        const socket = new client_1.MuWebSocket({
            sessionId: sessionId(),
            url,
        });
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
    tape('socket.close() - when OPEN', (t) => {
        t.plan(1);
        const socket = new client_1.MuWebSocket({
            sessionId: sessionId(),
            url,
        });
        socket.open({
            ready: () => socket.close(),
            message: noop,
            close: () => t.equal(socket.state(), socket_1.MuSocketState.CLOSED, 'should change socket state to CLOSED'),
        });
    });
    tape('socket.close() - when INIT', (t) => {
        const socket = new client_1.MuWebSocket({
            sessionId: sessionId(),
            url,
        });
        socket.close();
        t.equal(socket.state(), socket_1.MuSocketState.CLOSED, 'should change socket state to CLOSED');
        t.end();
    });
});
//# sourceMappingURL=client.js.map