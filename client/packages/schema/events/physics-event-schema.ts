import { MuStruct, MuArray, MuVarint } from '@box/mudb/schema';
import {
  BodyContactSchema,
  VoxelContactSchema,
  FluidContactSchema,
} from '../physics/physics-schema';

export const BodyContactEventSchema = new MuStruct({
  id: new MuVarint(),
  tick: new MuVarint(),
  ...BodyContactSchema.muData,
});

export const VoxelContactEventSchema = new MuStruct({
  id: new MuVarint(),
  tick: new MuVarint(),
  ...VoxelContactSchema.muData,
});

export const FluidContactEventSchema = new MuStruct({
  id: new MuVarint(),
  tick: new MuVarint(),
  ...FluidContactSchema.muData,
});

export const PhysicsEventSchema = new MuStruct({
  bodyContact: new MuArray(BodyContactEventSchema, Infinity),
  voxelContact: new MuArray(VoxelContactEventSchema, Infinity),
  fluidContact: new MuArray(FluidContactEventSchema, Infinity),

  bodySeparate: new MuArray(BodyContactEventSchema, Infinity),
  voxelSeparate: new MuArray(VoxelContactEventSchema, Infinity),
  fluidSeparate: new MuArray(FluidContactEventSchema, Infinity),
});

export type PhysicsEvent = typeof PhysicsEventSchema.identity;
