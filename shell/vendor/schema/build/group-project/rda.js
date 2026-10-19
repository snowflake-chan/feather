"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupProjectStateSchema = exports.GroupProjectStoreSchema = exports.GroupProjectRDA = exports.GroupAssetsRDA = exports.GroupAssetEntryRDA = exports.CommonAssets = exports.AssetTypeSchema = exports.AssetType = void 0;
const rda_1 = require("@box/mudb/rda");
const ascii_1 = require("@box/mudb/schema/ascii");
const float64_1 = require("@box/mudb/schema/float64");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const index_1 = require("../content-server/index");
const defs_1 = require("../project/ui-rda/defs");
var AssetType;
(function (AssetType) {
    AssetType[AssetType["JS_SCRIPT"] = 1] = "JS_SCRIPT";
    AssetType[AssetType["VOXEL_MODEL"] = 2] = "VOXEL_MODEL";
    AssetType[AssetType["COLOR_LUT"] = 3] = "COLOR_LUT";
    AssetType[AssetType["PARTICLE_TEXTURE"] = 4] = "PARTICLE_TEXTURE";
    AssetType[AssetType["IMAGE"] = 5] = "IMAGE";
    AssetType[AssetType["AUDIO"] = 6] = "AUDIO";
    AssetType[AssetType["CLIENT_JS_SCRIPT"] = 7] = "CLIENT_JS_SCRIPT";
    /**
     * 新增图片类型资源
     * PICTURE会被存储至OSS中。
     * IMAGE存储至IPFS中。
     */
    AssetType[AssetType["PICTURE"] = 8] = "PICTURE";
    /**
     * 新增GLTF类型资源
     */
    AssetType[AssetType["GLTF_MODEL"] = 9] = "GLTF_MODEL";
})(AssetType || (exports.AssetType = AssetType = {}));
exports.AssetTypeSchema = (new varint_1.MuVarint(AssetType.VOXEL_MODEL));
exports.CommonAssets = {
    type: new rda_1.MuRDAConstant(exports.AssetTypeSchema),
    /**
     * type为VOXEL_MODEL时
     * voxa导出的作品这里存的是modelFileHash，数据是modelMetaData
     * 旧版.vb作品这里存的是.vb格式的hash，为工程文件
     */
    hash: new rda_1.MuRDARegister(index_1.HashSchema),
    size: new rda_1.MuRDARegister(new varint_1.MuVarint(0)),
    previewImage: new rda_1.MuRDARegister(new ascii_1.MuASCII()),
};
exports.GroupAssetEntryRDA = new rda_1.MuRDAStruct(Object.assign({ id: new rda_1.MuRDARegister(new ascii_1.MuASCII()), updateAt: new rda_1.MuRDARegister(new float64_1.MuFloat64()) }, exports.CommonAssets));
exports.GroupAssetsRDA = new rda_1.MuRDAMap(new utf8_1.MuUTF8(), exports.GroupAssetEntryRDA);
/**
 * 地图组数据的RDA，用于定义地图数据结构
 * 该数据会合并到ProjectRDA中
 */
exports.GroupProjectRDA = {
    uiTree: defs_1.UITreeRDA,
    audioAssets: exports.GroupAssetsRDA,
    pictureAssets: exports.GroupAssetsRDA,
};
const { storeSchema: GroupProjectStoreSchema, stateSchema: GroupProjectStateSchema, } = new rda_1.MuRDAStruct(exports.GroupProjectRDA);
exports.GroupProjectStoreSchema = GroupProjectStoreSchema;
exports.GroupProjectStateSchema = GroupProjectStateSchema;
