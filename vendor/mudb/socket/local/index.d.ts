import { MuSocket, MuSocketSpec, MuSocketServer, MuSocketServerSpec, MuSessionId, MuData, MuSocketState, MuSocketServerState } from '../socket';
import { MuScheduler } from '../../scheduler/scheduler';
import { MuLogger } from '../../logger';
export declare class MuLocalSocket implements MuSocket {
    sessionId: MuSessionId;
    private _server;
    _duplex: MuLocalSocket;
    private _onMessage;
    private _onClose;
    private _isClientSocket;
    private _state;
    state(): MuSocketState;
    scheduler: MuScheduler;
    constructor(sessionId: string, server: MuLocalSocketServer, isClientSocket: boolean, scheduler: MuScheduler);
    open(spec: MuSocketSpec): void;
    private _pendingUnreliableMessages;
    private _drainUnreliable;
    private _pendingMessages;
    private _drainTimeout;
    private _drain;
    send(data_: MuData, unreliable?: boolean): void;
    close(): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
export declare class MuLocalSocketServer implements MuSocketServer {
    scheduler: MuScheduler;
    clients: MuSocket[];
    _pendingSockets: MuSocket[];
    private _state;
    state(): MuSocketServerState;
    private _onConnection;
    private _onClose;
    constructor(scheduler: MuScheduler);
    _handleConnection(socket: any): void;
    _removeSocket(socket: any): void;
    start(spec: MuSocketServerSpec): void;
    close(): void;
}
export declare function createLocalSocketServer(spec?: {
    scheduler?: MuScheduler;
    logger?: MuLogger;
}): MuLocalSocketServer;
export declare function createLocalSocket(spec: {
    sessionId: MuSessionId;
    server: MuLocalSocketServer;
    scheduler?: MuScheduler;
    logger?: MuLogger;
}): MuLocalSocket;
//# sourceMappingURL=index.d.ts.map