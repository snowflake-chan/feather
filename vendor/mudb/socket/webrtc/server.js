"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRTCSocketServer = exports.MuRTCSocketClient = void 0;
const system_1 = require("../../scheduler/system");
const logger_1 = require("../../logger");
const socket_1 = require("../socket");
const rtc_1 = require("./rtc");
const error_1 = require("../../util/error");
const error = (0, error_1.makeError)('socket/webrtc/server');
const isBrowser = typeof self !== undefined && !!self && self['Object'] === Object;
function noop() { }
class MuRTCSocketClient {
    state() { return this._state; }
    constructor(sessionId, pc, answerOpts, signal, connection, serverClose, logger) {
        this._state = socket_1.MuSocketState.INIT;
        this._signal = noop;
        this._onMessage = noop;
        this._onClose = noop;
        this._serverClose = noop;
        this._reliableChannel = null;
        this._unreliableChannel = null;
        this.sessionId = sessionId;
        this._pc = pc;
        this._answerOpts = answerOpts;
        this._signal = (data) => {
            signal(data, sessionId);
        };
        this._serverClose = serverClose;
        this._logger = logger;
        pc.onicecandidate = ({ candidate }) => {
            if (this._state === socket_1.MuSocketState.INIT) {
                if (candidate) {
                    this._signal(candidate.toJSON());
                }
            }
        };
        pc.oniceconnectionstatechange = () => {
            if (this._state === socket_1.MuSocketState.INIT) {
                if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
                    logger.error(`ICE connection ${pc.iceConnectionState}`);
                    this.close();
                }
                else {
                    logger.log(`${sessionId} ICE connection state: ${pc.iceConnectionState}`);
                }
            }
        };
        pc.onconnectionstatechange = () => {
            if (this._state !== socket_1.MuSocketState.CLOSED) {
                if (pc.connectionState === 'failed') {
                    logger.error(`connection failed`);
                    this.close();
                }
            }
        };
        pc.ondatachannel = ({ channel }) => {
            if (this._state !== socket_1.MuSocketState.INIT) {
                return;
            }
            if (!channel) {
                this._logger.error('`channel` property is missing`');
                this.close();
                return;
            }
            channel.onopen = () => {
                if (this._state === socket_1.MuSocketState.CLOSED) {
                    return;
                }
                this._logger.log(`${channel.label} channel is open`);
                if (this._reliableChannel && this._unreliableChannel &&
                    this._reliableChannel.readyState === 'open' &&
                    this._unreliableChannel.readyState === 'open') {
                    connection(this);
                }
            };
            channel.onerror = (e) => {
                if (this._state !== socket_1.MuSocketState.CLOSED) {
                    this.close(e);
                }
            };
            channel.onclose = () => {
                if (this._state !== socket_1.MuSocketState.CLOSED) {
                    this.close(`${channel.label} channel closed unexpectedly`);
                }
            };
            if (/unreliable/.test(channel.label)) {
                this._unreliableChannel = channel;
                this._unreliableChannel.binaryType = 'arraybuffer';
                this._unreliableChannel.onmessage = ({ data }) => {
                    if (typeof data !== 'string') {
                        this._onMessage(new Uint8Array(data).subarray(0), true);
                    }
                    else {
                        this._onMessage(data, true);
                    }
                };
            }
            else if (/reliable/.test(channel.label)) {
                this._reliableChannel = channel;
                this._reliableChannel.binaryType = 'arraybuffer';
                this._reliableChannel.onmessage = ({ data }) => {
                    if (typeof data !== 'string') {
                        this._onMessage(new Uint8Array(data).subarray(0), false);
                    }
                    else {
                        this._onMessage(data, false);
                    }
                };
            }
        };
    }
    handleSignal(data) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            return;
        }
        if ('sdp' in data) {
            this._pc.setRemoteDescription(data)
                .then(() => {
                this._pc.createAnswer(this._answerOpts)
                    .then((answer) => {
                    this._pc.setLocalDescription(answer)
                        .then(() => {
                        this._signal(answer);
                    }).catch((e) => this.close(e));
                }).catch((e) => this.close(e));
            }).catch((e) => this.close(e));
        }
        else if ('candidate' in data) {
            this._pc.addIceCandidate(data).catch((e) => this.close(e));
        }
        else {
            this._logger.error(`invalid negotiation message: ${data}`);
        }
    }
    open(spec) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            throw error(`socket had been opened`);
        }
        this._state = socket_1.MuSocketState.OPEN;
        this._onMessage = spec.message;
        this._onClose = spec.close;
        spec.ready();
    }
    send(data, unreliable) {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            return;
        }
        if (unreliable && this._unreliableChannel) {
            this._unreliableChannel.send(data);
        }
        else if (this._reliableChannel) {
            this._reliableChannel.send(data);
        }
    }
    close(e) {
        if (this._state === socket_1.MuSocketState.CLOSED) {
            return;
        }
        if (e) {
            this._logger.exception(e);
        }
        this._state = socket_1.MuSocketState.CLOSED;
        this._pc.close();
        this._pc.onicecandidate = null;
        this._pc.oniceconnectionstatechange = null;
        this._pc.onconnectionstatechange = null;
        this._pc.ondatachannel = null;
        if (this._reliableChannel) {
            this._reliableChannel.onopen = null;
            this._reliableChannel.onmessage = null;
            this._reliableChannel.onerror = null;
            this._reliableChannel.onclose = null;
            this._reliableChannel = null;
        }
        if (this._unreliableChannel) {
            this._unreliableChannel.onopen = null;
            this._unreliableChannel.onmessage = null;
            this._unreliableChannel.onerror = null;
            this._unreliableChannel.onclose = null;
            this._unreliableChannel = null;
        }
        this._pc = null;
        this._onClose();
        this._serverClose();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
exports.MuRTCSocketClient = MuRTCSocketClient;
class MuRTCSocketServer {
    state() { return this._state; }
    constructor(spec) {
        this._state = socket_1.MuSocketServerState.INIT;
        this.clients = [];
        this._onConnection = noop;
        this._onClose = noop;
        this._pendingClients = [];
        if (isBrowser && !(0, rtc_1.browserRTC)()) {
            throw error(`browser doesn't support WebRTC`);
        }
        if (!isBrowser && !spec.wrtc) {
            throw error(`specify WebRTC binding via spec.wrtc`);
        }
        this.wrtc = (0, rtc_1.browserRTC)() || spec.wrtc;
        this._signal = spec.signal;
        this._pcConfig = spec.pcConfig || {
            iceServers: [
                { urls: 'stun:global.stun.twilio.com:3478' },
            ],
        };
        this._pcConfig.sdpSemantics = 'unified-plan';
        this._answerOpts = spec.answerOpts || {};
        this._scheduler = spec.scheduler || system_1.MuSystemScheduler;
        this._logger = spec.logger || logger_1.MuDefaultLogger;
    }
    start(spec) {
        if (this._state !== socket_1.MuSocketServerState.INIT) {
            throw error(`attempt to start when server is ${this._state === socket_1.MuSocketServerState.RUNNING ? 'running' : 'shut down'}`);
        }
        this._scheduler.setTimeout(() => {
            if (this._state !== socket_1.MuSocketServerState.INIT) {
                return;
            }
            this._state = socket_1.MuSocketServerState.RUNNING;
            this._onConnection = spec.connection;
            this._onClose = spec.close;
            spec.ready();
        }, 0);
    }
    handleSignal(packet) {
        if (this._state !== socket_1.MuSocketServerState.RUNNING) {
            return;
        }
        function findClient(sessionId, clients) {
            for (let i = clients.length - 1; i >= 0; --i) {
                if (clients[i].sessionId === sessionId) {
                    return clients[i];
                }
            }
            return null;
        }
        try {
            const data = JSON.parse(packet);
            if (!data.sid) {
                this._logger.error(`no session id in negotiation message`);
                return;
            }
            const sessionId = data.sid;
            delete data.sid;
            let client = findClient(sessionId, this._pendingClients);
            if (!client) {
                client = new MuRTCSocketClient(sessionId, new this.wrtc.RTCPeerConnection(this._pcConfig), this._answerOpts, this._signal, () => {
                    if (client) {
                        this._onConnection(client);
                        this.clients.push(client);
                        this._pendingClients.splice(this._pendingClients.indexOf(client), 1);
                    }
                }, () => {
                    if (client) {
                        this.clients.splice(this.clients.indexOf(client), 1);
                    }
                }, this._logger);
                this._pendingClients.push(client);
            }
            client.handleSignal(data);
        }
        catch (e) {
            this._logger.exception(e);
        }
    }
    close() {
        if (this._state === socket_1.MuSocketServerState.SHUTDOWN) {
            return;
        }
        this._state = socket_1.MuSocketServerState.SHUTDOWN;
        for (let i = 0; i < this.clients.length; ++i) {
            this.clients[i].close();
        }
        this.clients.length = 0;
        this._onClose();
    }
}
exports.MuRTCSocketServer = MuRTCSocketServer;
//# sourceMappingURL=server.js.map