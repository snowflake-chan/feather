"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoxelCollisionSchema = exports.VoxelCollisionChunkSchema = exports.CHUNK_MASK = exports.CHUNK_SIZE = exports.CHUNK_SHIFT = void 0;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const int32_1 = require("@box/mudb/schema/int32");
const struct_1 = require("@box/mudb/schema/struct");
const rbush_schema_1 = require("../utils/rbush-schema");
exports.CHUNK_SHIFT = 5;
exports.CHUNK_SIZE = 1 << exports.CHUNK_SHIFT;
exports.CHUNK_MASK = exports.CHUNK_SIZE - 1;
exports.VoxelCollisionChunkSchema = new struct_1.MuStruct({
    i: new int32_1.MuInt32(),
    j: new int32_1.MuInt32(),
    k: new int32_1.MuInt32(),
    // indexes
    hasSolid: new boolean_1.MuBoolean(false),
    rbush: rbush_schema_1.RBushSchema,
    hasFluid: new boolean_1.MuBoolean(false),
    fluidRBush: rbush_schema_1.RBushSchema,
});
exports.VoxelCollisionSchema = new struct_1.MuStruct({
    chunkDimI: new int32_1.MuInt32(),
    chunkDimJ: new int32_1.MuInt32(),
    chunkDimK: new int32_1.MuInt32(),
    chunks: new array_1.MuArray(exports.VoxelCollisionChunkSchema, Infinity),
});
