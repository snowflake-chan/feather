import { MuStruct, MuArray, MuVarint } from '@box/mudb/schema';

export const HurtEventSchema = new MuStruct({
  id: new MuVarint(0),
  damage: new MuVarint(0),
});

export const HurtEventSetSchema = new MuArray(HurtEventSchema, Infinity);

export const RespawnEventSchema = new MuStruct({
  tick: new MuVarint(),
  id: new MuVarint(),
});

export const RespawnEventSetSchema = new MuArray(RespawnEventSchema, Infinity);

export const DamageEventSchema = new MuStruct({
  hurt: HurtEventSetSchema,
  respawn: new MuArray(new MuVarint(), Infinity),
  die: new MuArray(new MuVarint(), Infinity),
});
