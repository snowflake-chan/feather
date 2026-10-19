"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsEventSchema = exports.FluidContactEventSchema = exports.VoxelContactEventSchema = exports.BodyContactEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const physics_schema_1 = require("../physics/physics-schema");
exports.BodyContactEventSchema = new schema_1.MuStruct(Object.assign({ id: new schema_1.MuVarint(), tick: new schema_1.MuVarint() }, physics_schema_1.BodyContactSchema.muData));
exports.VoxelContactEventSchema = new schema_1.MuStruct(Object.assign({ id: new schema_1.MuVarint(), tick: new schema_1.MuVarint() }, physics_schema_1.VoxelContactSchema.muData));
exports.FluidContactEventSchema = new schema_1.MuStruct(Object.assign({ id: new schema_1.MuVarint(), tick: new schema_1.MuVarint() }, physics_schema_1.FluidContactSchema.muData));
exports.PhysicsEventSchema = new schema_1.MuStruct({
    bodyContact: new schema_1.MuArray(exports.BodyContactEventSchema, Infinity),
    voxelContact: new schema_1.MuArray(exports.VoxelContactEventSchema, Infinity),
    fluidContact: new schema_1.MuArray(exports.FluidContactEventSchema, Infinity),
    bodySeparate: new schema_1.MuArray(exports.BodyContactEventSchema, Infinity),
    voxelSeparate: new schema_1.MuArray(exports.VoxelContactEventSchema, Infinity),
    fluidSeparate: new schema_1.MuArray(exports.FluidContactEventSchema, Infinity),
});
//# sourceMappingURL=physics-event-schema.js.map