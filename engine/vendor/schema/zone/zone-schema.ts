import {
  MuBoolean,
  MuQuantizedFloat,
  MuSortedArray,
  MuStruct,
  MuVarint,
} from '@box/mudb/schema';
import { FogRDA, RainRDA, SkyRDA, SnowRDA } from '../project/project-rda';
import { compareId } from '@box/utils/id';

// common zone stuff
export const ZoneSchema = new MuStruct({
  id: new MuVarint(),

  // bounds
  minX: new MuQuantizedFloat(1 / 16, 0),
  minY: new MuQuantizedFloat(1 / 16, 0),
  minZ: new MuQuantizedFloat(1 / 16, 0),

  maxX: new MuQuantizedFloat(1 / 16, 0),
  maxY: new MuQuantizedFloat(1 / 16, 0),
  maxZ: new MuQuantizedFloat(1 / 16, 0),
});

export const ZoneSelectorGroupSchema = new MuStruct({
  id: new MuVarint(),
  groupBits: new MuSortedArray(new MuVarint(), Infinity, (a, b) => a - b),
});

export type ZoneSelectorGroup = typeof ZoneSelectorGroupSchema.identity;

export const ZoneSelectorGroupSetSchema = new MuSortedArray(
  ZoneSelectorGroupSchema,
  Infinity,
  compareId,
);

export const PhysicsZoneSchema = new MuStruct({
  // selector group for this zone
  selectorGroup: new MuVarint(0),

  // physics effects
  massScale: new MuQuantizedFloat(1 / 256, 0),
  fx: new MuQuantizedFloat(1 / 1024, 0),
  fy: new MuQuantizedFloat(1 / 1024, 0),
  fz: new MuQuantizedFloat(1 / 1024, 0),

  ...ZoneSchema.muData,
});

export type PhysicsZone = typeof PhysicsZoneSchema.identity;

export const PhysicsZoneSetSchema = new MuSortedArray(
  PhysicsZoneSchema,
  Infinity,
  compareId,
);

export const EnvironmentZoneSchema = new MuStruct({
  // weather effects
  overrideFog: new MuBoolean(false),
  fog: FogRDA.stateSchema,
  overrideSky: new MuBoolean(false),
  sky: SkyRDA.stateSchema,
  overrideSnow: new MuBoolean(false),
  snow: SnowRDA.stateSchema,
  overrideRain: new MuBoolean(false),
  rain: RainRDA.stateSchema,

  ...ZoneSchema.muData,
});

export type EnvironmentZone = typeof EnvironmentZoneSchema.identity;

export type EnvironmentZoneSchema = typeof EnvironmentZoneSchema.identity;

export const EnvironmentZoneSetSchema = new MuSortedArray(
  EnvironmentZoneSchema,
  Infinity,
  compareId,
);
