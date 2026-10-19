"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRPCServiceWorkerTransport = exports.MuRPCServiceWorkerConnection = void 0;
class MuRPCServiceWorkerConnection {
    constructor(fetchEvent) {
        this.fetchEvent = fetchEvent;
        this.auth = '';
    }
    setAuth(x) {
        this.auth = x;
    }
}
exports.MuRPCServiceWorkerConnection = MuRPCServiceWorkerConnection;
class MuRPCServiceWorkerTransport {
    constructor(spec) {
        this._handlers = {};
        this._logger = null;
        this._routePrefix = spec.url;
        if (spec.logger) {
            this._logger = spec.logger;
        }
    }
    listen(schemas, auth, recv) {
        this._handlers[schemas.protocol.name] = {
            schemas,
            auth,
            recv,
        };
    }
    handler(event) {
        if (event.request.method !== 'POST') {
            return false;
        }
        if (!event.request.url.startsWith(this._routePrefix)) {
            return false;
        }
        let url = event.request.url;
        url = url.replace(/\/$/, '');
        const splits = url.split('/');
        const suffix = splits[splits.length - 1];
        const handler = this._handlers[suffix];
        if (!handler) {
            return false;
        }
        event.respondWith((() => __awaiter(this, void 0, void 0, function* () {
            const conn = new MuRPCServiceWorkerConnection(event);
            try {
                const auth = yield handler.auth(conn);
                if (!auth) {
                    return new Response(JSON.stringify({
                        type: 'error',
                        data: 'Permission denied',
                    }), {
                        status: 500,
                        statusText: 'NOT OK',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
                else {
                    const result = yield event.request.text();
                    if (!result) {
                        throw new Error('Missing body');
                    }
                    const arg = handler.schemas.argSchema.fromJSON(JSON.parse(result));
                    const res = handler.schemas.responseSchema.alloc();
                    yield handler.recv(conn, arg, res);
                    const jsonResponse = JSON.stringify(handler.schemas.responseSchema.toJSON(res));
                    handler.schemas.responseSchema.free(res);
                    return new Response(jsonResponse, {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
            }
            catch (e) {
                if (e) {
                    return new Response(JSON.stringify({
                        type: 'error',
                        data: e.stack || e.toString(),
                    }), {
                        status: 500,
                        statusText: 'NOT OK',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
            }
            return new Response(JSON.stringify({
                type: 'error',
                data: 'Unspecified error',
            }), {
                status: 500,
                statusText: 'NOT OK',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }))());
        return true;
    }
}
exports.MuRPCServiceWorkerTransport = MuRPCServiceWorkerTransport;
//# sourceMappingURL=index.js.map