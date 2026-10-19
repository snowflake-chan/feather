import * as tcp from 'net';
import * as udp from 'dgram';
import { MuSocketServer, MuSocketServerState, MuSocketServerSpec, MuSocket } from '../socket';
import { MuScheduler } from '../../scheduler/scheduler';
export declare class MuNetSocketServer implements MuSocketServer {
    private _state;
    state(): MuSocketServerState;
    clients: MuSocket[];
    private _tcpServer;
    private _udpServer;
    scheduler: MuScheduler;
    private _unreliableMsgHandlers;
    private _onclose;
    constructor(spec: {
        tcpServer: tcp.Server;
        udpServer: udp.Socket;
        scheduler?: MuScheduler;
    });
    start(spec: MuSocketServerSpec): void;
    close(): void;
}
//# sourceMappingURL=server.d.ts.map