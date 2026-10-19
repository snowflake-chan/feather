import * as http from 'http';
import * as https from 'https';
import { MuSessionId, MuSocket, MuSocketState, MuSocketSpec, MuSocketServer, MuSocketServerState, MuSocketServerSpec } from '../socket';
import { MuScheduler } from '../../scheduler/scheduler';
import { MuLogger } from '../../logger';
export interface WSSocket {
    onmessage: (message: {
        data: Buffer[] | string;
    }) => void;
    binaryType: string;
    onclose: () => void;
    onerror: (e: any) => void;
    send: (data: Uint8Array | string) => void;
    close: () => void;
    ping: (() => void);
    bufferedAmount: number;
}
export declare class MuWebSocketConnection {
    bufferLimit: number;
    sessionProof: string;
    readonly sessionId: string;
    started: boolean;
    closed: boolean;
    reliableSocket: WSSocket;
    unreliableSockets: WSSocket[];
    lastReliablePing: number;
    lastUnreliablePing: number[];
    private _logger;
    pendingMessages: (Uint8Array | string)[];
    onMessage: (data: Uint8Array | string, unreliable: boolean) => void;
    onClose: () => void;
    serverClose: () => void;
    constructor(sessionId: string, reliableSocket: WSSocket, serverClose: () => void, logger: MuLogger, bufferLimit: number);
    addUnreliableSocket(socket: WSSocket): void;
    send(data: Uint8Array, unreliable: boolean): void;
    close(): void;
    doPing(now: number, pingCutoff: number): void;
}
export declare class MuWebSocketClient implements MuSocket {
    private _state;
    readonly sessionId: MuSessionId;
    state(): MuSocketState;
    private _connection;
    private _logger;
    scheduler: MuScheduler;
    constructor(connection: MuWebSocketConnection, scheduler: MuScheduler, logger: MuLogger);
    open(spec: MuSocketSpec): void;
    send(data: Uint8Array, unreliable?: boolean): void;
    close(): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
export declare class MuWebSocketServer implements MuSocketServer {
    private _proof;
    private _requireSessionProof;
    issueSessionProof(sessionId: string): string;
    private _state;
    state(): MuSocketServerState;
    private _connections;
    clients: MuWebSocketClient[];
    private _options;
    private _wsServer;
    private _logger;
    private _onClose;
    private _pingInterval;
    private _pingIntervalId;
    scheduler: MuScheduler;
    bufferLimit: number;
    constructor(spec: {
        server: http.Server | https.Server;
        requireSessionProof?: boolean;
        bufferLimit?: number;
        backlog?: number;
        handleProtocols?: (protocols: any[], request: http.IncomingMessage) => any;
        path?: string;
        perMessageDeflate?: boolean | object;
        maxPayload?: number;
        scheduler?: MuScheduler;
        logger?: MuLogger;
        pingInterval?: number;
    });
    private _findConnection;
    start(spec: MuSocketServerSpec): void;
    close(): void;
}
//# sourceMappingURL=server.d.ts.map