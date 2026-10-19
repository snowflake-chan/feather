import { MuStruct, MuVarint, MuSortedArray, MuBoolean } from '@box/mudb/schema';
import { compareId } from '@box/utils/id';
import {
  AmbientSoundRDA,
  EntitySoundRDA,
  PlayerSoundRDA,
} from '@box/schema/project/project-rda';

export const ServerEntitySoundEffectSchema = new MuStruct({
  id: new MuVarint(),
  ...EntitySoundRDA.stateSchema.muData,
});
export type ServerEntitySoundEffect =
  typeof ServerEntitySoundEffectSchema.identity;

export const ServerEntitySoundComponentSchema = new MuSortedArray(
  ServerEntitySoundEffectSchema,
  Infinity,
  compareId,
);

export const ServerPlayerSoundEffectSchema = new MuStruct({
  id: new MuVarint(),
  ...PlayerSoundRDA.stateSchema.muData,
});
export type ServerPlayerEntitySoundEffect =
  typeof ServerPlayerSoundEffectSchema.identity;

export const ServerPlayerSoundComponentSchema = new MuSortedArray(
  ServerPlayerSoundEffectSchema,
  Infinity,
  compareId,
);

export const ServerSoundStateSchema = new MuStruct({
  ambientDirty: new MuBoolean(true),
  ambient: AmbientSoundRDA.stateSchema,
  entityDirty: new MuBoolean(true),
  entity: ServerEntitySoundComponentSchema,
  playerDirty: new MuBoolean(true),
  player: ServerPlayerSoundComponentSchema,
});
