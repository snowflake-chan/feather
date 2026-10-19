export interface MuRTCBinding {
    RTCPeerConnection: typeof RTCPeerConnection;
    RTCSessionDescription: typeof RTCSessionDescription;
    RTCIceCandidate: typeof RTCIceCandidate;
}
export declare function browserRTC(): MuRTCBinding | null;
export interface MuRTCConfiguration extends RTCConfiguration {
    sdpSemantics?: string;
}
export interface MuRTCOfferAnswerOptions extends RTCOfferAnswerOptions {
    iceRestart?: boolean;
}
//# sourceMappingURL=rtc.d.ts.map