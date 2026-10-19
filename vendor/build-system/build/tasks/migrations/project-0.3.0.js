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
exports.name = 'project';
exports.fromVersion = '0.2.2';
exports.toVersion = '0.3.0';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.0';
        project.prevHash = hash;
        // split assets into subtypes and remove timestamps
        const assets = {};
        const scriptAssets = {};
        const keys = Object.keys(project.assets);
        keys.sort();
        for (let i = 0; i < keys.length; ++i) {
            const path = keys[i];
            const asset = project.assets[path];
            delete asset.createdAt;
            delete asset.lastModified;
            if (asset.type === 1) {
                scriptAssets[path] = asset;
            }
            else {
                assets[path] = asset;
            }
        }
        const [infoHash, entitiesHash, assetsHash, scriptAssetsHash, deleteAssetsHash, voxelsHash, playerHash, environmentHash, physicsHash, ambientSoundHash,] = yield Promise.all([
            bs.storeJSON({
                displayName: project.displayName,
                description: project.description,
                previewImage: project.previewImage,
                bannerImages: project.bannerImages,
            }),
            bs.storeJSON(project.entities),
            bs.storeJSON(assets),
            bs.storeJSON(scriptAssets),
            bs.storeJSON(project.deleteAssets || []),
            bs.storeJSON(project.voxels),
            bs.storeJSON(project.player),
            bs.storeJSON(project.environment),
            bs.storeJSON(project.physics),
            bs.storeJSON(project.ambientSound),
        ]);
        project.info = infoHash;
        project.entities = entitiesHash;
        project.assets = assetsHash;
        project.scriptAssets = scriptAssetsHash;
        project.deleteAssets = deleteAssetsHash;
        project.voxels = voxelsHash;
        project.player = playerHash;
        project.environment = environmentHash;
        project.physics = physicsHash;
        project.ambientSound = ambientSoundHash;
        // delete old display info
        delete project.displayName;
        delete project.description;
        delete project.previewImage;
        delete project.bannerImages;
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.0.js.map