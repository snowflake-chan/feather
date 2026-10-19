import { MuReadStream } from '@box/mudb/stream';
import { CHUNK_MASK } from './voxel-collision-schema';
import { VoxelView } from '@box/utils/voxel';
import {
  VoxelCollisionBox,
  VoxelCollisionBoxSchema,
  VoxelCollisionBoxListSchema,
} from '../utils/rbush-schema';

function signDecode(x: number) {
  if (x & 1) {
    return -(x >> 1) - 1;
  }
  return x >> 1;
}

export function deinterleave3(v_: number) {
  let v = v_ & 1227133513;
  v = (v | (v >>> 2)) & 3272356035;
  v = (v | (v >>> 4)) & 251719695;
  v = (v | (v >>> 8)) & 4278190335;
  v = (v | (v >>> 16)) & 0x3ff;
  return (v << 22) >>> 22;
}

// read input from stream
export function boxDecompress(inp: MuReadStream): VoxelCollisionBox[] {
  const numIds = inp.readVarint();
  const numBoxes = inp.readVarint();

  const idTable: number[] = new Array(numIds);
  for (let i = 0; i < numIds; ++i) {
    idTable[i] = inp.readVarint();
  }

  const boxList = VoxelCollisionBoxListSchema.clone(
    VoxelCollisionBoxListSchema.identity,
  );
  boxList.length = numBoxes;

  let pX = 0;
  let pY = 0;
  let pZ = 0;
  for (let i = 0; i < numBoxes; ++i) {
    const b = (boxList[i] = VoxelCollisionBoxSchema.alloc());

    const minCode = inp.readVarint();
    const maxCode = inp.readVarint();
    const idCode = inp.readVarint();

    const x0 = deinterleave3(minCode);
    const y0 = deinterleave3(minCode >>> 1);
    const z0 = deinterleave3(minCode >>> 2);
    b.minX = (signDecode(x0) + pX) & CHUNK_MASK;
    b.minY = (signDecode(y0) + pY) & CHUNK_MASK;
    b.minZ = (signDecode(z0) + pZ) & CHUNK_MASK;

    const x1 = deinterleave3(maxCode);
    const y1 = deinterleave3(maxCode >>> 1);
    const z1 = deinterleave3(maxCode >>> 2);
    b.maxX = x1 + b.minX;
    b.maxY = y1 + b.minY;
    b.maxZ = z1 + b.minZ;

    b.block = idTable[idCode];
    b.faces = 0;

    pX = b.minX;
    pY = b.minY;
    pZ = b.minZ;
  }

  return boxList;
}

// more-or-less inverse of mesh3d
export function blitBoxesToChunk<
  T extends {
    setVoxelByPtr: (ptr: number, b: number) => void;
    stride: [number, number, number];
    offset: number;
  },
>(chunk: T, boxes: VoxelCollisionBox[]) {
  const {
    setVoxelByPtr,
    stride: [sx, sy, sz],
    offset,
  } = chunk;

  for (let boxId = 0; boxId < boxes.length; ++boxId) {
    const { minX, minY, minZ, maxX, maxY, maxZ, block } = boxes[boxId];

    const nx = maxX - minX;
    const ny = maxY - minY;
    const nz = maxZ - minZ;

    let tptr = offset + sx * minX + sy * minY + sz * minZ;
    const dtdi = sx;
    const dtdj = sy - nx * sx;
    const dtdk = sz - ny * sy;
    for (let k = 0; k < nz; ++k) {
      for (let j = 0; j < ny; ++j) {
        for (let i = 0; i < nx; ++i) {
          setVoxelByPtr(tptr, block);
          tptr += dtdi;
        }
        tptr += dtdj;
      }
      tptr += dtdk;
    }
  }
}
