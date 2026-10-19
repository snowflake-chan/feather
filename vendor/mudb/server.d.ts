import { MuSocket, MuSocketServer } from './socket/socket';
import { MuMessageInterface, MuAnyMessageTable, MuAnyProtocolSchema, MuProtocolBandwidth } from './protocol';
import { MuLogger } from './logger';
export declare class MuRemoteClient<Schema extends MuAnyMessageTable> {
    readonly sessionId: string;
    readonly message: MuMessageInterface<Schema>['userAPI'];
    readonly sendRaw: (bytes: Uint8Array | string, unreliable?: boolean) => void;
    private _socket;
    constructor(socket: MuSocket, message: MuMessageInterface<Schema>['userAPI'], sendRaw: any);
    close(): void;
}
export interface MuRemoteMessageInterface<Schema extends MuAnyProtocolSchema> {
    api: {
        [message in keyof Schema['server']]: (client: MuRemoteClient<Schema['client']>, data: Schema['server'][message]['identity'], unreliable?: boolean) => void;
    };
}
export declare class MuServerProtocolSpec {
    messageHandlers: {};
    readyHandler: () => void;
    connectHandler: (client: any) => void;
    rawHandler: (client: any, bytes: Uint8Array | string, unreliable: boolean) => void;
    disconnectHandler: (client: any) => void;
    closeHandler: () => void;
}
export declare class MuServerProtocol<Schema extends MuAnyProtocolSchema> {
    readonly schema: Schema;
    readonly server: MuServer;
    readonly clients: {
        [sessionId: string]: MuRemoteClient<Schema['client']>;
    };
    broadcast: MuMessageInterface<Schema["client"]>["userAPI"];
    broadcastRaw: (bytes: Uint8Array | string, unreliable?: boolean) => void;
    configured: boolean;
    private _protocolSpec;
    constructor(schema: Schema, server: MuServer, protocolSpec: MuServerProtocolSpec);
    configure(spec: {
        message: MuRemoteMessageInterface<Schema>['api'];
        raw?: (client: MuRemoteClient<Schema['client']>, data: Uint8Array | string, unreliable: boolean) => void;
        ready?: () => void;
        connect?: (client: MuRemoteClient<Schema['client']>) => void;
        disconnect?: (client: MuRemoteClient<Schema['client']>) => void;
        close?: () => void;
    }): void;
}
export interface MuAnyServerProtocol extends MuServerProtocol<MuAnyProtocolSchema> {
}
export interface MuIncomingMessage {
    sessionId: string;
    protocol: string;
    message: string;
    data: unknown;
    unreliable: boolean;
}
export declare class MuServer {
    messageGuard?: (message: MuIncomingMessage, complete: (allow: boolean) => void) => void;
    protocols: MuAnyServerProtocol[];
    private _protocolSpecs;
    running: boolean;
    private _started;
    private _closed;
    private _socketServer;
    logger: MuLogger;
    private _shouldValidateProtocol;
    bandwidth: MuProtocolBandwidth[];
    constructor(socketServer: MuSocketServer, logger?: MuLogger, skipProtocolValidation?: boolean);
    start(spec?: {
        ready?: () => void;
        close?: (error?: any) => void;
    }): void;
    destroy(): void;
    private _guardMessage;
    protocol<Schema extends MuAnyProtocolSchema>(schema: Schema): MuServerProtocol<Schema>;
}
//# sourceMappingURL=server.d.ts.map