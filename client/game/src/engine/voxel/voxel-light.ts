/** @fileoverview Voxel lighting propagation helpers. */

import { alloc, free } from '../utils/pool';
import { fillArray } from './fill';
import { BlockIndex } from '@box/schema/voxel/block-schema';
import { VoxelView } from '@box/utils/voxel';

const STEP_SIZE = 1;

export function wlpLT(a: number, b: number) {
  const ae = (a | (a << 12)) & 0xf0f0f0f;
  const be = (b | (b << 12)) & 0xf0f0f0f;
  const d = ((0x20202020 + ae - be) & 0x10101010) * 0xf;
  return ((d >>> 4) | (d >>> 16)) & 0xffff;
}

export function wlpMax(a: number, b: number) {
  return a ^ ((a ^ b) & wlpLT(a, b));
}

export function wlpDec(x: number) {
  const xd = ((x | (x << 12)) & 0xf0f0f0f) + 0x1f1f1f1f;
  const b = xd & 0x10101010;
  const d = (xd + (b >>> 4)) & 0xf0f0f0f;
  return (d + (d >>> 12)) & 0xffff;
}

export function wlpEquals(a: number, b: number) {
  const x = a ^ b;
  const m = (x | (x << 12)) & 0xf0f0f0f;
  const m0 = m | (m << 1) | (m >>> 2);
  const m1 = m0 | (m0 << 2) | (m0 >>> 1);
  const r = ~m1 & 0xf0f0f0f;
  return (r + (r >>> 12)) & 0xffff;
}

const R_MASK = 0xf;
const G_MASK = 0xf0;
const B_MASK = 0xf00;
const A_MASK = 0xf000;

export class VoxelLightMap {
  public voxels: VoxelView;
  public yRays: Int16Array;
  public lightLevel: Uint16Array;

  public nx: number = 0;
  public ny: number = 0;
  public nz: number = 0;

  public sx: number = 0;
  public sy: number = 0;
  public sz: number = 0;

  public startX: number = 0;
  public startY: number = 0;
  public startZ: number = 0;

  public endX: number = 0;
  public endY: number = 0;
  public endZ: number = 0;

  // FIXME: allocate these locally
  public ADD_QUEUE: Uint16Array;
  public ADD_PTR = 0;
  public REMOVE_QUEUE: Uint32Array;
  public REMOVE_PTR = 0;

  private ADD_XLO = 0;
  private ADD_YLO = 0;
  private ADD_ZLO = 0;
  private ADD_XHI = 0;
  private ADD_YHI = 0;
  private ADD_ZHI = 0;

  private MIN_LIGHT: number;

  private pushAdd(x: number, y: number, z: number) {
    if (
      x < this.ADD_XLO ||
      x > this.ADD_XHI ||
      y < this.ADD_YLO ||
      y > this.ADD_YHI ||
      z < this.ADD_ZLO ||
      z > this.ADD_ZHI
    ) {
      return;
    }
    this.ADD_QUEUE[this.ADD_PTR++] = x;
    this.ADD_QUEUE[this.ADD_PTR++] = y;
    this.ADD_QUEUE[this.ADD_PTR++] = z;
  }

  private pushRemove(x: number, y: number, z: number, l: number) {
    this.REMOVE_QUEUE[this.REMOVE_PTR++] = x;
    this.REMOVE_QUEUE[this.REMOVE_PTR++] = y;
    this.REMOVE_QUEUE[this.REMOVE_PTR++] = z;
    this.REMOVE_QUEUE[this.REMOVE_PTR++] = l;
  }

  private _isTransparent(id: number) {
    return (id & 0x0fff & 1) ^ 1;
  }

