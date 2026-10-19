import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { vec3 } from 'gl-matrix';
import { allocEmptyVoxels, traverseVoxels } from './helper';
import { alloc, free } from './pool';
import { compress, decompress } from './rle-compress';

export type BoxBoundary = {
  start: vec3;
  end: vec3;
};

const TEMP_UINT16ARRAY = new Uint16Array();

export class VoxelView {
  public data: Uint16Array;
  public shape: [number, number, number];
  public stride: [number, number, number];
  public offset: number;
  public dataStart?: [number, number, number];
  public dataEnd?: [number, number, number];
  public dataStride?: [number, number, number];

  constructor(
    data: Uint16Array,
    shape: [number, number, number],
    stride: [number, number, number],
    offset: number,
    dataStart?: [number, number, number],
    dataEnd?: [number, number, number],
    dataStride?: [number, number, number],
  ) {
    this.data = data;
    this.shape = shape;
    this.stride = stride;
    this.offset = offset | 0;
    this.dataStart = dataStart;
    this.dataEnd = dataEnd;
    this.dataStride = dataStride;
  }

  public getVoxelByPtr = (ptr: number) => {
    if (!this.dataStart || !this.dataEnd || !this.dataStride) {
      return this.data[ptr];
    }

    const z = Math.floor(ptr / this.stride[2]);
    const y = Math.floor((ptr % this.stride[2]) / this.stride[1]);
    const x = ptr % this.stride[1];

    if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
      return 0;
    }

