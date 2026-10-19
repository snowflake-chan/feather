import {
  CHUNK_MASK,
  CHUNK_SIZE,
} from '@box/schema/voxel/voxel-collision-schema';
import { MuWriteStream } from '@box/mudb/stream';
import { VoxelView } from '@box/utils/voxel';
import {
  VoxelCollisionBox,
  VoxelCollisionBoxSchema,
  VoxelCollisionBoxList,
  VoxelCollisionBoxListSchema,
} from '@box/schema/utils/rbush-schema';

function signEncode(x: number) {
  const y = x & CHUNK_MASK;
  if (y > 16) {
    return ((CHUNK_MASK - y) << 1) + 1;
  }
  return y << 1;
}

//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
export function interleave3(x_: number, y_: number, z_: number) {
  let x = x_;
  x = (x | (x << 16)) & 4278190335;
  x = (x | (x << 8)) & 251719695;
  x = (x | (x << 4)) & 3272356035;
  x = (x | (x << 2)) & 1227133513;

  let y = y_;
  y = (y | (y << 16)) & 4278190335;
  y = (y | (y << 8)) & 251719695;
  y = (y | (y << 4)) & 3272356035;
  y = (y | (y << 2)) & 1227133513;
  x |= y << 1;

  let z = z_;
  z = (z | (z << 16)) & 4278190335;
  z = (z | (z << 8)) & 251719695;
  z = (z | (z << 4)) & 3272356035;
  z = (z | (z << 2)) & 1227133513;

  return x | (z << 2);
}

function toInt(x: string) {
  return +x;
}
export function boxCompress(boxes: VoxelCollisionBox[], out: MuWriteStream) {
  // first compute table of all voxel types
  const voxelIdTable: { [id: number]: number } = {};
  for (let i = 0; i < boxes.length; ++i) {
    const { block } = boxes[i];
    if (voxelIdTable[block]) {
      voxelIdTable[block] += 1;
    } else {
      voxelIdTable[block] = 1;
    }
  }

  // compact id list and update index
  const ids = Object.keys(voxelIdTable)
    .map(toInt)
    .sort((a, b) => {
      return voxelIdTable[a] - voxelIdTable[b];
    });
  for (let i = 0; i < ids.length; ++i) {
    voxelIdTable[ids[i]] = i;
  }

  // reserve space
  out.grow(10 + ids.length * 5 + boxes.length * 15);

  // write header
  out.writeVarint(ids.length);
  out.writeVarint(boxes.length);

  // write id table
  for (let i = 0; i < ids.length; ++i) {
    out.writeVarint(ids[i]);
  }

  // write blocks
  let pX = 0;
  let pY = 0;
  let pZ = 0;
  for (let i = 0; i < boxes.length; ++i) {
    const { minX, minY, minZ, maxX, maxY, maxZ, block } = boxes[i];
    const minCode = interleave3(
      signEncode(minX - pX),
      signEncode(minY - pY),
      signEncode(minZ - pZ),
    );
    const maxCode = interleave3(maxX - minX, maxY - minY, maxZ - minZ);
    const blockCode = voxelIdTable[block];
    out.writeVarint(minCode);
    out.writeVarint(maxCode);
    out.writeVarint(blockCode);
    pX = minX;
    pY = minY;
    pZ = minZ;
  }
}

const VISITED = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);

