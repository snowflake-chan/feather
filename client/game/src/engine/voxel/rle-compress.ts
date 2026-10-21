import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
import { VoxelView } from '@box/utils/voxel';
import { vec3 } from 'gl-matrix';

export type Vector3 = vec3 | number[];

function writeRun(out: MuWriteStream, runLength: number, block: number) {
  if (runLength) {
    out.grow(10);
    out.writeVarint(runLength - 1);
    out.writeVarint(block);
  }
}

/**
 * Run length encodes the contents of a VoxelView
 * @param voxels A voxel view
 */
export function compress(voxels: VoxelView, out: MuWriteStream): boolean {
  const {
    data,
    shape: [nx, ny, nz],
    stride: [sx, sy, sz],
    offset,
  } = voxels;

  let prevBlock = -1;
  let runLength = 0;

  let ptr = offset;
  const stepi = sx;
  const stepj = sy - sx * nx;
  const stepk = sz - sy * ny;
  for (let k = 0; k < nz; ++k) {
    for (let j = 0; j < ny; ++j) {
      for (let i = 0; i < nx; ++i) {
        const b = data[ptr];
        if (b !== prevBlock) {
          writeRun(out, runLength, prevBlock);
          runLength = 0;
          prevBlock = b;
        }
        runLength += 1;
        ptr += stepi;
      }
      ptr += stepj;
    }
    ptr += stepk;
  }

  writeRun(out, runLength, prevBlock);

  return true;
}

function fastDecompress(inp: MuReadStream, data: Uint16Array, count: number) {
  for (let ptr = 0; ptr < count; ) {
    const length = inp.readVarint() + 1;
    const block = inp.readVarint();
    for (let i = 0; i < length; ++i) {
      data[ptr++] = block;
    }
  }
  return true;
}

/**
 * Decodes a run-length-encoded chunk of voxel data into a voxel view
 * @param rle The compressed run-length encoded data
 * @param voxels A VoxelView into which the run length encoded data is unpacked
 */
export function decompress(inp: MuReadStream, voxels: VoxelView): boolean {
  const {
    data,
    shape: [nx, ny, nz],
    stride: [sx, sy, sz],
    offset,
  } = voxels;

  let curBlock = -1;
  let curLength = 0;

  if (sx === 1 && sy === nx && sz === nx * ny && offset === 0) {
    return fastDecompress(inp, data, nx * ny * nz);
  }

  let ptr = offset;
  const stepi = sx;
  const stepj = sy - sx * nx;
  const stepk = sz - sy * ny;
  for (let k = 0; k < nz; ++k) {
    for (let j = 0; j < ny; ++j) {
      for (let i = 0; i < nx; ++i) {
        if (curLength <= 0) {
          curLength = inp.readVarint() + 1;
          curBlock = inp.readVarint();
        }
        data[ptr] = curBlock;
        curLength -= 1;
        ptr += stepi;
      }
      ptr += stepj;
    }
    ptr += stepk;
  }

  return curLength === 0;
}

/**
 * Encode a delta compressed set of voxels
 * @param base A voxel view
 * @param target Target to encode to
 */
export function xorCompress(
  base: VoxelView,
  target: VoxelView,
  out: MuWriteStream,
): boolean {
  const {
    data: bdata,
    shape: [nx, ny, nz],
    stride: [bsx, bsy, bsz],
    offset: boffset,
  } = base;
  const {
    data: tdata,
    stride: [tsx, tsy, tsz],
    offset: toffset,
  } = target;

  let prevBlock = -1;
  let runLength = 0;

  let bptr = boffset;
  const bstepi = bsx;
  const bstepj = bsy - bsx * nx;
  const bstepk = bsz - bsy * ny;

  let tptr = toffset;
  const tstepi = tsx;
  const tstepj = tsy - tsx * nx;
  const tstepk = tsz - tsy * ny;

  for (let k = 0; k < nz; ++k) {
    for (let j = 0; j < ny; ++j) {
      for (let i = 0; i < nx; ++i) {
        const b = bdata[bptr] ^ tdata[tptr];
        if (b !== prevBlock) {
          writeRun(out, runLength, prevBlock);
          runLength = 0;
          prevBlock = b;
        }
        runLength += 1;
        bptr += bstepi;
        tptr += tstepi;
      }
      bptr += bstepj;
      tptr += tstepj;
    }
    bptr += bstepk;
    tptr += tstepk;
  }

  if (runLength === nx * ny * nz && prevBlock === 0) {
    return false;
  }

  writeRun(out, runLength, prevBlock);
  return true;
}

