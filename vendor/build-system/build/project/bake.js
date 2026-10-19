"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ProjectBakeCache = void 0;
exports.copySoundAssets = copySoundAssets;
exports.hasRuntimeAssetHash = hasRuntimeAssetHash;
exports.resolveSeedMeshInfo = resolveSeedMeshInfo;
exports.updateHotProjectAssets = updateHotProjectAssets;
const Cold = __importStar(require("@box/schema/project/project-rda"));
const Hot = __importStar(require("@box/schema/project/hot-schema"));
const stream_1 = require("@box/mudb/stream");
const block_schema_1 = require("@box/schema/voxel/block-schema");
const bounds_schema_1 = require("./bounds-schema");
const script_protocol_1 = require("@box/schema/script/script-protocol");
const murda_tree_1 = require("@box/schema/project/murda-tree");
const voxa_project_1 = require("@box/voxa-project");
const defs_1 = require("@box/schema/project/ui-rda/defs");
const math_schema_1 = require("@box/schema/utils/math-schema");
function copySoundAssets(hp) {
    Hot.SoundTableSchema.assign(hp.soundAssets, Hot.SoundTableSchema.identity);
    const { audioAssets } = hp;
    Object.keys(audioAssets).forEach((path) => {
        const asset = audioAssets[path];
        if (asset.type === Cold.AssetType.AUDIO) {
            const hash = asset.hash;
            if (hash in hp.soundAssets.hashId) {
                return;
            }
            hp.soundAssets.hashId[path] = hp.soundAssets.hashId[hash] =
                hp.soundAssets.hashes.length;
            hp.soundAssets.hashes.push(hash);
        }
    });
}
/**
 * An imported cloud project can contain a dangling model-library entry whose
 * hash was never saved. Do not pass an empty value into migrateVoxel: there is
 * no resource to migrate, and failing the complete prebake makes an otherwise
 * playable map permanently unavailable.
 */
function hasRuntimeAssetHash(hash) {
    return typeof hash === 'string' && hash.trim().length > 0;
}
/**
 * A local project model and its VOXA source can legitimately have the same
 * numeric model id. The entity path is authoritative in that case. Falling
 * back to model id preserves Boxes' rename/migration behaviour for legacy
 * entities whose old path no longer exists.
 */
