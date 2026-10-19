"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuWebSocket = void 0;
const socket_1 = require("../socket");
const error_1 = require("../../util/error");
const logger_1 = require("../../logger");
const error = (0, error_1.makeError)('socket/web/client');
const isBrowser = typeof window === 'object' && !!window && window['Object'] === Object;
let WS;
if (isBrowser) {
    WS = window['WebSocket'] || window['MozWebSocket'];
    if (!WS) {
        throw error(`no WebSocket support in browser`);
    }
}
else {
    WS = require.call(null, 'ws');
}
class MuWebSocket {
    state() {
        return this._state;
    }
    constructor(spec) {
        this._state = socket_1.MuSocketState.INIT;
        this._reliableSocket = null;
        this._unreliableSockets = [];
        this._onClose = (ev) => {
            if (!ev.wasClean) {
                this._logger.error(`WebSocket error: ${ev.code} ${ev.reason}`);
            }
        };
        this.close = () => {
            if (this._state === socket_1.MuSocketState.CLOSED) {
                return;
            }
            this._state = socket_1.MuSocketState.CLOSED;
            if (isBrowser) {
                window.removeEventListener('beforeunload', this.close);
            }
            if (this._reliableSocket) {
                this._reliableSocket.onmessage = null;
                this._reliableSocket.close();
                this._reliableSocket = null;
            }
            const sockets = this._unreliableSockets.slice();
            for (let i = 0; i < sockets.length; ++i) {
                sockets[i].onmessage = null;
                sockets[i].close();
            }
            this._unreliableSockets.length = 0;
        };
        this.sessionId = spec.sessionId;
        this._sessionProof = spec.sessionProof || '';
        this._url = spec.url;
        this._maxSockets = Math.max(1, spec.maxSockets || 5) | 0;
        this._logger = spec.logger || logger_1.MuDefaultLogger;
        this.bufferLimit = spec.bufferLimit || 1024;
    }
    open(spec) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            throw error(`socket had been opened`);
        }
        if (isBrowser) {
            window.addEventListener('beforeunload', this.close);
        }
        const self = this;
        function openSocket() {
            const address = new URL(self._url, isBrowser ? window.location.href : undefined);
            address.searchParams.set('sid', String(self.sessionId));
            const socket = new WS(address.toString(), self._sessionProof ? ['box3-game', `box3-proof.${self._sessionProof}`] : undefined);
            socket.onclose = function (ev) {
                if (self._state === socket_1.MuSocketState.INIT) {
                    self.close();
                    spec.close(ev);
                }
            };
            socket.onerror = function (ev) {
                console.error('WebSocket error', ev);
                self._logger.error(`WebSocket error ${ev}`);
            };
            socket.binaryType = 'arraybuffer';
            socket.onopen = function () {
                self._logger.log(`open web socket.  extensions: ${socket.extensions}.  protocol: ${socket.protocol}`);
                socket.onopen = null;
                if (self._state === socket_1.MuSocketState.CLOSED) {
                    self._logger.log('socket opened after connection closed');
                    socket.close();
                    return;
                }
                socket.onmessage = function (event) {
                    if (self._state === socket_1.MuSocketState.CLOSED) {
                        socket.onmessage = null;
                        socket.close();
                        return;
                    }
                    let reliable;
                    try {
                        if (typeof event.data !== 'string') {
                            throw error('first message should be a string');
                        }
                        reliable = JSON.parse(event.data).reliable;
                    }
                    catch (e) {
                        socket.onmessage = null;
                        self.close();
                        self._logger.error(e);
                        return;
                    }
                    if (reliable) {
                        socket.onmessage = function ({ data }) {
                            if (self._state !== socket_1.MuSocketState.OPEN) {
                                return;
                            }
                            if (typeof data === 'string') {
                                spec.message(data, false);
                            }
                            else {
                                spec.message(new Uint8Array(data), false);
                            }
                        };
                        socket.onclose = function (ev) {
                            self._logger.log('closing reliable socket');
                            self._onClose(ev);
                            self._reliableSocket = null;
                            socket.onmessage = null;
                            socket.onclose = null;
                            self.close();
                            spec.close(ev);
                        };
                        self._reliableSocket = socket;
                        self._state = socket_1.MuSocketState.OPEN;
                        spec.ready();
                    }
                    else {
                        socket.onmessage = function ({ data }) {
                            if (self._state !== socket_1.MuSocketState.OPEN) {
                                return;
                            }
                            if (typeof data === 'string') {
                                spec.message(data, true);
                            }
                            else {
                                spec.message(new Uint8Array(data), true);
                            }
                        };
                        socket.onclose = function (ev) {
                            self._logger.log('closing unreliable socket');
                            self._onClose(ev);
                            socket.onmessage = null;
                            socket.onclose = null;
                            const sockets = self._unreliableSockets;
                            for (let i = sockets.length - 1; i >= 0; --i) {
                                if (sockets[i] === socket) {
                                    sockets.splice(i, 1);
                                }
                            }
                            if (self._state !== socket_1.MuSocketState.CLOSED) {
                                self._logger.log('attempt to reopen unreliable socket');
                                openSocket();
                            }
                        };
                        self._unreliableSockets.push(socket);
                    }
                };
            };
        }
        for (let i = 0; i < this._maxSockets; ++i) {
            openSocket();
        }
    }
    send(data, unreliable) {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            return;
        }
        if (unreliable) {
            const sockets = this._unreliableSockets;
            if (sockets.length > 0) {
                let socket = sockets[0];
                let bufferedAmount = socket.bufferedAmount || 0;
                let idx = 0;
                for (let i = 1; i < sockets.length; ++i) {
                    const s = sockets[i];
                    const b = s.bufferedAmount || 0;
                    if (b < bufferedAmount) {
                        socket = s;
                        bufferedAmount = b;
                        idx = i;
                    }
                }
                if (bufferedAmount < this.bufferLimit) {
                    socket.send(data);
                    sockets.splice(idx, 1);
                    sockets.push(socket);
                }
            }
        }
        else if (this._reliableSocket) {
            this._reliableSocket.send(data);
        }
    }
    reliableBufferedAmount() {
        if (this._reliableSocket) {
            return this._reliableSocket.bufferedAmount;
        }
        else {
            return Infinity;
        }
    }
    unreliableBufferedAmount() {
        let amount = Infinity;
        for (let i = 0; i < this._unreliableSockets.length; ++i) {
            amount = Math.min(amount, this._unreliableSockets[i].bufferedAmount);
        }
        return amount;
    }
}
exports.MuWebSocket = MuWebSocket;
//# sourceMappingURL=client.js.map