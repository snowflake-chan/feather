import {
  MuStruct,
  MuVarint,
  MuFloat32,
  MuSortedArray,
  MuArray,
  MuFloat64,
  MuBoolean,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';

export const ParticleWorkerEmitterSchema = new MuStruct({
  id: new MuVarint(),

  minEmit: new MuFloat32(),
  spreadEmit: new MuFloat32(),

  minX: new MuFloat32(),
  minY: new MuFloat32(),
  minZ: new MuFloat32(),

  spreadX: new MuFloat32(),
  spreadY: new MuFloat32(),
  spreadZ: new MuFloat32(),

  minVX: new MuFloat32(),
  minVY: new MuFloat32(),
  minVZ: new MuFloat32(),

  spreadVX: new MuFloat32(),
  spreadVY: new MuFloat32(),
  spreadVZ: new MuFloat32(),

  minLifetime: new MuFloat32(),
  spreadLifetime: new MuFloat32(),
});

export type ParticleWorkerEmitter = typeof ParticleWorkerEmitterSchema.identity;

export const ParticleWorkerTickSchema = new MuStruct({
  reset: new MuBoolean(false),
  now: new MuFloat64(),
  deltaT: new MuFloat64(),
  maxParticles: new MuVarint(),
  maxGroups: new MuVarint(),
  emitters: new MuSortedArray(ParticleWorkerEmitterSchema, Infinity, compareId),
});

export const ParticleWorkerGroupSchema = new MuStruct({
  id: new MuVarint(),
  offset: new MuVarint(),
  count: new MuVarint(),
});

export type ParticleWorkerGroupInfo = typeof ParticleWorkerGroupSchema.identity;

export const ParticleWorkerGroupHeaderSchema = new MuStruct({
  count: new MuVarint(),
  groups: new MuArray(ParticleWorkerGroupSchema, Infinity),
});

export type ParticleWorkerMessage = {
  message: ArrayBuffer;
  free: ArrayBuffer[];
};
