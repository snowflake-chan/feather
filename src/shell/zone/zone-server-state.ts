import { MuSortedArray, MuStruct, MuVarint } from '@box/mudb/schema';
import { compareId } from '@box/utils/id';
import { EnvironmentZoneSchema } from '@box/schema/zone/zone-schema';

export const MAX_ZONES = 128;

export const ServerEnvironmentZoneSchema = new MuStruct({
  // player bit field
  selectorGroup: new MuVarint(),

  ...EnvironmentZoneSchema.muData,
});

export type ServerEnvironmentZone = typeof ServerEnvironmentZoneSchema.identity;

export const ServerEnvironmentZoneSetSchema = new MuSortedArray(
  ServerEnvironmentZoneSchema,
  Infinity,
  compareId,
);
