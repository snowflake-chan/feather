import { toWebSocketURL } from './websocket-url';
export type Options = {
    body: object;
    headers?: Record<string, string>;
};
type Listener = (event: any) => void;
export interface RealtimeGrant {
    ticket: string;
    socketPath: string;
}
export interface RealtimeClientOptions {
    sessionURL?: string;
    pageURL?: () => string;
    createSocket?: (url: string) => WebSocket;
    requestSession?: (options: Options, signal: AbortSignal) => Promise<RealtimeGrant | false>;
}
/** Instances isolate connection keys; adapters may use the application's existing API client. */
export declare function createRealtimeClient(config?: RealtimeClientOptions): {
    subscribeRealtime: (key: string, options: Options, listener: Listener) => () => void;
};
export declare const subscribeRealtime: (key: string, options: Options, listener: Listener) => () => void;
export { toWebSocketURL };