    return this.data[
      this.dataStride[0] * (x - this.dataStart[0]) +
        this.dataStride[1] * (y - this.dataStart[1]) +
        this.dataStride[2] * (z - this.dataStart[2])
    ];
  };

  /**
   * Retrieves the block at the given offset
   * @param x the x-index of the block
   * @param y the y-index of the block
   * @param z the z-index of the block
   */
  public getVoxel(x: number, y: number, z: number): number {
    return this.getVoxelByPtr(this.index(x, y, z));
  }

  public getVoxels() {
    const voxels: vec3[] = [];
    traverseVoxels(
      this,
      [0, 0, 0],
      this.shape.map((v) => v - 1) as [number, number, number],
      (i, j, k, d) => {
        if (d != 0) {
          voxels.push([i, j, k]);
        }
      },
    );
    return voxels;
  }

  public getDimension() {
    return vec3.add(vec3.clone(this.shape), this.shape, [-1, -1, -1]);
  }

  public index(x: number, y: number, z: number): number {
    return (
      this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset
    );
  }

  public contains(
    x: number,
    y: number,
    z: number,
    start: [number, number, number],
    end: [number, number, number],
  ) {
    return (
      x >= start[0] &&
      x < end[0] &&
      y >= start[1] &&
      y < end[1] &&
      z >= start[2] &&
      z < end[2]
    );
  }

  public setVoxelByPtr = (ptr: number, b: number) => {
    if (!this.dataStart || !this.dataEnd || !this.dataStride) {
      return (this.data[ptr] = b);
    }

    const z = Math.floor(ptr / this.stride[2]);
    const y = Math.floor((ptr % this.stride[2]) / this.stride[1]);
    const x = ptr % this.stride[1];
    if (!this.contains(x, y, z, this.dataStart, this.dataEnd)) {
      return 0;
    }

    return (this.data[
      this.dataStride[0] * (x - this.dataStart[0]) +
        this.dataStride[1] * (y - this.dataStart[1]) +
        this.dataStride[2] * (z - this.dataStart[2])
    ] = b);
  };

  /**
   * Sets a voxel in the array to a given value
   * @param x x-index
   * @param y y-index
   * @param z z-index
   * @param b new block value
   */
  public setVoxel(x: number, y: number, z: number, b: number) {
    return this.setVoxelByPtr(this.index(x, y, z), b);
  }

  /**
   * Sets a voxel rotation in the array to a given value
   * @param x x-index
   * @param y y-index
   * @param z z-index
   * @param b new block value
   */
  public setVoxelRotate(
    x: number,
    y: number,
    z: number,
    rotate: number,
  ): number {
    const b = this.getVoxel(x, y, z) | (rotate << 14);
    return (this.data[
      this.stride[0] * x + this.stride[1] * y + this.stride[2] * z + this.offset
    ] = b);
  }

  /**
   * Cuts out a slice from the voxels
   * @param lo The lower bound of the slice
   * @param hi The upper bound of the slice
   */
  public slice(
    lo: [number, number, number],
    hi: [number, number, number],
  ): VoxelView {
    return new VoxelView(
      this.data,
      [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]],
      this.stride,
      this.offset +
        this.stride[0] * lo[0] +
        this.stride[1] * lo[1] +
        this.stride[2] * lo[2],
      this.dataStart,
      this.dataEnd,
      this.dataStride,
    );
  }

  /**
   * Transposes the voxels
   * @param px the new x-coordinate permutation
   * @param py the new y-coordinate permutation
   * @param pz the new z-coordinate permuation
   */
  public transpose(px: number, py: number, pz: number): VoxelView {
    return new VoxelView(
      this.data,
      [this.shape[px], this.shape[py], this.shape[pz]],
      [this.stride[px], this.stride[py], this.stride[pz]],
      this.offset,
    );
  }

  public step(sx: number, sy: number, sz: number): VoxelView {
    return new VoxelView(
      this.data,
      [
        Math.floor(this.shape[0] / sx),
        Math.floor(this.shape[1] / sy),
        Math.floor(this.shape[2] / sz),
      ],
      [this.stride[0] * sx, this.stride[1] * sy, this.stride[2] * sz],
      this.offset,
    );
  }

  /**
   * 复制体素数据
   * @param other 被复制的体素数据
   */
  public copy(other: VoxelView) {
    const [nx_, ny_, nz_] = this.shape;
    const [mx_, my_, mz_] = other.shape;

    const nx = Math.min(nx_, mx_);
    const ny = Math.min(ny_, my_);
    const nz = Math.min(nz_, mz_);

    const tdata = this.data;
    const [tx, ty, tz] = this.stride;
    let tptr = this.offset;
    const dtdi = tx;
    const dtdj = ty - nx * tx;
    const dtdk = tz - ny * ty;

    const sdata = other.data;
    const [sx, sy, sz] = other.stride;
    let sptr = other.offset;
    const dsdi = sx;
    const dsdj = sy - nx * sx;
    const dsdk = sz - ny * sy;

    for (let k = 0; k < nz; ++k) {
      for (let j = 0; j < ny; ++j) {
        for (let i = 0; i < nx; ++i) {
          tdata[tptr] = sdata[sptr];
          tptr += dtdi;
          sptr += dsdi;
        }
        tptr += dtdj;
        sptr += dsdj;
      }
      tptr += dtdk;
      sptr += dsdk;
    }
  }

  public fill(b: number) {
    const [nx, ny, nz] = this.shape;

    const tdata = this.data;
    const [tx, ty, tz] = this.stride;
    let tptr = this.offset;
    const dtdi = tx;
    const dtdj = ty - nx * tx;
    const dtdk = tz - ny * ty;

    for (let k = 0; k < nz; ++k) {
      for (let j = 0; j < ny; ++j) {
        for (let i = 0; i < nx; ++i) {
          tdata[tptr] = b;
          tptr += dtdi;
        }
        tptr += dtdj;
      }
      tptr += dtdk;
    }
  }

  public equals(other: VoxelView) {
    if (
      this.shape[0] !== other.shape[0] ||
      this.shape[1] !== other.shape[1] ||
      this.shape[2] !== other.shape[2]
    ) {
      return false;
    }

    const [nx, ny, nz] = this.shape;

    const tdata = this.data;
    const [tx, ty, tz] = this.stride;
    let tptr = this.offset;
    const dtdi = tx;
    const dtdj = ty - nx * tx;
    const dtdk = tz - ny * ty;

    const sdata = other.data;
    const [sx, sy, sz] = other.stride;
    let sptr = other.offset;
    const dsdi = sx;
    const dsdj = sy - nx * sx;
    const dsdk = sz - ny * sy;

    for (let k = 0; k < nz; ++k) {
      for (let j = 0; j < ny; ++j) {
        for (let i = 0; i < nx; ++i) {
          if (tdata[tptr] !== sdata[sptr]) {
            return false;
          }
          tptr += dtdi;
          sptr += dsdi;
        }
        tptr += dtdj;
        sptr += dsdj;
      }
      tptr += dtdk;
      sptr += dsdk;
    }

    return true;
  }

  public clear() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = 0;
    }
  }

  public destroy() {
    this.data = TEMP_UINT16ARRAY;
  }

  /**
   * 获取体素模型的起点
   * @returns vec3 起点坐标；undefined 当前体素模型为空。
   */
  public getStartPosition(): vec3 | undefined {
    let idx = this.data.findIndex((data) => data !== 0);

    if (idx < 0) {
      return undefined;
    }

    const [strideX, strideY, strideZ] = this.stride;

    let x = 0;
    let y = 0;
    let z = 0;

    z = Math.floor(idx / strideZ);

    idx -= z * strideZ;
    y = Math.floor(idx / strideY);

    idx -= y * strideY;
    x = Math.floor(idx / strideX);

    return [x, y, z];
  }
}

/**
 * 获得实际模型内容的起点和终点
 * @param voxels
 * @returns
 */
