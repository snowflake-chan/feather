"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuNetSocketServer = void 0;
const socket_1 = require("../socket");
const util_1 = require("./util");
const system_1 = require("../../scheduler/system");
function noop() { }
class MuNetSocketClient {
    state() {
        return this._state;
    }
    constructor(sessionId, reliableSocket, unreliableSocket, remotePort, remoteAddr, scheduler, removeConnection) {
        this._state = socket_1.MuSocketState.INIT;
        this._pendingMessages = [];
        this.onmessage = noop;
        this._onclose = noop;
        this.sessionId = sessionId;
        this._reliableSocket = reliableSocket;
        this._unreliableSocket = unreliableSocket;
        this._remotePort = remotePort;
        this._remoteAddr = remoteAddr;
        this.scheduler = scheduler;
        this._reliableSocket.on('message', (msg) => {
            if ((0, util_1.isJSON)(msg)) {
                this._pendingMessages.push(msg.toString());
            }
            else {
                this._pendingMessages.push(new Uint8Array(msg).slice(0));
            }
        });
        this._reliableSocket.on('close', (hadError) => {
            this._state = socket_1.MuSocketState.CLOSED;
            this._onclose();
            removeConnection();
            if (hadError) {
                console.error('mudb/net-socket: socket was closed due to a transmission error');
            }
        });
    }
    open(spec) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            throw new Error('mudb/net-socket: socket was already opened');
        }
        this.scheduler.setTimeout(() => {
            const onmessage = this.onmessage = spec.message;
            this._onclose = spec.close;
            this._state = socket_1.MuSocketState.OPEN;
            spec.ready();
            this._reliableSocket.on('message', (msg) => {
                if (this._state !== socket_1.MuSocketState.OPEN) {
                    return;
                }
                if ((0, util_1.isJSON)(msg)) {
                    onmessage(msg.toString(), false);
                }
                else {
                    onmessage(new Uint8Array(msg), false);
                }
            });
            for (let i = 0; i < this._pendingMessages.length; ++i) {
                onmessage(this._pendingMessages[i], false);
            }
            this._pendingMessages.length = 0;
        }, 0);
    }
    send(data, unreliable) {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            return;
        }
        if (unreliable) {
            const buf = Buffer.from(data);
            this._unreliableSocket.send(buf, 0, buf.length, this._remotePort, this._remoteAddr);
        }
        else {
            this._reliableSocket.write(data);
        }
    }
    close() {
        if (this._state === socket_1.MuSocketState.CLOSED) {
            return;
        }
        this._state = socket_1.MuSocketState.CLOSED;
        this._reliableSocket.end();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
class MuNetSocketServer {
    state() {
        return this._state;
    }
    constructor(spec) {
        this._state = socket_1.MuSocketServerState.INIT;
        this.clients = [];
        this._unreliableMsgHandlers = {};
        this._onclose = noop;
        this._tcpServer = spec.tcpServer;
        this._udpServer = spec.udpServer;
        this.scheduler = spec.scheduler || system_1.MuSystemScheduler;
    }
    start(spec) {
        if (this._state !== socket_1.MuSocketServerState.INIT) {
            throw new Error('mudb/net-socket: server was already started');
        }
        this._tcpServer.on('connection', (socket) => {
            socket.setNoDelay(true);
            (0, util_1.messagify)(socket);
            socket.on('error', (err) => {
                console.error(err.stack);
            });
            socket.once('message', (message) => {
                try {
                    const clientInfo = JSON.parse(message.toString());
                    if (typeof clientInfo.i !== 'string' ||
                        typeof clientInfo.p !== 'number' ||
                        typeof clientInfo.a !== 'string') {
                        throw new Error('bad client info');
                    }
                    const udpServerInfo = this._udpServer.address();
                    if (typeof udpServerInfo === 'string') {
                        socket.write(JSON.stringify({
                            p: '',
                            a: '' + udpServerInfo,
                        }));
                    }
                    else {
                        socket.write(JSON.stringify({
                            p: udpServerInfo.port,
                            a: udpServerInfo.address,
                        }));
                    }
                    const url = `${clientInfo.a}:${clientInfo.p}`;
                    const client = new MuNetSocketClient(clientInfo.i, socket, this._udpServer, clientInfo.p, clientInfo.a, this.scheduler, () => {
                        this.clients.splice(this.clients.indexOf(client), 1);
                        delete this._unreliableMsgHandlers[url];
                    });
                    this.clients.push(client);
                    this._unreliableMsgHandlers[url] = function (msg) {
                        if (client.state() !== socket_1.MuSocketState.OPEN) {
                            return;
                        }
                        if ((0, util_1.isJSON)(msg)) {
                            client.onmessage(msg.toString(), true);
                        }
                        else {
                            client.onmessage(new Uint8Array(msg), true);
                        }
                    };
                    spec.connection(client);
                }
                catch (e) {
                    console.error(`mudb/net-socket: destroying socket due to ${e}`);
                    socket.destroy();
                }
            });
        });
        this._udpServer.on('listening', () => {
            let addr = this._udpServer.address();
            if (typeof addr !== 'string') {
                addr = addr.address;
            }
            if (addr === '0.0.0.0' || addr === '::') {
                console.warn(`mudb/net-socket: UDP server is bound to ${addr}. Are you sure?`);
            }
        });
        this._udpServer.on('message', (msg, client) => {
            const onmessage = this._unreliableMsgHandlers[`${client.address}:${client.port}`];
            if (typeof onmessage === 'function') {
                onmessage(msg);
            }
        });
        this._onclose = spec.close;
        this._state = socket_1.MuSocketServerState.RUNNING;
        spec.ready();
    }
    close() {
        if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
            return;
        }
        this._state = socket_1.MuSocketServerState.SHUTDOWN;
        this._tcpServer.close(this._onclose);
        this._udpServer.close();
    }
}
exports.MuNetSocketServer = MuNetSocketServer;
//# sourceMappingURL=server.js.map