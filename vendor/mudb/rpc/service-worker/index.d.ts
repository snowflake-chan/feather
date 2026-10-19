import { MuLogger } from '../../logger';
import { MuRPCConnection, MuRPCProtocol, MuRPCServerTransport } from '../protocol';
interface FetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): any;
    waitUntil(fn: Promise<any>): any;
}
export declare class MuRPCServiceWorkerConnection implements MuRPCConnection {
    fetchEvent: FetchEvent;
    constructor(fetchEvent: FetchEvent);
    auth: string;
    setAuth(x: string): void;
}
export declare class MuRPCServiceWorkerTransport implements MuRPCServerTransport<MuRPCProtocol<any>, MuRPCServiceWorkerConnection> {
    private _handlers;
    private _routePrefix;
    private _logger;
    constructor(spec: {
        url: string;
        logger?: MuLogger;
    });
    listen(schemas: any, auth: any, recv: any): void;
    handler(event: FetchEvent): boolean;
}
export {};
//# sourceMappingURL=index.d.ts.map