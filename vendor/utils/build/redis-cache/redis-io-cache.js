"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoCache = void 0;
const ioredis_1 = require("ioredis");
const semaphore_1 = require("../semaphore");
class RedisIoCache {
    constructor() {
        this.subCallbacks = {};
        this.subscribeMutex = new semaphore_1.Semaphore();
    }
    async init(config) {
        this.redis = new ioredis_1.Redis(config);
        this.redis.on('message', (channel, message) => {
            const cbs = this.subCallbacks[channel];
            if (cbs && cbs.length > 0) {
                for (const cb of cbs) {
                    cb(message);
                }
            }
        });
        this.redis.on('error', function (error) {
            config.showFriendlyErrorStack && console.log(error);
        });
    }
    isReady() {
        var _a;
        return ((_a = this.redis) === null || _a === void 0 ? void 0 : _a.status) == 'ready';
    }
    quit() {
        if (this.redis !== undefined) {
            this.redis.quit();
        }
    }
    async get(key) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.get(key, (err, result) => {
                if (err !== null && err !== undefined) {
                    reject(err);
                    return;
                }
                if (result === null) {
                    resolve(void 0);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async keys(key) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.keys(key, (err, result) => {
                if (err !== null && err !== undefined) {
                    reject(err);
                    return;
                }
                resolve(result || []);
            });
        });
    }
    async del(key) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.del(key, (err) => {
                if (err !== null && err !== undefined) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async setex(key, seconds, value, nx = false) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            if (nx) {
                client.set(key, value, 'EX', seconds, 'NX', (err, res) => {
                    if (err !== null && err !== undefined) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            }
            else {
                client.set(key, value, 'EX', seconds, (err, res) => {
                    if (err !== null && err !== undefined) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            }
        });
    }
    async expire(key, seconds) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.expire(key, seconds, (err) => {
                if (err !== null && err !== undefined) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async ttl(key) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.ttl(key, (err, ttl) => {
                if (err || !ttl) {
                    reject(err);
                }
                else {
                    resolve(ttl);
                }
            });
        });
    }
    async sadd(key, value) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.sadd(key, value, (err, ttl) => {
                if (err || !ttl) {
                    reject(err);
                }
                else {
                    resolve(ttl);
                }
            });
        });
    }
    async smembers(key) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.smembers(key, (err, list) => {
                if (err || !list) {
                    reject(err);
                }
                else {
                    resolve(list);
                }
            });
        });
    }
    async setnx(key, value) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.setnx(key, value, (err, result) => {
                if (err || !result) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async dispose() {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.quit((err) => {
                if (err !== null && err !== undefined) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    requireClient() {
        const client = this.redis;
        if (!client) {
            throw new Error(`You forgot to initialize the redis clients`);
        }
        return client;
    }
    publish(channel, message) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.publish(channel, message, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(void 0);
                }
            });
        });
    }
    async subscribe(channel, callback) {
        if (channel in this.subCallbacks) {
            this.subCallbacks[channel].push(callback);
            return;
        }
        await this.subscribeMutex.p();
        if (channel in this.subCallbacks) {
            this.subCallbacks[channel].push(callback);
            this.subscribeMutex.v();
            return;
        }
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.subscribe(channel, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.subCallbacks[channel] = [callback];
                    resolve();
                }
                this.subscribeMutex.v();
            });
        });
    }
    async unsubscribe(channel, callback) {
        const cbs = this.subCallbacks[channel];
        if (cbs && cbs.length > 0) {
            const idx = cbs.indexOf(callback);
            if (idx > -1) {
                cbs.splice(idx, 1);
                if (cbs.length === 0) {
                    const client = this.requireClient();
                    return new Promise((resolve, reject) => {
                        client.unsubscribe(channel, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    });
                }
                return true;
            }
        }
        return false;
    }
    async incr(key) {
        const client = this.requireClient();
        return new Promise((resolve, reject) => {
            client.incr(key, (err, result) => {
                if (err !== null && err !== undefined) {
                    reject(err);
                    return;
                }
                if (result === null) {
                    resolve(void 0);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.RedisIoCache = RedisIoCache;
