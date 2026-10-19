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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtraProjectInfoSchema = exports.ScriptAssetSetsSchema = exports.ScriptAssetsSchema = exports.MeshPathSetsSchema = exports.MeshPathSchema = exports.SkinNameSetsSchema = exports.HotProjectSchema = exports.SkinAssetSetSchema = exports.SkinAssetSchema = exports.SkinAssetContent = exports.PictureAssetSetSchema = exports.PictureAssetSchema = exports.HotCollisionRules = exports.SoundTableSchema = exports.ScriptIndexSchema = exports.ScriptAssetSetSchema = exports.ScriptAssetSchema = exports.MeshAssetSetSchema = exports.MeshAssetSchema = exports.CustomBoundsSchema = exports.MotionListSchema = exports.MotionSchema = exports.HashType = exports.SeedSetSchema = exports.SeedSchema = exports.GamepadSchema = exports.VoxelSchema = exports.PhysicsSchema = exports.EnvironmentSchema = exports.PlayerSchema = exports.PrevHashSchema = exports.DisplayNameSchema = void 0;
exports.getMeshPath = getMeshPath;
const array_1 = require("@box/mudb/schema/array");
const ascii_1 = require("@box/mudb/schema/ascii");
const boolean_1 = require("@box/mudb/schema/boolean");
const dictionary_1 = require("@box/mudb/schema/dictionary");
const float32_1 = require("@box/mudb/schema/float32");
const float64_1 = require("@box/mudb/schema/float64");
const int32_1 = require("@box/mudb/schema/int32");
const struct_1 = require("@box/mudb/schema/struct");
const uint32_1 = require("@box/mudb/schema/uint32");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const ERDA = __importStar(require("./project-rda"));
const index_1 = require("../content-server/index");
const math_schema_1 = require("../utils/math-schema");
const block_schema_1 = require("../voxel/block-schema");
const script_protocol_1 = require("../script/script-protocol");
const defs_1 = require("./ui-rda/defs");
const player_schema_1 = require("../player/player-schema");
const pRDA = ERDA.ProjectRDA.stateSchema;
exports.DisplayNameSchema = pRDA.muData.info.muData.displayName;
exports.PrevHashSchema = pRDA.muData.prevHash;
exports.PlayerSchema = pRDA.muData.player;
exports.EnvironmentSchema = pRDA.muData.environment;
exports.PhysicsSchema = pRDA.muData.physics;
exports.VoxelSchema = pRDA.muData.voxels;
exports.GamepadSchema = pRDA.muData.gamepad;
exports.SeedSchema = ERDA.EntitySeedRDA.stateSchema;
exports.SeedSetSchema = new dictionary_1.MuDictionary(exports.SeedSchema, Infinity);
var HashType;
(function (HashType) {
    HashType["VOXEL_MODEL"] = "voxelModel";
    HashType["IMAGE"] = "image";
    HashType["GLTF_MODEL"] = "gltfModel";
})(HashType || (exports.HashType = HashType = {}));
function getMeshPath(meshName) {
    return `mesh/${meshName}.vb`;
}
exports.MotionSchema = new struct_1.MuStruct({
    id: new ascii_1.MuASCII(),
    name: new utf8_1.MuUTF8(),
    duration: new float32_1.MuFloat32(),
});
exports.MotionListSchema = new array_1.MuArray(exports.MotionSchema, Infinity);
exports.CustomBoundsSchema = new struct_1.MuStruct({
    /**
     * 框的大小
     */
    size: math_schema_1.Vec3Schema,
    /**
     * 自定义物理框与外观框锚点的偏移量
     * 目前外观框的锚点就是外观框的质心
     */
    offset: math_schema_1.Vec3Schema,
});
exports.MeshAssetSchema = new struct_1.MuStruct({
    hash: index_1.HashSchema,
    /**
     * meshHash为hash值经过migrateVoxel后转出来的最新版本的hash值
     */
    meshHash: index_1.HashSchema,
    bounds: math_schema_1.Vec3Schema,
    hashType: new utf8_1.MuUTF8(HashType.VOXEL_MODEL),
    /**
     * 动作列表
     */
    motionList: exports.MotionListSchema,
    /**
     * 是否用自定义物理模型
     */
    useCustomBounds: new boolean_1.MuBoolean(false),
    /**
     * 自定义物理模型
     */
    customBounds: exports.CustomBoundsSchema,
    /**
     * 外观框中心到锚点的距离
     */
    renderBoxOffset: math_schema_1.Vec3Schema,
});
exports.MeshAssetSetSchema = new dictionary_1.MuDictionary(exports.MeshAssetSchema, Infinity);
exports.ScriptAssetSchema = new struct_1.MuStruct({
    hash: index_1.HashSchema,
    isClient: new boolean_1.MuBoolean(false),
});
exports.ScriptAssetSetSchema = new dictionary_1.MuDictionary(exports.ScriptAssetSchema, Infinity);
exports.ScriptIndexSchema = new array_1.MuArray(new utf8_1.MuUTF8(), Infinity);
// sound asset schema
exports.SoundTableSchema = new struct_1.MuStruct({
    hashes: new array_1.MuArray(index_1.HashSchema, Infinity, ['']),
    hashId: new dictionary_1.MuDictionary(new varint_1.MuVarint(), Infinity),
});
exports.HotCollisionRules = new array_1.MuArray(script_protocol_1.SciptCollisionFilterSpecSchema, Infinity);
exports.PictureAssetSchema = new struct_1.MuStruct({
    metadataHash: index_1.HashSchema,
    hash: index_1.HashSchema,
    width: new int32_1.MuInt32(),
    height: new int32_1.MuInt32(),
});
exports.PictureAssetSetSchema = new dictionary_1.MuDictionary(exports.PictureAssetSchema, Infinity);
exports.SkinAssetContent = {
    hash: index_1.HashSchema,
    parts: player_schema_1.PlayerSkinHashSchema,
};
exports.SkinAssetSchema = new struct_1.MuStruct(exports.SkinAssetContent);
exports.SkinAssetSetSchema = new dictionary_1.MuDictionary(exports.SkinAssetSchema, Infinity);
exports.HotProjectSchema = new struct_1.MuStruct({
    version: new ascii_1.MuASCII('0.0.27'),
    name: new utf8_1.MuUTF8(),
    // block info
    blockInfoHash: index_1.HashSchema,
    blockInfo: block_schema_1.BlockInfoSchema,
    // Copied
    environment: exports.EnvironmentSchema,
    physics: exports.PhysicsSchema,
    player: exports.PlayerSchema,
    voxels: exports.VoxelSchema,
    seeds: exports.SeedSetSchema,
    assets: ERDA.AssetsRDA.stateSchema,
    /**
     * 音频资源字典，复制ProjectRDA的audioAssets
     */
    audioAssets: ERDA.GroupAssetsRDA.stateSchema,
    sound: ERDA.AmbientSoundRDA.stateSchema,
    features: ERDA.ProjectFeatureRDA.stateSchema,
    zones: ERDA.ZoneSetRDA.stateSchema,
    gamepad: ERDA.GamepadRDA.stateSchema,
    // collision rules
    collisionRules: exports.HotCollisionRules,
    // sound assets
    soundAssets: exports.SoundTableSchema,
    // Mesh assets
    meshAssets: exports.MeshAssetSetSchema,
    // script assets
    modules: exports.ScriptAssetSetSchema,
    scriptIndex: new utf8_1.MuUTF8(),
    uiTree: defs_1.UITreeRDA.stateSchema,
    defaultScreenId: new utf8_1.MuUTF8(),
    pictureAssets: exports.PictureAssetSetSchema,
    // skin assets
    skinAssets: exports.SkinAssetSetSchema,
    defaultSkinName: new utf8_1.MuUTF8(),
});
/**
 * 以皮肤name为key的字典
 */
