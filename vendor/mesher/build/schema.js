"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshDataSchema = exports.MeshTextureSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.MeshTextureSchema = new schema_1.MuStruct({
    palette: new schema_1.MuArray(new schema_1.MuUint32(), Infinity),
    data: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    width: new schema_1.MuVarint(),
});
exports.MeshDataSchema = new schema_1.MuArray(new schema_1.MuStruct({
    vertices: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    sizes: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    uvs: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    uvFlags: new schema_1.MuArray(new schema_1.MuUint8(), Infinity),
}), 6);
