import type { ChildProcess } from 'child_process';
import { MuCloseHandler, MuData, MuSessionId, MuSocket, MuSocketServer, MuSocketServerSpec, MuSocketServerState, MuSocketSpec, MuSocketState } from '../socket';
export declare class MuChildProcessSocketClient implements MuSocket {
    static clientCount: number;
    private _state;
    sessionId: MuSessionId;
    state(): MuSocketState;
    private _socket;
    private _onmessage;
    private _closeCallbackPerOpen;
    private _closeCallbackPerClient;
    constructor({ sessionId, socket, onClientClose, }: {
        sessionId: MuSessionId;
        socket: ChildProcess;
        onClientClose: MuCloseHandler;
    });
    open(spec: MuSocketSpec): void;
    private addChildProcessListeners;
    private removeChildProcessListeners;
    private _onMessage;
    send(message: MuData, unreliable_?: boolean): void;
    close(): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
export declare class MuChildProcessSocketServer implements MuSocketServer {
    protected _state: MuSocketServerState;
    state(): MuSocketServerState;
    private _pendingSockets;
    clients: MuChildProcessSocketClient[];
    private _onconnection;
    private _onclose;
    constructor();
    private _handleConnection;
    start(spec: MuSocketServerSpec): void;
    close(): void;
}
//# sourceMappingURL=server.d.ts.map