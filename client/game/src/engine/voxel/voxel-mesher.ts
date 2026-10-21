import { VoxelView } from '@box/utils/voxel';
import { BlockIndex } from '@box/schema/voxel/block-schema';
import { VOXEL_TYPE_MASK } from '../../defs/script';

enum CubeFace {
  LEFT = 0,
  RIGHT = 1,
  BOTTOM = 2,
  TOP = 3,
  FRONT = 4,
  BACK = 5,
}

export const FLUID_VERTEX_SIZE = 8;
export const VERTEX_SIZE = 16;
const SIDEFACEORDER = [0, 4, 1, 5]; // l, f, r, b
// id经过换算，对应block-spec中的id为325
const INVISIBLE_VOXEL_ID = 650;

function wlpSum(y: number) {
  return (y + (y >>> 8) + (y >>> 16) + (y >>> 24)) & 0xff;
}

function wlpUnpack(x: number) {
  return (x | (x << 12)) & 0xf0f0f0f;
}

function isTransparent(id: number) {
  return (id & 0x0fff & 1) ^ 1;
}

function sumFluidAO(x: number) {
  return (x >> 1) << 27;
}

function flipFace(f: CubeFace) {
  switch (f) {
    case CubeFace.FRONT:
      return CubeFace.BACK;
    case CubeFace.BACK:
      return CubeFace.FRONT;
    case CubeFace.LEFT:
      return CubeFace.RIGHT;
    case CubeFace.RIGHT:
      return CubeFace.LEFT;
    case CubeFace.TOP:
      return CubeFace.BOTTOM;
    default:
      return CubeFace.TOP;
  }
}

// vertex format:
//  x, y, z, f
//  r, x1, g, y0
//  b, z0, x0, z1
//  tr, tc, _, _

export class SimpleMeshBuilder {
  public meshBuffer: Uint8Array;
  public meshBuffer32: Uint32Array;
  public meshPtr: number = 0;

  public alphaBuffer: Uint8Array;
  public alphaBuffer32: Uint32Array;
  public alphaPtr: number = 0;

  public fluidBuffer: Uint8Array;
  public fluidBuffer32: Uint32Array;
  public fluidPtr: number = 0;

  public nx: number;
  public ny: number;
  public nz: number;

  constructor(
    public blockIndex: BlockIndex,
    nx: number,
    ny: number,
    nz: number,
  ) {
    const sz = nx * ny * nz * VERTEX_SIZE * 6;
    this.meshBuffer = new Uint8Array(sz);
    this.meshBuffer32 = new Uint32Array(this.meshBuffer.buffer);
    this.alphaBuffer = new Uint8Array(sz);
    this.alphaBuffer32 = new Uint32Array(this.alphaBuffer.buffer);
    this.fluidBuffer = new Uint8Array(sz);
    this.fluidBuffer32 = new Uint32Array(this.fluidBuffer.buffer);
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
  }

