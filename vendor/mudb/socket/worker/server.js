"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuWorkerSocketServer = void 0;
exports.createWorkerSocketServer = createWorkerSocketServer;
const socket_1 = require("../socket");
const system_1 = require("../../scheduler/system");
function noop() { }
class MuWorkerServerSocket {
    state() { return this._state; }
    constructor(sessionId, socket, scheduler) {
        this._state = socket_1.MuSocketState.INIT;
        this._onclose = noop;
        this.sessionId = sessionId;
        this._socket = socket;
        this.scheduler = scheduler || system_1.MuSystemScheduler;
    }
    open(spec) {
        if (this._state === socket_1.MuSocketState.OPEN) {
            throw new Error('server-side Worker socket already open');
        }
        if (this._state === socket_1.MuSocketState.CLOSED) {
            throw new Error('server-side Worker socket already closed, cannot reopen');
        }
        this.scheduler.setTimeout(() => {
            this._state = socket_1.MuSocketState.OPEN;
            this._socket.onmessage = ({ data }) => {
                spec.message(data.message, data.unreliable);
            };
            this._onclose = spec.close;
            this._socket.postMessage({ sessionId: this.sessionId });
            spec.ready();
        }, 0);
    }
    send(message, unreliable_) {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            return;
        }
        const unreliable = !!unreliable_;
        if (typeof message === 'string') {
            this._socket.postMessage({
                message,
                unreliable,
            });
        }
        else {
            this._socket.postMessage({
                message,
                unreliable,
            }, [message.buffer]);
        }
    }
    close() {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            this._state = socket_1.MuSocketState.CLOSED;
            return;
        }
        this._state = socket_1.MuSocketState.CLOSED;
        this._socket.close();
        this._onclose();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
class MuWorkerSocketServer {
    state() { return this._state; }
    constructor(scheduler) {
        this._state = socket_1.MuSocketServerState.INIT;
        this._pendingSockets = [];
        this.clients = [];
        this._onconnection = noop;
        this._onclose = noop;
        this.scheduler = scheduler || system_1.MuSystemScheduler;
    }
    _handleConnection(socket) {
        switch (this._state) {
            case socket_1.MuSocketServerState.RUNNING:
                this._onconnection(socket);
                this.clients.push(socket);
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
            throw new Error('Worker socket server already running');
        }
        if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
            throw new Error('Worker socket server already shut down, cannot restart');
        }
        this.scheduler.setTimeout(() => {
            this._state = socket_1.MuSocketServerState.RUNNING;
            this._onconnection = spec.connection;
            this._onclose = spec.close;
            while (this._pendingSockets.length > 0) {
                this._handleConnection(this._pendingSockets.pop());
            }
            spec.ready();
        }, 0);
    }
    listen() {
        self.onmessage = ({ data }) => {
            if (data.sessionId) {
                this._handleConnection(new MuWorkerServerSocket(data.sessionId, self));
            }
        };
        console.log('socket server listening');
    }
    close() {
        if (this._state !== socket_1.MuSocketServerState.RUNNING) {
            this._state = socket_1.MuSocketServerState.SHUTDOWN;
            return;
        }
        this._state = socket_1.MuSocketServerState.SHUTDOWN;
        for (let i = this.clients.length - 1; i >= 0; --i) {
            this.clients[i].close();
        }
        this._onclose();
    }
}
exports.MuWorkerSocketServer = MuWorkerSocketServer;
function createWorkerSocketServer() {
    return new MuWorkerSocketServer();
}
//# sourceMappingURL=server.js.map