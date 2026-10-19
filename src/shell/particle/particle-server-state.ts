import {
  MuStruct,
  MuVarint,
  MuSortedArray,
  MuBoolean,
  MuFloat64,
} from '@box/mudb/schema';
import {
  ParticleParameterSchema,
  ParticleEntity,
  ParticleEmitterSchema,
} from '@box/schema/particle/particle-schema';
import { compareId } from '@box/utils/id';
import { MuRefSchema } from '@box/schema/utils/ref-schema';

// server particle entities
export const ServerParticleEntitySchema = new MuStruct({
  id: new MuVarint(),
  animated: new MuBoolean(false),
  ...ParticleEmitterSchema.muData,
  ...ParticleParameterSchema.muData,
});

export const ServerParticlePrototypeSchema = new MuStruct({
  id: new MuVarint(),
  emitterRef: new MuRefSchema<ParticleEntity>(),
  inactive: new MuBoolean(false),
  animatedId: new MuVarint(0),
  lastTick: new MuFloat64(),
  ...ParticleParameterSchema.muData,
});

export type ServerParticlePrototype =
  typeof ServerParticlePrototypeSchema.identity;

export function compareParticleParams(
  a: ServerParticlePrototype,
  b: ServerParticlePrototype,
) {
  const aAni = +a.animatedId;
  const bAni = +b.animatedId;
  if (aAni || bAni) {
    return aAni - bAni || b.id - a.id;
  }
  return (
    a.acceleration[0] - b.acceleration[0] ||
    a.acceleration[1] - b.acceleration[1] ||
    a.acceleration[2] - b.acceleration[2] ||
    a.damping - b.damping ||
    a.noiseAmpl - b.noiseAmpl ||
    a.noiseFreq - b.noiseFreq ||
    a.color0 - b.color0 ||
    a.color1 - b.color1 ||
    a.color2 - b.color2 ||
    a.color3 - b.color3 ||
    a.color4 - b.color4 ||
    a.size0 - b.size0 ||
    a.size1 - b.size1 ||
    a.size2 - b.size2 ||
    a.size3 - b.size3 ||
    a.size4 - b.size4 ||
    a.sizeSpread - b.sizeSpread ||
    a.targetId - b.targetId ||
    a.targetWeight - b.targetWeight ||
    b.id - a.id // sort so runs of same particle prototypes have id first
  );
}

export const ServerParticleSetSchema = new MuSortedArray(
  ServerParticleEntitySchema,
  Infinity,
  compareId,
);

// server particle state
export const ServerParticleStateSchema = new MuStruct({
  particleIdCounter: new MuVarint(1),
  entities: ServerParticleSetSchema,
  prototypeIndex: new MuSortedArray(
    ServerParticlePrototypeSchema,
    Infinity,
    compareParticleParams,
  ),
});
