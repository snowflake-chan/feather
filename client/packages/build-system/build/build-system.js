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
exports.BuildSystem = void 0;
const stream_1 = require("@box/mudb/stream");
const stringify_1 = require("@box/mudb/util/stringify");
const task_index_1 = require("./task-index");
class BuildSystem {
    constructor(cache, contentServer, ossContentServer, nextUidListUsingGet, logger, debug = false) {
        this.cache = cache;
        this.contentServer = contentServer;
        this.ossContentServer = ossContentServer;
        this.nextUidListUsingGet = nextUidListUsingGet;
        this.logger = logger;
        this.debug = debug;
        this.tasks = task_index_1.tasks;
    }
    retrieveJSON(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = Buffer.from(yield this.retrieveContent(hash)).toString();
            try {
                if (json.length === 0) {
                    return void 0;
                }
                return JSON.parse(json);
            }
            catch (e) {
                throw new Error(`could not parse json for hash: ${hash}.  ${e.message}`);
            }
        });
    }
    retrieveContent(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!hash || typeof hash !== 'string') {
                throw new Error(`retrieveContent was called with an invalid hash: ${'' + hash}`);
            }
            // remove extension name and extra point if exists
            const pureHash = hash.match(/^(.*?)(\..*?)?$/)[1];
            const data = yield this.contentServer.retrieve(pureHash);
            if (!data) {
                throw new Error(`error retrieving hash ${hash}`);
            }
            return data;
        });
    }
    retrieveContentFromS3(hash, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!hash || typeof hash !== 'string') {
                throw new Error(`retrieveContent was called with an invalid hash: ${hash}`);
            }
            const data = yield this.ossContentServer.retrieve(hash, options);
            if (!data) {
                throw new Error(`error retrieving hash ${hash} from s3`);
            }
            return data;
        });
    }
    retrieveBinarySchema(schema, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const bytes = yield this.contentServer.retrieve(hash);
            if (!bytes) {
                throw new Error('error retrieving hash ' + hash);
            }
            if (bytes.length === 0) {
                return schema.clone(schema.identity);
            }
            const stream = new stream_1.MuReadStream(bytes);
            return schema.patch(schema.identity, stream);
        });
    }
    retrieveJSONSchema(schema, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.retrieveJSON(hash);
            return schema.fromJSON(data);
        });
    }
    storeBinarySchema(schema, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const ws = new stream_1.MuWriteStream(1);
            schema.diff(schema.identity, value, ws);
            const hash = yield this.storeContent(ws.bytes());
            ws.destroy();
            return hash;
        });
    }
    storeContent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = yield this.contentServer.store(data);
            if (!hash) {
                throw new Error(`error saving data`);
            }
            return hash;
        });
    }
    storeContentToS3(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = yield this.ossContentServer.store(data, options);
            if (!hash) {
                throw new Error(`error saving data to s3`);
            }
            return hash;
        });
    }
    storeJSON(data) {
        return this.storeContent(Buffer.from((0, stringify_1.stableStringify)(data) || '', 'utf8'));
    }
    build(name, ...params) {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = yield this.cache.retrieve(name, params);
            if (cached) {
                if (yield this.contentServer.retrieve(cached)) {
                    return cached;
                }
                this.logger.warn(`Build cache result is unavailable in the current content store; rebuilding ${String(name)} (${cached}).`);
                yield this.cache.invalidate(name, params, cached);
            }
            const task = this.tasks[name];
            if (!task) {
                throw new Error(`no such build task: ${name}`);
            }
            this.logger.info(`${name}(${params.join(',')})`);
            const runTask = () => task(new BuildSystem(this.cache, this.contentServer, this.ossContentServer, this.nextUidListUsingGet, this.logger.child({
                caller: name,
            }), this.debug), ...params);
            try {
                const result = yield this.cache.store(name, params, runTask);
                if (yield this.contentServer.retrieve(result)) {
                    return result;
                }
                // Another runtime can win a shared Redis lock while writing its result
                // into a different derived content store. Do not let that foreign hash
                // strand this runtime in its startup screen: invalidate it, build once
                // against the current store, then best-effort publish the usable result.
                this.logger.warn(`Concurrent build cache result is unavailable in the current content store; rebuilding ${String(name)} (${result}).`);
                yield this.cache.invalidate(name, params, result);
                const recovered = yield runTask();
                yield this.cache.store(name, params, () => __awaiter(this, void 0, void 0, function* () { return recovered; }));
                return recovered;
            }
            catch (e) {
                this.logger.error(`Error in build task: ${name}(${JSON.stringify(params)})`);
                this.logger.error(e);
                this.logger.error(e.stack);
                throw e;
            }
        });
    }
    addTasks(task) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.assign(this.tasks, task);
        });
    }
}
exports.BuildSystem = BuildSystem;
//# sourceMappingURL=build-system.js.map