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
exports.concat = concat;
exports.concatValues = concatValues;
exports.recursivelyConcatValues = recursivelyConcatValues;
exports.removeExtensions = removeExtensions;
exports.swapExtensions = swapExtensions;
exports.copyExtensions = copyExtensions;
exports.mergeJSON = mergeJSON;
exports.mergeDir = mergeDir;
exports.stripMeta = stripMeta;
exports.calcSize = calcSize;
exports.addMeta = addMeta;
exports.flatten = flatten;
exports.replacePattern = replacePattern;
exports.mapJSON = mapJSON;
const stream_1 = require("@box/mudb/stream");
const build_system_1 = require("../build-system");
function concat(bs, ...hashes) {
    return __awaiter(this, void 0, void 0, function* () {
        const blocks = yield Promise.all(hashes.map((hash) => bs.retrieveContent(hash)));
        return yield bs.storeContent(Buffer.concat(blocks));
    });
}
function concatValues(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const json = yield bs.retrieveJSON(hash);
        const blocks = yield Promise.all(Object.values(json).map((h) => bs.retrieveContent(h)));
        return yield bs.storeContent(Buffer.concat(blocks));
    });
}
function recursivelyConcatValues(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        const stack = [yield bs.retrieveJSON(hash)];
        while (stack.length > 0) {
            const json = stack.pop();
            Object.values(json).forEach((value) => {
                if (typeof value === 'string') {
                    promises.push(bs.retrieveContent(value));
                }
                else {
                    stack.push(value);
                }
            });
        }
        const blocks = yield Promise.all(promises);
        return yield bs.storeContent(Buffer.concat(blocks));
    });
}
function removeExtensions(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        function rec(dir) {
            const result = {};
            Object.keys(dir).forEach((key) => {
                const val = dir[key];
                if (typeof val === 'object') {
                    result[key] = rec(val);
                }
                else {
                    result[key.replace(/\.[^.]*$/, '')] = val;
                }
            });
            return result;
        }
        return yield bs.storeJSON(rec(yield bs.retrieveJSON(hash)));
    });
}
function swapExtensions(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        function rec(dir) {
            const result = {};
            Object.keys(dir).forEach((key) => {
                if (key === '.') {
                    return;
                }
                const val = dir[key];
                if (typeof val === 'object') {
                    result[key] = rec(val);
                }
                else if (typeof val === 'string') {
                    const ext = key.match(/\.[^.]*$/);
                    result[key.replace(/\.[^.]*$/, '')] = val + (ext ? ext[0] : '');
                }
            });
            return result;
        }
        const x = rec(yield bs.retrieveJSON(hash));
        return yield bs.storeJSON(x);
    });
}
function copyExtensions(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        function rec(dir) {
            const result = {};
            Object.keys(dir).forEach((key) => {
                const val = dir[key];
                if (typeof val === 'object') {
                    result[key] = rec(val);
                }
                else {
                    const ext = key.match(/\.[^.]*$/);
                    result[key] = val + (ext ? ext[0] : '');
                }
            });
            return result;
        }
        return yield bs.storeJSON(rec(yield bs.retrieveJSON(hash)));
    });
}
function mergeJSON(bs, ...hashes) {
    return __awaiter(this, void 0, void 0, function* () {
        const blocks = yield Promise.all(hashes.map((hash) => bs.retrieveJSON(hash)));
        return yield bs.storeJSON(Object.assign({}, ...blocks));
    });
}
function mergeDir(bs, ...hashes) {
    return __awaiter(this, void 0, void 0, function* () {
        const dirs = yield Promise.all(hashes.map((hash) => bs.retrieveJSON(hash)));
        function mergeRec(obj, dir) {
            const files = Object.keys(dir);
            for (let j = 0; j < files.length; ++j) {
                const k = files[j];
                if (k === '.') {
                    continue;
                }
                if (typeof dir[k] === 'object') {
                    obj[k] = mergeRec(obj[k] || {}, dir[k]);
                }
                else {
                    obj[k] = dir[k];
                }
            }
            return obj;
        }
        const result = {};
        for (let i = 0; i < dirs.length; ++i) {
            mergeRec(result, dirs[i]);
        }
        return yield bs.storeJSON(result);
    });
}
function stripMeta(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        function stripRec(obj) {
            const result = {};
            Object.keys(obj).forEach((x) => {
                const y = obj[x];
                if (y === '.') {
                    return;
                }
                if (typeof y === 'object') {
                    result[x] = stripRec(y);
                }
                else {
                    result[x] = y;
                }
            });
            return result;
        }
        return yield bs.storeJSON(stripRec(yield bs.retrieveJSON(hash)));
    });
}
function calcSize(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const bytes = yield bs.retrieveContent(hash);
        return '' + bytes.length;
    });
}
function addMeta(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        function metaRec(obj) {
            return __awaiter(this, void 0, void 0, function* () {
                const meta = [];
                yield Promise.all(Object.keys(obj).map((name) => __awaiter(this, void 0, void 0, function* () {
                    if (name === '.') {
                        return;
                    }
                    const f = obj[name];
                    if (typeof f === 'string') {
                        meta.push({
                            name,
                            dir: false,
                            size: yield bs.build('calcSize', hash),
                        });
                    }
                    else {
                        meta.push({
                            name,
                            dir: true,
                            size: 0,
                        });
                        yield metaRec(f);
                    }
                })));
                obj['.'] = meta;
                return obj;
            });
        }
        return yield bs.storeJSON(yield metaRec(yield bs.retrieveJSON(hash)));
    });
}
function flatten(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {};
        function flattenRec(obj) {
            Object.keys(obj).forEach((key) => {
                if (key === '.') {
                    return;
                }
                const val = obj[key];
                if (typeof val === 'string') {
                    result[key] = val;
                }
                else if (typeof val === 'object') {
                    flattenRec(val);
                }
            });
        }
        flattenRec(yield bs.retrieveJSON(hash));
        return yield bs.storeJSON(result);
    });
}
function replacePattern(bs, hash, pattern, replace) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = yield bs.retrieveJSON(hash);
        const result = {};
        Object.keys(dir).forEach((x) => {
            result[x.replace(pattern, replace)] = dir[x];
        });
        return bs.storeJSON(result);
    });
}
function mapJSON(bs, task, hash, ret) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(task in bs.tasks)) {
            throw new Error('Invalid task name: ' + task);
        }
        if (!hash) {
            return yield bs.storeJSON({});
        }
        function mapRec(field, prefix) {
            return __awaiter(this, void 0, void 0, function* () {
                if (typeof field === 'string') {
                    const h = yield new build_system_1.BuildSystem(bs.cache, bs.contentServer, bs.ossContentServer, bs.nextUidListUsingGet, bs.logger.child({ caller: `"${prefix}"` }), bs.debug).build(task, field);
                    if (ret === 'json') {
                        return yield bs.retrieveJSON(h);
                    }
                    else if (ret === 'text') {
                        return (0, stream_1.decodeUTF8)(yield bs.retrieveContent(h));
                    }
                    else if (ret === 'bin') {
                        return yield bs.retrieveContent(h);
                    }
                    return h;
                }
                else if (typeof field === 'object') {
                    if (Array.isArray(field)) {
                        return yield Promise.all(field.map((x, i) => mapRec(x, prefix + `[${i}]`)));
                    }
                    else {
                        const result = {};
                        yield Promise.all(Object.keys(field).map((k) => __awaiter(this, void 0, void 0, function* () {
                            result[k] = yield mapRec(field[k], prefix ? prefix + '.' + k : k);
                        })));
                        return result;
                    }
                }
                return field;
            });
        }
        const json = (yield bs.retrieveJSON(hash)) || {};
        const mapped = yield mapRec(json, '');
        return yield bs.storeJSON(mapped);
    });
}
//# sourceMappingURL=utils.js.map