  public mesh(
    voxels: VoxelView,
    light: Uint16Array,
    enableInvisibleVoxel = false,
  ) {
    this.meshPtr = 0;
    this.alphaPtr = 0;
    this.fluidPtr = 0;

    const { nx, ny, nz } = this;

    let [sx, sy, sz] = voxels.stride;
    if (voxels.dataStride) {
      sx = voxels.dataStride[0];
      sy = voxels.dataStride[1];
      sz = voxels.dataStride[2];
    }

    let ptr = 0;

    if (voxels.dataStart && voxels.dataEnd && voxels.dataStride) {
      let oz = Math.floor(voxels.offset / voxels.stride[2]);
      let oy = Math.floor(
        (voxels.offset % voxels.stride[2]) / voxels.stride[1],
      );
      let ox = voxels.offset % voxels.stride[1];

      let ex = Math.min(ox + voxels.shape[0], voxels.dataEnd[0]);
      let ey = Math.min(oy + voxels.shape[1], voxels.dataEnd[1]);
      let ez = Math.min(oz + voxels.shape[2], voxels.dataEnd[2]);

      ox = ox - voxels.dataStart[0];
      oy = oy - voxels.dataStart[1];
      oz = oz - voxels.dataStart[2];

      ex = ex - voxels.dataStart[0];
      ey = ey - voxels.dataStart[1];
      ez = ez - voxels.dataStart[2];

      const startX = Math.max(ox, 0) + 1;
      const startY = Math.max(oy, 0) + 1;
      const startZ = Math.max(oz, 0) + 1;

      const endX = Math.min(startX + this.nx, ex - 1);
      const endY = Math.min(startY + this.ny, ey - 1);
      const endZ = Math.min(startZ + this.nz, ez - 1);

      const currNx = endX - startX;
      const currNy = endY - startY;
      const currNz = endZ - startZ;
      if (currNx !== this.nx || currNy !== this.ny || currNz !== this.nz) {
        return;
      }

      ptr = sx * startX + sy * startY + sz * startZ;
    } else {
      ptr = voxels.offset + sx + sy + sz;
    }

    const getData = (ptr: number) => {
      const v = voxels.data[ptr];
      const realId = v & VOXEL_TYPE_MASK;
      if (enableInvisibleVoxel && realId === INVISIBLE_VOXEL_ID) {
        return 0;
      }
      return v;
    };

    const o000 = -sx - sy - sz;
    const o001 = -sx - sy;
    const o002 = -sx - sy + sz;
    const o010 = -sx - sz;
    const o011 = -sx;
    const o012 = -sx + sz;
    const o020 = -sx + sy - sz;
    const o021 = -sx + sy;
    const o022 = -sx + sy + sz;

    const o100 = -sy - sz;
    const o101 = -sy;
    const o102 = -sy + sz;
    const o110 = -sz;
    const o111 = 0;
    const o112 = +sz;
    const o120 = sy - sz;
    const o121 = sy;
    const o122 = sy + sz;

    const o200 = +sx - sy - sz;
    const o201 = +sx - sy;
    const o202 = +sx - sy + sz;
    const o210 = +sx - sz;
    const o211 = +sx;
    const o212 = +sx + sz;
    const o220 = +sx + sy - sz;
    const o221 = +sx + sy;

    for (let z = 0; z < nz; ++z) {
      for (let y = 0; y < ny; ++y) {
        for (let x = 0; x < nx; ++x) {
          const c0 = getData(ptr);
          const cx = getData(ptr - sx);
          const cy = getData(ptr - sy);
          const cz = getData(ptr - sz);

          const t0 = c0 & 1;
          const tx = cx & 1;
          const ty = cy & 1;
          const tz = cz & 1;

          // x-face
          if ((t0 && !tx) || (!t0 && c0 && !cx)) {
            const l000 = light[ptr + o000];
            const l001 = light[ptr + o001];
            const l002 = light[ptr + o002];
            const l010 = light[ptr + o010];
            const l011 = light[ptr + o011];
            const l012 = light[ptr + o012];
            const l020 = light[ptr + o020];
            const l021 = light[ptr + o021];
            const l022 = light[ptr + o022];

            const t001 = getData(ptr + o001);
            const t010 = getData(ptr + o010);
            const t012 = getData(ptr + o012);
            const t021 = getData(ptr + o021);

            const tU = getData(ptr + o121);
            const tD = getData(ptr + o101);
            const tR = getData(ptr + o112);
            const tL = getData(ptr + o110);
            const tF = getData(ptr + o011);
            const tUF = getData(ptr + o021);
            const tDF = getData(ptr + o001);
            const tRF = getData(ptr + o012);
            const tLF = getData(ptr + o010);

            this._emitFace(
              t0,
              true,
              x,
              y,
              z,
              0x010000,
              0x000100,
              c0,
              cx,
              CubeFace.LEFT,
              l000,
              l001,
              l002,
              l010,
              l011,
              l012,
              l020,
              l021,
              l022,
              t001,
              t010,
              t012,
              t021,
              tU,
              tD,
              tR,
              tL,
              tF,
              tUF,
              tDF,
              tRF,
              tLF,
              getData(ptr),
            );
          } else if ((tx && !t0) || (!tx && cx && !c0)) {
            const l100 = light[ptr + o100];
            const l101 = light[ptr + o101];
            const l102 = light[ptr + o102];
            const l110 = light[ptr + o110];
            const l111 = light[ptr + o111];
            const l112 = light[ptr + o112];
            const l120 = light[ptr + o120];
            const l121 = light[ptr + o121];
            const l122 = light[ptr + o122];

            const t101 = getData(ptr + o101);
            const t110 = getData(ptr + o110);
            const t112 = getData(ptr + o112);
            const t121 = getData(ptr + o121);

            const _ptr = ptr - sx;
            const tU = getData(_ptr + o121);
            const tD = getData(_ptr + o101);
            const tR = getData(_ptr + o110);
            const tL = getData(_ptr + o112);
            const tF = getData(_ptr + o211);
            const tUF = getData(_ptr + o221);
            const tDF = getData(_ptr + o201);
            const tRF = getData(_ptr + o210);
            const tLF = getData(_ptr + o212);

            this._emitFace(
              tx,
              false,
              x,
              y,
              z,
              0x000100,
              0x010000,
              cx,
              c0,
              CubeFace.RIGHT,
              l100,
              l110,
              l120,
              l101,
              l111,
              l121,
              l102,
              l112,
              l122,
              t110,
              t101,
              t121,
              t112,
              tU,
              tD,
              tR,
              tL,
              tF,
              tUF,
              tDF,
              tRF,
              tLF,
              getData(_ptr),
            );
          }

          // y-face
          if ((t0 && !ty) || (!t0 && c0 && !cy)) {
            const l000 = light[ptr + o000];
            const l001 = light[ptr + o001];
            const l002 = light[ptr + o002];
            const l100 = light[ptr + o100];
            const l101 = light[ptr + o101];
            const l102 = light[ptr + o102];
            const l200 = light[ptr + o200];
            const l201 = light[ptr + o201];
            const l202 = light[ptr + o202];

            const t001 = getData(ptr + o001);
            const t100 = getData(ptr + o100);
            const t102 = getData(ptr + o102);
            const t201 = getData(ptr + o201);

            const tU = getData(ptr + o110);
            const tD = getData(ptr + o112);
            const tR = getData(ptr + o011);
            const tL = getData(ptr + o211);
            const tF = getData(ptr + o101);
            const tUF = getData(ptr + o100);
            const tDF = getData(ptr + o102);
            const tRF = getData(ptr + o001);
            const tLF = getData(ptr + o201);

            this._emitFace(
              t0,
              false,
              x,
              y,
              z,
              0x000001,
              0x010000,
              c0,
              cy,
              CubeFace.BOTTOM,
              l000,
              l100,
              l200,
              l001,
              l101,
              l201,
              l002,
              l102,
              l202,
              t100,
              t001,
              t201,
              t102,
              tU,
              tD,
              tR,
              tL,
              tF,
              tUF,
              tDF,
              tRF,
              tLF,
              getData(ptr),
            );
          } else if ((ty && !t0) || (!ty && cy && !c0)) {
            const l010 = light[ptr + o010];
            const l011 = light[ptr + o011];
            const l012 = light[ptr + o012];
            const l110 = light[ptr + o110];
            const l111 = light[ptr + o111];
            const l112 = light[ptr + o112];
            const l210 = light[ptr + o210];
            const l211 = light[ptr + o211];
            const l212 = light[ptr + o212];

            const t011 = getData(ptr + o011);
            const t110 = getData(ptr + o110);
            const t112 = getData(ptr + o112);
            const t211 = getData(ptr + o211);

            const _ptr = ptr - sy;
            const tU = getData(_ptr + o110);
            const tD = getData(_ptr + o112);
            const tR = getData(_ptr + o211);
            const tL = getData(_ptr + o011);
            const tF = getData(_ptr + o121);
            const tUF = getData(_ptr + o120);
            const tDF = getData(_ptr + o122);
            const tRF = getData(_ptr + o221);
            const tLF = getData(_ptr + o021);

            this._emitFace(
              ty,
              false,
              x,
              y,
              z,
              0x010000,
              0x000001,
              cy,
              c0,
              CubeFace.TOP,
              l010,
              l011,
              l012,
              l110,
              l111,
              l112,
              l210,
              l211,
              l212,
              t011,
              t110,
              t112,
              t211,
              tU,
              tD,
              tR,
              tL,
              tF,
              tUF,
              tDF,
              tRF,
              tLF,
              getData(_ptr),
            );
          }

          // z-face
          if ((t0 && !tz) || (!t0 && c0 && !cz)) {
            const l000 = light[ptr + o000];
            const l010 = light[ptr + o010];
            const l020 = light[ptr + o020];
            const l100 = light[ptr + o100];
            const l110 = light[ptr + o110];
            const l120 = light[ptr + o120];
            const l200 = light[ptr + o200];
            const l210 = light[ptr + o210];
            const l220 = light[ptr + o220];

            const t010 = getData(ptr + o010);
            const t100 = getData(ptr + o100);
            const t120 = getData(ptr + o120);
            const t210 = getData(ptr + o210);

            const tU = getData(ptr + o121);
            const tD = getData(ptr + o101);
            const tR = getData(ptr + o011);
            const tL = getData(ptr + o211);
            const tF = getData(ptr + o110);
            const tUF = getData(ptr + o120);
            const tDF = getData(ptr + o100);
            const tRF = getData(ptr + o010);
            const tLF = getData(ptr + o210);

            this._emitFace(
              t0,
              false,
              x,
              y,
              z,
              0x000100,
              0x000001,
              c0,
              cz,
              CubeFace.FRONT,
              l000,
              l010,
              l020,
              l100,
              l110,
              l120,
              l200,
              l210,
              l220,
              t010,
              t100,
              t120,
              t210,
              tU,
              tD,
              tR,
              tL,
              tF,
              tUF,
              tDF,
              tRF,
              tLF,
              getData(ptr),
            );
          } else if ((tz && !t0) || (!tz && cz && !c0)) {
            const l001 = light[ptr + o001];
            const l011 = light[ptr + o011];
            const l021 = light[ptr + o021];
            const l101 = light[ptr + o101];
            const l111 = light[ptr + o111];
            const l121 = light[ptr + o121];
            const l201 = light[ptr + o201];
            const l211 = light[ptr + o211];
            const l221 = light[ptr + o221];

            const t011 = getData(ptr + o011);
            const t101 = getData(ptr + o101);
            const t121 = getData(ptr + o121);
            const t211 = getData(ptr + o211);

            const _ptr = ptr - sz;
            const tU = getData(_ptr + o121);
            const tD = getData(_ptr + o101);
            const tR = getData(_ptr + o211);
            const tL = getData(_ptr + o011);
            const tF = getData(_ptr + o112);
            const tUF = getData(_ptr + o122);
            const tDF = getData(_ptr + o102);
            const tRF = getData(_ptr + o212);
            const tLF = getData(_ptr + o012);

            this._emitFace(
              tz,
              true,
              x,
              y,
              z,
              0x000001,
              0x000100,
              cz,
              c0,
              CubeFace.BACK,
              l001,
              l101,
              l201,
              l011,
              l111,
              l211,
              l021,
              l121,
              l221,
              t101,
              t011,
              t211,
              t121,
              tU,
              tD,
              tR,
              tL,
              tF,
              tUF,
              tDF,
              tRF,
              tLF,
              getData(_ptr),
            );
          }

          ptr += sx;
        }
        ptr += sy - sx * nx;
      }
      ptr += sz - sy * ny;
    }
  }

