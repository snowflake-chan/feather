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
exports.toVersion = exports.fromVersion = exports.name = void 0;
exports.migration = migration;
const project_rda_1 = require("@box/schema/project/project-rda");
exports.name = 'project';
exports.fromVersion = '0.3.26';
exports.toVersion = '0.3.27';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.27';
        project.prevHash = hash;
        const assets = yield bs.retrieveJSON(project.assets);
        const pictureAssets = {};
        for (const key in assets) {
            const asset = assets[key];
            if (asset.type === project_rda_1.AssetType.PICTURE) {
                // 构造pictureAssets结构，id在后面统一生成
                pictureAssets[key] = {
                    id: '',
                    updateAt: Date.now(),
                    type: asset.type,
                    hash: asset.hash,
                    size: asset.size,
                    previewImage: asset.previewImage,
                };
                // 删除asset中type为图片的字段
                delete assets[key];
            }
            // 删除asset中type为音频的字段
            if (asset.type === project_rda_1.AssetType.AUDIO) {
                delete assets[key];
            }
        }
        // 生成并修改图片id
        const pictureIds = yield getAssetsIds(bs, Object.keys(pictureAssets).length);
        Object.keys(pictureAssets).forEach((key, idx) => (pictureAssets[key].id = pictureIds[idx]));
        // 存储新assets字段和pictureAssets字段
        project.assets = yield bs.storeJSON(assets);
        project.pictureAssets = yield bs.storeJSON(pictureAssets);
        const audioAssets = yield bs.retrieveJSON(project.audioAssets);
        // 生成音频资源id
        const audioIds = yield getAssetsIds(bs, Object.keys(audioAssets).length);
        Object.keys(audioAssets).forEach((key, idx) => {
            const audioAsset = audioAssets[key];
            audioAssets[key] = {
                id: audioIds[idx],
                updateAt: Date.now(),
                type: audioAsset.type,
                hash: audioAsset.hash,
                size: audioAsset.size,
                previewImage: audioAsset.previewImage,
            };
        });
        project.audioAssets = yield bs.storeJSON(audioAssets);
        return bs.storeJSON(project);
    });
}
const MAX_FETCH_COUNT = 50;
function getAssetsIds(bs, num) {
    return __awaiter(this, void 0, void 0, function* () {
        const loopCount = Math.ceil(num / MAX_FETCH_COUNT);
        const lastNum = num % MAX_FETCH_COUNT;
        const ids = [];
        for (let i = 0; i < loopCount; i++) {
            const fetchCount = i === loopCount - 1 ? lastNum : MAX_FETCH_COUNT;
            ids.push(...(yield bs.nextUidListUsingGet({ num: fetchCount })));
        }
        return ids;
    });
}
//# sourceMappingURL=project-0.3.27.js.map