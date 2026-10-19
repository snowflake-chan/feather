import { MuSocketServer, MuSocketServerState, MuSocketServerSpec, MuSocket } from '../socket';
import { MuScheduler } from '../../scheduler/scheduler';
export declare class MuWorkerSocketServer implements MuSocketServer {
    private _state;
    state(): MuSocketServerState;
    private _pendingSockets;
    clients: MuSocket[];
    private _onconnection;
    private _onclose;
    scheduler: MuScheduler;
    constructor(scheduler?: MuScheduler);
    private _handleConnection;
    start(spec: MuSocketServerSpec): void;
    listen(): void;
    close(): void;
}
export declare function createWorkerSocketServer(): MuWorkerSocketServer;
//# sourceMappingURL=server.d.ts.map