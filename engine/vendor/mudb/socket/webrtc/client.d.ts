import { MuScheduler } from '../../scheduler/scheduler';
import { MuLogger } from '../../logger';
import { MuSocket, MuSocketState, MuSocketSpec, MuSessionId, MuData } from '../socket';
import { MuRTCBinding, MuRTCConfiguration, MuRTCOfferAnswerOptions } from './rtc';
export declare class MuRTCSocket implements MuSocket {
    private _state;
    state(): MuSocketState;
    readonly sessionId: MuSessionId;
    readonly wrtc: MuRTCBinding;
    private _pc;
    private _signal;
    private _reliableChannel;
    private _unreliableChannel;
    private _offerOpts;
    private _onClose;
    private _scheduler;
    private _logger;
    constructor(spec: {
        sessionId: MuSessionId;
        signal: (data: any) => void;
        wrtc?: MuRTCBinding;
        pcConfig?: MuRTCConfiguration;
        reliableConfig?: RTCDataChannelInit;
        unreliableConfig?: RTCDataChannelInit;
        offerOpts?: MuRTCOfferAnswerOptions;
        scheduler?: MuScheduler;
        logger: MuLogger;
    });
    open(spec: MuSocketSpec): void;
    private _pendingCandidates;
    handleSignal(data: RTCSessionDescriptionInit | RTCIceCandidateInit): void;
    send(data: MuData, unreliable?: boolean): void;
    close(e?: any): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
//# sourceMappingURL=client.d.ts.map