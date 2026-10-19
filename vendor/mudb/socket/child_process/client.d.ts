import type { ChildProcess } from 'child_process';
import { MuData, MuSocket, MuSocketSpec, MuSocketState } from '../socket';
export declare class MuChildProcessSocket implements MuSocket {
    readonly sessionId: string;
    private _childProcess;
    private _state;
    state(): MuSocketState;
    private _spec;
    constructor(sessionId: string, _childProcess: ChildProcess);
    open(spec: MuSocketSpec): void;
    send(message: MuData, unreliable?: boolean): void;
    close(): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
    private addProcessListeners;
    private removeProcessListeners;
    private _onMessage;
    private _onChildProcessClose;
    private sendInternal;
}
//# sourceMappingURL=client.d.ts.map