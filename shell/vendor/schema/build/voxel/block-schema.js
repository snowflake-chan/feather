"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockIndexSchema = exports.BlockInfoSchema = exports.BlockCategory = exports.BlockSoundGroup = void 0;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const dictionary_1 = require("@box/mudb/schema/dictionary");
const float32_1 = require("@box/mudb/schema/float32");
const float64_1 = require("@box/mudb/schema/float64");
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const rvarint_1 = require("@box/mudb/schema/rvarint");
const struct_1 = require("@box/mudb/schema/struct");
const uint16_1 = require("@box/mudb/schema/uint16");
const uint32_1 = require("@box/mudb/schema/uint32");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const index_1 = require("../content-server/index");
const ref_schema_1 = require("../utils/ref-schema");
const relative_array_1 = require("../utils/relative-array");
var BlockSoundGroup;
(function (BlockSoundGroup) {
    BlockSoundGroup[BlockSoundGroup["default"] = 0] = "default";
})(BlockSoundGroup || (exports.BlockSoundGroup = BlockSoundGroup = {}));
var BlockCategory;
(function (BlockCategory) {
    BlockCategory[BlockCategory["default"] = 0] = "default";
    BlockCategory[BlockCategory["symbol"] = 1] = "symbol";
    BlockCategory[BlockCategory["number"] = 2] = "number";
    BlockCategory[BlockCategory["letter"] = 3] = "letter";
    BlockCategory[BlockCategory["color"] = 4] = "color";
    BlockCategory[BlockCategory["nature"] = 5] = "nature";
    BlockCategory[BlockCategory["structure"] = 6] = "structure";
    BlockCategory[BlockCategory["light"] = 7] = "light";
    BlockCategory[BlockCategory["food"] = 8] = "food";
    BlockCategory[BlockCategory["element"] = 9] = "element";
})(BlockCategory || (exports.BlockCategory = BlockCategory = {}));
exports.BlockInfoSchema = new struct_1.MuStruct({
    // voxel info
    ids: new relative_array_1.RelativeArray(new rvarint_1.MuRelativeVarint(), Infinity, [0]),
    names: new array_1.MuArray(new utf8_1.MuUTF8(), Infinity, ['air']),
    // run length encode these arrays
    emissive: new relative_array_1.RelativeArray(new varint_1.MuVarint(), Infinity, [0]),
    texture: new relative_array_1.RelativeArray(new rvarint_1.MuRelativeVarint(), Infinity, [0, 0, 0, 0, 0, 0]),
    animLength: new relative_array_1.RelativeArray(new varint_1.MuVarint(1), Infinity, [1, 1, 1, 1, 1, 1]),
    friction: new relative_array_1.RelativeArray(new quantized_float_1.MuQuantizedFloat(1 / 256, 1), Infinity, [0]),
    restitution: new relative_array_1.RelativeArray(new quantized_float_1.MuQuantizedFloat(1 / 256, 0), Infinity, [
        0,
    ]),
    velocity: new relative_array_1.RelativeArray(new float32_1.MuFloat32(0), Infinity, [0, 0, 0]),
    // fluids
    fluids: new array_1.MuArray(new struct_1.MuStruct({
        id: new varint_1.MuVarint(),
        info: new uint32_1.MuUint32(),
        mass: new float64_1.MuFloat64(1),
    }), Infinity, [
        {
            id: 0,
            info: 0,
            mass: 0,
        },
    ]),
    // category list
    category: new dictionary_1.MuDictionary(new relative_array_1.RelativeArray(new rvarint_1.MuRelativeVarint(), Infinity), Infinity, {
        default: [0],
    }),
    // texture info
    atlasRadius: new varint_1.MuVarint(16),
    blockBumpShift: new varint_1.MuVarint(6),
    blockColorShift: new varint_1.MuVarint(4),
    // texture atlases
    colorAtlas: new array_1.MuArray(index_1.HashSchema, Infinity),
    materialAtlas: new array_1.MuArray(index_1.HashSchema, Infinity),
    bumpAtlas: new array_1.MuArray(index_1.HashSchema, Infinity),
});
exports.BlockIndexSchema = new struct_1.MuStruct({
    id: new dictionary_1.MuDictionary(new varint_1.MuVarint(), Infinity, { air: 0 }),
    valid: new array_1.MuArray(new boolean_1.MuBoolean(false), Infinity),
    name: new array_1.MuArray(new utf8_1.MuUTF8(), Infinity, ['air']),
    emissive: new array_1.MuArray(new uint16_1.MuUint16(), Infinity, [0]),
    texture: new array_1.MuArray(new uint32_1.MuUint32(), Infinity, [0, 0, 0, 0, 0, 0]),
    mass: new array_1.MuArray(new float64_1.MuFloat64(), Infinity, [0]),
    restitution: new array_1.MuArray(new float64_1.MuFloat64(), Infinity, [0]),
    friction: new array_1.MuArray(new float64_1.MuFloat64(), Infinity, [0]),
    fluid: new array_1.MuArray(new varint_1.MuVarint(), Infinity, [1]),
    fluidInfo: new array_1.MuArray(new uint32_1.MuUint32(), Infinity, [0, 0]),
    velocity: new array_1.MuArray(new float32_1.MuFloat32(0), Infinity, [0, 0, 0]),
    isFluid: new ref_schema_1.MuRefSchema(),
});
