"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoxelProtocol = exports.HashesResponseSchema = exports.FetchHashesSchema = exports.ChunkIdsSchema = exports.BatchWriteSchema = exports.BatchVoxelRunSchema = exports.VoxelResetSchema = exports.VoxelWriteSchema = exports.VOXEL_TYPE_MASK = exports.VOXEL_ROTATION_SHIFT = void 0;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const float64_1 = require("@box/mudb/schema/float64");
const rvarint_1 = require("@box/mudb/schema/rvarint");
const struct_1 = require("@box/mudb/schema/struct");
const uint16_1 = require("@box/mudb/schema/uint16");
const uint32_1 = require("@box/mudb/schema/uint32");
const varint_1 = require("@box/mudb/schema/varint");
const index_1 = require("../content-server/index");
const rbush_schema_1 = require("../utils/rbush-schema");
exports.VOXEL_ROTATION_SHIFT = 14;
exports.VOXEL_TYPE_MASK = ~(3 << exports.VOXEL_ROTATION_SHIFT);
exports.VoxelWriteSchema = new struct_1.MuStruct({
    x: new uint16_1.MuUint16(),
    y: new uint16_1.MuUint16(),
    z: new uint16_1.MuUint16(),
    b: new uint16_1.MuUint16(),
});
exports.VoxelResetSchema = new struct_1.MuStruct({
    resetCounter: new uint32_1.MuUint32(),
    nx: new uint16_1.MuUint16(),
    ny: new uint16_1.MuUint16(),
    nz: new uint16_1.MuUint16(),
    blocks: index_1.HashSchema,
    hashes: new array_1.MuArray(index_1.HashSchema, Infinity, []),
    innerAO: new boolean_1.MuBoolean(false),
    positionX: new float64_1.MuFloat64(),
    positionY: new float64_1.MuFloat64(),
    positionZ: new float64_1.MuFloat64(),
});
exports.BatchVoxelRunSchema = new struct_1.MuStruct({
    offset: new varint_1.MuVarint(0),
    count: new varint_1.MuVarint(1),
    block: new rvarint_1.MuRelativeVarint(0),
});
exports.BatchWriteSchema = new array_1.MuArray(exports.BatchVoxelRunSchema, Infinity);
exports.ChunkIdsSchema = new array_1.MuArray(new varint_1.MuVarint(), Infinity);
exports.FetchHashesSchema = new struct_1.MuStruct({
    startI: new varint_1.MuVarint(),
    startJ: new varint_1.MuVarint(),
    startK: new varint_1.MuVarint(),
    chunkIds: exports.ChunkIdsSchema,
    dirtyChunks: exports.ChunkIdsSchema,
});
exports.HashesResponseSchema = new struct_1.MuStruct({
    startI: new varint_1.MuVarint(),
    startJ: new varint_1.MuVarint(),
    startK: new varint_1.MuVarint(),
    dirtyChunks: exports.ChunkIdsSchema,
    chunksInfo: new array_1.MuArray(new struct_1.MuStruct({
        idx: new varint_1.MuVarint(),
        hash: index_1.HashSchema,
    }), Infinity),
});
exports.VoxelProtocol = {
    name: 'game-terrain',
    client: {
        reset: exports.VoxelResetSchema,
        voxelChange: exports.BatchWriteSchema,
        chunkResponse: new struct_1.MuStruct({
            rpcId: new varint_1.MuVarint(),
            boxes: rbush_schema_1.VoxelCollisionBoxListSchema,
        }),
        lightMapResponse: new boolean_1.MuBoolean(),
        hashesResponse: exports.HashesResponseSchema,
    },
    server: {
        ready: new varint_1.MuVarint(),
        fetchChunk: new struct_1.MuStruct({
            chunkId: new varint_1.MuVarint(),
            rpcId: new varint_1.MuVarint(),
        }),
        rebuildLightMap: new boolean_1.MuBoolean(),
        fetchHashes: exports.FetchHashesSchema,
    },
};