  private _emitFace(
    transparent: number,
    flip: boolean,
    x: number,
    y: number,
    z: number,
    du: number,
    dv: number,
    b: number,
    a: number,
    f: number,
    l00: number,
    l01: number,
    l02: number,
    l10: number,
    l11: number,
    l12: number,
    l20: number,
    l21: number,
    l22: number,
    t01: number,
    t10: number,
    t12: number,
    t21: number,
    tU: number,
    tD: number,
    tR: number,
    tL: number,
    tF: number,
    tUF: number,
    tDF: number,
    tRF: number,
    tLF: number,
    tC: number,
  ) {
    b = b & 0x0fff;
    a = a & 0x0fff;
    const fluidIndex = this.blockIndex.fluid;
    const fluid = fluidIndex[b];
    const pos = x | (y << 8) | (z << 16) | (f << 24);

    // compute level of detail
    if (fluid) {
      return this._emitFluidFace(
        flip,
        pos,
        du,
        dv,
        fluid,
        fluidIndex[a],
        l00 >>> 12,
        l01 >>> 12,
        l02 >>> 12,
        l10 >>> 12,
        l11 >>> 12,
        l12 >>> 12,
        l20 >>> 12,
        l21 >>> 12,
        l22 >>> 12,
      );
    }

    const u00 = (isTransparent(t01) || isTransparent(t10)) && wlpUnpack(l00);
    const u01 = wlpUnpack(l01);
    const u02 = (isTransparent(t01) || isTransparent(t12)) && wlpUnpack(l02);
    const u10 = wlpUnpack(l10);
    const u11 = wlpUnpack(l11);
    const u12 = wlpUnpack(l12);
    const u20 = (isTransparent(t21) || isTransparent(t10)) && wlpUnpack(l20);
    const u21 = wlpUnpack(l21);
    const u22 = (isTransparent(t21) || isTransparent(t12)) && wlpUnpack(l22);

    let ptr = transparent ? this.meshPtr : this.alphaPtr;
    const mesh = transparent ? this.meshBuffer32 : this.alphaBuffer32;

    // texture info & lod
    const r = tC >>> 14;

    // counterclockwise rotation as r increase
    let texCode = 0;
    if (f === CubeFace.LEFT) {
      f = SIDEFACEORDER[(4 - r) & 0b11];
    } else if (f === CubeFace.FRONT) {
      f = SIDEFACEORDER[(4 - r + 1) & 0b11];
    } else if (f === CubeFace.RIGHT) {
      f = SIDEFACEORDER[(4 - r + 2) & 0b11];
    } else if (f === CubeFace.BACK) {
      f = SIDEFACEORDER[(4 - r + 3) & 0b11];
    } else if (f === CubeFace.TOP) {
      texCode = texCode | (r << 20);
    } else if (f === CubeFace.BOTTOM) {
      texCode = texCode | ((-r & 3) << 20);
    }

    texCode |= this.blockIndex.texture[6 * b + f];

    // TODO: edge of all voxels or same voxels?
    let edge = 0b0000;
    if (!isTransparent(tC)) {
      const UpIsBevel =
        isTransparent(tF) && isTransparent(tU) && isTransparent(tUF);
      const DownIsBevel =
        isTransparent(tF) && isTransparent(tD) && isTransparent(tDF);
      const LeftIsBevel =
        isTransparent(tF) && isTransparent(tL) && isTransparent(tLF);
      const RightIsBevel =
        isTransparent(tF) && isTransparent(tR) && isTransparent(tRF);
      if (
        (f === CubeFace.TOP && r === 1) ||
        (f === CubeFace.BOTTOM && r === 3)
      ) {
        // 90°
        edge =
          (RightIsBevel << 3) |
          (DownIsBevel << 2) |
          (LeftIsBevel << 1) |
          UpIsBevel;
      } else if (
        (f === CubeFace.TOP && r === 3) ||
        (f === CubeFace.BOTTOM && r === 1)
      ) {
        // -90°
        edge =
          (LeftIsBevel << 3) |
          (UpIsBevel << 2) |
          (RightIsBevel << 1) |
          DownIsBevel;
      } else if (
        (f === CubeFace.TOP && r === 2) ||
        (f === CubeFace.BOTTOM && r === 2)
      ) {
        // 180°
        edge =
          (DownIsBevel << 3) |
          (LeftIsBevel << 2) |
          (UpIsBevel << 1) |
          RightIsBevel;
      } else {
        edge =
          (UpIsBevel << 3) |
          (RightIsBevel << 2) |
          (DownIsBevel << 1) |
          LeftIsBevel;
      }
    }

    // compute flags
    const flags = texCode | (edge << 16);
    if (wlpSum(u00) + wlpSum(u22) > wlpSum(u20) + wlpSum(u02)) {
      mesh[ptr++] = pos;
      mesh[ptr++] = u00 + (u01 << 4);
      mesh[ptr++] = u10 + (u11 << 4);
      mesh[ptr++] = flags;

      mesh[ptr++] = pos + du;
      mesh[ptr++] = u01 + (u02 << 4);
      mesh[ptr++] = u11 + (u12 << 4);
      mesh[ptr++] = flags;

      mesh[ptr++] = pos + dv;
      mesh[ptr++] = u10 + (u11 << 4);
      mesh[ptr++] = u20 + (u21 << 4);
      mesh[ptr++] = flags;

      mesh[ptr++] = pos + du + dv;
      mesh[ptr++] = u11 + (u12 << 4);
      mesh[ptr++] = u21 + (u22 << 4);
      mesh[ptr++] = flags;
    } else {
      mesh[ptr++] = pos + du;
      mesh[ptr++] = u01 + (u02 << 4);
      mesh[ptr++] = u11 + (u12 << 4);
      mesh[ptr++] = flags;

      mesh[ptr++] = pos + du + dv;
      mesh[ptr++] = u11 + (u12 << 4);
      mesh[ptr++] = u21 + (u22 << 4);
      mesh[ptr++] = flags;

      mesh[ptr++] = pos;
      mesh[ptr++] = u00 + (u01 << 4);
      mesh[ptr++] = u10 + (u11 << 4);
      mesh[ptr++] = flags;

      mesh[ptr++] = pos + dv;
      mesh[ptr++] = u10 + (u11 << 4);
      mesh[ptr++] = u20 + (u21 << 4);
      mesh[ptr++] = flags;
    }

    if (transparent) {
      this.meshPtr = ptr;
    } else {
      this.alphaPtr = ptr;
    }
  }

