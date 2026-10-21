import { MuRPCServerTransport, MuRPCProtocol, MuRPCSchemas, MuRPCConnection } from '../protocol';
import * as http from 'http';
import { MuLogger } from '../../logger';
export type MuRPCHttpCookieOptions = {
    domain: string;
    path: string;
    maxAge: number;
    sameSite: '' | 'none' | 'lax' | 'strict';
    httpOnly: boolean;
    secure: boolean;
};
export declare class MuRPCHttpConnection implements MuRPCConnection {
    request: http.IncomingMessage;
    response: http.ServerResponse;
    useCookie: boolean;
    cookie: string;
    auth: string;
    constructor(request: http.IncomingMessage, response: http.ServerResponse, useCookie: boolean, cookie: string, auth: string);
    setAuth(auth: string, options?: Partial<MuRPCHttpCookieOptions>): void;
}
export declare class MuRPCHttpServerTransport implements MuRPCServerTransport<any, MuRPCHttpConnection> {
    private _handlers;
    private _route;
    private _useCookie;
    private _cookie;
    private _matchCookie;
    private _byteLimit;
    private _logger?;
    constructor(spec: {
        route: string;
        byteLimit: number;
        cookie?: string;
        logger?: MuLogger;
    });
    handler: (request: http.IncomingMessage, response: http.ServerResponse) => Promise<boolean>;
    listen<Protocol extends MuRPCProtocol<any>>(schemas: MuRPCSchemas<Protocol>, auth: (conn: MuRPCHttpConnection) => Promise<boolean>, recv: (conn: MuRPCHttpConnection, arg: MuRPCSchemas<Protocol>['argSchema']['identity'], response: MuRPCSchemas<Protocol>['responseSchema']['identity']) => void): void;
}
//# sourceMappingURL=server.d.ts.map