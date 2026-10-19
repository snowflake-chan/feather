"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoxelCollisionSchema = exports.VoxelCollisionChunkSchema = exports.CHUNK_MASK = exports.CHUNK_SIZE = exports.CHUNK_SHIFT = void 0;
const schema_1 = require("@box/mudb/schema");
const rbush_schema_1 = require("../utils/rbush-schema");
exports.CHUNK_SHIFT = 5;
exports.CHUNK_SIZE = 1 << exports.CHUNK_SHIFT;
exports.CHUNK_MASK = exports.CHUNK_SIZE - 1;
exports.VoxelCollisionChunkSchema = new schema_1.MuStruct({
    i: new schema_1.MuInt32(),
    j: new schema_1.MuInt32(),
    k: new schema_1.MuInt32(),
    // indexes
    hasSolid: new schema_1.MuBoolean(false),
    rbush: rbush_schema_1.RBushSchema,
    hasFluid: new schema_1.MuBoolean(false),
    fluidRBush: rbush_schema_1.RBushSchema,
});
exports.VoxelCollisionSchema = new schema_1.MuStruct({
    chunkDimI: new schema_1.MuInt32(),
    chunkDimJ: new schema_1.MuInt32(),
    chunkDimK: new schema_1.MuInt32(),
    chunks: new schema_1.MuArray(exports.VoxelCollisionChunkSchema, Infinity),
});
//# sourceMappingURL=voxel-collision-schema.js.map