function resolveSeedMeshInfo(meshPath, meshId, meshAssets, meshIdSetCache) {
    const mesh = meshAssets[meshPath];
    if (mesh) {
        return {
            hash: mesh.hash,
            path: meshPath,
            bounds: [mesh.bounds[0], mesh.bounds[1], mesh.bounds[2]],
            motionIds: mesh.motionList.map((motion) => motion.id),
        };
    }
    return meshIdSetCache[meshId];
}
class ProjectBakeCache {
    constructor(content, build, blockInfoHash) {
        this.blockInfoHash = blockInfoHash;
        this.meshIdSetCache = {};
        this._meshInfoCache = {};
        this._blockInfoCache = {};
        this._pictureInfoCache = {};
        this._skinInfoCache = {};
        this.content = content;
        this.build = build;
    }
    destroy() {
        Object.keys(this._blockInfoCache).forEach((hash) => {
            const blockInfo = this._blockInfoCache[hash];
            block_schema_1.BlockInfoSchema.free(blockInfo);
        });
        this._blockInfoCache = {};
        Object.keys(this._meshInfoCache).forEach((hash) => {
            const meshInfo = this._meshInfoCache[hash];
            Hot.MeshAssetSchema.free(meshInfo);
        });
        this._meshInfoCache = {};
        Object.keys(this._pictureInfoCache).forEach((hash) => {
            const pictureInfo = this._pictureInfoCache[hash];
            Hot.PictureAssetSchema.free(pictureInfo);
        });
        this._pictureInfoCache = {};
        Object.keys(this._skinInfoCache).forEach((hash) => {
            const skinInfo = this._skinInfoCache[hash];
            Hot.SkinAssetSchema.free(skinInfo);
        });
        this._skinInfoCache = {};
    }
    getMeshInfo(hash, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const prev = this._meshInfoCache[hash];
            if (prev) {
                return prev;
            }
            const info = Hot.MeshAssetSchema.alloc();
            info.hash = hash;
            if (type === Cold.AssetType.IMAGE) {
                info.hashType = Hot.HashType.IMAGE;
                info.meshHash = hash;
                const bounds = yield this._retrieveImageBounds(info.meshHash);
                info.bounds[0] = bounds.hix - bounds.lox;
                info.bounds[1] = bounds.hiy - bounds.loy;
                info.bounds[2] = bounds.hiz - bounds.loz;
                info.renderBoxOffset[0] = 0;
                info.renderBoxOffset[1] = 0;
                info.renderBoxOffset[2] = 0;
            }
            else if (type === Cold.AssetType.GLTF_MODEL) {
                info.hashType = Hot.HashType.GLTF_MODEL;
                info.meshHash = hash;
                const bounds = this.retrieveGLTFMetaData(info.meshHash);
                info.bounds[0] = bounds[0];
                info.bounds[1] = bounds[1];
                info.bounds[2] = bounds[2];
                info.renderBoxOffset[0] = 0;
                info.renderBoxOffset[1] = 0;
                info.renderBoxOffset[2] = 0;
            }
            else {
                info.hashType = Hot.HashType.VOXEL_MODEL;
                info.meshHash = yield this.build.build('migrateVoxel', hash);
                const { bounds, motionList, useCustomBounds, customBounds, renderBoxOffset, } = yield this._retrieveVoxelMetaData(info.meshHash);
                info.bounds[0] = bounds.hix - bounds.lox;
                info.bounds[1] = bounds.hiy - bounds.loy;
                info.bounds[2] = bounds.hiz - bounds.loz;
                info.motionList = motionList;
                info.useCustomBounds = useCustomBounds;
                info.customBounds = customBounds;
                info.renderBoxOffset = renderBoxOffset;
            }
            this._meshInfoCache[hash] = info;
            return info;
        });
    }
    _retrieveImageBounds(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const imgBuffer = yield this.content.retrieve(hash);
            if (!imgBuffer || !imgBuffer.length) {
                return bounds_schema_1.IntBoundsSchema.clone(bounds_schema_1.IntBoundsSchema.identity);
            }
            const imgJson = JSON.parse(Buffer.from(imgBuffer).toString());
            const intBounds = bounds_schema_1.IntBoundsSchema.alloc();
            intBounds.lox = 0;
            intBounds.loy = 0;
            intBounds.loz = 0;
            intBounds.hix = imgJson.width;
            intBounds.hiy = imgJson.height;
            intBounds.hiz = 0;
            return intBounds;
        });
    }
    _retrieveVoxelMetaData(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const intBounds = bounds_schema_1.IntBoundsSchema.clone(bounds_schema_1.IntBoundsSchema.identity);
            const motionList = Hot.MotionListSchema.clone(Hot.MotionListSchema.identity);
            const customBounds = Hot.CustomBoundsSchema.clone(Hot.CustomBoundsSchema.identity);
            const renderBoxOffset = math_schema_1.Vec3Schema.clone(math_schema_1.Vec3Schema.identity);
            const metaDataBytes = yield this.build.retrieveContentFromS3(hash);
            if (!metaDataBytes || !metaDataBytes.length) {
                return {
                    bounds: intBounds,
                    motionList,
                    useCustomBounds: false,
                    customBounds,
                    renderBoxOffset,
                };
            }
            const metaData = JSON.parse(Buffer.from(metaDataBytes).toString());
            intBounds.lox = 0;
            intBounds.loy = 0;
            intBounds.loz = 0;
            intBounds.hix = metaData.bounds[0];
            intBounds.hiy = metaData.bounds[1];
            intBounds.hiz = metaData.bounds[2];
            if (metaData.motionList) {
                metaData.motionList.forEach((motion) => {
                    motionList.push({
                        id: motion.id,
                        name: motion.name,
                        duration: motion.duration,
                    });
                });
            }
            if (metaData.customBounds) {
                const { offset, size } = metaData.customBounds;
                customBounds.offset[0] = offset[0];
                customBounds.offset[1] = offset[1];
                customBounds.offset[2] = offset[2];
                customBounds.size[0] = size[0];
                customBounds.size[1] = size[1];
                customBounds.size[2] = size[2];
            }
            else {
                // 模型文件没有自定义物理框数据就用默认物理框数据
                customBounds.size[0] = intBounds.hix - intBounds.lox;
                customBounds.size[1] = intBounds.hiy - intBounds.loy;
                customBounds.size[2] = intBounds.hiz - intBounds.loz;
            }
            if (metaData.renderBoxOffset) {
                renderBoxOffset[0] = metaData.renderBoxOffset[0];
                renderBoxOffset[1] = metaData.renderBoxOffset[1];
                renderBoxOffset[2] = metaData.renderBoxOffset[2];
            }
            else {
                renderBoxOffset[0] = 0;
                renderBoxOffset[1] = 0;
                renderBoxOffset[2] = 0;
            }
            return {
                bounds: intBounds,
                motionList,
                useCustomBounds: !!metaData.useCustomBounds,
                customBounds,
                renderBoxOffset,
            };
        });
    }
    retrieveGLTFMetaData(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const metaDataBytes = yield this.build.retrieveContentFromS3(hash);
            if (!metaDataBytes) {
                return {
                    bounds: [0, 0, 0],
                };
            }
            const metaData = JSON.parse(Buffer.from(metaDataBytes).toString());
            return {
                bounds: metaData.bounds,
            };
        });
    }
    _getPicture(metadataHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._pictureInfoCache[metadataHash]) {
                return this._pictureInfoCache[metadataHash];
            }
            const bufferArr = yield this.build.retrieveContentFromS3(metadataHash);
            const metadata = JSON.parse(Buffer.from(bufferArr).toString());
            this._pictureInfoCache[metadataHash] = Object.assign({ metadataHash }, metadata);
            return this._pictureInfoCache[metadataHash];
        });
    }
    _getSkinAsset(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = this._skinInfoCache[hash];
            if (cache) {
                return cache;
            }
            const skinInfo = Hot.SkinAssetSchema.alloc();
            skinInfo.hash = hash;
            const metaDataBytes = yield this.build.retrieveContentFromS3(hash);
            const metaData = (0, voxa_project_1.getSkinMetaData)(metaDataBytes);
            if (!metaData) {
                throw new Error(`Failed to get skin metaData with hash: ${hash}`);
            }
            const latestHash = yield this.build.build('migrateSkin', hash, metaData);
            const bufferArr = yield this.build.retrieveContentFromS3(latestHash);
            const skinMetaData = (0, voxa_project_1.getSkinMetaData)(bufferArr);
            Object.keys(skinInfo.parts).forEach((partName) => {
                const partHash = skinMetaData ? skinMetaData[partName] : '';
                skinInfo.parts[partName] = partHash || '';
            });
            this._skinInfoCache[hash] = skinInfo;
            return this._skinInfoCache[hash];
        });
    }
    _getBlockInfo(hp, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            hp.blockInfoHash = hash;
            if (!(hash in this._blockInfoCache)) {
                const bytes = yield this.content.retrieve(hash);
                if (!bytes) {
                    throw new Error('missing block info hash');
                }
                const stream = new stream_1.MuReadStream(bytes);
                const info = block_schema_1.BlockInfoSchema.patch(block_schema_1.BlockInfoSchema.identity, stream);
                this._blockInfoCache[hash] = info;
                block_schema_1.BlockInfoSchema.assign(hp.blockInfo, info);
            }
            else {
                block_schema_1.BlockInfoSchema.assign(hp.blockInfo, this._blockInfoCache[hash]);
            }
        });
    }
    bake(cold, extra, hp_) {
        return __awaiter(this, void 0, void 0, function* () {
            const pending = [];
            // make a copy so we can safely run asynchronously
            const hp = hp_ || Hot.HotProjectSchema.clone(Hot.HotProjectSchema.identity);
            // save project name
            hp.name = cold.info.displayName;
            // copy basic stuff
            Hot.EnvironmentSchema.assign(hp.environment, cold.environment);
            Hot.PhysicsSchema.assign(hp.physics, cold.physics);
            Hot.PlayerSchema.assign(hp.player, cold.player);
            Hot.GamepadSchema.assign(hp.gamepad, cold.gamepad);
            updateHotProjectAssets(hp, cold);
            Cold.AmbientSoundRDA.stateSchema.assign(hp.sound, cold.ambientSound);
            Cold.ProjectFeatureRDA.stateSchema.assign(hp.features, cold.features);
            Cold.ZoneSetRDA.stateSchema.assign(hp.zones, cold.zones);
            defs_1.UITreeRDA.stateSchema.assign(hp.uiTree, cold.uiTree);
            Hot.VoxelSchema.assign(hp.voxels, cold.voxels);
            hp.scriptIndex = cold.scriptIndex;
            hp.defaultScreenId = cold.defaultScreenId;
            // copy collision rules
            Hot.HotCollisionRules.assign(hp.collisionRules, Hot.HotCollisionRules.identity);
            Object.keys(cold.collisionFilter).forEach((id) => {
                const rule = cold.collisionFilter[id];
                const spec = script_protocol_1.SciptCollisionFilterSpecSchema.alloc();
                spec.a = rule.selectorA;
                spec.b = rule.selectorB;
                hp.collisionRules.push(spec);
            });
            // preload voxel data
            pending.push(this._getBlockInfo(hp, this.blockInfoHash));
            // sync all assets from cold to warm
            function syncAssets(coldAssets, validator, schema, warm, load) {
                // update new assets
                const coldItems = Object.keys(coldAssets);
                for (let i = 0; i < coldItems.length; ++i) {
                    const url = coldItems[i];
                    const coldItem = coldAssets[url];
                    if (validator && !validator(coldItem)) {
                        continue;
                    }
                    if (url in warm) {
                        const warmItem = warm[url];
                        if (warmItem.hash !== coldItem.hash) {
                            pending.push(load(warmItem, coldItem, url));
                        }
                    }
                    else {
                        const warmItem = schema.clone(schema.identity);
                        warm[url] = warmItem;
                        warmItem.hash = coldItem.hash;
                        pending.push(load(warmItem, coldItem, url));
                    }
                }
                // remove old assets
                const items = Object.keys(warm);
                for (let i = 0; i < items.length; ++i) {
                    const url = items[i];
                    if (!(url in coldAssets) ||
                        (validator && !validator(coldAssets[url]))) {
                        const asset = warm[url];
                        schema.free(asset);
                        delete warm[url];
                    }
                }
            }
            // copy sound asset hashes over
            copySoundAssets(hp);
            // synchornize assets
            syncAssets(cold.assets, (coldItem) => {
                return (coldItem.type === Cold.AssetType.JS_SCRIPT ||
                    coldItem.type === Cold.AssetType.CLIENT_JS_SCRIPT);
            }, Hot.ScriptAssetSchema, hp.modules, (script, spec) => __awaiter(this, void 0, void 0, function* () {
                script.hash = spec.hash;
                script.isClient = spec.type === Cold.AssetType.CLIENT_JS_SCRIPT;
            }));
            // 同步共享代码
            Object.keys(extra.scriptAssets)
                .filter((id) => {
                return extra.scriptAssets[id].isShare;
            })
                .forEach((id) => {
                const script = extra.scriptAssets[id];
                const warmItem = Hot.ScriptAssetSchema.clone(Hot.ScriptAssetSchema.identity);
                warmItem.hash = script.hash;
                warmItem.isClient = script.isClient;
                hp.modules[script.name] = warmItem;
            });
            syncAssets(Object.assign({}, cold.assets, extra.meshAssets), (coldItem) => {
                const isMeshAsset = !!coldItem.modelId ||
                    [
                        Cold.AssetType.VOXEL_MODEL,
                        Cold.AssetType.IMAGE,
                        Cold.AssetType.GLTF_MODEL,
                    ].includes(coldItem.type);
                if (isMeshAsset && !hasRuntimeAssetHash(coldItem.hash)) {
                    this.build.logger.warn('Skipping a model asset with an empty resource hash while baking the map.');
                    return false;
                }
                return isMeshAsset;
            }, Hot.MeshAssetSchema, hp.meshAssets, (mesh, spec, url) => __awaiter(this, void 0, void 0, function* () {
                const info = yield this.getMeshInfo(spec.hash, spec.modelId ? Cold.AssetType.VOXEL_MODEL : spec.type);
                if (spec.modelId) {
                    this.meshIdSetCache[spec.modelId] = {
                        hash: spec.hash,
                        path: url,
                        bounds: [info.bounds[0], info.bounds[1], info.bounds[2]],
                        motionIds: info.motionList.map((motion) => motion.id),
                    };
                }
                Hot.MeshAssetSchema.assign(mesh, info);
            }));
            syncAssets(cold.pictureAssets, undefined, Hot.PictureAssetSchema, hp.pictureAssets, (picture, spec) => __awaiter(this, void 0, void 0, function* () {
                const info = yield this._getPicture(spec.hash);
                Hot.PictureAssetSchema.assign(picture, info);
            }));
            syncAssets(extra.skinAssets, undefined, Hot.SkinAssetSchema, hp.skinAssets, (result, spec) => __awaiter(this, void 0, void 0, function* () {
                const info = yield this._getSkinAsset(spec.hash);
                Hot.SkinAssetSchema.assign(result, info);
            }));
            hp.defaultSkinName = extra.defaultSkinName;
            // wait for all pending promises
            if (pending.length > 0) {
                yield Promise.all(pending);
            }
            // copy seeds from entities tree
            Hot.SeedSetSchema.assign(hp.seeds, Hot.SeedSetSchema.identity);
            Object.keys(cold.entitiesTree).forEach((id) => {
                const entityNode = cold.entitiesTree[id];
                if (entityNode.type !== murda_tree_1.TreeNodeType.leaf || !entityNode.value) {
                    return;
                }
                const seed = Hot.SeedSchema.clone(entityNode.value);
                const meshInfo = resolveSeedMeshInfo(seed.mesh, seed.meshId, hp.meshAssets, this.meshIdSetCache);
                if (meshInfo) {
                    seed.mesh = meshInfo.path;
                    seed.bounds[0] = meshInfo.bounds[0];
                    seed.bounds[1] = meshInfo.bounds[1];
                    seed.bounds[2] = meshInfo.bounds[2];
                    // 默认动作重置规则：
                    // 非静态动作 且 在动作列表中不存在此动作时，重置为动作列表的首个动作
                    if (seed.defaultMotionId &&
                        !meshInfo.motionIds.includes(seed.defaultMotionId)) {
                        seed.defaultMotionId = meshInfo.motionIds[0] || '';
                    }
                }
                hp.seeds[id] = seed;
            });
            return hp;
        });
    }
}
exports.ProjectBakeCache = ProjectBakeCache;
/**
 * 通过ProjectRDA中的资源更新HotProject的资源
 */
function updateHotProjectAssets(out, projectInfo) {
    Cold.AssetsRDA.stateSchema.assign(out.assets, projectInfo.assets);
    Cold.GroupAssetsRDA.stateSchema.assign(out.audioAssets, projectInfo.audioAssets);
}
//# sourceMappingURL=bake.js.map