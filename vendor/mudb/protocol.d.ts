import { MuSchema } from './schema/schema';
import { MuSocket, MuData } from './socket/socket';
import { MuLogger } from './logger';
export type MuAnySchema = MuSchema<any>;
export type MuMessageType = MuAnySchema;
export interface MuAnyMessageTable {
    [message: string]: MuMessageType;
}
export interface MuMessageInterface<MessageTable extends MuAnyMessageTable> {
    abstractAPI: {
        [message in keyof MessageTable]: (event: MessageTable[message]['identity'], unreliable: boolean) => void;
    };
    userAPI: {
        [message in keyof MessageTable]: (event: MessageTable[message]['identity'], unreliable?: boolean) => void;
    };
    schema: MuSchema<{
        type: keyof MessageTable;
        data: MessageTable[keyof MessageTable]['identity'];
    }>;
    serializer: {
        [message in keyof MessageTable]: (data: MessageTable['identity']) => string;
    };
}
export interface MuProtocolSchema<ClientMessage extends MuAnyMessageTable, ServerMessage extends MuAnyMessageTable> {
    name?: string;
    client: ClientMessage;
    server: ServerMessage;
}
export type MuAnyProtocolSchema = MuProtocolSchema<MuAnyMessageTable, MuAnyMessageTable>;
export type MuBandwidthAccumulator = {
    count: number;
    bytes: number;
};
export type MuProtocolBandwidth = {
    [sessionId: string]: {
        sent: {
            [message: string]: MuBandwidthAccumulator;
        };
        received: {
            [message: string]: MuBandwidthAccumulator;
        };
    };
};
export declare class MuMessageFactory {
    private idBase;
    schemas: MuAnySchema[];
    messageNames: string[];
    jsonStr: string;
    constructor(schema: MuAnyMessageTable, idBase: number);
    createDispatch(sockets: MuSocket[], bandwidth: MuProtocolBandwidth): {};
    createSendRaw(sockets: MuSocket[], bandwidth: MuProtocolBandwidth): (data: MuData, unreliable?: boolean) => void;
}
export declare class MuProtocolFactory {
    protocolFactories: MuMessageFactory[];
    jsonStr: string;
    constructor(protocolSchemas: MuAnyMessageTable[]);
    createParser(spec: {
        messageHandlers: {
            [name: string]: (data: any, unreliable: boolean) => void;
        };
        rawHandler: (data: any, unreliable: boolean) => void;
    }[], logger: MuLogger, bandwidth: MuProtocolBandwidth[], sessionId: string): (data: MuData, unreliable: boolean) => void;
}
//# sourceMappingURL=protocol.d.ts.map