/**
 * Decodes a run-length-encoded chunk of voxel data into a voxel view
 * @param rle The compressed run-length encoded data
 * @param voxels A VoxelView into which the run length encoded data is unpacked
 */
export function xorDecompress(inp: MuReadStream, voxels: VoxelView): boolean {
  const {
    data,
    shape: [nx, ny, nz],
    stride: [sx, sy, sz],
    offset,
  } = voxels;

  let curBlock = -1;
  let curLength = 0;

  let ptr = offset;
  const stepi = sx;
  const stepj = sy - sx * nx;
  const stepk = sz - sy * ny;
  for (let k = 0; k < nz; ++k) {
    for (let j = 0; j < ny; ++j) {
      for (let i = 0; i < nx; ++i) {
        if (curLength <= 0) {
          curLength = inp.readVarint() + 1;
          curBlock = inp.readVarint();
        }
        data[ptr] ^= curBlock;
        curLength -= 1;
        ptr += stepi;
      }
      ptr += stepj;
    }
    ptr += stepk;
  }

  return curLength === 0;
}

export function sectionDecompress(
  rle: Uint8Array | number[],
  voxels: VoxelView,
  start: Vector3,
  end: Vector3,
): boolean {
  const {
    data,
    shape: [nx, ny, nz],
    stride: [sx, sy, sz],
    offset,
  } = voxels;

  const rleLength = rle.length;
  let curBlock = -1;
  let curLength = 0;
  let rlePtr = 0;

  const l = end[0] - start[0] + 1;
  const h = end[1] - start[1] + 1;
  const w = end[2] - start[2] + 1;

  const stepi = sx;
  const stepj = sy - sx * l;
  const stepk = sz - sy * h;
  let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;

  for (let k = start[2]; k <= end[2]; k++) {
    for (let j = start[1]; j <= end[1]; j++) {
      for (let i = start[0]; i <= end[0]; i++) {
        if (curLength <= 0) {
          if (rlePtr >= rleLength) {
            return false;
          }
          const runPrefix = rle[rlePtr++];
          if (runPrefix < 255) {
            curLength = runPrefix;
          } else {
            if (rlePtr + 1 >= rleLength) {
              return false;
            }
            curLength = (rle[rlePtr] << 8) + rle[rlePtr + 1];
            rlePtr += 2;
          }
          if (rlePtr >= rleLength) {
            return false;
          }
          const blockPrefix = rle[rlePtr++];
          if (blockPrefix < 255) {
            curBlock = blockPrefix;
          } else {
            if (rlePtr + 1 >= rleLength) {
              return false;
            }
            curBlock = (rle[rlePtr] << 8) + rle[rlePtr + 1];
            rlePtr += 2;
          }
        }
        data[ptr] = curBlock;
        curLength -= 1;
        ptr += stepi;
      }
      ptr += stepj;
    }
    ptr += stepk;
  }

  return rlePtr === rle.length && curLength === 0;
}

export function old_decompress(
  rle: Uint8Array | number[],
  voxels: VoxelView,
): boolean {
  return sectionDecompress(
    rle,
    voxels,
    [0, 0, 0],
    <Vector3>voxels.shape.map((v) => v - 1),
  );
}
