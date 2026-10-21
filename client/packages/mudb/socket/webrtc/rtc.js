"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserRTC = browserRTC;
function browserRTC() {
    if (typeof window === 'undefined') {
        return null;
    }
    const rtc = {
        RTCPeerConnection: window['RTCPeerConnection'] || window['webkitRTCPeerConnection'] || window['mozRTCPeerConnection'],
        RTCSessionDescription: window['RTCSessionDescription'] || window['mozRTCSessionDescription'],
        RTCIceCandidate: window['RTCIceCandidate'] || window['mozRTCIceCandidate'],
    };
    if (rtc.RTCPeerConnection && rtc.RTCSessionDescription && rtc.RTCIceCandidate) {
        return rtc;
    }
    return null;
}
//# sourceMappingURL=rtc.js.map