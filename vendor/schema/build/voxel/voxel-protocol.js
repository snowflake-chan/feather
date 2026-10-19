"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoxelProtocol = exports.HashesResponseSchema = exports.FetchHashesSchema = exports.ChunkIdsSchema = exports.BatchWriteSchema = exports.BatchVoxelRunSchema = exports.VoxelResetSchema = exports.VoxelWriteSchema = exports.VOXEL_TYPE_MASK = exports.VOXEL_ROTATION_SHIFT = void 0;
const schema_1 = require("@box/mudb/schema");
const index_1 = require("../content-server/index");
const rbush_schema_1 = require("../utils/rbush-schema");
exports.VOXEL_ROTATION_SHIFT = 14;
exports.VOXEL_TYPE_MASK = ~(3 << exports.VOXEL_ROTATION_SHIFT);
exports.VoxelWriteSchema = new schema_1.MuStruct({
    x: new schema_1.MuUint16(),
    y: new schema_1.MuUint16(),
    z: new schema_1.MuUint16(),
    b: new schema_1.MuUint16(),
});
exports.VoxelResetSchema = new schema_1.MuStruct({
    resetCounter: new schema_1.MuUint32(),
    nx: new schema_1.MuUint16(),
    ny: new schema_1.MuUint16(),
    nz: new schema_1.MuUint16(),
    blocks: index_1.HashSchema,
    hashes: new schema_1.MuArray(index_1.HashSchema, Infinity, []),
    innerAO: new schema_1.MuBoolean(false),
    positionX: new schema_1.MuFloat64(),
    positionY: new schema_1.MuFloat64(),
    positionZ: new schema_1.MuFloat64(),
});
exports.BatchVoxelRunSchema = new schema_1.MuStruct({
    offset: new schema_1.MuVarint(0),
    count: new schema_1.MuVarint(1),
    block: new schema_1.MuRelativeVarint(0),
});
exports.BatchWriteSchema = new schema_1.MuArray(exports.BatchVoxelRunSchema, Infinity);
exports.ChunkIdsSchema = new schema_1.MuArray(new schema_1.MuVarint(), Infinity);
exports.FetchHashesSchema = new schema_1.MuStruct({
    startI: new schema_1.MuVarint(),
    startJ: new schema_1.MuVarint(),
    startK: new schema_1.MuVarint(),
    chunkIds: exports.ChunkIdsSchema,
    dirtyChunks: exports.ChunkIdsSchema,
});
exports.HashesResponseSchema = new schema_1.MuStruct({
    startI: new schema_1.MuVarint(),
    startJ: new schema_1.MuVarint(),
    startK: new schema_1.MuVarint(),
    dirtyChunks: exports.ChunkIdsSchema,
    chunksInfo: new schema_1.MuArray(new schema_1.MuStruct({
        idx: new schema_1.MuVarint(),
        hash: index_1.HashSchema,
    }), Infinity),
});
exports.VoxelProtocol = {
    name: 'game-terrain',
    client: {
        reset: exports.VoxelResetSchema,
        voxelChange: exports.BatchWriteSchema,
        chunkResponse: new schema_1.MuStruct({
            rpcId: new schema_1.MuVarint(),
            boxes: rbush_schema_1.VoxelCollisionBoxListSchema,
        }),
        lightMapResponse: new schema_1.MuBoolean(),
        hashesResponse: exports.HashesResponseSchema,
    },
    server: {
        ready: new schema_1.MuVarint(),
        fetchChunk: new schema_1.MuStruct({
            chunkId: new schema_1.MuVarint(),
            rpcId: new schema_1.MuVarint(),
        }),
        rebuildLightMap: new schema_1.MuBoolean(),
        fetchHashes: exports.FetchHashesSchema,
    },
};
//# sourceMappingURL=voxel-protocol.js.map