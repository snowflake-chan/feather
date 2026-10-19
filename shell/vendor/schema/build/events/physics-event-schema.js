"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsEventSchema = exports.FluidContactEventSchema = exports.VoxelContactEventSchema = exports.BodyContactEventSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const struct_1 = require("@box/mudb/schema/struct");
const varint_1 = require("@box/mudb/schema/varint");
const physics_schema_1 = require("../physics/physics-schema");
exports.BodyContactEventSchema = new struct_1.MuStruct(Object.assign({ id: new varint_1.MuVarint(), tick: new varint_1.MuVarint() }, physics_schema_1.BodyContactSchema.muData));
exports.VoxelContactEventSchema = new struct_1.MuStruct(Object.assign({ id: new varint_1.MuVarint(), tick: new varint_1.MuVarint() }, physics_schema_1.VoxelContactSchema.muData));
exports.FluidContactEventSchema = new struct_1.MuStruct(Object.assign({ id: new varint_1.MuVarint(), tick: new varint_1.MuVarint() }, physics_schema_1.FluidContactSchema.muData));
exports.PhysicsEventSchema = new struct_1.MuStruct({
    bodyContact: new array_1.MuArray(exports.BodyContactEventSchema, Infinity),
    voxelContact: new array_1.MuArray(exports.VoxelContactEventSchema, Infinity),
    fluidContact: new array_1.MuArray(exports.FluidContactEventSchema, Infinity),
    bodySeparate: new array_1.MuArray(exports.BodyContactEventSchema, Infinity),
    voxelSeparate: new array_1.MuArray(exports.VoxelContactEventSchema, Infinity),
    fluidSeparate: new array_1.MuArray(exports.FluidContactEventSchema, Infinity),
});
