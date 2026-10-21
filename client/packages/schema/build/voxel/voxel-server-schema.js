"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerVoxelStateSchema = exports.ServerVoxelConnectionSchema = exports.PendingVoxelWriteSchema = exports.ServerVoxelChunkSchema = exports.ServerVoxelPreloadDataSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const index_1 = require("../content-server/index");
const ref_schema_1 = require("../utils/ref-schema");
const voxel_protocol_1 = require("./voxel-protocol");
const rbush_schema_1 = require("../utils/rbush-schema");
exports.ServerVoxelPreloadDataSchema = new schema_1.MuStruct({
    nx: new schema_1.MuUint32(),
    ny: new schema_1.MuUint32(),
    nz: new schema_1.MuUint32(),
    hashes: new schema_1.MuArray(index_1.HashSchema, Infinity, []),
    boxes: new schema_1.MuArray(rbush_schema_1.VoxelCollisionBoxListSchema, Infinity, []),
});
exports.ServerVoxelChunkSchema = new schema_1.MuStruct({
    hash: index_1.HashSchema,
    versionCounter: new schema_1.MuVarint(0),
    dirtyGeom: new schema_1.MuBoolean(false),
    dirtyBoxes: new schema_1.MuBoolean(false),
    dirtyHash: new schema_1.MuBoolean(false),
    voxels: new ref_schema_1.MuRefSchema(),
    geom: new ref_schema_1.MuRefSchema(),
    boxes: rbush_schema_1.VoxelCollisionBoxListSchema,
});
exports.PendingVoxelWriteSchema = new schema_1.MuArray(voxel_protocol_1.VoxelWriteSchema, Infinity, []);
exports.ServerVoxelConnectionSchema = new schema_1.MuStruct({
    ready: new schema_1.MuBoolean(false),
    runs: voxel_protocol_1.BatchWriteSchema,
});
exports.ServerVoxelStateSchema = new schema_1.MuStruct({
    // reset state
    ready: new schema_1.MuBoolean(false),
    resetCounter: new schema_1.MuUint32(0),
    pendingWrites: exports.PendingVoxelWriteSchema,
    innerAO: new schema_1.MuBoolean(false),
    chunks: new schema_1.MuArray(exports.ServerVoxelChunkSchema, Infinity),
    dirty: new schema_1.MuArray(new ref_schema_1.MuRefSchema(), Infinity),
});
//# sourceMappingURL=voxel-server-schema.js.map