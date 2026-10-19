import { MuRPCProtocol, MuRPCSchemas, MuRPCServerTransport, MuRPCConnection } from './protocol';
import { MuLogger } from '../logger';
export declare class MuRPCServer<Protocol extends MuRPCProtocol<any>, Connection extends MuRPCConnection> {
    schemas: MuRPCSchemas<Protocol>;
    transport: MuRPCServerTransport<Protocol, Connection>;
    constructor(spec: {
        protocol: Protocol;
        transport: MuRPCServerTransport<Protocol, Connection>;
        authorize: (conn: Connection) => Promise<boolean>;
        handlers: {
            [method in keyof Protocol['api']]: (conn: Connection, arg: Protocol['api'][method]['arg']['identity'], ret: Protocol['api'][method]['ret']['identity']) => Promise<Protocol['api'][method]['ret']['identity']>;
        };
        logger?: MuLogger;
    });
}
//# sourceMappingURL=server.d.ts.map