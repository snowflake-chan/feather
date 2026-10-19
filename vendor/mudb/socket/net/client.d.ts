import * as tcp from 'net';
import * as udp from 'dgram';
import { MuSocket, MuSocketState, MuSocketSpec, MuSessionId, MuData } from '../socket';
export declare class MuNetSocket implements MuSocket {
    readonly sessionId: MuSessionId;
    private _state;
    state(): MuSocketState;
    private _reliableSocket;
    private _connectOpts;
    private _unreliableSocket;
    private _bindOpts;
    private _remotePort;
    private _remoteAddr;
    constructor(spec: {
        sessionId: MuSessionId;
        connectOpts: tcp.TcpSocketConnectOpts;
        bindOpts: udp.BindOptions;
        tcpSocket?: tcp.Socket;
        udpSocket?: udp.Socket;
    });
    open(spec: MuSocketSpec): void;
    send(data: MuData, unreliable?: boolean): void;
    close(): void;
    reliableBufferedAmount(): number;
    unreliableBufferedAmount(): number;
}
//# sourceMappingURL=client.d.ts.map