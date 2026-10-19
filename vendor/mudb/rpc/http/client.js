"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRPCHttpClientTransport = void 0;
const http = require("http");
const https = require("https");
class MuRPCHttpClientTransport {
    constructor(spec) {
        this._cookies = {};
        this._url = spec.url;
        this._headers = spec.headers || {};
    }
    send(schemas, arg) {
        const argBuffer = Buffer.from(JSON.stringify(schemas.argSchema.toJSON(arg)), 'utf8');
        return new Promise((resolve, reject) => {
            let completed = false;
            const chunks = [];
            function done(error, payload) {
                if (completed) {
                    return;
                }
                completed = true;
                chunks.length = 0;
                if (error) {
                    return reject(error);
                }
                else if (!payload) {
                    return reject('unspecified error');
                }
                try {
                    let json = void 0;
                    if (payload.length > 0) {
                        json = JSON.parse(payload);
                    }
                    return resolve(schemas.responseSchema.fromJSON(json));
                }
                catch (e) {
                    return reject(e);
                }
            }
            const url = new URL(this._url + '/' + schemas.protocol.name);
            const httx = url.protocol === 'http:' ? http : https;
            const req = httx.request({
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': argBuffer.length, 'Cookie': Object.keys(this._cookies)
                        .map((cookie) => `${cookie}=${encodeURIComponent(this._cookies[cookie])}`)
                        .join('; ') }, this._headers),
            }, (res) => {
                const cookie = res.headers['set-cookie'];
                if (cookie) {
                    for (let i = 0; i < cookie.length; ++i) {
                        const parts = cookie[i].split('; ');
                        if (parts.length < 1) {
                            continue;
                        }
                        const tokens = parts[0].split('=');
                        this._cookies[tokens[0]] = decodeURIComponent(tokens[1]);
                    }
                }
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    if (completed) {
                        return;
                    }
                    else if (typeof chunk === 'string') {
                        chunks.push(chunk);
                    }
                    else {
                        chunks.push(chunk.toString('utf8'));
                    }
                });
                res.on('end', () => {
                    if (completed) {
                        return;
                    }
                    done(void 0, chunks.join(''));
                });
            });
            req.on('error', (err) => done(err));
            req.end(argBuffer);
        });
    }
}
exports.MuRPCHttpClientTransport = MuRPCHttpClientTransport;
//# sourceMappingURL=client.js.map