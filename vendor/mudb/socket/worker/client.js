"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuWorkerSocket = void 0;
exports.createWorkerSocket = createWorkerSocket;
const socket_1 = require("../socket");
function noop() { }
class MuWorkerSocket {
    state() { return this._state; }
    constructor(sessionId, socket) {
        this._state = socket_1.MuSocketState.INIT;
        this._onclose = noop;
        this.sessionId = sessionId;
        this._socket = socket;
        this._socket.onerror = (ev) => {
            console.error(`${ev.message} (${ev.filename}:${ev.lineno})`);
        };
    }
    open(spec) {
        if (this._state === socket_1.MuSocketState.OPEN) {
            throw new Error('client-side Worker socket already open');
        }
        if (this._state === socket_1.MuSocketState.CLOSED) {
            throw new Error('client-side Worker socket already closed, cannot reopen');
        }
        this._state = socket_1.MuSocketState.OPEN;
        this._socket.onmessage = (ev) => {
            if (ev.data.sessionId !== this.sessionId) {
                this._socket.terminate();
                throw new Error('invalid ACK from server');
            }
            this._socket.onmessage = ({ data }) => {
                spec.message(data.message, data.unreliable);
            };
            this._onclose = spec.close;
            spec.ready();
        };
        this._socket.postMessage({ sessionId: this.sessionId });
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
        this._socket.terminate();
        this._onclose();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
exports.MuWorkerSocket = MuWorkerSocket;
function createWorkerSocket(spec) {
    return new MuWorkerSocket(spec.sessionId, spec.serverWorker);
}
//# sourceMappingURL=client.js.map