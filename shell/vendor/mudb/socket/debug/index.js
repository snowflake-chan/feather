"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuDebugServer = exports.MuDebugSocket = void 0;
const stream_1 = require("../../stream");
const logger_1 = require("../../logger");
class MuBufferWrapper {
    constructor(bytes) {
        this._buffer = (0, stream_1.allocBuffer)(bytes.length);
        this.bytes = this._buffer.uint8.subarray(0, bytes.length);
        this.bytes.set(bytes);
    }
    free() {
        (0, stream_1.freeBuffer)(this._buffer);
    }
}
function calcDelay(latency, jitter) {
    return latency + Math.floor(Math.random() * jitter);
}
function drain(pendingMessages, handler) {
    const message = pendingMessages.shift();
    if (typeof message === 'string') {
        handler(message);
    }
    else if (message) {
        handler(message.bytes);
        message.free();
    }
}
class MuDebugSocket {
    state() {
        return this.socket.state();
    }
    constructor(spec) {
        this.inLatency = 0;
        this.inJitter = 0;
        this.inPacketLoss = 0;
        this.outLatency = 0;
        this.outJitter = 0;
        this.outPacketLoss = 0;
        this._inbox = [];
        this._outbox = [];
        this.socket = spec.socket;
        this.sessionId = this.socket.sessionId;
        if (typeof spec.inLatency === 'number') {
            this.inLatency = Math.max(0, spec.inLatency);
        }
        if (typeof spec.inJitter === 'number') {
            this.inJitter = Math.max(0, spec.inJitter);
        }
        if (typeof spec.inPacketLoss === 'number') {
            this.inPacketLoss = Math.min(100, Math.max(0, spec.inPacketLoss));
        }
        if (typeof spec.outLatency === 'number') {
            this.outLatency = Math.max(0, spec.outLatency);
        }
        if (typeof spec.outJitter === 'number') {
            this.outJitter = Math.max(0, spec.outJitter);
        }
        if (typeof spec.outPacketLoss === 'number') {
            this.outPacketLoss = Math.min(100, Math.max(0, spec.outPacketLoss));
        }
        this.logger = spec.logger || logger_1.MuDefaultLogger;
    }
    open(spec) {
        this.socket.open({
            ready: () => {
                try {
                    spec.ready();
                }
                catch (e) {
                    this.logger.exception(e);
                }
            },
            message: (data, unreliable) => {
                if (unreliable) {
                    if (Math.random() * 100 < this.inPacketLoss) {
                        return;
                    }
                    setTimeout(() => {
                        try {
                            spec.message(data, true);
                        }
                        catch (e) {
                            this.logger.exception(e);
                        }
                    }, calcDelay(this.inLatency, this.inJitter));
                }
                else {
                    const message = typeof data === 'string' ? data : new MuBufferWrapper(data);
                    this._inbox.push(message);
                    setTimeout(() => {
                        try {
                            drain(this._inbox, (data_) => spec.message(data_, false));
                        }
                        catch (e) {
                            this.logger.exception(e);
                        }
                    }, calcDelay(this.inLatency, this.inJitter));
                }
            },
            close: () => {
                try {
                    spec.close();
                }
                catch (e) {
                    this.logger.exception(e);
                }
            },
        });
    }
    send(data, unreliable) {
        const message = typeof data === 'string' ? data : new MuBufferWrapper(data);
        this._outbox.push(message);
        const unreliable_ = !!unreliable;
        if (unreliable_) {
            if (Math.random() * 100 < this.outPacketLoss) {
                return;
            }
        }
        setTimeout(() => drain(this._outbox, (data_) => {
            try {
                this.socket.send(data_, unreliable_);
            }
            catch (e) {
                this.logger.exception(e);
            }
        }), calcDelay(this.outLatency, this.outJitter));
    }
    close() {
        this.socket.close();
    }
    reliableBufferedAmount() {
        return this.socket.reliableBufferedAmount();
    }
    unreliableBufferedAmount() {
        return this.socket.unreliableBufferedAmount();
    }
}
exports.MuDebugSocket = MuDebugSocket;
class MuDebugServer {
    state() {
        return this.socketServer.state();
    }
    constructor(spec) {
        this.clients = [];
        this.socketServer = spec.socketServer;
        this.inLatency = spec.inLatency || 0;
        this.inJitter = spec.inJitter || 0;
        this.inPacketLoss = spec.inPacketLoss || 0;
        this.outLatency = spec.outLatency || 0;
        this.outJitter = spec.outJitter || 0;
        this.outPacketLoss = spec.outPacketLoss || 0;
        this.logger = spec.logger || logger_1.MuDefaultLogger;
    }
    start(spec) {
        this.socketServer.start({
            ready: () => {
                try {
                    spec.ready();
                }
                catch (e) {
                    this.logger.exception(e);
                }
            },
            connection: (socket) => {
                const client = new MuDebugSocket({
                    socket,
                    inLatency: this.inLatency,
                    inJitter: this.inJitter,
                    inPacketLoss: this.inPacketLoss,
                    outLatency: this.outLatency,
                    outJitter: this.outJitter,
                    outPacketLoss: this.outPacketLoss,
                });
                this.clients.push(client);
                try {
                    spec.connection(client);
                }
                catch (e) {
                    this.logger.exception(e);
                }
            },
            close: () => {
                try {
                    spec.close();
                }
                catch (e) {
                    this.logger.exception(e);
                }
            },
        });
    }
    close() {
        this.socketServer.close();
    }
}
exports.MuDebugServer = MuDebugServer;
//# sourceMappingURL=index.js.map