  constructor(
    public blockIndex: BlockIndex,
    voxels: VoxelView,
    innerAO: boolean = false,
  ) {
    this.voxels = voxels;

    this.MIN_LIGHT = innerAO ? 0xd000 : 0;

    const nx = (this.nx = voxels.shape[0]);
    const ny = (this.ny = voxels.shape[1]);
    const nz = (this.nz = voxels.shape[2]);

    this.updateStartEnd();

    const yRaySize = this.nx * this.nz * 2;
    this.yRays = new Int16Array(alloc(yRaySize));
    this.lightLevel = new Uint16Array(alloc(voxels.data.byteLength));

    // reserve space in queue data structures, reset pointers
    // FIXME: not sure this upper bound is sufficient
    //  this as far as a diagonal ray could spread through the volume in the worst case.
    //  unclear if there can be larger voxel mods than this
    const queueSize =
      Math.pow(STEP_SIZE + 32, 2) * Math.max(STEP_SIZE + 32, (nx + nz) * 3);
    this.ADD_QUEUE = new Uint16Array(alloc(queueSize * 6));
    this.REMOVE_QUEUE = new Uint32Array(alloc(queueSize * 16));

    this.recalcRays();
    this.recalcLightLevel();
  }

  public destroy() {
    free(this.yRays.buffer);
    free(this.lightLevel.buffer);
    free(this.ADD_QUEUE.buffer);
    free(this.REMOVE_QUEUE.buffer);
  }

  public updateAllLight() {
    this.updateStartEnd();
    this.recalcRays();
    this.recalcLightLevel();
  }

  private updateStartEnd() {
    const { nx, ny, nz } = this;
    const { dataStart, dataEnd, dataStride, stride } = this.voxels;
    if (dataStart) {
      this.startX = dataStart[0];
      this.startY = dataStart[1];
      this.startZ = dataStart[2];
    }

    if (dataEnd) {
      this.endX = dataEnd[0];
      this.endY = dataEnd[1];
      this.endZ = dataEnd[2];
    } else {
      this.endX = nx;
      this.endY = ny;
      this.endZ = nz;
    }

    if (dataStride) {
      this.sx = dataStride[0];
      this.sy = dataStride[1];
      this.sz = dataStride[2];
    } else {
      this.sx = stride[0];
      this.sy = stride[1];
      this.sz = stride[2];
    }
  }

  public recalcRays() {
    const { nx, ny, startX, startZ, endX, endZ, yRays, voxels } = this;

    fillArray(yRays, -1);

    for (let z = startZ; z < endZ; ++z) {
      for (let x = startX; x < endX; ++x) {
        const yptr = x + z * nx;
        for (let y = 0; y < ny; ++y) {
          const voxel = voxels.getVoxel(x, y, z);
          if (!this._isTransparent(voxel)) {
            yRays[yptr] = Math.max(yRays[yptr], y);
          }
        }
      }
    }
  }

  public recalcLightLevel() {
    const {
      nx,
      sx,
      sy,
      sz,
      startX,
      startY,
      startZ,
      endX,
      endY,
      endZ,
      yRays,
      voxels,
      lightLevel,
    } = this;

    const { data } = voxels;

    // 1st pass: set light levels
    const EMISSIVE = this.blockIndex.emissive;
    for (let z = startZ; z < endZ; ++z) {
      for (let x = startX; x < endX; ++x) {
        const yptr = x + z * nx;
        const y0 = yRays[yptr];
        for (let y = startY; y < endY; ++y) {
          const ptr = sx * (x - startX) + sy * (y - startY) + sz * (z - startZ);
          let light = EMISSIVE[data[ptr] & 0x0fff] >>> 0;

          if (y > y0) {
            light = (light | A_MASK) >>> 0;
          }

          if (!light && this._isTransparent(data[ptr])) {
            light = (light | this.MIN_LIGHT) >>> 0;
          }

          lightLevel[ptr] = light;
        }
      }
    }

    // 2nd pass: propagate lights
    for (let cz = startZ; cz < endZ; cz += STEP_SIZE) {
      for (let cy = startY; cy < endY; cy += STEP_SIZE) {
        for (let cx = startX; cx < endX; cx += STEP_SIZE) {
          this.ADD_PTR = 0;
          const mx = Math.min(endX, cx + STEP_SIZE);
          const my = Math.min(endY, cy + STEP_SIZE);
          const mz = Math.min(endZ, cz + STEP_SIZE);

          this.ADD_XLO = cx - 16;
          this.ADD_YLO = cy - 16;
          this.ADD_ZLO = cz - 16;
          this.ADD_XHI = mx + 16;
          this.ADD_YHI = my + 16;
          this.ADD_ZHI = mz + 16;
          for (let z = cz; z < mz; ++z) {
            for (let y = cy; y < my; ++y) {
              for (let x = cx; x < mx; ++x) {
                const ptr =
                  sx * (x - startX) + sy * (y - startY) + sz * (z - startZ);
                if (lightLevel[ptr]) {
                  this.pushAdd(x, y, z);
                }
              }
            }
          }
          this._addLights();
        }
      }
    }

    this.ADD_XLO = 0;
    this.ADD_YLO = 0;
    this.ADD_ZLO = 0;
    this.ADD_XHI = endX - 1;
    this.ADD_YHI = endY - 1;
    this.ADD_ZHI = endZ - 1;
  }

