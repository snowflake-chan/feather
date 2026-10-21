import { MuSocket, MuSocketState, MuSocketSpec, MuSessionId, MuData } from '../socket';
export declare class MuWorkerSocket implements MuSocket {
    private _state;
    sessionId: MuSessionId;
    state(): MuSocketState;
    private _socket;
    private _onclose;
    constructor(sessionId: MuSessionId, socket: Worker);
    open(spec: MuSocketSpec): void;
    send(message: MuData, unreliable_?: boolean): void;
    close(): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
export declare function createWorkerSocket(spec: {
    sessionId: MuSessionId;
    serverWorker: Worker;
}): MuWorkerSocket;
//# sourceMappingURL=client.d.ts.map