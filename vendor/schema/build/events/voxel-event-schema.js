"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoxelEventSchema = exports.VoxelChangeEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.VoxelChangeEventSchema = new schema_1.MuStruct({
    x: new schema_1.MuUint32(),
    y: new schema_1.MuUint32(),
    z: new schema_1.MuUint32(),
    b: new schema_1.MuUint16(),
    p: new schema_1.MuUint16(),
});
exports.VoxelEventSchema = new schema_1.MuStruct({
    voxelChange: new schema_1.MuArray(exports.VoxelChangeEventSchema, Infinity),
    voxelReset: new schema_1.MuBoolean(false),
});
//# sourceMappingURL=voxel-event-schema.js.map