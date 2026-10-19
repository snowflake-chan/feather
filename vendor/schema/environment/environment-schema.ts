import { EnvironmentRDA } from '../project/project-rda';
import { MuStruct, MuFloat64, MuBoolean, MuFloat32 } from '@box/mudb/schema';
import { Vec3Schema, Vec4Schema } from '../utils/math-schema';

export const EnvironmentParamSchema = EnvironmentRDA.stateSchema;

export type EnvironmentParams = typeof EnvironmentParamSchema.identity;

export const EnvironmentStateSchema = new MuStruct({
  timeOfDay: new MuFloat64(0),
  sunUp: new MuBoolean(false),
  globalLight: new MuFloat64(0),
  gamma: new MuFloat32(1.3),
  drawDistance: new MuFloat32(512),
  freezeDrawDistance: new MuBoolean(false),

  sunDirection: Vec3Schema,
  sunColor: Vec3Schema,

  skyLeft: Vec3Schema,
  skyRight: Vec3Schema,
  skyTop: Vec3Schema,
  skyBottom: Vec3Schema,
  skyFront: Vec3Schema,
  skyBack: Vec3Schema,

  fogParams: Vec4Schema,
  fogParams2: Vec4Schema,
  fogParams3: Vec4Schema,
});

export type EnvironmentState = typeof EnvironmentStateSchema.identity;
