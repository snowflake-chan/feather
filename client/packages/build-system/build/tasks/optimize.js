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
exports.optimizePNG = optimizePNG;
exports.optimizeDir = optimizeDir;
exports.optimizeJPG = optimizeJPG;
// asset optimization/minification stuff goes in here
const build_system_1 = require("../build-system");
const heavy_mutex_1 = require("./heavy_mutex");
const codecs_1 = require("../squoosh/codecs");
const squoosh_1 = require("../squoosh/squoosh");
function optimizePNG(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        if (bs.debug) {
            return hash;
        }
        yield heavy_mutex_1.BUILD_HEAVY_LOCK.p();
        const t = Date.now();
        try {
            return yield (0, codecs_1.squooshOxipng)(bs.contentServer, hash, 3);
        }
        catch (e) {
            bs.logger.error(`error calling optimize png with hash: ${hash}`);
            bs.logger.error(e);
            return hash;
        }
        finally {
            bs.logger.info(`reencode png ${hash} elapsed time = ${Date.now() - t} ms`);
            heavy_mutex_1.BUILD_HEAVY_LOCK.v();
        }
    });
}
function optimizeDir(bs_, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const assets = yield bs_.retrieveJSON(hash);
        if (typeof assets !== 'object') {
            throw new Error('invalid directory');
        }
        const errors = [];
        function optimizeRec(dir, prefix) {
            return __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(dir)) {
                    return Promise.all(dir.map((x, i) => optimizeRec(x, `${prefix}[${i}]`)));
                }
                else if (typeof dir === 'string') {
                    const x = yield optimizeRec({ default: dir }, prefix);
                    return x.default;
                }
                const result = {};
                yield Promise.all(Object.keys(dir).map((file) => __awaiter(this, void 0, void 0, function* () {
                    if (file === '.') {
                        return;
                    }
                    const entry = dir[file];
                    const K = prefix ? `${prefix}/${file}` : file;
                    if (typeof entry === 'string' && entry) {
                        const ext = file.slice(file.lastIndexOf('.') + 1).toLowerCase();
                        const bs = new build_system_1.BuildSystem(bs_.cache, bs_.contentServer, bs_.ossContentServer, bs_.nextUidListUsingGet, bs_.logger.child({ caller: `"${K}"` }), bs_.debug);
                        try {
                            if (ext === 'png' || ext === 'lut' || ext === 'part') {
                                return (result[file] = yield bs.build('optimizePNG', entry));
                            }
                            else {
                                return (result[file] = entry);
                            }
                        }
                        catch (e) {
                            bs_.logger.error(e);
                            errors.push(`${file} :: ${e.message}`);
                        }
                    }
                    else if (Array.isArray(entry)) {
                        return (result[file] = yield Promise.all(entry.map((x) => {
                            if (typeof x === 'object') {
                                return optimizeRec(x, K);
                            }
                            else {
                                return Promise.resolve(x);
                            }
                        })));
                    }
                    else if (typeof entry === 'object') {
                        return (result[file] = yield optimizeRec(entry, K));
                    }
                    return (result[file] = entry);
                })));
                return result;
            });
        }
        if (errors.length > 0) {
            throw new Error(errors.join('\n\n'));
        }
        return yield bs_.storeJSON(yield optimizeRec(assets, ''));
    });
}
function optimizeJPG(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        if (bs.debug) {
            return hash;
        }
        yield heavy_mutex_1.BUILD_HEAVY_LOCK.p();
        bs.logger.info(`building jpg ${hash}`);
        const t = Date.now();
        try {
            const image = yield (0, squoosh_1.decodeImage)({
                content: bs.contentServer,
                hash,
            });
            if (!image) {
                throw new Error(`Error decoding image: ${hash}`);
            }
            bs.logger.info(`image dimensions ${image.width}x${image.height}`);
            return yield (0, squoosh_1.encodeImage)({
                content: bs.contentServer,
                data: image.data,
                width: image.width,
                height: image.height,
                codec: 'mozjpeg',
            });
        }
        catch (e) {
            bs.logger.error(`error calling optimize png with hash: ${hash}`);
            bs.logger.error(e);
            return hash;
        }
        finally {
            bs.logger.info(`optimize jpg elapsed time ${Date.now() - t}`);
            heavy_mutex_1.BUILD_HEAVY_LOCK.v();
        }
    });
}
//# sourceMappingURL=optimize.js.map