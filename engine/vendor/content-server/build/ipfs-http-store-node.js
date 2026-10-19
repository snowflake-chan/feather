"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoIPFSStore = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const url = __importStar(require("url"));
const form_data_1 = __importDefault(require("form-data"));
const semaphore_1 = require("@box/utils/semaphore");
class GoIPFSStore {
    constructor(spec) {
        this.retryCount = 10;
        this.logger = spec.logger.child({ caller: 'go-ipfs' });
        this.pin = spec.pin;
        this.semaphore = new semaphore_1.Semaphore(spec.maxConcurrency);
        const info = url.parse(spec.uri || '');
        this.protocol = info.protocol || 'http:';
        this.hostname = info.hostname || 'localhost';
        this.port = +(info.port || '5001');
        this.apiPrefix = info.path && info.path !== '/' ? info.path : '/api/v0';
        this.server = this.protocol === 'http:' ? http : https;
    }
    async init() { }
    async store(_content) {
        const options = {
            protocol: this.protocol,
            hostname: this.hostname,
            port: this.port,
            method: 'POST',
            path: `${this.apiPrefix}/block/put?pin=${this.pin}`,
        };
        const data = _content instanceof Buffer ? _content : Buffer.from(_content);
        await this.semaphore.p();
        try {
            for (let i = 0; i < this.retryCount; ++i) {
                const form = new form_data_1.default();
                form.append('data', data);
                options.headers = form.getHeaders();
                options.timeout = 5000 << i;
                try {
                    return await new Promise((resolve, reject) => {
                        const req = this.server.request(options, (res) => {
                            if (res.statusCode !== 200) {
                                return reject(new Error('invalid request: ' + res.statusCode));
                            }
                            const text = [];
                            res.setEncoding('utf8');
                            res.on('data', (chunk) => {
                                if (typeof chunk !== 'string') {
                                    if (chunk && chunk.toString) {
                                        text.push(chunk.toString());
                                    }
                                }
                                else {
                                    text.push(chunk);
                                }
                            });
                            res.on('end', () => {
                                try {
                                    const info = JSON.parse(text.join(''));
                                    this.logger.debug(`store ${info.Key}`);
                                    if (!info.Key) {
                                        reject(new Error('error storing content'));
                                    }
                                    else {
                                        resolve(info.Key);
                                    }
                                }
                                catch (e) {
                                    reject(e);
                                }
                            });
                        });
                        req.on('timeout', () => reject(new Error('request timeout')));
                        req.on('error', reject);
                        form.pipe(req);
                    });
                }
                catch (e) {
                    this.logger.error(`Error ipfs store failed: ${e}`);
                    form.destroy();
                }
            }
            throw new Error('failed to store content');
        }
        finally {
            this.semaphore.v();
        }
    }
    async retrieve(hash) {
        await this.semaphore.p();
        try {
            for (let i = 0; i < this.retryCount; ++i) {
                try {
                    return await new Promise((resolve, reject) => {
                        const options = {
                            protocol: this.protocol,
                            hostname: this.hostname,
                            port: this.port,
                            method: 'GET',
                            path: `${this.apiPrefix}/block/get?arg=${hash}`,
                            timeout: 5000 << i,
                        };
                        const req = this.server.request(options, (res) => {
                            const buffers = [];
                            res.on('data', (chunk) => {
                                if (chunk && typeof chunk !== 'string') {
                                    buffers.push(chunk);
                                }
                                else {
                                    reject(new Error(`Got string instead of buffer`));
                                }
                            });
                            res.on('end', () => {
                                if (res.statusCode !== 200) {
                                    this.logger.error(`failed retrieved: ${hash}`);
                                    reject(new Error(`hash: ${hash}. ${buffers ? Buffer.concat(buffers).toString() : ''}`));
                                }
                                else {
                                    resolve(Buffer.concat(buffers));
                                }
                            });
                        });
                        req.on('timeout', reject);
                        req.on('error', reject);
                        req.end();
                    });
                }
                catch (e) {
                    this.logger.error(`Error ipfs retrieve hash ${hash} failed: ${e}`);
                }
            }
            return undefined;
        }
        finally {
            this.semaphore.v();
        }
    }
}
exports.GoIPFSStore = GoIPFSStore;
