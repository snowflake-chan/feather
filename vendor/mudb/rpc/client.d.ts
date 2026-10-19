import { MuRPCProtocol, MuRPCSchemas, MuRPCClientTransport } from './protocol';
import { MuLogger } from '../logger';
export declare class MuRPCClient<Protocol extends MuRPCProtocol<any>> {
    api: {
        [method in keyof Protocol['api']]: (arg: Protocol['api'][method]['arg']['identity']) => Promise<Protocol['api'][method]['ret']['identity']>;
    };
    schemas: MuRPCSchemas<Protocol>;
    transport: MuRPCClientTransport<Protocol>;
    logger: MuLogger;
    private _handleResponse;
    private _createRPC;
    constructor(protocol: Protocol, transport: MuRPCClientTransport<Protocol>, logger?: MuLogger);
}
//# sourceMappingURL=client.d.ts.map