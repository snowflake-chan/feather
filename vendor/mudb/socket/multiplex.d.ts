import { MuSocketServer, MuSocketServerState, MuSocketServerSpec, MuSocket } from './socket';
export declare class MuMultiSocketServer implements MuSocketServer {
    private _state;
    state(): MuSocketServerState;
    clients: MuSocket[];
    private _servers;
    private _numLiveServers;
    private _onclose;
    constructor(servers: MuSocketServer[]);
    start(spec: MuSocketServerSpec): void;
    close(): void;
}
//# sourceMappingURL=multiplex.d.ts.map