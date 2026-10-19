import { MuSocketServer, MuSocketServerSpec, MuSocket, MuSocketState, MuSocketSpec, MuSessionId, MuData } from '../socket';
import { MuLogger } from '../../logger';
export declare class MuDebugSocket implements MuSocket {
    socket: MuSocket;
    readonly sessionId: MuSessionId;
    state(): MuSocketState;
    inLatency: number;
    inJitter: number;
    inPacketLoss: number;
    outLatency: number;
    outJitter: number;
    outPacketLoss: number;
    logger: MuLogger;
    constructor(spec: {
        socket: MuSocket;
        inLatency?: number;
        inJitter?: number;
        inPacketLoss?: number;
        outLatency?: number;
        outJitter?: number;
        outPacketLoss?: number;
        logger?: MuLogger;
    });
    private _inbox;
    open(spec: MuSocketSpec): void;
    private _outbox;
    send(data: MuData, unreliable?: boolean): void;
    close(): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
export declare class MuDebugServer implements MuSocketServer {
    socketServer: MuSocketServer;
    state(): import("../socket").MuSocketServerState;
    clients: MuDebugSocket[];
    inLatency: number;
    inJitter: number;
    inPacketLoss: number;
    outLatency: number;
    outJitter: number;
    outPacketLoss: number;
    logger: MuLogger;
    constructor(spec: {
        socketServer: MuSocketServer;
        inLatency?: number;
        inJitter?: number;
        inPacketLoss?: number;
        outLatency?: number;
        outJitter?: number;
        outPacketLoss?: number;
        logger?: MuLogger;
    });
    start(spec: MuSocketServerSpec): void;
    close(): void;
}
//# sourceMappingURL=index.d.ts.map