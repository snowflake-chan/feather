import { MuSocket } from './socket/socket';
import { MuMessageInterface, MuAnyMessageTable, MuAnyProtocolSchema, MuProtocolBandwidth } from './protocol';
import { MuLogger } from './logger';
export declare class MuRemoteServer<Schema extends MuAnyMessageTable> {
    message: MuMessageInterface<Schema>["userAPI"];
    sendRaw: (bytes: Uint8Array | string, unreliable?: boolean) => void;
}
export declare class MuClientProtocolSpec {
    messageHandlers: {};
    rawHandler: (data: Uint8Array | string, unreliable: boolean) => void;
    readyHandler: () => void;
    closeHandler: () => void;
}
export declare class MuClientProtocol<Schema extends MuAnyProtocolSchema> {
    readonly schema: Schema;
    readonly server: MuRemoteServer<Schema['server']>;
    readonly client: MuClient;
    configured: boolean;
    private _protocolSpec;
    constructor(schema: Schema, client: MuClient, protocolSpec: MuClientProtocolSpec);
    configure(spec: {
        message: MuMessageInterface<Schema['client']>['abstractAPI'];
        raw?: (bytes: Uint8Array | string, unreliable: boolean) => void;
        ready?: () => void;
        close?: () => void;
    }): void;
}
export interface MuAnyClientProtocol extends MuClientProtocol<MuAnyProtocolSchema> {
}
export declare class MuClient {
    readonly sessionId: string;
    protocols: MuAnyClientProtocol[];
    private _protocolSpecs;
    running: boolean;
    private _started;
    private _closed;
    private _socket;
    logger: MuLogger;
    private _shouldValidateProtocol;
    bandwidth: MuProtocolBandwidth[];
    constructor(socket: MuSocket, logger?: MuLogger, skipProtocolValidation?: boolean);
    start(spec_?: {
        ready?: (error?: string) => void;
        close?: (error?: string) => void;
    }): void;
    destroy(): void;
    protocol<Schema extends MuAnyProtocolSchema>(schema: Schema): MuClientProtocol<Schema>;
}
//# sourceMappingURL=client.d.ts.map