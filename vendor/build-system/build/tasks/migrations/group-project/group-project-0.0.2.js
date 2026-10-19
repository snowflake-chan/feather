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
exports.AudioAssets_002 = exports.UiTree_002 = void 0;
const math_schema_1 = require("@box/schema/utils/math-schema");
const fromVersion = '0.0.1';
const toVersion = '0.0.2';
function noMigration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return hash;
    });
}
exports.UiTree_002 = {
    name: 'uiTree',
    fromVersion,
    toVersion,
    migration: noMigration,
};
/**
 * 音频也需要migration
 * - 0.3.17补充animated字段，设置为false
 * - 0.3.13补充bounds字段
 */
function audioAssetsMigration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const audioAssets = yield bs.retrieveJSON(hash);
        const newAudioAssets = {};
        Object.keys(audioAssets).forEach((key) => {
            const asset = audioAssets[key];
            if (!asset) {
                return;
            }
            asset.animated = false;
            if (!asset.bounds) {
                asset.bounds = math_schema_1.Vec3Schema.clone(math_schema_1.Vec3Schema.identity);
            }
            newAudioAssets[key] = asset;
        });
        return bs.storeJSON(newAudioAssets);
    });
}
exports.AudioAssets_002 = {
    name: 'audioAssets',
    fromVersion,
    toVersion,
    migration: audioAssetsMigration,
};
//# sourceMappingURL=group-project-0.0.2.js.map