export function getBoxBoundary(voxels: VoxelView): BoxBoundary {
  const start: vec3 = [Infinity, Infinity, Infinity];
  const end: vec3 = [-Infinity, -Infinity, -Infinity];

  traverseVoxels(
    voxels,
    [0, 0, 0],
    voxels.getDimension(),
    (i: number, j: number, k: number, d: number) => {
      if (d) {
        vec3.min(start, start, [i, j, k]);
        vec3.max(end, end, [i, j, k]);
      }
    },
  );

  return {
    start,
    end,
  };
}

/**
 * Allocates a new VoxelView using the memory pool
 * @param nx x size
 * @param ny y size
 * @param nz z size
 */
export function allocVoxels(
  nx: number,
  ny: number,
  nz: number,
  dataStart?: [number, number, number],
  dataEnd?: [number, number, number],
) {
  let size = nx * ny * nz;
  let dataStride: [number, number, number] | undefined = undefined;
  if (dataStart && dataEnd) {
    const dnx = dataEnd[0] - dataStart[0];
    const dny = dataEnd[1] - dataStart[1];
    const dnz = dataEnd[2] - dataStart[2];

    size = dnx * dny * dnz;
    dataStride = [1, dnx, dnx * dny];
  }
  return new VoxelView(
    new Uint16Array(alloc(size * 2)),
    [nx, ny, nz],
    [1, nx, nx * ny],
    0,
    dataStart,
    dataEnd,
    dataStride,
  );
}

/**
 * Returns the underlying typed array from a VoxelView to the memory pool
 * @param voxels A VoxelView allocated with allocVoxels
 */
export function freeVoxels(voxels: VoxelView) {
  free(voxels.data.buffer);
}

export function cloneVoxels(voxels: VoxelView): VoxelView {
  const result = allocVoxels(voxels.shape[0], voxels.shape[1], voxels.shape[2]);
  result.copy(voxels);

  return result;
}

export function storeVoxels(
  voxels: VoxelView,
  ws: MuWriteStream,
  isEmpty: boolean,
) {
  const [nx, ny, nz] = voxels.shape;
  ws.writeInt32(nx);
  ws.writeInt32(ny);
  ws.writeInt32(nz);

  if (isEmpty) {
    return;
  }

  compress(voxels, ws);
}

export function restoreVoxels(rs: MuReadStream) {
  const nx = rs.readInt32();
  const ny = rs.readInt32();
  const nz = rs.readInt32();

  const isEmpty = rs.buffer.buffer.byteLength <= rs.offset;

  let voxels: VoxelView;

  if (isEmpty) {
    voxels = allocEmptyVoxels(nx, ny, nz);
  } else {
    voxels = allocVoxels(nx, ny, nz);

    decompress(rs, voxels);
  }

  return {
    voxels,
    isEmpty,
  };
}

/**
 * 对体素进行翻转
 * @param voxels
 * @param axis 轴方向
 * @param boundary 指定翻转范围，默认为剪裁体素后的范围
 */
export function flipVoxels(
  voxels: VoxelView,
  axis: 'X' | 'Y' | 'Z',
  boundary?: BoxBoundary,
) {
  const flipBoundary = boundary || getBoxBoundary(voxels);

  switch (axis) {
    case 'X':
      flipX(voxels, flipBoundary);
      break;
    case 'Y':
      flipY(voxels, flipBoundary);
      break;
    case 'Z':
      flipZ(voxels, flipBoundary);
    default:
      break;
  }
}

function flipX(voxels: VoxelView, boundary: BoxBoundary) {
  const { start, end } = boundary;
  const spanX = start[0] + end[0];

  traverseVoxels(
    voxels,
    start,
    [Math.floor(spanX / 2), end[1], end[2]],
    (i, j, k, d) => {
      const flipped = voxels.getVoxel(spanX - i, j, k);
      voxels.setVoxel(i, j, k, flipped);
      voxels.setVoxel(spanX - i, j, k, d);
    },
  );
}

function flipY(voxels: VoxelView, boundary: BoxBoundary) {
  const { start, end } = boundary;
  const spanY = start[1] + end[1];

  traverseVoxels(
    voxels,
    start,
    [end[0], Math.floor(spanY / 2), end[2]],
    (i, j, k, d) => {
      const flipped = voxels.getVoxel(i, spanY - j, k);
      voxels.setVoxel(i, j, k, flipped);
      voxels.setVoxel(i, spanY - j, k, d);
    },
  );
}

function flipZ(voxels: VoxelView, boundary: BoxBoundary) {
  const { start, end } = boundary;
  const spanZ = start[2] + end[2];

  traverseVoxels(
    voxels,
    start,
    [end[0], end[1], Math.floor(spanZ / 2)],
    (i, j, k, d) => {
      const flipped = voxels.getVoxel(i, j, spanZ - k);
      voxels.setVoxel(i, j, k, flipped);
      voxels.setVoxel(i, j, spanZ - k, d);
    },
  );
}

export function isEmptyVoxels(voxelView: VoxelView) {
  return voxelView.data.some((v) => v !== 0);
}
