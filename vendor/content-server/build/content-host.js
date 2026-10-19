"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContentRouter = createContentRouter;
const mime_1 = __importDefault(require("mime"));
function log(...args) { }
function log_error(...args) {
    console.error(...args);
}
function error(res, code, reason) {
    log_error(`${code} error: "${reason}"`);
    let publicReason = reason;
    if (499 < code && code < 600) {
        publicReason = 'Internal Server Error';
    }
    res.writeHead(code, publicReason);
    res.end();
}
function bad_method(req, res, method) {
    if (req.method == method) {
        return false;
    }
    error(res, 405, `this route must be called with method: ${method}`);
    return true;
}
function requestOriginAllowed(origin, allowedOrigins) {
    if (!origin)
        return true;
    if (allowedOrigins.has(origin))
        return true;
    try {
        const hostname = new URL(origin).hostname;
        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    }
    catch (_a) {
        return false;
    }
}
function createContentRouter(contentServer, options = {}) {
    const endpointRegex = /^\/block\/?/;
    const argRegex = /^\/block\/([^/?]+)\/?/;
    const deniedHashes = options.deniedHashes || new Set();
    const allowedOrigins = options.allowedOrigins || new Set();
    const getArg = (pathname) => {
        const match = argRegex.exec(pathname);
        if (match == null || match == undefined) {
            return null;
        }
        return match[1];
    };
    const router = {
        store: async (pathname, req, res) => {
            log(`in store`);
            if (bad_method(req, res, 'POST')) {
                return;
            }
            return new Promise((resolve, reject) => {
                const buffers = [];
                req.on('data', (chunk) => {
                    if (typeof chunk === 'string') {
                        error(res, 500, `got string instead of buffer in store`);
                        resolve();
                        return;
                    }
                    buffers.push(chunk);
                });
                req.on('end', async () => {
                    const data = Buffer.concat(buffers);
                    try {
                        const hash = await contentServer.store(data);
                        res.setHeader('Content-Type', 'application/octet-stream');
                        res.end(hash);
                        log(`store success`);
                        resolve();
                    }
                    catch (e) {
                        error(res, 500, e.toString());
                        resolve();
                    }
                });
            });
        },
        retrieve: async (pathname, req, res) => {
            log('in retrieve');
            if (bad_method(req, res, 'GET')) {
                return;
            }
            const arg = getArg(pathname);
            if (arg == null) {
                error(res, 400, `bad arg: "${pathname}"`);
                return;
            }
            if (deniedHashes.has(arg)) {
                error(res, 404, 'nothing with that hash found');
                return;
            }
            const buffer = await contentServer.retrieve(arg);
            if (buffer == undefined) {
                return error(res, 404, `nothing with that hash found`);
            }
            log(`retrieve success`);
            log(buffer.toString());
            const type = mime_1.default.getType(pathname);
            if (type) {
                res.setHeader('Content-Type', type);
            }
            res.end(buffer);
        },
    };
    return async (req, res) => {
        var _a;
        const origin = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.origin;
        const originAllowed = requestOriginAllowed(origin, allowedOrigins);
        if (origin && originAllowed) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
        }
        res.setHeader('Access-Control-Allow-Methods', options.readOnly ? 'OPTIONS, GET' : 'OPTIONS, POST, GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Auth');
        res.setHeader('Cross-Origin-Resource-Policy', origin && originAllowed ? 'cross-origin' : 'same-origin');
        if (req.method == 'OPTIONS') {
            if (!originAllowed) {
                error(res, 403, 'cross-origin request is not allowed');
                return;
            }
            res.writeHead(200);
            res.end();
            return;
        }
        if (!req.url) {
            return error(res, 400, `no endpoint, empty url`);
        }
        try {
            const pathname = req.url;
            if (!pathname) {
                return error(res, 400, `bad url ${req.url}`);
            }
            if (!endpointRegex.test(pathname)) {
                return error(res, 404, `unrecognized endpoint ${req.url}`);
            }
            const { method } = req;
            let action;
            if (method === 'GET') {
                action = 'retrieve';
            }
            else if (method === 'POST') {
                if (options.readOnly) {
                    return error(res, 403, 'content storage is read-only');
                }
                action = 'store';
            }
            else {
                return error(res, 405, `Method ${method} not allowed of url ${req.url}`);
            }
            router[action](pathname, req, res).catch((e) => {
                return error(res, 500, e.toString());
            });
        }
        catch (e) {
            return error(res, 500, e.toString());
        }
    };
}
