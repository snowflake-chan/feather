"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuLocalSocketServer = exports.MuLocalSocket = void 0;
exports.createLocalSocketServer = createLocalSocketServer;
exports.createLocalSocket = createLocalSocket;
const stream_1 = require("../../stream");
const socket_1 = require("../socket");
const system_1 = require("../../scheduler/system");
function noop() { }
class BufferWrapper {
    constructor(data) {
        this._buffer = (0, stream_1.allocBuffer)(data.length);
        this.bytes = this._buffer.uint8.subarray(0, data.length);
        this.bytes.set(data);
    }
    free() {
        (0, stream_1.freeBuffer)(this._buffer);
    }
}
class MuLocalSocket {
    state() { return this._state; }
    constructor(sessionId, server, isClientSocket, scheduler) {
        this._duplex = null;
        this._onMessage = noop;
        this._onClose = noop;
        this._state = socket_1.MuSocketState.INIT;
        this._pendingUnreliableMessages = [];
        this._drainUnreliable = () => {
            if (this._state !== socket_1.MuSocketState.OPEN) {
                return;
            }
            const message = this._pendingUnreliableMessages.pop();
            if (typeof message === 'string') {
                this._duplex._onMessage(message, true);
            }
            else if (message) {
                this._duplex._onMessage(message.bytes, true);
                message.free();
            }
        };
        this._pendingMessages = [];
        this._drain = () => {
            this._drainTimeout = 0;
            if (this._state !== socket_1.MuSocketState.OPEN) {
                return;
            }
            if (this._duplex._onMessage === noop) {
                this.scheduler.setTimeout(() => this._drain(), 0);
                return;
            }
            for (let i = 0; i < this._pendingMessages.length; ++i) {
                const message = this._pendingMessages[i];
                if (typeof message === 'string') {
                    this._duplex._onMessage(message, false);
                }
                else {
                    this._duplex._onMessage(message.bytes, false);
                    message.free();
                }
            }
            this._pendingMessages.length = 0;
        };
        this.sessionId = sessionId;
        this._server = server;
        this._isClientSocket = isClientSocket;
        this.scheduler = scheduler;
    }
    open(spec) {
        this.scheduler.setTimeout(() => {
            if (this._state === socket_1.MuSocketState.OPEN) {
                this._onClose('socket already open');
                return;
            }
            if (this._state === socket_1.MuSocketState.CLOSED) {
                this._onClose('cannot reopen closed socket');
                return;
            }
            this._state = socket_1.MuSocketState.OPEN;
            this._onMessage = spec.message;
            this._onClose = spec.close;
            if (this._isClientSocket) {
                this._server._handleConnection(this._duplex);
            }
            spec.ready();
            this._drain();
            while (this._pendingUnreliableMessages.length) {
                this._drainUnreliable();
            }
        }, 0);
    }
    send(data_, unreliable) {
        if (this._state === socket_1.MuSocketState.CLOSED) {
            return;
        }
        const data = typeof data_ === 'string' ? data_ : new BufferWrapper(data_);
        if (unreliable) {
            this._pendingUnreliableMessages.push(data);
            this.scheduler.setTimeout(this._drainUnreliable, 0);
        }
        else {
            this._pendingMessages.push(data);
            if (!this._drainTimeout) {
                this._drainTimeout = this.scheduler.setTimeout(this._drain, 0);
            }
        }
    }
    close() {
        if (this._state === socket_1.MuSocketState.CLOSED) {
            return;
        }
        this._state = socket_1.MuSocketState.CLOSED;
        this._server._removeSocket(this);
        this._onClose();
        this._duplex.close();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
exports.MuLocalSocket = MuLocalSocket;
function removeIfExists(array, element) {
    const idx = array.indexOf(element);
    if (idx >= 0) {
        array[idx] = array[array.length - 1];
        array.pop();
    }
}
class MuLocalSocketServer {
    state() { return this._state; }
    constructor(scheduler) {
        this.scheduler = scheduler;
        this.clients = [];
        this._pendingSockets = [];
        this._state = socket_1.MuSocketServerState.INIT;
        this._onConnection = noop;
        this._onClose = noop;
    }
    _handleConnection(socket) {
        switch (this._state) {
            case socket_1.MuSocketServerState.RUNNING:
                this.clients.push(socket);
                this._onConnection(socket);
                break;
            case socket_1.MuSocketServerState.SHUTDOWN:
                socket.close();
                break;
            default:
                this._pendingSockets.push(socket);
        }
    }
    _removeSocket(socket) {
        removeIfExists(this.clients, socket);
        removeIfExists(this._pendingSockets, socket);
    }
    start(spec) {
        this.scheduler.setTimeout(() => {
            if (this._state === socket_1.MuSocketServerState.RUNNING) {
                this._onClose('local socket server already running');
                return;
            }
            if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
                this._onClose('local socket server already shut down, cannot restart');
                return;
            }
            this._state = socket_1.MuSocketServerState.RUNNING;
            this._onConnection = spec.connection;
            this._onClose = spec.close;
            while (this._pendingSockets.length > 0) {
                this._handleConnection(this._pendingSockets.pop());
            }
            spec.ready();
        }, 0);
    }
    close() {
        if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
            return;
        }
        if (this._state === socket_1.MuSocketServerState.INIT) {
            this._state = socket_1.MuSocketServerState.SHUTDOWN;
            return;
        }
        this._state = socket_1.MuSocketServerState.SHUTDOWN;
        for (let i = this.clients.length - 1; i >= 0; --i) {
            this.clients[i].close();
        }
        this._onClose();
    }
}
exports.MuLocalSocketServer = MuLocalSocketServer;
function createLocalSocketServer(spec) {
    return new MuLocalSocketServer(spec && spec.scheduler || system_1.MuSystemScheduler);
}
function createLocalSocket(spec) {
    const scheduler = spec.scheduler || system_1.MuSystemScheduler;
    const clientSocket = new MuLocalSocket(spec.sessionId, spec.server, true, scheduler);
    const serverSocket = new MuLocalSocket(spec.sessionId, spec.server, false, scheduler);
    clientSocket._duplex = serverSocket;
    serverSocket._duplex = clientSocket;
    return clientSocket;
}
//# sourceMappingURL=index.js.map