"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingContentServer = void 0;
const bs58_1 = __importDefault(require("bs58"));
const crypto_1 = require("crypto");
const content_cache_1 = require("./content-cache");
const semaphore_1 = require("@box/utils/semaphore");
function ipfsHash(data) {
    const digest = (0, crypto_1.createHash)('sha256').update(data).digest();
    const digestSize = Buffer.from(digest.byteLength.toString(16), 'hex');
    const hashFunction = Buffer.from('12', 'hex');
    const combined = Buffer.concat([hashFunction, digestSize, digest]);
    const multihash = bs58_1.default.encode(combined);
    return multihash.toString();
}
class CachingContentServer {
    async _waitHash(hash) {
        const sem = this._mutex[hash];
        if (sem) {
            return sem.p();
        }
        this._mutex[hash] = new semaphore_1.Semaphore(0);
    }
    _signalHash(hash) {
        const sem = this._mutex[hash];
        if (sem) {
            delete this._mutex[hash];
            sem.v(Infinity);
        }
    }
    constructor(logger, baseServer, cache = content_cache_1.DEFAULT_CONTENT_CACHE, maxCacheItemSize = Infinity) {
        this.logger = logger;
        this.baseServer = baseServer;
        this.cache = cache;
        this.maxCacheItemSize = maxCacheItemSize;
        this._mutex = {};
    }
    async init() {
        return this.baseServer.init();
    }
    async store(content) {
        if (content.length < this.maxCacheItemSize) {
            const hash = ipfsHash(content);
            let cached = this.cache.getCache(hash);
            if (cached) {
                return hash;
            }
            const data = (0, content_cache_1.copyContent)(content);
            await this._waitHash(hash);
            try {
                cached = this.cache.getCache(hash);
                if (cached) {
                    return hash;
                }
                const realHash = await this.baseServer.store(data);
                this.cache.putCache(realHash, data, false);
                return realHash;
            }
            finally {
                this._signalHash(hash);
            }
        }
        else {
            return this.baseServer.store(content);
        }
    }
    async retrieve(hash) {
        let data = this.cache.getCache(hash);
        if (data) {
            return data;
        }
        await this._waitHash(hash);
        try {
            data = this.cache.getCache(hash);
            if (data) {
                return data;
            }
            data = await this.baseServer.retrieve(hash);
            if (data && data.length < this.maxCacheItemSize) {
                this.cache.putCache(hash, data, true);
            }
            return data;
        }
        finally {
            this._signalHash(hash);
        }
    }
}
exports.CachingContentServer = CachingContentServer;
