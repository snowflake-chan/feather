import { MuSchema } from '../schema/schema';
import { MuUnion, MuVarint, MuUTF8 } from '../schema';
export type MuRPCTableEntry<ArgsSchema extends MuSchema<any>, ReturnSchema extends MuSchema<any>> = {
    arg: ArgsSchema;
    ret: ReturnSchema;
};
export type MuRPCTable = {
    [method: string]: MuRPCTableEntry<any, any>;
};
export type MuRPCProtocol<RPCTable extends MuRPCTable> = {
    name: string;
    api: RPCTable;
};
export declare class MuRPCSchemas<Protocol extends MuRPCProtocol<any>> {
    protocol: Protocol;
    errorSchema: MuUTF8;
    tokenSchema: MuVarint;
    argSchema: MuUnion<{
        [method in keyof Protocol['api']]: Protocol['api']['arg'];
    }>;
    retSchema: MuUnion<{
        [method in keyof Protocol['api']]: Protocol['api']['ret'];
    }>;
    responseSchema: MuUnion<{
        success: MuRPCSchemas<Protocol>['retSchema'];
        error: MuRPCSchemas<Protocol>['errorSchema'];
    }>;
    error(message: string): import("../schema/union").UnionInstance<{
        success: MuRPCSchemas<Protocol>["retSchema"];
        error: MuRPCSchemas<Protocol>["errorSchema"];
    }, "success" | "error">;
    constructor(protocol: Protocol);
}
export interface MuRPCClientTransport<Protocol extends MuRPCProtocol<any>> {
    send: (schema: MuRPCSchemas<Protocol>, rpc: MuRPCSchemas<Protocol>['argSchema']['identity']) => Promise<MuRPCSchemas<Protocol>['responseSchema']['identity']>;
}
export interface MuRPCConnection {
    auth: string;
    setAuth: (auth: string) => void;
}
export interface MuRPCServerTransport<Protocol extends MuRPCProtocol<any>, Connection extends MuRPCConnection> {
    listen: (schemas: MuRPCSchemas<Protocol>, authorize: (connection: Connection) => Promise<boolean>, recv: (connection: Connection, rpc: MuRPCSchemas<Protocol>['argSchema']['identity'], response: MuRPCSchemas<Protocol>['responseSchema']['identity']) => Promise<void>) => void;
}
//# sourceMappingURL=protocol.d.ts.map