export type MuSessionId = string;
export type MuData = Uint8Array | string;
export interface MuReadyHandler {
    (): void;
}
export interface MuMessageHandler {
    (data: MuData, unreliable: boolean): void;
}
export interface MuCloseHandler {
    (error?: any): void;
}
export interface MuConnectionHandler {
    (socket: MuSocket): void;
}
export declare enum MuSocketState {
    INIT = 0,
    OPEN = 1,
    CLOSED = 2
}
export interface MuSocketSpec {
    ready: MuReadyHandler;
    message: MuMessageHandler;
    close: MuCloseHandler;
}
export interface MuSocket {
    readonly sessionId: MuSessionId;
    state(): MuSocketState;
    open(spec: MuSocketSpec): any;
    send(data: MuData, unreliable?: boolean): any;
    close(): any;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
export declare enum MuSocketServerState {
    INIT = 0,
    RUNNING = 1,
    SHUTDOWN = 2
}
export interface MuSocketServerSpec {
    ready: MuReadyHandler;
    connection: MuConnectionHandler;
    close: MuCloseHandler;
}
export interface MuSocketServer {
    clients: MuSocket[];
    state(): MuSocketServerState;
    start(spec: MuSocketServerSpec): any;
    close(): any;
}
//# sourceMappingURL=socket.d.ts.map