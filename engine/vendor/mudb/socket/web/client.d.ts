import { MuSocket, MuSocketState, MuSocketSpec, MuSessionId, MuData } from '../socket';
import { MuLogger } from '../../logger';
export declare class MuWebSocket implements MuSocket {
    readonly sessionId: MuSessionId;
    private _state;
    state(): MuSocketState;
    private _url;
    private _reliableSocket;
    private _unreliableSockets;
    private _sessionProof;
    private _maxSockets;
    private _logger;
    bufferLimit: number;
    constructor(spec: {
        sessionId: MuSessionId;
        sessionProof?: string;
        url: string;
        maxSockets?: number;
        logger?: MuLogger;
        bufferLimit?: number;
    });
    private _onClose;
    open(spec: MuSocketSpec): void;
    send(data: MuData, unreliable?: boolean): void;
    close: () => void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
//# sourceMappingURL=client.d.ts.map