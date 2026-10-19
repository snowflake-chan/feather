import { MuStruct, MuFloat64 } from '@box/mudb/schema';
import { Mat4Schema } from './math-schema';

export const FrustumSchema = new MuStruct({
  // Matrix
  matrix: Mat4Schema,
  invMatrix: Mat4Schema,

  // Bounds
  lox: new MuFloat64(0),
  loy: new MuFloat64(0),
  loz: new MuFloat64(0),

  hix: new MuFloat64(0),
  hiy: new MuFloat64(0),
  hiz: new MuFloat64(0),

  // 6 planes (written in dumb way to improve perf)
  h0x: new MuFloat64(0),
  h0y: new MuFloat64(0),
  h0z: new MuFloat64(0),
  h0w: new MuFloat64(0),

  h1x: new MuFloat64(0),
  h1y: new MuFloat64(0),
  h1z: new MuFloat64(0),
  h1w: new MuFloat64(0),

  h2x: new MuFloat64(0),
  h2y: new MuFloat64(0),
  h2z: new MuFloat64(0),
  h2w: new MuFloat64(0),

  h3x: new MuFloat64(0),
  h3y: new MuFloat64(0),
  h3z: new MuFloat64(0),
  h3w: new MuFloat64(0),

  h4x: new MuFloat64(0),
  h4y: new MuFloat64(0),
  h4z: new MuFloat64(0),
  h4w: new MuFloat64(0),

  h5x: new MuFloat64(0),
  h5y: new MuFloat64(0),
  h5z: new MuFloat64(0),
  h5w: new MuFloat64(0),

  // 8 points (again, written in dumb way for perf)
  p0x: new MuFloat64(0),
  p0y: new MuFloat64(0),
  p0z: new MuFloat64(0),

  p1x: new MuFloat64(0),
  p1y: new MuFloat64(0),
  p1z: new MuFloat64(0),

  p2x: new MuFloat64(0),
  p2y: new MuFloat64(0),
  p2z: new MuFloat64(0),

  p3x: new MuFloat64(0),
  p3y: new MuFloat64(0),
  p3z: new MuFloat64(0),

  p4x: new MuFloat64(0),
  p4y: new MuFloat64(0),
  p4z: new MuFloat64(0),

  p5x: new MuFloat64(0),
  p5y: new MuFloat64(0),
  p5z: new MuFloat64(0),

  p6x: new MuFloat64(0),
  p6y: new MuFloat64(0),
  p6z: new MuFloat64(0),

  p7x: new MuFloat64(0),
  p7y: new MuFloat64(0),
  p7z: new MuFloat64(0),

  // near clip bounds
  nearX0: new MuFloat64(0),
  nearY0: new MuFloat64(0),
  nearZ0: new MuFloat64(0),

  nearX1: new MuFloat64(0),
  nearY1: new MuFloat64(0),
  nearZ1: new MuFloat64(0),
});

export type Frustum = typeof FrustumSchema.identity;
