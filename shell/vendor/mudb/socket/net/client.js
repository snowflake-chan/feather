"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuNetSocket = void 0;
const tcp = require("net");
const udp = require("dgram");
const socket_1 = require("../socket");
const util_1 = require("./util");
class MuNetSocket {
    state() {
        return this._state;
    }
    constructor(spec) {
        this._state = socket_1.MuSocketState.INIT;
        this._remotePort = 0;
        this._remoteAddr = '127.0.0.1';
        this.sessionId = spec.sessionId;
        this._reliableSocket = spec.tcpSocket || new tcp.Socket();
        this._connectOpts = spec.connectOpts;
        this._unreliableSocket = spec.udpSocket || udp.createSocket({
            type: 'udp4',
            reuseAddr: true,
        });
        this._bindOpts = spec.bindOpts;
    }
    open(spec) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            throw new Error('mudb/net-socket: socket was already opened');
        }
        const onmessage = spec.message;
        this._reliableSocket.connect(this._connectOpts, () => {
            this._reliableSocket.setNoDelay(true);
            (0, util_1.messagify)(this._reliableSocket);
            this._reliableSocket.once('message', (info) => {
                if (this._state !== socket_1.MuSocketState.INIT) {
                    return;
                }
                const serverInfo = JSON.parse(info.toString());
                if (typeof serverInfo.p !== 'number' ||
                    typeof serverInfo.a !== 'string') {
                    throw new Error('mudb/net-socket: bad server info');
                }
                this._remotePort = serverInfo.p;
                this._remoteAddr = serverInfo.a;
                this._state = socket_1.MuSocketState.OPEN;
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
                this._reliableSocket.on('close', (hadError) => {
                    this._state = socket_1.MuSocketState.CLOSED;
                    spec.close();
                    if (hadError) {
                        console.error('mudb/net-socket: socket was closed due to a transmission error');
                    }
                });
                spec.ready();
            });
            this._unreliableSocket.bind(this._bindOpts, () => {
                this._unreliableSocket.on('message', (msg) => {
                    if (this._state !== socket_1.MuSocketState.OPEN) {
                        return;
                    }
                    if ((0, util_1.isJSON)(msg)) {
                        onmessage(msg.toString(), true);
                    }
                    else {
                        onmessage(new Uint8Array(msg), true);
                    }
                });
                const socketInfo = this._unreliableSocket.address();
                if (typeof socketInfo === 'string') {
                    this._reliableSocket.write(JSON.stringify({
                        i: this.sessionId,
                        p: '',
                        a: '' + socketInfo,
                    }));
                }
                else {
                    this._reliableSocket.write(JSON.stringify({
                        i: this.sessionId,
                        p: socketInfo.port,
                        a: socketInfo.address,
                    }));
                }
            });
        });
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
        this._unreliableSocket.close();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
exports.MuNetSocket = MuNetSocket;
//# sourceMappingURL=client.js.map