export function meshChunkToBoxes(chunk: VoxelView): VoxelCollisionBoxList {
  const result = VoxelCollisionBoxListSchema.clone(
    VoxelCollisionBoxListSchema.identity,
  );
  const { data, offset, stride } = chunk;
  const stride0 = stride[0] | 0;
  const shape0 = CHUNK_SIZE;
  const astep0 = stride0 | 0;
  const vstep0 = 1;
  let i0 = 0;
  let j0 = 0;
  let k0 = 0;
  const stride1 = stride[1] | 0;
  const shape1 = CHUNK_SIZE;
  const astep1 = (stride1 - stride0 * shape0) | 0;
  const vstep1 = (vstep0 * shape0) | 0;
  let i1 = 0;
  let j1 = 0;
  let k1 = 0;
  let ustep1 = vstep1 | 0;
  let bstep1 = astep1 | 0;
  const stride2 = stride[2] | 0;
  const shape2 = CHUNK_SIZE;
  const astep2 = (stride2 - stride1 * shape1) | 0;
  const vstep2 = (vstep1 * shape1) | 0;
  let i2 = 0;
  let j2 = 0;
  let k2 = 0;
  let ustep2 = vstep2 | 0;
  let bstep2 = astep2 | 0;
  let a_ptr = offset >>> 0;
  let b_ptr = 0;
  let u_ptr = 0;
  let v_ptr = 0;
  let i = 0;
  let d = 0;
  let val = 0;
  let oval = 0;
  const count = shape0 * shape1 * shape2;
  for (; i < count; ++i) {
    VISITED[i] = 0;
  }
  for (i2 = 0; i2 < shape2; ++i2) {
    for (i1 = 0; i1 < shape1; ++i1) {
      for (i0 = 0; i0 < shape0; ++i0) {
        if (!VISITED[v_ptr]) {
          val = data[a_ptr];
          if (val !== 0) {
            oval = val;
            u_ptr = v_ptr + vstep0;
            b_ptr = a_ptr + stride0;
            j0_loop: for (j0 = 1 + i0; j0 < shape0; ++j0) {
              if (VISITED[u_ptr]) {
                break j0_loop;
              }
              val = data[b_ptr];
              if (val !== oval) {
                break j0_loop;
              }
              ++u_ptr;
              b_ptr += stride0;
            }
            d = j0 - i0;
            ustep1 = (vstep1 - vstep0 * d) | 0;
            bstep1 = (stride1 - stride0 * d) | 0;
            u_ptr = v_ptr + vstep1;
            b_ptr = a_ptr + stride1;
            j1_loop: for (j1 = 1 + i1; j1 < shape1; ++j1) {
              for (k0 = i0; k0 < j0; ++k0) {
                if (VISITED[u_ptr]) {
                  break j1_loop;
                }
                val = data[b_ptr];
                if (val !== oval) {
                  break j1_loop;
                }
                ++u_ptr;
                b_ptr += stride0;
              }
              u_ptr += ustep1;
              b_ptr += bstep1;
            }
            d = j1 - i1;
            ustep2 = (vstep2 - vstep1 * d) | 0;
            bstep2 = (stride2 - stride1 * d) | 0;
            u_ptr = v_ptr + vstep2;
            b_ptr = a_ptr + stride2;
            j2_loop: for (j2 = 1 + i2; j2 < shape2; ++j2) {
              for (k1 = i1; k1 < j1; ++k1) {
                for (k0 = i0; k0 < j0; ++k0) {
                  if (VISITED[u_ptr]) {
                    break j2_loop;
                  }
                  val = data[b_ptr];
                  if (val !== oval) {
                    break j2_loop;
                  }
                  ++u_ptr;
                  b_ptr += stride0;
                }
                u_ptr += ustep1;
                b_ptr += bstep1;
              }
              u_ptr += ustep2;
              b_ptr += bstep2;
            }
            u_ptr = v_ptr;
            for (k2 = i2; k2 < j2; ++k2) {
              for (k1 = i1; k1 < j1; ++k1) {
                for (k0 = i0; k0 < j0; ++k0) {
                  VISITED[u_ptr++] = 1;
                }
                u_ptr += ustep1;
              }
              u_ptr += ustep2;
            }
            const box = VoxelCollisionBoxSchema.alloc();
            box.minX = i0;
            box.minY = i1;
            box.minZ = i2;
            box.maxX = j0;
            box.maxY = j1;
            box.maxZ = j2;
            box.block = oval;
            box.faces = 0;
            result.push(box);
          }
        }
        ++v_ptr;
        a_ptr += astep0;
      }
      a_ptr += astep1;
    }
    a_ptr += astep2;
  }
  return result;
}
