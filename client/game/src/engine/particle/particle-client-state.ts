import {
  MuStruct,
  MuVarint,
  MuBoolean,
  MuSortedArray,
  MuArray,
  MuSchema,
  MuFloat64,
  MuUTF8,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { Vec4Schema, Vec3Schema } from '@box/schema/utils/math-schema';
import { compareId } from '@box/utils/id';
import {
  ParticleParameterSchema,
  ParticleEmitterSchema,
} from '@box/schema/particle/particle-schema';

export const ClientParticleGroupSchema = new MuStruct({
  // id of particle group
  id: new MuVarint(),

  // target vector
  targetVector: Vec4Schema,
  targetId: new MuVarint(),

  // color and size knots
  rgbSize0: Vec4Schema,
  rgbSize1: Vec4Schema,
  rgbSize2: Vec4Schema,
  rgbSize3: Vec4Schema,
  rgbSize4: Vec4Schema,

  // acceleration and noise vector
  forceNoise: Vec4Schema,

  // noise frequency, size spread, velocity damping
  miscVector: Vec4Schema,

  // live state (if false destroy emitter when particle count drops to 0)
  live: new MuBoolean(false),

  // particle offset
  offset: new MuVarint(),
  count: new MuVarint(),
});

export type ClientParticleGroup = typeof ClientParticleGroupSchema.identity;

// local particle state
export const ClientLocalEmitterSchema = new MuStruct({
  id: new MuVarint(),
  position: Vec3Schema,
  bounds: Vec3Schema,
  ...ParticleParameterSchema.muData,
  ...ParticleEmitterSchema.muData,
});

export type ClientLocalEmitter = typeof ClientLocalEmitterSchema.identity;

export const ClientLocalEmitterSet = new MuArray(
  ClientLocalEmitterSchema,
  Infinity,
);

export const ClientParticleGroupSetSchema = new MuSortedArray(
  ClientParticleGroupSchema,
  Infinity,
  compareId,
);

export const ClientParticlePendingSeedIds = new MuArray(new MuUTF8(), Infinity);

export const ClientParticleStateSchema = new MuStruct({
  resetNeeded: new MuBoolean(false),

  worker: new MuRefSchema<Worker>(),
  workerMemory: new MuArray(
    <MuSchema<ArrayBuffer>>new MuRefSchema<ArrayBuffer>(),
    Infinity,
  ),

  localEmitters: ClientLocalEmitterSet,

  updateInProgress: new MuBoolean(false),
  lastUpdateTick: new MuFloat64(0),
  swapNeeded: new MuBoolean(false),

  particleBackGroups: ClientParticleGroupSetSchema,

  particleGroups: ClientParticleGroupSetSchema,

  pendingSeedIds: ClientParticlePendingSeedIds,
});
