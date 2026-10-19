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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateVoxel = migrateVoxel;
const stringify_1 = require("@box/mudb/util/stringify");
const vb_parser_1 = require("@box/vb-parser");
const voxa_project_1 = require("@box/voxa-project");
const heavy_mutex_1 = require("./heavy_mutex");
function migrateVoxel(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        yield heavy_mutex_1.BUILD_HEAVY_LOCK.p();
        const t = Date.now();
        try {
            return yield migrateVoxelModel(bs, hash);
        }
        finally {
            bs.logger.info(`migrate voxel mesh ${hash} elapsed time ${Date.now() - t}ms`);
            heavy_mutex_1.BUILD_HEAVY_LOCK.v();
        }
    });
}
const migrateVoxelModel = (bs, hash) => __awaiter(void 0, void 0, void 0, function* () {
    // Qm开头的hash模型大概率在IPFS上，优先从IPFS中拉取资源
    if (hash.startsWith('Qm')) {
        try {
            return yield migrateIPFSModel(bs, hash);
        }
        catch (_a) {
            return yield migrateS3Model(bs, hash);
        }
    }
    return yield migrateS3Model(bs, hash);
});
const migrateIPFSModel = (bs, hash) => __awaiter(void 0, void 0, void 0, function* () {
    const vbData = yield bs.retrieveContent(hash);
    const json = JSON.parse(Buffer.from(vbData).toString());
    const voxaData = (0, vb_parser_1.parseVbFile)(json);
    const str = (0, stringify_1.stableStringify)(voxaData.model);
    if (!str) {
        throw new Error(`vb file invalid json ${hash}`);
    }
    const modelBytes = new Uint8Array(Buffer.from(str, 'utf8'));
    const metaData = (0, voxa_project_1.getModelMetaData)(hash, modelBytes);
    if (!metaData) {
        throw new Error(`error when get model ${hash} meta data`);
    }
    return yield storeBytesToLatestVersion(bs, hash, modelBytes, metaData);
});
const migrateS3Model = (bs, hash) => __awaiter(void 0, void 0, void 0, function* () {
    const metaBytes = yield bs.retrieveContentFromS3(hash);
    const metaData = (0, voxa_project_1.getModelMetaData)(hash, metaBytes);
    if (!metaData) {
        throw new Error(`error when get model ${hash} meta data`);
    }
    if (metaData.version === voxa_project_1.VOXA_MODEL_VERSION) {
        return hash;
    }
    const modelBytes = yield bs.retrieveContentFromS3(metaData.dataHash);
    return yield storeBytesToLatestVersion(bs, hash, modelBytes, metaData);
});
const storeBytesToLatestVersion = (bs, hash, bytes, metaData) => __awaiter(void 0, void 0, void 0, function* () {
    const modelData = yield (0, voxa_project_1.migrateModel)(bytes);
    if (!modelData) {
        throw new Error(`error when migrate voxa file ${hash}`);
    }
    const latestVersion = (0, voxa_project_1.modelSchemaToBytes)(modelData);
    const dataHash = yield bs.storeContentToS3(latestVersion);
    const { version: oldVersion, dataHash: oldHash } = metaData, remain = __rest(metaData, ["version", "dataHash"]);
    const newMetaData = Object.assign(Object.assign({}, remain), { version: modelData.version, dataHash });
    const metaBytes = new Uint8Array(Buffer.from(JSON.stringify(newMetaData), 'utf8'));
    return yield bs.storeContentToS3(metaBytes);
});
//# sourceMappingURL=migrate-voxel.js.map