  private _minLight(l: number) {
    const a = l & A_MASK;
    if (a >= this.MIN_LIGHT) {
      return l;
    }
    const rgb = l & ~A_MASK;
    return rgb | this.MIN_LIGHT;
  }

  private _addLights() {
    const {
      sx,
      sy,
      sz,
      startX,
      startY,
      startZ,
      endX,
      endY,
      endZ,
      voxels,
      lightLevel,
    } = this;

    const { data } = voxels;

    for (let ptr = 0; ptr < this.ADD_PTR; ptr += 3) {
      const x = this.ADD_QUEUE[ptr];
      const y = this.ADD_QUEUE[ptr + 1];
      const z = this.ADD_QUEUE[ptr + 2];

      const index = sx * (x - startX) + sy * (y - startY) + sz * (z - startZ);

      const l = wlpDec(lightLevel[index]);
      if (!l) {
        continue;
      }

      if (x > startX) {
        const idx = index - sx;
        if (this._isTransparent(data[idx])) {
          const bl = lightLevel[idx];
          const nl = this._minLight(wlpMax(bl, l));
          if (nl !== bl) {
            lightLevel[idx] = nl;
            this.pushAdd(x - 1, y, z);
          }
        }
      }

      if (x < endX - 1) {
        const idx = index + sx;
        if (this._isTransparent(data[idx])) {
          const bl = lightLevel[idx];
          const nl = this._minLight(wlpMax(bl, l));
          if (nl !== bl) {
            lightLevel[idx] = nl;
            this.pushAdd(x + 1, y, z);
          }
        }
      }

      if (y > startY) {
        const idx = index - sy;
        if (this._isTransparent(data[idx])) {
          const bl = lightLevel[idx];
          const nl = this._minLight(wlpMax(bl, l));
          if (nl !== bl) {
            lightLevel[idx] = nl;
            this.pushAdd(x, y - 1, z);
          }
        }
      }

      if (y < endY - 1) {
        const idx = index + sy;
        if (this._isTransparent(data[idx])) {
          const bl = lightLevel[idx];
          const nl = this._minLight(wlpMax(bl, l));
          if (nl !== bl) {
            lightLevel[idx] = nl;
            this.pushAdd(x, y + 1, z);
          }
        }
      }

      if (z > startZ) {
        const idx = index - sz;
        if (this._isTransparent(data[idx])) {
          const bl = lightLevel[idx];
          const nl = this._minLight(wlpMax(bl, l));
          if (nl !== bl) {
            lightLevel[idx] = nl;
            this.pushAdd(x, y, z - 1);
          }
        }
      }

      if (z < endZ - 1) {
        const idx = index + sz;
        if (this._isTransparent(data[idx])) {
          const bl = lightLevel[idx];
          const nl = this._minLight(wlpMax(bl, l));
          if (nl !== bl) {
            lightLevel[idx] = nl;
            this.pushAdd(x, y, z + 1);
          }
        }
      }
    }
  }

