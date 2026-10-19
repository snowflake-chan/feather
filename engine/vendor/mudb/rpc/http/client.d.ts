import { MuRPCClientTransport, MuRPCProtocol, MuRPCSchemas } from '../protocol';
export declare class MuRPCHttpClientTransport implements MuRPCClientTransport<any> {
    private _url;
    private _cookies;
    private _headers;
    constructor(spec: {
        url: string;
        timeout: number;
        headers?: object;
    });
    send<Protocol extends MuRPCProtocol<any>>(schemas: MuRPCSchemas<Protocol>, arg: MuRPCSchemas<Protocol>['argSchema']['identity']): Promise<import("../../schema/union").UnionInstance<{
        success: import("../../schema").MuUnion<{ [method in keyof Protocol["api"]]: Protocol["api"]["ret"]; }>;
        error: MuRPCSchemas<Protocol_1>["errorSchema"];
    }, "success" | "error">>;
}
//# sourceMappingURL=client.d.ts.map