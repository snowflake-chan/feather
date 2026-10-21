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
exports.MuRPCHttpServerTransport = exports.MuRPCHttpConnection = void 0;
const parse_body_1 = require("../../util/parse-body");
function opt(key, options, defaultValue) {
    if (options && (key in options)) {
        return options[key];
    }
    return defaultValue;
}
class MuRPCHttpConnection {
    constructor(request, response, useCookie, cookie, auth) {
        this.request = request;
        this.response = response;
        this.useCookie = useCookie;
        this.cookie = cookie;
        this.auth = auth;
    }
    setAuth(auth, options) {
        if (this.useCookie) {
            const tokens = [`${this.cookie}=${encodeURIComponent(auth)}`];
            if (auth === '') {
                tokens.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
            }
            else {
                const maxAge = opt('maxAge', options, 0);
                if (maxAge) {
                    tokens.push(`Max-Age=${Math.ceil(maxAge)}`);
                }
                const httpOnly = opt('httpOnly', options, false);
                if (httpOnly) {
                    tokens.push('HttpOnly');
                }
                const secure = opt('secure', options, false);
                if (secure) {
                    tokens.push('Secure');
                }
                const sameSite = opt('sameSite', options, '');
                if (sameSite) {
                    tokens.push(`SameSite=${sameSite}`);
                }
            }
            const domain = opt('domain', options, '');
            if (domain) {
                tokens.push(`Domain=${domain}`);
            }
            const path = opt('path', options, '');
            if (path) {
                tokens.push(`Path=${path}`);
            }
            this.response.setHeader('Set-Cookie', tokens.join('; '));
        }
        this.auth = auth;
    }
}
exports.MuRPCHttpConnection = MuRPCHttpConnection;
class MuRPCHttpServerTransport {
    constructor(spec) {
        this._handlers = {};
        this.handler = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const method = request.method;
            if (method !== 'post' && method !== 'POST') {
                return false;
            }
            const url = request.url;
            if (!url || !url.startsWith(this._route)) {
                return false;
            }
            const suffix = url.substr(this._route.length);
            const handler = this._handlers[suffix];
            if (!handler) {
                return false;
            }
            const ret = handler.schemas.responseSchema.alloc();
            const length = parseInt(request.headers['content-length'] || '', 10) || 0;
            if (this._byteLimit < length) {
                ret.type = 'error';
                ret.data = 'size limit exceeded';
            }
            else {
                try {
                    let auth = '';
                    if (this._useCookie) {
                        const cookies = request.headers.cookie;
                        if (cookies) {
                            if (Array.isArray(cookies)) {
                                for (let i = 0; i < cookies.length; ++i) {
                                    const match = cookies[i].match(this._matchCookie);
                                    if (match && match[1]) {
                                        auth = decodeURIComponent(match[1]);
                                        break;
                                    }
                                }
                            }
                            else {
                                const match = cookies.match(this._matchCookie);
                                if (match && match[1]) {
                                    auth = decodeURIComponent(match[1]);
                                }
                            }
                        }
                    }
                    const connection = new MuRPCHttpConnection(request, response, this._useCookie, this._cookie, auth);
                    if (!(yield handler.auth(connection))) {
                        ret.type = 'error';
                        ret.data = 'unauthorized';
                    }
                    else {
                        const body = yield (0, parse_body_1.getRawBody)(request, length);
                        const bodyStr = body.toString('utf8');
                        let bodyJSON = void 0;
                        if (bodyStr.length > 0) {
                            bodyJSON = JSON.parse(bodyStr);
                        }
                        const arg = handler.schemas.argSchema.fromJSON(bodyJSON);
                        yield handler.recv(connection, arg, ret);
                    }
                }
                catch (e) {
                    ret.type = 'error';
                    if (e instanceof Error && typeof e.stack !== 'undefined') {
                        ret.data = e.stack;
                    }
                    else {
                        ret.data = '' + e;
                    }
                }
            }
            if (process.env.NODE_ENV === 'development') {
                response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*');
                response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH');
                response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                response.setHeader('Access-Control-Allow-Credentials', 'true');
            }
            response.statusCode = ret.type === 'success' ? 200 : 400;
            response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            response.setHeader('Expires', '0');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('Surrogate-Control', 'no-store');
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify(handler.schemas.responseSchema.toJSON(ret)));
            handler.schemas.responseSchema.free(ret);
            return true;
        });
        this._route = spec.route;
        this._byteLimit = spec.byteLimit;
        if (this._route.charAt(0) !== '/') {
            this._route = '/' + this._route;
        }
        if (this._route.charAt(this._route.length - 1) !== '/') {
            this._route += '/';
        }
        if ('cookie' in spec) {
            this._useCookie = true;
            const cookie = this._cookie = spec.cookie || '';
            this._matchCookie = new RegExp(`(?:^|;) *${cookie}=([^;]*)`);
        }
        else {
            this._useCookie = false;
            this._cookie = '';
            this._matchCookie = new RegExp('');
        }
    }
    listen(schemas, auth, recv) {
        this._handlers[schemas.protocol.name] = {
            schemas,
            auth,
            recv: recv,
        };
    }
}
exports.MuRPCHttpServerTransport = MuRPCHttpServerTransport;
//# sourceMappingURL=server.js.map