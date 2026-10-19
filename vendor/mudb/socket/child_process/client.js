"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuChildProcessSocket = void 0;
const debug_1 = require("debug");
const socket_1 = require("../socket");
const debug = (0, debug_1.default)('mudb:socket:child-process:client');
class MuChildProcessSocket {
    state() {
        return this._state;
    }
    constructor(sessionId, _childProcess) {
        this.sessionId = sessionId;
        this._childProcess = _childProcess;
        this._state = socket_1.MuSocketState.INIT;
        this._onMessage = (data) => {
            this._spec.message(data.message, data.unreliable);
        };
        this._onChildProcessClose = (code, signal) => {
            var _a;
            debug(`close child process socket since child process closed with code ${code} and signal ${signal}`);
            this._state = socket_1.MuSocketState.CLOSED;
            (_a = this._spec) === null || _a === void 0 ? void 0 : _a.close(signal);
        };
    }
    open(spec) {
        debug(`open start with state: ${this._state}`);
        if (this._state === socket_1.MuSocketState.OPEN) {
            throw new Error('client-side child-process socket already opened');
        }
        if (this._state === socket_1.MuSocketState.CLOSED) {
            throw new Error('client-side child-process socket already closed, cannot reopen');
        }
        this._spec = spec;
        this.addProcessListeners();
        this._state = socket_1.MuSocketState.OPEN;
        this.sendInternal({
            type: 'connect',
            payload: {
                sessionId: this.sessionId,
            },
        });
        spec.ready();
        debug('child-process socket is ready');
    }
    send(message, unreliable = false) {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            return;
        }
        this._childProcess.send({
            message,
            unreliable,
        });
    }
    close() {
        var _a;
        debug('closing child-process socket');
        if (this._state !== socket_1.MuSocketState.OPEN) {
            this._state = socket_1.MuSocketState.CLOSED;
            return;
        }
        this.removeProcessListeners();
        this._state = socket_1.MuSocketState.CLOSED;
        this.sendInternal({ type: 'close' });
        (_a = this._spec) === null || _a === void 0 ? void 0 : _a.close();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
    addProcessListeners() {
        this._childProcess.on('message', this._onMessage);
        this._childProcess.on('close', this._onChildProcessClose);
    }
    removeProcessListeners() {
        this._childProcess.removeListener('message', this._onMessage);
        this._childProcess.removeListener('close', this._onChildProcessClose);
    }
    sendInternal(message) {
        this._childProcess.send(message);
    }
}
exports.MuChildProcessSocket = MuChildProcessSocket;
//# sourceMappingURL=client.js.map