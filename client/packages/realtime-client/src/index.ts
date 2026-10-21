import { toWebSocketURL } from './websocket-url';
export type Options = { body:object; headers?:Record<string, string> };
type Listener = (event:any) => void;
type Connection = { listeners:Set<Listener>; stop:() => void };
export interface RealtimeGrant {
    ticket:string;
    socketPath:string;
}
export interface RealtimeClientOptions {
    sessionURL?:string;
    pageURL?:() => string;
    createSocket?:(url:string) => WebSocket;
    requestSession?:(options:Options, signal:AbortSignal) => Promise<RealtimeGrant | false>;
}

/** Instances isolate connection keys; adapters may use the application's existing API client. */
export function createRealtimeClient(config:RealtimeClientOptions = {}) {
    const connections = new Map<string, Connection>();
    const pageURL = () => (config.pageURL ? config.pageURL() : window.location.href);
    const requestSession =
        config.requestSession ||
        (async (options:Options, signal:AbortSignal):Promise<RealtimeGrant | false> => {
            const response = await fetch(config.sessionURL || '/api/realtime/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...options.headers },
                body: JSON.stringify(options.body),
                signal,
            });
            if ([401, 403, 404].includes(response.status)) {
                return false;
            }
            if (!response.ok) {
                throw new Error('实时连接不可用');
            }
            return response.json();
        });
    /** One connection per service and subscription; no periodic HTTP data reads. */
    function subscribeRealtime(key:string, options:Options, listener:Listener) {
        let connection = connections.get(key);
        if (!connection) {
            const listeners = new Set<Listener>();
            let socket:WebSocket | undefined;
            let disposed = false;
            let retry:ReturnType<typeof setTimeout> | undefined;
            let deadline:ReturnType<typeof setTimeout> | undefined;
            let failures = 0;
            const controller = new AbortController();
            const emit = (event:any) => {
                for (const handler of [...listeners]) {
                    try {
                        handler(event);
                    } catch {
                        /* Isolate observers. */
                    }
                }
            };
            const reopen = () => {
                if (!disposed) {
                    retry = setTimeout(
                        () => {
                            void open();
                        },
                        Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5)),
                    );
                }
            };
            const open = async () => {
                if (disposed) {
                    return;
                }
                try {
                    const grant = await requestSession(
                        options,
                        AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
                    );
                    if (!grant) {
                        emit({ type: 'unauthorized' });
                        return;
                    }
                    if (disposed) {
                        return;
                    }
                    const page = pageURL();
                    const url = new URL(grant.socketPath, page);
                    if (url.origin !== new URL(page).origin) {
                        throw new Error('实时连接必须同源');
                    }
                    const socketURL = toWebSocketURL(url.href, page);
                    const ws = config.createSocket
                        ? config.createSocket(socketURL)
                        : new WebSocket(socketURL);
                    socket = ws;
                    deadline = setTimeout(() => ws.close(), 10_000);
                    ws.onopen = () => {
                        if (!disposed && socket === ws) {
                            ws.send(JSON.stringify({ type: 'connect', ticket: grant.ticket }));
                        }
                    };
                    ws.onmessage = ({ data }) => {
                        if (disposed || socket !== ws) {
                            return;
                        }
                        try {
                            const event = JSON.parse(String(data));
                            if (event.type === 'reauthenticate') {
                                emit(event);
                                ws.close();
                                return;
                            }
                            if (event.type === 'ready') {
                                failures = 0;
                                clearTimeout(deadline);
                            }
                            emit(event);
                        } catch {
                            ws.close();
                        }
                    };
                    ws.onerror = () => ws.close();
                    ws.onclose = () => {
                        if (socket !== ws) {
                            return;
                        }
                        clearTimeout(deadline);
                        socket = undefined;
                        emit({ type: 'disconnected' });
                        reopen();
                    };
                } catch {
                    if (!disposed) {
                        emit({ type: 'disconnected' });
                        reopen();
                    }
                }
            };
            connection = {
                listeners,
                stop: () => {
                    disposed = true;
                    controller.abort();
                    clearTimeout(retry);
                    clearTimeout(deadline);
                    socket?.close();
                },
            };
            connections.set(key, connection);
            // Defer so the first observer is installed before bootstrap can fail.
            void Promise.resolve().then(open);
        }
        const subscription = (event:any) => listener(event);
        connection.listeners.add(subscription);
        return () => {
            connection!.listeners.delete(subscription);
            if (!connection!.listeners.size) {
                connection!.stop();
                connections.delete(key);
            }
        };
    }
    return { subscribeRealtime };
}

export const subscribeRealtime = createRealtimeClient().subscribeRealtime;
export { toWebSocketURL };
