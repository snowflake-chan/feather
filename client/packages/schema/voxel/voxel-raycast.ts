import { vec3 } from 'gl-matrix';
import { VoxelView } from '@box/utils/voxel';
import { BlockIndex } from './block-schema';

export class VoxelRaycastHitResult {
  public hitPosition: vec3;
  public hitNormal: vec3;
  public hitVoxel: [number, number, number];
  public hitDistance: number;
  public hitBlock: number;

  constructor() {
    this.hitPosition = vec3.create();
    this.hitNormal = vec3.create();
    this.hitVoxel = [0, 0, 0];
    this.hitDistance = Infinity;
    this.hitBlock = 0;
  }
}

function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

function isTransparent(id: number) {
  return (id & 0x0fff & 1) ^ 1;
}

function raycastImplementation(
  result: VoxelRaycastHitResult,
  blockIndex: BlockIndex,
  voxels: VoxelView,
  px_: number,
  py_: number,
  pz_: number,
  dx: number,
  dy: number,
  dz: number,
  maxDistance_: number,
  ignoreFluid: boolean,
  ignoreTransparent: boolean,
): boolean {
  let t = 0;
  let maxDistance = maxDistance_;

  const txDelta = Math.abs(1 / dx);
  const tyDelta = Math.abs(1 / dy);
  const tzDelta = Math.abs(1 / dz);

  const tx0 = -px_ / dx;
  const tx1 = (voxels.shape[0] - px_) / dx;
  const ty0 = -py_ / dy;
  const ty1 = (voxels.shape[1] - py_) / dy;
  const tz0 = -pz_ / dz;
  const tz1 = (voxels.shape[2] - pz_) / dz;

  let stepx = 1;
  let initAxis = -1;
  let initDirec = -1;

  if (dx < 0) {
    if (px_ < 0) {
      return false;
    } else if (px_ >= voxels.shape[0]) {
      if (tx1 > t) {
        t = tx1;
        initAxis = 0;
        initDirec = 1;
      }
    }
    maxDistance = Math.min(maxDistance, tx0);
    stepx = -1;
  } else {
    if (px_ >= voxels.shape[0]) {
      return false;
    } else if (px_ < 0) {
      if (tx0 > t) {
        t = tx0;
        initAxis = 0;
        initDirec = -1;
      }
    }
    maxDistance = Math.min(maxDistance, tx1);
  }

  let stepy = 1;
  if (dy < 0) {
    if (py_ < 0) {
      return false;
    } else if (py_ >= voxels.shape[1]) {
      if (ty1 > t) {
        t = ty1;
        initAxis = 1;
        initDirec = 1;
      }
    }
    maxDistance = Math.min(maxDistance, ty0);
    stepy = -1;
  } else {
    if (py_ >= voxels.shape[1]) {
      return false;
    } else if (py_ < 0) {
      if (ty0 > t) {
        t = ty0;
        initAxis = 1;
        initDirec = -1;
      }
    }
    maxDistance = Math.min(maxDistance, ty1);
  }

  let stepz = 2 * +(dz > 0) - 1;
  if (dz < 0) {
    if (pz_ < 0) {
      return false;
    } else if (pz_ >= voxels.shape[2]) {
      if (tz1 > t) {
        t = tz1;
        initAxis = 2;
        initDirec = 1;
      }
    }
    maxDistance = Math.min(maxDistance, tz0);
    stepz = -1;
  } else {
    if (pz_ >= voxels.shape[2]) {
      return false;
    } else if (pz_ < 0) {
      if (tz0 > t) {
        t = tz0;
        initAxis = 2;
        initDirec = -1;
      }
    }
    maxDistance = Math.min(maxDistance, tz1);
  }

  const px = clamp(px_ + t * dx, 0, voxels.shape[0] - 0.001);
  const py = clamp(py_ + t * dy, 0, voxels.shape[1] - 0.001);
  const pz = clamp(pz_ + t * dz, 0, voxels.shape[2] - 0.001);

  let ix = Math.floor(px) | 0;
  let iy = Math.floor(py) | 0;
  let iz = Math.floor(pz) | 0;

  const xdist = stepx > 0 ? ix + 1 - px : px - ix;
  const ydist = stepy > 0 ? iy + 1 - py : py - iy;
  const zdist = stepz > 0 ? iz + 1 - pz : pz - iz;

  // location of nearest voxel boundary, in units of t
  let txMax = t + (txDelta < Infinity ? txDelta * xdist : Infinity);
  let tyMax = t + (tyDelta < Infinity ? tyDelta * ydist : Infinity);
  let tzMax = t + (tzDelta < Infinity ? tzDelta * zdist : Infinity);
  let steppedIndex = -1;

  // unpack voxel params
  const {
    getVoxelByPtr,
    stride: [stridex, stridey, stridez],
    offset,
  } = voxels;

  // main loop along raycast vector
  let times = 0;
  while (t <= maxDistance) {
    // exit check
    let b = getVoxelByPtr(ix * stridex + iy * stridey + iz * stridez + offset);
    if (
      ix >= voxels.shape[0] ||
      iy >= voxels.shape[1] ||
      iz >= voxels.shape[2] ||
      ix < 0 ||
      iy < 0 ||
      iz < 0
    ) {
      b = 0;
    }
    if (
      b &&
      (!ignoreFluid || !blockIndex.fluid[b & 0x0fff]) &&
      (!ignoreTransparent || !isTransparent(b))
    ) {
      result.hitPosition[0] = px_ + t * dx;
      result.hitPosition[1] = py_ + t * dy;
      result.hitPosition[2] = pz_ + t * dz;

      result.hitVoxel[0] = ix;
      result.hitVoxel[1] = iy;
      result.hitVoxel[2] = iz;
      result.hitNormal[0] = result.hitNormal[1] = result.hitNormal[2] = 0;
      if (times == 0 && initAxis != -1) {
        result.hitNormal[initAxis] = initDirec;
      }
      if (steppedIndex === 0) {
        result.hitNormal[0] = -stepx;
      }
      if (steppedIndex === 1) {
        result.hitNormal[1] = -stepy;
      }
      if (steppedIndex === 2) {
        result.hitNormal[2] = -stepz;
      }

      result.hitDistance = t;
      result.hitBlock = b;
      return true;
    }

    // advance t to next nearest voxel boundary
    if (txMax < tyMax) {
      if (txMax < tzMax) {
        ix += stepx;
        t = txMax;
        txMax += txDelta;
        steppedIndex = 0;
      } else {
        iz += stepz;
        t = tzMax;
        tzMax += tzDelta;
        steppedIndex = 2;
      }
    } else {
      if (tyMax < tzMax) {
        iy += stepy;
        t = tyMax;
        tyMax += tyDelta;
        steppedIndex = 1;
      } else {
        iz += stepz;
        t = tzMax;
        tzMax += tzDelta;
        steppedIndex = 2;
      }
    }
    ++times;
  }
  return false;
}

export function raycast(
  result: VoxelRaycastHitResult,
  blockIndex: BlockIndex,
  voxels: VoxelView,
  origin: vec3,
  direction: vec3,
  maxDistance: number,
  ignoreFluid?: boolean,
  ignoreTransparent?: boolean,
): boolean {
  const px = +origin[0];
  const py = +origin[1];
  const pz = +origin[2];
  const dx = +direction[0];
  const dy = +direction[1];
  const dz = +direction[2];

  const s = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

  return raycastImplementation(
    result,
    blockIndex,
    voxels,
    px,
    py,
    pz,
    dx / s,
    dy / s,
    dz / s,
    +maxDistance,
    !!ignoreFluid,
    !!ignoreTransparent,
  );
}
