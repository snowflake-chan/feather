"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuChildProcessSocketServer = exports.MuChildProcessSocketClient = void 0;
const debug_1 = require("debug");
const socket_1 = require("../socket");
const debug = (0, debug_1.default)('mudb:socket:child-process:server');
function noop() {
    debug('noop invoked');
}
class MuChildProcessSocketClient {
    state() {
        return this._state;
    }
    constructor({ sessionId, socket, onClientClose, }) {
        this._state = socket_1.MuSocketState.INIT;
        this._onmessage = noop;
        this._closeCallbackPerOpen = noop;
        this._onMessage = (data) => {
            if (!data.message) {
                return;
            }
            this._onmessage(data.message, data.unreliable);
        };
        debug('new child-process socket client');
        this._socket = socket;
        this.sessionId = sessionId;
        this._closeCallbackPerClient = onClientClose;
    }
    open(spec) {
        debug('open child-process socket client');
        if (this._state === socket_1.MuSocketState.OPEN) {
            throw new Error('server-side child-process socket already open');
        }
        if (this._state === socket_1.MuSocketState.CLOSED) {
            throw new Error('server-side child-process socket already closed, cannot reopen');
        }
        this._onmessage = spec.message;
        this._closeCallbackPerOpen = spec.close;
        this.addChildProcessListeners();
        this._state = socket_1.MuSocketState.OPEN;
        spec.ready();
    }
    addChildProcessListeners() {
        this._socket.on('message', this._onMessage);
    }
    removeChildProcessListeners() {
        this._socket.removeListener('message', this._onMessage);
    }
    send(message, unreliable_) {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            return;
        }
        const unreliable = !!unreliable_;
        this._socket.send({
            message,
            unreliable,
        });
    }
    close() {
        debug('close child-process socket client');
        if (this._state !== socket_1.MuSocketState.OPEN) {
            this._state = socket_1.MuSocketState.CLOSED;
            return;
        }
        this.removeChildProcessListeners();
        this._state = socket_1.MuSocketState.CLOSED;
        this._closeCallbackPerClient();
        this._closeCallbackPerOpen();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
exports.MuChildProcessSocketClient = MuChildProcessSocketClient;
MuChildProcessSocketClient.clientCount = 0;
class MuChildProcessSocketServer {
    state() {
        return this._state;
    }
    constructor() {
        this._state = socket_1.MuSocketServerState.INIT;
        this._pendingSockets = [];
        this.clients = [];
        this._onconnection = noop;
        this._onclose = noop;
        process.on('message', (data) => {
            if (data.type === 'connect') {
                const client = new MuChildProcessSocketClient({
                    sessionId: data.payload.sessionId,
                    socket: process,
                    onClientClose: () => {
                        this.clients.splice(this.clients.indexOf(client), 1);
                    },
                });
                this.clients.push(client);
                this._handleConnection(client);
            }
            else if (data.type === 'close') {
                this.clients.forEach((c) => c.close());
            }
        });
    }
    _handleConnection(socket) {
        switch (this._state) {
            case socket_1.MuSocketServerState.RUNNING:
                debug('connection');
                this._onconnection(socket);
                break;
            case socket_1.MuSocketServerState.SHUTDOWN:
                socket.close();
                break;
            default:
                this._pendingSockets.push(socket);
        }
    }
    start(spec) {
        if (this._state === socket_1.MuSocketServerState.RUNNING) {
            throw new Error('Child-process socket server already started');
        }
        if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
            throw new Error('Child-process socket server already started and shut down, cannot restart');
        }
        this._state = socket_1.MuSocketServerState.RUNNING;
        this._onconnection = spec.connection;
        this._onclose = spec.close;
        spec.ready();
        debug('socket server is ready');
        while (this._pendingSockets.length > 0) {
            this._handleConnection(this._pendingSockets.pop());
        }
    }
    close() {
        if (this._state !== socket_1.MuSocketServerState.RUNNING) {
            this._state = socket_1.MuSocketServerState.SHUTDOWN;
            return;
        }
        this._state = socket_1.MuSocketServerState.SHUTDOWN;
        debug(`close all ${this.clients.length} clients`);
        for (let i = 0; i < this.clients.length; ++i) {
            this.clients[i].close();
        }
        debug('socket server close');
        this._onclose();
    }
}
exports.MuChildProcessSocketServer = MuChildProcessSocketServer;
//# sourceMappingURL=server.js.map