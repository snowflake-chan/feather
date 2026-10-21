import { vec3 } from 'gl-matrix';
import { IKState } from '@box/schema/animation/ik-schema';
import { boxRayIntersectRecip } from '@box/schema/physics/box-collide';
import { BodyRaycast } from '@box/schema/physics/raycast-bodies';

const EPSILON = 1e-6;

export function raycastPlayersByMeshBound(
  result: BodyRaycast,
  playersAnimation: IKState[],
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
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
    for (let i = 0; i < playersAnimation.length; ++i) {
      const id = playersAnimation[i].id;
      const meshes = playersAnimation[i].meshBound;
      for (const part in meshes) {
        const { lo, hi } = meshes[part];
        const hit = boxRayIntersectRecip(
          lo[0],
          lo[1],
          lo[2],
          hi[0],
          hi[1],
          hi[2],
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
