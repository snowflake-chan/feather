"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockIndexSchema = exports.BlockInfoSchema = exports.BlockCategory = exports.BlockSoundGroup = void 0;
const schema_1 = require("@box/mudb/schema");
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
exports.BlockInfoSchema = new schema_1.MuStruct({
    // voxel info
    ids: new relative_array_1.RelativeArray(new schema_1.MuRelativeVarint(), Infinity, [0]),
    names: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity, ['air']),
    // run length encode these arrays
    emissive: new relative_array_1.RelativeArray(new schema_1.MuVarint(), Infinity, [0]),
    texture: new relative_array_1.RelativeArray(new schema_1.MuRelativeVarint(), Infinity, [0, 0, 0, 0, 0, 0]),
    animLength: new relative_array_1.RelativeArray(new schema_1.MuVarint(1), Infinity, [1, 1, 1, 1, 1, 1]),
    friction: new relative_array_1.RelativeArray(new schema_1.MuQuantizedFloat(1 / 256, 1), Infinity, [0]),
    restitution: new relative_array_1.RelativeArray(new schema_1.MuQuantizedFloat(1 / 256, 0), Infinity, [
        0,
    ]),
    velocity: new relative_array_1.RelativeArray(new schema_1.MuFloat32(0), Infinity, [0, 0, 0]),
    // fluids
    fluids: new schema_1.MuArray(new schema_1.MuStruct({
        id: new schema_1.MuVarint(),
        info: new schema_1.MuUint32(),
        mass: new schema_1.MuFloat64(1),
    }), Infinity, [
        {
            id: 0,
            info: 0,
            mass: 0,
        },
    ]),
    // category list
    category: new schema_1.MuDictionary(new relative_array_1.RelativeArray(new schema_1.MuRelativeVarint(), Infinity), Infinity, {
        default: [0],
    }),
    // texture info
    atlasRadius: new schema_1.MuVarint(16),
    blockBumpShift: new schema_1.MuVarint(6),
    blockColorShift: new schema_1.MuVarint(4),
    // texture atlases
    colorAtlas: new schema_1.MuArray(index_1.HashSchema, Infinity),
    materialAtlas: new schema_1.MuArray(index_1.HashSchema, Infinity),
    bumpAtlas: new schema_1.MuArray(index_1.HashSchema, Infinity),
});
exports.BlockIndexSchema = new schema_1.MuStruct({
    id: new schema_1.MuDictionary(new schema_1.MuVarint(), Infinity, { air: 0 }),
    valid: new schema_1.MuArray(new schema_1.MuBoolean(false), Infinity),
    name: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity, ['air']),
    emissive: new schema_1.MuArray(new schema_1.MuUint16(), Infinity, [0]),
    texture: new schema_1.MuArray(new schema_1.MuUint32(), Infinity, [0, 0, 0, 0, 0, 0]),
    mass: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity, [0]),
    restitution: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity, [0]),
    friction: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity, [0]),
    fluid: new schema_1.MuArray(new schema_1.MuVarint(), Infinity, [1]),
    fluidInfo: new schema_1.MuArray(new schema_1.MuUint32(), Infinity, [0, 0]),
    velocity: new schema_1.MuArray(new schema_1.MuFloat32(0), Infinity, [0, 0, 0]),
    isFluid: new ref_schema_1.MuRefSchema(),
});
//# sourceMappingURL=block-schema.js.map