import { MuLogger } from '../logger';
import { MuRPCClient } from './client';
import { MuRPCClientTransport, MuRPCConnection, MuRPCProtocol, MuRPCSchemas, MuRPCServerTransport } from './protocol';
export declare class MuRPCIntercept<Protocol extends MuRPCProtocol<any>, Connection extends MuRPCConnection> {
    protocol: Protocol;
    logger: MuLogger;
    remote: MuRPCClient<Protocol>;
    schemas: MuRPCSchemas<Protocol>;
    private _transport;
    private _server?;
    constructor(spec: {
        protocol: Protocol;
        client: MuRPCClientTransport<Protocol>;
        server: MuRPCServerTransport<Protocol, Connection>;
        logger: MuLogger;
    });
    configure(spec: {
        authorize?: (conn: Connection) => Promise<boolean>;
        handlers: Partial<{
            [method in keyof Protocol['api']]: (conn: Connection, arg: Protocol['api'][method]['arg']['identity']) => Promise<Protocol['api'][method]['ret']['identity']>;
        }>;
    }): void;
}
//# sourceMappingURL=intercept.d.ts.map