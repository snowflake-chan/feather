"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRTCSocket = void 0;
const system_1 = require("../../scheduler/system");
const logger_1 = require("../../logger");
const socket_1 = require("../socket");
const rtc_1 = require("./rtc");
const error_1 = require("../../util/error");
const error = (0, error_1.makeError)('socket/webrtc/client');
const isBrowser = typeof self !== undefined && !!self && self['Object'] === Object;
function noop() { }
class MuRTCSocket {
    state() { return this._state; }
    constructor(spec) {
        this._state = socket_1.MuSocketState.INIT;
        this._onClose = noop;
        this._pendingCandidates = [];
        if (isBrowser && !(0, rtc_1.browserRTC)()) {
            throw error(`browser doesn't support WebRTC`);
        }
        if (!isBrowser && !spec.wrtc) {
            throw error(`specify WebRTC binding via spec.wrtc`);
        }
        this.wrtc = (0, rtc_1.browserRTC)() || spec.wrtc;
        this.sessionId = spec.sessionId;
        this._signal = spec.signal;
        const pcConfig = spec.pcConfig || {
            iceServers: [
                { urls: 'stun:global.stun.twilio.com:3478' },
            ],
        };
        pcConfig.sdpSemantics = 'unified-plan';
        this._pc = new this.wrtc.RTCPeerConnection(pcConfig);
        this._reliableChannel = this._pc.createDataChannel('mudb-reliable', spec.reliableConfig || {});
        this._unreliableChannel = this._pc.createDataChannel('mudb-unreliable', spec.unreliableConfig || {
            ordered: false,
            maxRetransmits: 0,
        });
        this._reliableChannel.binaryType = this._unreliableChannel.binaryType = 'arraybuffer';
        this._pc.onicecandidate = (ev) => {
            if (this._state !== socket_1.MuSocketState.INIT) {
                return;
            }
            if (ev.candidate) {
                const candidate = ev.candidate.toJSON();
                candidate['sid'] = this.sessionId;
                this._signal(candidate);
            }
        };
        this._offerOpts = spec.offerOpts || {};
        this._scheduler = spec.scheduler || system_1.MuSystemScheduler;
        this._logger = spec.logger || logger_1.MuDefaultLogger;
    }
    open(spec) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            throw error(`attempt to connect when connection is ${this._state === socket_1.MuSocketState.OPEN ? 'open' : 'closed'}`);
        }
        if (isBrowser) {
            window.addEventListener('beforeunload', () => {
                this.close();
            });
        }
        const maybeReady = () => {
            if (this._state !== socket_1.MuSocketState.INIT) {
                return;
            }
            if (this._reliableChannel.readyState === 'open' &&
                this._unreliableChannel.readyState === 'open') {
                this._state = socket_1.MuSocketState.OPEN;
                spec.ready();
            }
        };
        this._reliableChannel.onopen = maybeReady;
        this._unreliableChannel.onopen = maybeReady;
        this._reliableChannel.onmessage = ({ data }) => {
            if (this._state !== socket_1.MuSocketState.OPEN) {
                return;
            }
            if (typeof data !== 'string') {
                spec.message(new Uint8Array(data), false);
            }
            else {
                spec.message(data, false);
            }
        };
        this._unreliableChannel.onmessage = ({ data }) => {
            if (this._state !== socket_1.MuSocketState.OPEN) {
                return;
            }
            if (typeof data !== 'string') {
                spec.message(new Uint8Array(data), true);
            }
            else {
                spec.message(data, true);
            }
        };
        const onChannelClose = (ev) => {
            if (this._state === socket_1.MuSocketState.CLOSED) {
                return;
            }
            this._logger.error(`${ev.target.channel} channel closed unexpectedly`);
            this.close();
        };
        this._reliableChannel.onclose = onChannelClose;
        this._unreliableChannel.onclose = onChannelClose;
        this._reliableChannel.onerror = (e) => this.close(e);
        this._unreliableChannel.onerror = (e) => this.close(e);
        this._onClose = spec.close;
        this._scheduler.setTimeout(() => {
            this._pc.createOffer(this._offerOpts)
                .then((offer) => {
                if (this._state === socket_1.MuSocketState.CLOSED) {
                    return;
                }
                this._pc.setLocalDescription(offer)
                    .then(() => {
                    if (this._state === socket_1.MuSocketState.CLOSED) {
                        return;
                    }
                    offer['sid'] = this.sessionId;
                    this._signal(offer);
                })
                    .catch((e) => this.close(e));
            })
                .catch((e) => this.close(e));
        }, 0);
    }
    handleSignal(data) {
        if (this._state !== socket_1.MuSocketState.INIT) {
            return;
        }
        if (!('sdp' in data) && !('candidate' in data)) {
            this.close();
            throw error(`invalid signal: ${data}`);
        }
        const pc = this._pc;
        if ('sdp' in data) {
            pc.setRemoteDescription(data)
                .then(() => {
                if (this._state === socket_1.MuSocketState.CLOSED) {
                    return;
                }
                for (let i = 0; i < this._pendingCandidates.length; ++i) {
                    pc.addIceCandidate(this._pendingCandidates[i]).catch((e) => this.close(e));
                }
                this._pendingCandidates.length = 0;
            }).catch((e) => {
                this.close(e);
            });
        }
        else if ('candidate' in data) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
                pc.addIceCandidate(data).catch((e) => this.close(e));
            }
            else {
                this._pendingCandidates.push(data);
            }
        }
    }
    send(data, unreliable) {
        if (this._state !== socket_1.MuSocketState.OPEN) {
            return;
        }
        if (unreliable) {
            this._unreliableChannel.send(data);
        }
        else {
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
        this._reliableChannel.onopen = null;
        this._reliableChannel.onmessage = null;
        this._unreliableChannel.onopen = null;
        this._unreliableChannel.onmessage = null;
        this._pc.onicecandidate = null;
        this._reliableChannel = null;
        this._unreliableChannel = null;
        this._pc = null;
        this._onClose();
    }
    reliableBufferedAmount() {
        return 0;
    }
    unreliableBufferedAmount() {
        return 0;
    }
}
exports.MuRTCSocket = MuRTCSocket;
//# sourceMappingURL=client.js.map