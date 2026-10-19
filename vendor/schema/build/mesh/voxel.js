"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewMeshSchema = exports.modelMeshSchema = exports.meshBufferSchema = exports.MeshSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const schema_2 = require("@box/mesher/schema");
const modelMeshSchema_1 = require("./modelMeshSchema");
exports.MeshSchema = new modelMeshSchema_1.ModelMeshSchema();
exports.meshBufferSchema = new schema_1.MuArray(new schema_1.MuUint8(), Infinity);
exports.modelMeshSchema = new schema_1.MuStruct({
    meshBuffer: exports.meshBufferSchema,
    pbrBuffer: exports.meshBufferSchema,
});
exports.NewMeshSchema = new schema_1.MuStruct({
    texture: schema_2.MeshTextureSchema,
    data: schema_2.MeshDataSchema,
});
//# sourceMappingURL=voxel.js.map