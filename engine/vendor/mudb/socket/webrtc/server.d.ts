import { MuScheduler } from '../../scheduler/scheduler';
import { MuLogger } from '../../logger';
import { MuSocketServer, MuSocketServerState, MuSocketServerSpec, MuSocket, MuSocketState, MuSocketSpec, MuSessionId, MuData } from '../socket';
import { MuRTCBinding, MuRTCConfiguration } from './rtc';
export declare class MuRTCSocketClient implements MuSocket {
    readonly sessionId: MuSessionId;
    private _state;
    state(): MuSocketState;
    private _pc;
    private _answerOpts;
    private _signal;
    private _onMessage;
    private _onClose;
    private _serverClose;
    private _reliableChannel;
    private _unreliableChannel;
    private _logger;
    constructor(sessionId: MuSessionId, pc: RTCPeerConnection, answerOpts: RTCOfferAnswerOptions, signal: (data: object, session: MuSessionId) => void, connection: (conn: MuRTCSocketClient) => void, serverClose: () => void, logger: MuLogger);
    handleSignal(data: RTCIceCandidateInit | RTCSessionDescriptionInit): void;
    open(spec: MuSocketSpec): void;
    send(data: MuData, unreliable?: boolean): void;
    close(e?: any): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
export declare class MuRTCSocketServer implements MuSocketServer {
    private _state;
    state(): MuSocketServerState;
    clients: MuRTCSocketClient[];
    readonly wrtc: MuRTCBinding;
    private _pcConfig;
    private _answerOpts;
    private _signal;
    private _scheduler;
    private _logger;
    private _onConnection;
    private _onClose;
    constructor(spec: {
        signal: (data: object, sessionId: MuSessionId) => void;
        wrtc?: MuRTCBinding;
        pcConfig?: MuRTCConfiguration;
        answerOpts?: RTCOfferAnswerOptions;
        scheduler?: MuScheduler;
        logger?: MuLogger;
    });
    start(spec: MuSocketServerSpec): void;
    private _pendingClients;
    handleSignal(packet: string): void;
    close(): void;
}
//# sourceMappingURL=server.d.ts.map