exports.SkinNameSetsSchema = new dictionary_1.MuDictionary(new struct_1.MuStruct({
    hash: index_1.HashSchema,
}), Infinity);
exports.MeshPathSchema = new struct_1.MuStruct({
    modelId: new float64_1.MuFloat64(),
    hash: index_1.HashSchema,
    modelPreviewHash: index_1.HashSchema,
    animated: new boolean_1.MuBoolean(),
    updatedAt: new ascii_1.MuASCII(),
});
/**
 * 以模型调用路径path为key的字段
 * 模型调用路径，即用模型名字name固定拼接的字符串
 * `mesh/${名字}.vb`
 */
exports.MeshPathSetsSchema = new dictionary_1.MuDictionary(exports.MeshPathSchema, Infinity);
exports.ScriptAssetsSchema = new struct_1.MuStruct({
    hash: index_1.HashSchema,
    name: new utf8_1.MuUTF8(''),
    isClient: new boolean_1.MuBoolean(false),
    isShare: new boolean_1.MuBoolean(false),
    order: new int32_1.MuInt32(0),
    lockedMapTitle: new utf8_1.MuUTF8(''),
    lockedMapId: new uint32_1.MuUint32(),
    id: new utf8_1.MuUTF8(''),
});
exports.ScriptAssetSetsSchema = new dictionary_1.MuDictionary(exports.ScriptAssetsSchema, Infinity);
exports.ExtraProjectInfoSchema = new struct_1.MuStruct({
    meshAssets: exports.MeshPathSetsSchema,
    skinAssets: exports.SkinNameSetsSchema,
    defaultSkinName: new utf8_1.MuUTF8(),
    // 共享脚本 + 本地脚本，因为是后端排序，所以需要保存全量
    // fileid: file
    scriptAssets: exports.ScriptAssetSetsSchema,
});
