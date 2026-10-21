"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProtocol = exports.NetSkinTableSchema = exports.NetSkinSchema = exports.NetModelSetSchema = exports.NetSkinPartTableSchema = exports.NetSkinPartSchema = exports.NetMeshTableSchema = exports.NetMeshTableEntrySchema = exports.NetModelSchema = exports.NetModelSchemaContent = exports.NetModelMotionSchema = exports.PlaybackSchema = exports.MotionsPlaybackSchema = exports.MotionPlaybackSchema = exports.HashSchema = void 0;
const hot_schema_1 = require("../project/hot-schema");
const schema_1 = require("@box/mudb/schema");
const id_1 = require("@box/utils/id");
exports.HashSchema = new schema_1.MuASCII();
exports.MotionPlaybackSchema = new schema_1.MuStruct({
    motionId: new schema_1.MuASCII(),
    /**
     * -1 means Infinity
     */
    cycleCount: new schema_1.MuInt32(1),
});
exports.MotionsPlaybackSchema = new schema_1.MuArray(exports.MotionPlaybackSchema, Infinity);
exports.PlaybackSchema = new schema_1.MuStruct({
    motions: exports.MotionsPlaybackSchema,
    startTick: new schema_1.MuFloat64(),
    /**
     * -1 means Infinity
     */
    cycleCount: new schema_1.MuInt32(1),
});
exports.NetModelMotionSchema = new schema_1.MuStruct({
    /**
     * 默认动作id
     */
    defaultMotionId: new schema_1.MuASCII(),
    /**
     * 是否暂停
     */
    paused: new schema_1.MuBoolean(false),
    /**
     * 暂停时的帧数
     */
    pausedTick: new schema_1.MuFloat64(),
    /**
     * 默认动作开始的帧数
     */
    startTick: new schema_1.MuFloat64(),
    /**
     * 动作链数据
     */
    playback: exports.PlaybackSchema,
});
exports.NetModelSchemaContent = {
    // entity id
    id: new schema_1.MuVarint(),
    // mesh id reference
    meshId: new schema_1.MuVarint(),
    // mesh
    invisible: new schema_1.MuBoolean(false),
    // tint
    red: new schema_1.MuUint8(255),
    green: new schema_1.MuUint8(255),
    blue: new schema_1.MuUint8(255),
    alpha: new schema_1.MuUint8(255),
    emissive: new schema_1.MuQuantizedFloat(1 / 256, 0),
    shininess: new schema_1.MuQuantizedFloat(1 / 256, 0),
    metalness: new schema_1.MuQuantizedFloat(1 / 256, 0),
    // transformation
    scaleX: new schema_1.MuQuantizedFloat(1 / 256, 1),
    scaleY: new schema_1.MuQuantizedFloat(1 / 256, 1),
    scaleZ: new schema_1.MuQuantizedFloat(1 / 256, 1),
    offsetX: new schema_1.MuQuantizedFloat(1 / 256, 0),
    offsetY: new schema_1.MuQuantizedFloat(1 / 256, 0),
    offsetZ: new schema_1.MuQuantizedFloat(1 / 256, 0),
    // motion
    motion: exports.NetModelMotionSchema,
    // shadow
    staticShadow: new schema_1.MuBoolean(false),
    name: new schema_1.MuUTF8(''),
};
exports.NetModelSchema = new schema_1.MuStruct(exports.NetModelSchemaContent);
exports.NetMeshTableEntrySchema = new schema_1.MuStruct({
    /**
     * 这里的hash是meshHash，真正渲染模型用的hash值
     */
    hash: exports.HashSchema,
    hashType: new schema_1.MuUTF8('voxelModel'),
    meshBX: new schema_1.MuQuantizedFloat(1, 64),
    meshBY: new schema_1.MuQuantizedFloat(1, 64),
    meshBZ: new schema_1.MuQuantizedFloat(1, 64),
    bodyBX: new schema_1.MuQuantizedFloat(1, 64),
    bodyBY: new schema_1.MuQuantizedFloat(1, 64),
    bodyBZ: new schema_1.MuQuantizedFloat(1, 64),
    bodyOffsetX: new schema_1.MuQuantizedFloat(1, 64),
    bodyOffsetY: new schema_1.MuQuantizedFloat(1, 64),
    bodyOffsetZ: new schema_1.MuQuantizedFloat(1, 64),
    // 外观框中心相对锚点的偏移
    renderBoxOffsetX: new schema_1.MuQuantizedFloat(1, 64),
    renderBoxOffsetY: new schema_1.MuQuantizedFloat(1, 64),
    renderBoxOffsetZ: new schema_1.MuQuantizedFloat(1, 64),
});
exports.NetMeshTableSchema = new schema_1.MuArray(exports.NetMeshTableEntrySchema, Infinity, [exports.NetMeshTableEntrySchema.identity]);
exports.NetSkinPartSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    hash: exports.HashSchema,
});
exports.NetSkinPartTableSchema = new schema_1.MuSortedArray(exports.NetSkinPartSchema, Infinity, id_1.compareId);
exports.NetModelSetSchema = new schema_1.MuSortedArray(exports.NetModelSchema, Infinity, id_1.compareId);
exports.NetSkinSchema = new schema_1.MuStruct(hot_schema_1.SkinAssetContent);
// NetSkinTableSchema中的元素索引值即为id，第0位代表空，默认初始值有一个元素
exports.NetSkinTableSchema = new schema_1.MuArray(exports.NetSkinSchema, Infinity, [
    exports.NetSkinSchema.identity,
]);
exports.ModelProtocol = {
    name: 'models',
    client: {
        appendMeshHashes: exports.NetMeshTableSchema,
        appendSkinHashes: exports.NetSkinTableSchema,
        appendSkinPartHashes: exports.NetSkinPartTableSchema,
    },
    server: {},
};
//# sourceMappingURL=model-schema.js.map