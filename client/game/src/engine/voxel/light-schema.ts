import {
  MuStruct,
  MuFloat64,
  MuArray,
  MuInt32,
  MuDictionary,
  MuSchema,
  MuBoolean,
  MuUint32,
} from '@box/mudb/schema';

export const LIGHTMAP_CACHE_AGE = 10000;

// We need to assign each light map query a unique id.  To do this we take the object id, shift it left and then stick a query mask in the lower order bits.
// light map query id formula:
//  ((base id number) << LightQuery.SHIFT) + LightQuery.QUERY_TYPE
// for player parts we split into each body part using some arbitrary locally defined offset
// (should this be more explicit later?)
export enum LightQueryMask {
  ENTITY = 0,
  SEED = 1,
  BREAK = 2,
  PARTICLE = 3,
  PLAYER_BASE = 4,

  // reserve enough space for all query masks
  SHIFT = 5,
}

export function lightId(objectId: number, type: LightQueryMask) {
  return (objectId << LightQueryMask.SHIFT) + type;
}

export const LightProbeSchema = new MuStruct({
  id: new MuUint32(0),
  dirty: new MuBoolean(false),
  lastAccess: new MuFloat64(0),
  lastGeomAccess: new MuFloat64(0),

  X0: new MuFloat64(0),
  Y0: new MuFloat64(0),
  Z0: new MuFloat64(0),

  X1: new MuFloat64(0),
  Y1: new MuFloat64(0),
  Z1: new MuFloat64(0),

  X2: new MuFloat64(0),
  Y2: new MuFloat64(0),
  Z2: new MuFloat64(0),

  X3: new MuFloat64(0),
  Y3: new MuFloat64(0),
  Z3: new MuFloat64(0),

  X4: new MuFloat64(0),
  Y4: new MuFloat64(0),
  Z4: new MuFloat64(0),

  X5: new MuFloat64(0),
  Y5: new MuFloat64(0),
  Z5: new MuFloat64(0),

  X6: new MuFloat64(0),
  Y6: new MuFloat64(0),
  Z6: new MuFloat64(0),

  X7: new MuFloat64(0),
  Y7: new MuFloat64(0),
  Z7: new MuFloat64(0),

  R0: new MuFloat64(0),
  G0: new MuFloat64(0),
  B0: new MuFloat64(0),
  A0: new MuFloat64(0),

  R1: new MuFloat64(0),
  G1: new MuFloat64(0),
  B1: new MuFloat64(0),
  A1: new MuFloat64(0),

  R2: new MuFloat64(0),
  G2: new MuFloat64(0),
  B2: new MuFloat64(0),
  A2: new MuFloat64(0),

  R3: new MuFloat64(0),
  G3: new MuFloat64(0),
  B3: new MuFloat64(0),
  A3: new MuFloat64(0),

  R4: new MuFloat64(0),
  G4: new MuFloat64(0),
  B4: new MuFloat64(0),
  A4: new MuFloat64(0),

  R5: new MuFloat64(0),
  G5: new MuFloat64(0),
  B5: new MuFloat64(0),
  A5: new MuFloat64(0),

  R6: new MuFloat64(0),
  G6: new MuFloat64(0),
  B6: new MuFloat64(0),
  A6: new MuFloat64(0),

  R7: new MuFloat64(0),
  G7: new MuFloat64(0),
  B7: new MuFloat64(0),
  A7: new MuFloat64(0),

  lox: new MuFloat64(),
  loy: new MuFloat64(),
  loz: new MuFloat64(),

  hix: new MuFloat64(),
  hiy: new MuFloat64(),
  hiz: new MuFloat64(),
});

export type LightProbe = typeof LightProbeSchema.identity;

export const LightProbeIndexSchema = <MuSchema<{ [id: number]: LightProbe }>>(
  new MuDictionary(LightProbeSchema, Infinity, {})
);
export type LightProbeIndex = typeof LightProbeIndexSchema.identity;

export const LightStateSchema = new MuStruct({
  ambient: new MuFloat64(),

  probes: LightProbeIndexSchema,

  pending: new MuBoolean(false),
  pendingProbes: new MuArray(LightProbeSchema, Infinity),
  nextIds: new MuArray(new MuInt32(), Infinity),
});

export type LightState = typeof LightStateSchema.identity;