  private _emitFluidFace(
    flip: boolean,
    _pos: number,
    du: number,
    dv: number,
    fluid: number,
    ofluid: number,
    u00: number,
    u01: number,
    u02: number,
    u10: number,
    u11: number,
    u12: number,
    u20: number,
    u21: number,
    u22: number,
  ) {
    const fluidInfo = this.blockIndex.fluidInfo;
    const bcode = fluidInfo[fluid];
    const acode = fluidInfo[ofluid];
    if (acode && bcode) {
      return;
    }
    let pos = _pos;
    if (acode) {
      pos = (_pos & ~(1 << 24)) | flipFace(pos >> 24);
    }

    let ptr = this.fluidPtr;
    const mesh = this.fluidBuffer32;
    const code = acode | bcode;

    if (u00 + u22 > u20 + u02) {
      mesh[ptr++] = pos | sumFluidAO(u00 + u01 + u10 + u11);
      mesh[ptr++] = code;

      mesh[ptr++] = (pos + du) | sumFluidAO(u01 + u02 + u11 + u12);
      mesh[ptr++] = code;

      mesh[ptr++] = (pos + dv) | sumFluidAO(u10 + u11 + u20 + u21);
      mesh[ptr++] = code;

      mesh[ptr++] = (pos + du + dv) | sumFluidAO(u11 + u12 + u21 + u22);
      mesh[ptr++] = code;
    } else {
      mesh[ptr++] = (pos + du) | sumFluidAO(u01 + u02 + u11 + u12);
      mesh[ptr++] = code;

      mesh[ptr++] = (pos + du + dv) | sumFluidAO(u11 + u12 + u21 + u22);
      mesh[ptr++] = code;

      mesh[ptr++] = pos | sumFluidAO(u00 + u01 + u10 + u11);
      mesh[ptr++] = code;

      mesh[ptr++] = (pos + dv) | sumFluidAO(u10 + u11 + u20 + u21);
      mesh[ptr++] = code;
    }

    this.fluidPtr = ptr;
  }
}
