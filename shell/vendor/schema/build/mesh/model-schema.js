"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProtocol = exports.NetSkinTableSchema = exports.NetSkinSchema = exports.NetModelSetSchema = exports.NetSkinPartTableSchema = exports.NetSkinPartSchema = exports.NetMeshTableSchema = exports.NetMeshTableEntrySchema = exports.NetModelSchema = exports.NetModelSchemaContent = exports.NetModelMotionSchema = exports.PlaybackSchema = exports.MotionsPlaybackSchema = exports.MotionPlaybackSchema = exports.HashSchema = void 0;
const hot_schema_1 = require("../project/hot-schema");
const array_1 = require("@box/mudb/schema/array");
const ascii_1 = require("@box/mudb/schema/ascii");
const boolean_1 = require("@box/mudb/schema/boolean");
const float64_1 = require("@box/mudb/schema/float64");
const int32_1 = require("@box/mudb/schema/int32");
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const uint8_1 = require("@box/mudb/schema/uint8");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const id_1 = require("@box/utils/id");
exports.HashSchema = new ascii_1.MuASCII();
exports.MotionPlaybackSchema = new struct_1.MuStruct({
    motionId: new ascii_1.MuASCII(),
    /**
     * -1 means Infinity
     */
    cycleCount: new int32_1.MuInt32(1),
});
exports.MotionsPlaybackSchema = new array_1.MuArray(exports.MotionPlaybackSchema, Infinity);
exports.PlaybackSchema = new struct_1.MuStruct({
    motions: exports.MotionsPlaybackSchema,
    startTick: new float64_1.MuFloat64(),
    /**
     * -1 means Infinity
     */
    cycleCount: new int32_1.MuInt32(1),
});
exports.NetModelMotionSchema = new struct_1.MuStruct({
    /**
     * 默认动作id
     */
    defaultMotionId: new ascii_1.MuASCII(),
    /**
     * 是否暂停
     */
    paused: new boolean_1.MuBoolean(false),
    /**
     * 暂停时的帧数
     */
    pausedTick: new float64_1.MuFloat64(),
    /**
     * 默认动作开始的帧数
     */
    startTick: new float64_1.MuFloat64(),
    /**
     * 动作链数据
     */
    playback: exports.PlaybackSchema,
});
exports.NetModelSchemaContent = {
    // entity id
    id: new varint_1.MuVarint(),
    // mesh id reference
    meshId: new varint_1.MuVarint(),
    // mesh
    invisible: new boolean_1.MuBoolean(false),
    // tint
    red: new uint8_1.MuUint8(255),
    green: new uint8_1.MuUint8(255),
    blue: new uint8_1.MuUint8(255),
    alpha: new uint8_1.MuUint8(255),
    emissive: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    shininess: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    metalness: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    // transformation
    scaleX: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    scaleY: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    scaleZ: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    offsetX: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    offsetY: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    offsetZ: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
    // motion
    motion: exports.NetModelMotionSchema,
    // shadow
    staticShadow: new boolean_1.MuBoolean(false),
    name: new utf8_1.MuUTF8(''),
};
exports.NetModelSchema = new struct_1.MuStruct(exports.NetModelSchemaContent);
exports.NetMeshTableEntrySchema = new struct_1.MuStruct({
    /**
     * 这里的hash是meshHash，真正渲染模型用的hash值
     */
    hash: exports.HashSchema,
    hashType: new utf8_1.MuUTF8('voxelModel'),
    meshBX: new quantized_float_1.MuQuantizedFloat(1, 64),
    meshBY: new quantized_float_1.MuQuantizedFloat(1, 64),
    meshBZ: new quantized_float_1.MuQuantizedFloat(1, 64),
    bodyBX: new quantized_float_1.MuQuantizedFloat(1, 64),
    bodyBY: new quantized_float_1.MuQuantizedFloat(1, 64),
    bodyBZ: new quantized_float_1.MuQuantizedFloat(1, 64),
    bodyOffsetX: new quantized_float_1.MuQuantizedFloat(1, 64),
    bodyOffsetY: new quantized_float_1.MuQuantizedFloat(1, 64),
    bodyOffsetZ: new quantized_float_1.MuQuantizedFloat(1, 64),
    // 外观框中心相对锚点的偏移
    renderBoxOffsetX: new quantized_float_1.MuQuantizedFloat(1, 64),
    renderBoxOffsetY: new quantized_float_1.MuQuantizedFloat(1, 64),
    renderBoxOffsetZ: new quantized_float_1.MuQuantizedFloat(1, 64),
});
exports.NetMeshTableSchema = new array_1.MuArray(exports.NetMeshTableEntrySchema, Infinity, [exports.NetMeshTableEntrySchema.identity]);
exports.NetSkinPartSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    hash: exports.HashSchema,
});
exports.NetSkinPartTableSchema = new sorted_array_1.MuSortedArray(exports.NetSkinPartSchema, Infinity, id_1.compareId);
exports.NetModelSetSchema = new sorted_array_1.MuSortedArray(exports.NetModelSchema, Infinity, id_1.compareId);
exports.NetSkinSchema = new struct_1.MuStruct(hot_schema_1.SkinAssetContent);
// NetSkinTableSchema中的元素索引值即为id，第0位代表空，默认初始值有一个元素
exports.NetSkinTableSchema = new array_1.MuArray(exports.NetSkinSchema, Infinity, [
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
