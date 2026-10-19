"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFetch = exports.isNon200Error = void 0;
exports.nodeRequest = nodeRequest;
const type_1 = require("./type");
Object.defineProperty(exports, "isNon200Error", { enumerable: true, get: function () { return type_1.isNon200Error; } });
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = __importDefault(require("url"));
class NodeFetch {
    constructor(baseURL, auth = '') {
        const urlInfo = url_1.default.parse(baseURL);
        this.requestOptions = {
            protocol: urlInfo.protocol || 'http:',
            hostname: urlInfo.hostname || '127.0.0.1',
            port: +(urlInfo.port
                ? urlInfo.port
                : urlInfo.protocol === 'http:'
                    ? 80
                    : 443),
            timeout: 99000,
        };
        this.requestHeaders = {
            Authorization: auth,
        };
    }
    async get(path, query = {}) {
        const keys = Object.keys(query);
        const options = {
            method: 'GET',
            path: path +
                ((keys.length > 0 &&
                    `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`) ||
                    ''),
            headers: this.requestHeaders,
        };
        return await nodeRequest(Object.assign(options, this.requestOptions));
    }
    async post(path, data) {
        const options = {
            method: 'POST',
            path,
            headers: Object.assign({
                'Content-Type': 'application/json',
            }, this.requestHeaders),
        };
        const body = JSON.stringify(data);
        return await nodeRequest(Object.assign(options, this.requestOptions), body);
    }
}
exports.NodeFetch = NodeFetch;
function nodeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const httx = options.protocol === 'http:' ? http_1.default : https_1.default;
        const req = httx.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk.toString();
            });
            res.on('end', () => {
                resolve(data);
            });
            if (res.statusCode !== 200) {
                reject(JSON.stringify({
                    non200: true,
                    method: options.method,
                    url: options.path,
                    data: body,
                    status: res.statusCode,
                    res: res.statusMessage,
                }));
                return;
            }
        });
        req.on('timeout', () => {
            reject(new Error('request timeout'));
        });
        req.on('error', (e) => {
            reject(e);
        });
        if (body) {
            req.write(body);
        }
        req.end();
    });
}
