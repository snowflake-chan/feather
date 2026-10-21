import { MuStruct, MuUint32, MuFloat64, MuBoolean } from '@box/mudb/schema';
import { RigidBodySet } from '../physics/physics-schema';
import { Vec3Schema } from '../utils/math-schema';
import { boxRayIntersectRecip } from './box-collide';
import { vec3 } from 'gl-matrix';
import { RenderBoxSet } from '../render-box/schema';

export const BodyRaycastSchema = new MuStruct({
  hit: new MuBoolean(),
  hitTime: new MuFloat64(),
  hitId: new MuUint32(0),
  hitPosition: Vec3Schema,
  hitNormal: Vec3Schema,
});

export type BodyRaycast = typeof BodyRaycastSchema.identity;

const EPSILON = 1e-6;

export function raycastBoxes(
  result: BodyRaycast,
  boxes: RigidBodySet | RenderBoxSet,
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  skipId: number,
) {
  result.hitTime = Infinity;
  result.hit = false;
  let count = 0;
  let idx;
  let idy;
  let idz;
  if (Math.abs(dx) > EPSILON) {
    idx = 1 / dx;
  } else {
    idx = Infinity;
    ++count;
  }
  if (Math.abs(dy) > EPSILON) {
    idy = 1 / dy;
  } else {
    idy = Infinity;
    ++count;
  }
  if (Math.abs(dz) > EPSILON) {
    idz = 1 / dz;
  } else {
    idz = Infinity;
    ++count;
  }
  // handle case where ray has no direction
  if (count < 3) {
    let axis = 0;
    for (let i = 0; i < boxes.length; ++i) {
      const { id, px, py, pz, rx, ry, rz } = boxes[i];
      if (id === skipId) {
        continue;
      }
      const hit = boxRayIntersectRecip(
        px - rx,
        py - ry,
        pz - rz,
        px + rx,
        py + ry,
        pz + rz,
        idx,
        idy,
        idz,
        ox,
        oy,
        oz,
      );
      if (hit.collides && hit.t < result.hitTime) {
        result.hit = true;
        result.hitId = id;
        result.hitTime = hit.t;
        axis = hit.axis;
      }
    }
    if (result.hit) {
      const P = result.hitPosition;
      const N = result.hitNormal;
      const t = result.hitTime;

      P[0] = ox + dx * t;
      P[1] = oy + dy * t;
      P[2] = oz + dz * t;

      N[0] = N[1] = N[2] = 0;
      const d = axis === 0 ? dx : axis === 1 ? dy : dz;
      N[axis] = d < 0 ? -1 : 1;

      return true;
    }
  }

  result.hitId = 0;
  vec3.set(result.hitPosition, ox, oy, oz);
  vec3.set(result.hitNormal, 0, 0, 0);
  return false;
}
