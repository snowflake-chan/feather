import {
  MuStruct,
  MuUint32,
  MuVarint,
  MuSortedArray,
  MuQuantizedFloat,
} from '@box/mudb/schema';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { compareId } from '@box/utils/id';

export function packColor(c: { r: number; g: number; b: number }) {
  const intensity = Math.floor(Math.min(256, Math.max(1, c.r, c.g, c.b))) - 1;
  const r = Math.max(0, Math.min(255, (255 * c.r) / intensity)) | 0;
  const g = Math.max(0, Math.min(255, (255 * c.g) / intensity)) | 0;
  const b = Math.max(0, Math.min(255, (255 * c.b) / intensity)) | 0;
  return r | (g << 8) | (b << 16) | (intensity << 24);
}

export const ParticleEmitterSchema = new MuStruct({
  // limits
  countLimit: new MuVarint(100),

  // emit rate
  emitRate: new MuQuantizedFloat(1 / 64, 1),
  emitSpread: new MuQuantizedFloat(1 / 64, 0),

  // particle life time
  lifetime: new MuQuantizedFloat(1 / 16, 1),
  lifetimeSpread: new MuQuantizedFloat(1 / 16, 0),

  // velocity bias
  velocity: new QuantizedVec3Schema(1 / 64),
  velocitySpread: new QuantizedVec3Schema(1 / 64),
});

export type ParticleEmitter = typeof ParticleEmitterSchema.identity;

// precomputed particle data, stored in a table
export const ParticleParameterSchema = new MuStruct({
  // external forces applied to the particle system
  acceleration: new QuantizedVec3Schema(1 / 64),

  // noise weight
  noiseAmpl: new MuQuantizedFloat(1 / 64),
  noiseFreq: new MuQuantizedFloat(1 / 128),

  // particle target entity
  targetId: new MuVarint(),
  targetWeight: new MuQuantizedFloat(1 / 128, 0),

  // particle color curve
  color0: new MuUint32(0xffffffff),
  color1: new MuUint32(0xffffffff),
  color2: new MuUint32(0xffffffff),
  color3: new MuUint32(0xffffffff),
  color4: new MuUint32(0xffffffff),

  // particle size curve
  size0: new MuQuantizedFloat(1 / 64, 1),
  size1: new MuQuantizedFloat(1 / 64, 1),
  size2: new MuQuantizedFloat(1 / 64, 1),
  size3: new MuQuantizedFloat(1 / 64, 1),
  size4: new MuQuantizedFloat(1 / 64, 1),
  sizeSpread: new MuQuantizedFloat(1 / 64),

  // velocity damping
  damping: new MuQuantizedFloat(1 / 1024, 0),
});

// entity particle emitter data
export const ParticleEntitySchema = new MuStruct({
  id: new MuVarint(), // entity id
  particleId: new MuVarint(), // particle prototype id
  ...ParticleEmitterSchema.muData, // emitter properties
});

export type ParticleEntity = typeof ParticleEntitySchema.identity;

// cached particle properties
export const ParticlePrototypeSchema = new MuStruct({
  id: new MuVarint(), // particle prototype id
  ...ParticleParameterSchema.muData, // emitter properties
});

export type ParticlePrototype = typeof ParticlePrototypeSchema.identity;

// replicated particle state
// split particles into emitters and prototypes to save bandwidth
export const ParticleReplicaSchema = new MuStruct({
  // emitters are attached to entities and emit particles at some rate
  emitters: new MuSortedArray(ParticleEntitySchema, Infinity, compareId),
  // prototypes are bulk particle configuration data (color etc.) which is commonly shared by many entities
  prototypes: new MuSortedArray(ParticlePrototypeSchema, Infinity, compareId),
});
