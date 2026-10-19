"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRedisCache = void 0;
const redis_mock_1 = require("redis-mock");
const redis_cache_1 = require("./redis-cache");
class TestRedisCache extends redis_cache_1.RedisCache {
    constructor() {
        super();
    }
    async init(config) {
        this._client = (0, redis_mock_1.createClient)();
    }
}
exports.TestRedisCache = TestRedisCache;
