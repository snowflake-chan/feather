import { vec3 } from 'gl-matrix';

import {
  MuStruct,
  MuFloat64,
  MuBoolean,
  MuSchema,
  MuVarint,
  MuUint8,
} from '@box/mudb/schema';
import {
  Mat4Schema,
  Vec3Schema,
  QuatSchema,
  Vec2Schema,
} from '../utils/math-schema';
import { FrustumSchema } from '../utils/frustum-schema';
import {
  QuantizedScalar,
  QuantizedVec3Schema,
} from '../utils/quantized-schema';

export const UP = vec3.fromValues(0, 1, 0);
export const EMISSIVE_SCALE = 100;
export const MIN_CAMERA_DISTANCE = 0.01;

export enum CameraMode {
  FOLLOW,
  FIXED,
  FPS,
  RELATIVE,
}

export enum CameraFreezedAxis {
  NONE = 0,
  X = 1 << 0,
  Y = 1 << 1,
  Z = 1 << 2,
}

export const CameraConfigurationSchema = new MuStruct({
  mode: <MuSchema<CameraMode>>new MuUint8(CameraMode.FOLLOW),

  targetId: new MuVarint(),

  eye: new QuantizedVec3Schema(1 / 256, vec3.fromValues(0, 0, 0)),
  up: new QuantizedVec3Schema(1 / 1024, vec3.fromValues(0, 1, 0)),
  target: new QuantizedVec3Schema(1 / 256, vec3.fromValues(0, 0, 0)),
  freezedAxis: new MuUint8(0),
  fovY: new QuantizedScalar(1 / 256, 0.25),
  distance: new QuantizedScalar(1 / 256, 8.5),
});

export type CameraConfiguration = typeof CameraConfigurationSchema.identity;

export const CameraSchema = new MuStruct({
  // Screen pixel ratio
  viewport: Vec2Schema,

  // Cursor position in screen coordinates
  cursor: Vec2Schema,
  cursorRay: Vec3Schema,
  axis: Vec3Schema,

  // View-projection transform
  view: Mat4Schema,
  projection: Mat4Schema,

  // Computed transforms
  viewProjection: Mat4Schema,
  invView: Mat4Schema,
  invProjection: Mat4Schema,
  invViewProjection: Mat4Schema,

  // Frustum
  frustum: FrustumSchema,

  // animation stuff
  eye: Vec3Schema,
  eyeVelocity: Vec3Schema,
  rotation: QuatSchema,
  distance: new MuFloat64(8.5),

  currentDistance: new MuFloat64(8.5),

  // eye target stuff
  targetEye: Vec3Schema,
  targetLook: Vec3Schema,
  targetRotation: QuatSchema,

  // projection matrix configuration
  fovY: new MuFloat64(Math.PI / 4),
  zNear: new MuFloat64(0.25),
  zFar: new MuFloat64(512),
  freezeFovY: new MuBoolean(false),

  // Camera eye types
  eyeVoxel: new MuVarint(0),
  underwater: new MuBoolean(false),

  // Focal distance
  focalDistance: new MuFloat64(8),
  crosshairSeparation: new MuFloat64(0),

  // Exposure
  targetExposure: new MuFloat64(1 / 100),
  currentExposure: new MuFloat64(1 / 100),
  logExposureVelocity: new MuFloat64(0),

  // crepuscular ray stuff
  screenLightPos: Vec3Schema,
  eyeFogAmount: new MuFloat64(0),

  // FPS id (skip rendering this player)
  fpsID: new MuVarint(0),
});

export type Camera = typeof CameraSchema.identity;
