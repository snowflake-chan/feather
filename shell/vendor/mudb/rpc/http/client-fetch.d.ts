import { MuRPCClientTransport, MuRPCProtocol, MuRPCSchemas } from '../protocol';
export declare class MuRPCFetchClientTransport implements MuRPCClientTransport<any> {
    private _url;
    constructor(spec: {
        url: string;
    });
    send<Protocol extends MuRPCProtocol<any>>(schemas: MuRPCSchemas<Protocol>, arg: MuRPCSchemas<Protocol>['argSchema']['identity']): Promise<import("../../schema/union").UnionInstance<{
        success: import("../../schema").MuUnion<{ [method in keyof Protocol["api"]]: Protocol["api"]["ret"]; }>;
        error: MuRPCSchemas<Protocol_1>["errorSchema"];
    }, "success" | "error">>;
}
//# sourceMappingURL=client-fetch.d.ts.map