  private _removeLights() {
    const { sx, sy, sz, startX, startY, startZ, endX, endY, endZ, lightLevel } =
      this;

    for (let ptr = 0; ptr < this.REMOVE_PTR; ptr += 4) {
      const x = this.REMOVE_QUEUE[ptr];
      const y = this.REMOVE_QUEUE[ptr + 1];
      const z = this.REMOVE_QUEUE[ptr + 2];
      const l = this.REMOVE_QUEUE[ptr + 3];

      if (!l) {
        continue;
      }

      if (x > startX) {
        this._removeLightValue(x - 1, y, z, l);
      }
      if (x < endX - 1) {
        this._removeLightValue(x + 1, y, z, l);
      }
      if (y > startY) {
        this._removeLightValue(x, y - 1, z, l);
      }
      if (y < endY - 1) {
        this._removeLightValue(x, y + 1, z, l);
      }
      if (z > startZ) {
        this._removeLightValue(x, y, z - 1, l);
      }
      if (z < endZ - 1) {
        this._removeLightValue(x, y, z + 1, l);
      }
    }

    // hack: add boundary lights to add queue to ensure light map updates correctly
    for (let i = 0; i < this.REMOVE_PTR; i += 4) {
      const x = this.REMOVE_QUEUE[i];
      const y = this.REMOVE_QUEUE[i + 1];
      const z = this.REMOVE_QUEUE[i + 2];
      const idx = sx * (x - startX) + sy * (y - startY) + sz * (z - startZ);

      if (x > startX && lightLevel[idx - sx]) {
        this.pushAdd(x - 1, y, z);
      }
      if (x < endX - 1 && lightLevel[idx + sx]) {
        this.pushAdd(x + 1, y, z);
      }
      if (y > startY && lightLevel[idx - sy]) {
        this.pushAdd(x, y - 1, z);
      }
      if (y < endY - 1 && lightLevel[idx + sy]) {
        this.pushAdd(x, y + 1, z);
      }
      if (z > startZ && lightLevel[idx - sz]) {
        this.pushAdd(x, y, z - 1);
      }
      if (z < endZ - 1 && lightLevel[idx + sz]) {
        this.pushAdd(x, y, z + 1);
      }
    }
  }

  private _removeLightValue(x: number, y: number, z: number, l: number) {
    const { lightLevel, sx, sy, sz, startX, startY, startZ, endX, endY, endZ } =
      this;
    const idx = sx * (x - startX) + sy * (y - startY) + sz * (z - startZ);
    const r = lightLevel[idx];

    const e = wlpEquals(r, wlpDec(l)) & ~wlpEquals(r, 0);

    if (!e) {
      return;
    }

    let n = 0;
    if (x > startX) {
      n = lightLevel[idx - sx];
    }
    if (x < endX - 1) {
      n = wlpMax(n, lightLevel[idx + sx]);
    }
    if (y > startY) {
      n = wlpMax(n, lightLevel[idx - sy]);
    }
    if (y < endY - 1) {
      n = wlpMax(n, lightLevel[idx + sy]);
    }
    if (z > startZ) {
      n = wlpMax(n, lightLevel[idx - sz]);
    }
    if (z < endZ - 1) {
      n = wlpMax(n, lightLevel[idx + sz]);
    }

    const mask = e & wlpLT(n, l);

    if (!mask) {
      return;
    }

    lightLevel[idx] = r & ~mask;
    this.pushRemove(x, y, z, mask & r);
  }

  private _updateHeight(x: number, y: number, z: number) {
    const {
      nx,
      sx,
      sy,
      sz,
      startX,
      startY,
      startZ,
      yRays,
      voxels,
      lightLevel,
    } = this;
    const yptr = x + z * nx;
    const y0 = yRays[yptr];

    let t = 0;
    if (y > y0) {
      t = t || voxels.getVoxel(x, y, z) & 1;
      if (t) {
        for (let i = y0 + 1; i <= y; ++i) {
          const idx = sx * (x - startX) + sy * (i - startY) + sz * (z - startZ);
          const l = lightLevel[idx];
          lightLevel[idx] &= ~A_MASK;
          this.pushRemove(x, i, z, l & A_MASK);
        }
        yRays[yptr] = y;
      }
    } else if (y === y0) {
      let blockPtr = sx * (x - startX) + sy * (y - startY) + sz * (z - startZ);
      const { data } = voxels;
      let h = y;
      while (h >= 0 && !(data[blockPtr] & 1)) {
        lightLevel[blockPtr] |= A_MASK;
        this.pushAdd(x, h--, z);
        blockPtr -= sy;
      }
      yRays[yptr] = h;
    }
  }

