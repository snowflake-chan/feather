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
exports.buildResource = buildResource;
const build_system_1 = require("../build-system");
const stream_1 = require("@box/mudb/stream");
const stringify_1 = require("@box/mudb/util/stringify");
function isFileResource(spec) {
    return 'file' in spec;
}
function isDirectoryResource(spec) {
    return 'dir' in spec;
}
function isFuncResource(spec) {
    return 'func' in spec;
}
function isTableResource(spec) {
    return 'table' in spec;
}
function isJSONResource(spec) {
    return 'json' in spec;
}
function isImportResource(spec) {
    return 'import' in spec;
}
function isStringResource(spec) {
    return 'str' in spec && typeof spec.str === 'string';
}
function removeMeta(dir) {
    Object.keys(dir).forEach((key) => {
        if (key === '.') {
            delete dir[key];
            return;
        }
        const val = dir[key];
        if (typeof val === 'object') {
            removeMeta(val);
        }
    });
}
function buildResource(bs, dirHash, resourceHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const [files, resource] = yield Promise.all([
            bs.retrieveJSON(dirHash),
            bs.retrieveJSON(resourceHash),
        ]);
        const EMPTY_HASH = yield bs.storeContent(new Uint8Array(0));
        function processFile(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                const parts = spec.file.split('/');
                let dir = files;
                for (let i = 0; i < parts.length; ++i) {
                    if (parts[i].length > 0) {
                        if (!(parts[i] in dir)) {
                            if (spec.skipError) {
                                dir = '';
                                break;
                            }
                            else {
                                throw new Error('missing file ' + spec.file);
                            }
                        }
                        dir = dir[parts[i]];
                    }
                }
                if (spec.skipError) {
                    dir = dir || EMPTY_HASH;
                }
                if (!dir || typeof dir !== 'string') {
                    throw new Error('invalid file name: ' + spec.file);
                }
                if (spec.ret === 'json') {
                    return yield bs.retrieveJSON(dir);
                }
                else if (spec.ret === 'bin') {
                    return yield bs.retrieveContent(dir);
                }
                else if (spec.ret === 'text') {
                    return (0, stream_1.decodeUTF8)(yield bs.retrieveContent(dir));
                }
                if (spec.ext) {
                    return dir + '.' + spec.ext;
                }
                return dir;
            });
        }
        function processDirectory(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                const parts = spec.dir.split('/');
                let dir = files;
                for (let i = 0; i < parts.length; ++i) {
                    if (parts[i].length > 0) {
                        if (!(parts[i] in dir)) {
                            throw new Error('missing directory ' + spec.dir);
                        }
                        dir = dir[parts[i]];
                    }
                }
                if (!dir || typeof dir === 'string') {
                    throw new Error('invalid directory name: ' + spec.dir);
                }
                if (spec.filter) {
                    const keys = Object.keys(dir);
                    const result = {};
                    const regexp = new RegExp(spec.filter);
                    for (let i = 0; i < keys.length; ++i) {
                        if (keys[i].match(regexp)) {
                            result[keys[i]] = dir[keys[i]];
                        }
                    }
                    dir = result;
                }
                if (!spec.meta) {
                    removeMeta(dir);
                }
                if (spec.ret === 'json') {
                    return dir;
                }
                else if (spec.ret === 'bin') {
                    return (0, stream_1.encodeUTF8)((0, stringify_1.stableStringify)(dir) || '');
                }
                else if (spec.ret === 'text') {
                    return (0, stringify_1.stableStringify)(dir) || '';
                }
                return yield bs.storeJSON(dir);
            });
        }
        function processFunc(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                const args = yield Promise.all(spec.args.map(processResource));
                args.unshift(spec.func);
                const hash = yield bs.build.apply(bs, args);
                if (spec.ret === 'json') {
                    return yield bs.retrieveJSON(hash);
                }
                else if (spec.ret === 'bin') {
                    return yield bs.retrieveContent(hash);
                }
                else if (spec.ret === 'text') {
                    return (0, stream_1.decodeUTF8)(yield bs.retrieveContent(hash));
                }
                return hash;
            });
        }
        function processTable(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                const ids = Object.keys(spec.table).sort();
                const ret = {};
                yield Promise.all(ids.map((id) => __awaiter(this, void 0, void 0, function* () {
                    ret[id] = yield processResource(spec.table[id]);
                })));
                if (spec.ret === 'json') {
                    return ret;
                }
                else if (spec.ret === 'bin') {
                    return (0, stream_1.encodeUTF8)((0, stringify_1.stableStringify)(ret) || '');
                }
                else if (spec.ret === 'text') {
                    return (0, stringify_1.stableStringify)(ret) || '';
                }
                return yield bs.storeJSON(ret);
            });
        }
        function processJSON(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                const json = spec.json;
                if (spec.ret === 'json') {
                    return json;
                }
                else if (spec.ret === 'bin') {
                    return (0, stream_1.encodeUTF8)((0, stringify_1.stableStringify)(json) || '');
                }
                else if (spec.ret === 'text') {
                    return (0, stringify_1.stableStringify)(json) || '';
                }
                return yield bs.storeJSON(json);
            });
        }
        function processString(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                const str = spec.str;
                if (spec.ret === 'json') {
                    return JSON.stringify(str);
                }
                else if (spec.ret === 'bin') {
                    return (0, stream_1.encodeUTF8)(str);
                }
                else if (spec.ret === 'text') {
                    return str;
                }
                return yield bs.storeContent((0, stream_1.encodeUTF8)(str));
            });
        }
        function processImport(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield processFile({
                    file: spec.import,
                });
                const hash = yield (new build_system_1.BuildSystem(bs.cache, bs.contentServer, bs.ossContentServer, bs.nextUidListUsingGet, bs.logger.child({ caller: spec.import }), bs.debug)).build('buildResource', dirHash, res);
                if (spec.ret === 'json') {
                    return yield bs.retrieveJSON(hash);
                }
                else if (spec.ret === 'bin') {
                    return yield bs.retrieveContent(hash);
                }
                else if (spec.ret === 'text') {
                    return (0, stream_1.decodeUTF8)(yield bs.retrieveContent(hash));
                }
                return hash;
            });
        }
        function processResource(spec) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (isFileResource(spec)) {
                        return yield processFile(spec);
                    }
                    else if (isDirectoryResource(spec)) {
                        return yield processDirectory(spec);
                    }
                    else if (isFuncResource(spec)) {
                        return yield processFunc(spec);
                    }
                    else if (isTableResource(spec)) {
                        return yield processTable(spec);
                    }
                    else if (isJSONResource(spec)) {
                        return yield processJSON(spec);
                    }
                    else if (isImportResource(spec)) {
                        return yield processImport(spec);
                    }
                    else if (isStringResource(spec)) {
                        return yield processString(spec);
                    }
                    else {
                        throw new Error('unrecognized resource: ' + JSON.stringify(spec));
                    }
                }
                catch (e) {
                    bs.logger.error(`error processing resource: ${JSON.stringify(spec)}`);
                    bs.logger.error(e);
                    throw e;
                }
            });
        }
        const buildResult = yield processResource(resource);
        if (resource.ret === 'bin') {
            return yield bs.storeContent(buildResult);
        }
        else if (resource.ret === 'text') {
            return yield bs.storeContent((0, stream_1.encodeUTF8)(buildResult));
        }
        else if (resource.ret === 'json') {
            return yield bs.storeJSON(buildResult);
        }
        else {
            return buildResult;
        }
    });
}
//# sourceMappingURL=build-resource.js.map