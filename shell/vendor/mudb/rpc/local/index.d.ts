import { MuRPCSchemas, MuRPCClientTransport, MuRPCServerTransport, MuRPCProtocol, MuRPCConnection } from '../protocol';
export declare class MuRPCLocalClient<Protocol extends MuRPCProtocol<any>> implements MuRPCClientTransport<Protocol>, MuRPCConnection {
    auth: string;
    private _handlers;
    constructor(auth: string, _handlers: {
        [name: string]: (auth: MuRPCLocalClient<Protocol>, rpc: any) => Promise<any>;
    });
    setAuth(auth: string): void;
    send(schemas: MuRPCSchemas<Protocol>, args: MuRPCSchemas<Protocol>['argSchema']['identity']): Promise<import("../../schema/union").UnionInstance<{
        success: import("../../schema").MuUnion<{ [method in keyof Protocol["api"]]: Protocol["api"]["ret"]; }>;
        error: MuRPCSchemas<Protocol_1>["errorSchema"];
    }, "success" | "error">>;
}
export declare class MuRPCLocalTransport implements MuRPCServerTransport<any, MuRPCLocalClient<any>> {
    private _handlers;
    client<Protocol extends MuRPCProtocol<any>>(auth: string): MuRPCLocalClient<Protocol>;
    listen<Protocol extends MuRPCProtocol<any>>(schemas: MuRPCSchemas<Protocol>, auth: (conn: MuRPCLocalClient<Protocol>) => Promise<boolean>, recv: (conn: MuRPCLocalClient<Protocol>, rpc: MuRPCSchemas<Protocol>['argSchema']['identity'], response: MuRPCSchemas<Protocol>['responseSchema']['identity']) => Promise<void>): {};
}
//# sourceMappingURL=index.d.ts.map