  public updateLight(x: number, y: number, z: number) {
    const {
      lightLevel,
      voxels,
      sx,
      sy,
      sz,
      startX,
      startY,
      startZ,
      endX,
      endY,
      endZ,
    } = this;

    if (
      !voxels.contains(x, y, z, [startX, startY, startZ], [endX, endY, endZ])
    ) {
      return;
    }

    // clear pointers
    this.ADD_PTR = 0;
    this.REMOVE_PTR = 0;
    this.ADD_XLO = 0;
    this.ADD_YLO = 0;
    this.ADD_ZLO = 0;
    this.ADD_XHI = this.endX - 1;
    this.ADD_YHI = this.endY - 1;
    this.ADD_ZHI = this.endZ - 1;

    // clear old light mask
    const index = sx * (x - startX) + sy * (y - startY) + sz * (z - startZ);
    const b = voxels.data[index];
    this._updateHeight(x, y, z);
    const l = lightLevel[index];
    this.pushRemove(x, y, z, b & 1 ? l : l & 0xfff);
    lightLevel[index] = b & 1 ? 0 : l & 0xf000;
    this._removeLights();

    // update light level
    lightLevel[index] |= this.blockIndex.emissive[voxels.data[index] & 0x0fff];
    this.pushAdd(x, y, z);

    // FIXME: deduplicate elements in add queue
    this._addLights();
  }

  private _sampleLightInt(
    out: { r: number; g: number; b: number; a: number },
    w: number,
    ix: number,
    iy: number,
    iz: number,
  ) {
    const {
      nx,
      ny,
      nz,
      startX,
      startY,
      startZ,
      endX,
      endY,
      endZ,
      sx,
      sy,
      sz,
      lightLevel,
      voxels,
    } = this;
    const x0 = Math.min(Math.max(ix, 0), nx - 2);
    const y0 = Math.min(Math.max(iy, 0), ny - 2);
    const z0 = Math.min(Math.max(iz, 0), nz - 2);
    if (
      !voxels.contains(x0, y0, z0, [startX, startY, startZ], [endX, endY, endZ])
    ) {
      return 0;
    }
    const index = sx * (x0 - startX) + sy * (y0 - startY) + sz * (z0 - startZ);
    if (voxels.data[index] & 1) {
      return 0;
    }

    const code = lightLevel[index];
    out.r += w * ((code & 0xf) / 0xf);
    out.g += w * ((code & 0xf0) / 0xf0);
    out.b += w * ((code & 0xf00) / 0xf00);
    out.a += w * ((code & 0xf000) / 0xf000);
    return w;
  }

  public sampleLight(
    out: { r: number; g: number; b: number; a: number },
    x: number,
    y: number,
    z: number,
  ) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const z0 = Math.floor(z);

    const xt = x - x0;
    const yt = y - y0;
    const zt = z - z0;

    const xti = 1 - xt;
    const yti = 1 - yt;
    const zti = 1 - zt;

    out.r = out.g = out.b = out.a = 0;

    let w = 0;

    w += this._sampleLightInt(out, xti * yti * zti, x0, y0, z0);
    w += this._sampleLightInt(out, xti * yti * zt, x0, y0, z0 + 1);
    w += this._sampleLightInt(out, xti * yt * zti, x0, y0 + 1, z0);
    w += this._sampleLightInt(out, xti * yt * zt, x0, y0 + 1, z0 + 1);
    w += this._sampleLightInt(out, xt * yti * zti, x0 + 1, y0, z0);
    w += this._sampleLightInt(out, xt * yti * zt, x0 + 1, y0, z0 + 1);
    w += this._sampleLightInt(out, xt * yt * zti, x0 + 1, y0 + 1, z0);
    w += this._sampleLightInt(out, xt * yt * zt, x0 + 1, y0 + 1, z0 + 1);

    if (w) {
      // scale intensity by inverse square law
      const invW = 1 / w;
      out.r *= invW;
      out.r = Math.min(1, out.r / (16 - 15 * out.r));
      out.g *= invW;
      out.g = Math.min(1, out.g / (16 - 15 * out.g));
      out.b *= invW;
      out.b = Math.min(1, out.b / (16 - 15 * out.b));
      out.a *= invW;
      out.a = Math.min(1, out.a / (16 - 15 * out.a));
    }
  }
}
