import {
  MuStruct,
  MuArray,
  MuFloat64,
  MuSchema,
  MuUint32,
  MuVarint,
} from '@box/mudb/schema';
import { Vec2Schema, Vec3Schema } from '@box/schema/utils/math-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { LightProbeSchema } from '../voxel/light-schema';

export const BREAK_EFFECT_TIME = 8;
export const MAX_BREAK_EFFECT = 64;
export const HURT_EFFECT_TIME = 12;
export const DIE_EFFECT_TIME = 10;
export const RESPAWN_EFFECT_TIME = 10;

export const BreakEffectSchema = new MuStruct({
  lightId: new MuUint32(0),

  animTick: new MuFloat64(0),

  rand: Vec2Schema,
  position: Vec3Schema,

  texCoordXPos: Vec2Schema,
  texCoordXNeg: Vec2Schema,
  texCoordYPos: Vec2Schema,
  texCoordYNeg: Vec2Schema,
  texCoordZPos: Vec2Schema,
  texCoordZNeg: Vec2Schema,

  probe: <MuSchema<typeof LightProbeSchema.identity>>(
    new MuRefSchema<typeof LightProbeSchema.identity>()
  ),
});

export type BreakEffect = typeof BreakEffectSchema.identity;

export const BreakEffectListSchema = new MuArray(BreakEffectSchema, Infinity);

export const HurtEffectSchema = new MuStruct({
  entityId: new MuVarint(),
  tick: new MuFloat64(),
  position: Vec3Schema,
  amount: new MuFloat64(),
  scaledAmount: new MuFloat64(0),
});
export type HurtEffect = typeof HurtEffectSchema.identity;
export const HurtEffectListSchema = new MuArray(HurtEffectSchema, Infinity);

export const DieEffectSchema = new MuStruct({
  tick: new MuFloat64(),
  position: Vec3Schema,
});
export const DieEffectListSchema = new MuArray(DieEffectSchema, Infinity);

export const RespawnEffectSchema = new MuStruct({
  tick: new MuFloat64(),
  position: Vec3Schema,
});
export const RespawnEffectListSchema = new MuArray(
  RespawnEffectSchema,
  Infinity,
);

// list of all client-side special effects which are active
export const EffectSchema = new MuStruct({
  effectCounter: new MuUint32(0),
  break: BreakEffectListSchema,
  hurt: HurtEffectListSchema,
  die: DieEffectListSchema,
  respawn: RespawnEffectListSchema,
});
