import { expect, test } from '@jest/globals';

import { allocVoxels, VoxelView } from '@box/utils/voxel';
import {
  chunkVisibility,
  ChunkVisibilityTable,
} from 'src/engine/voxel/chunk-visibility';
import { ChunkVisibilityFlags } from 'src/engine/voxel/visibility-flags';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';

const RAY_STEPS = 3 * CHUNK_SIZE;

const FACE_DIMS = {
  posX: {
    flag: ChunkVisibilityFlags.POS_X,
    bounds: [
      [16, 0, 0],
      [16, 16, 16],
    ],
  },
  negX: {
    flag: ChunkVisibilityFlags.NEG_X,
    bounds: [
      [0, 0, 0],
      [0, 16, 16],
    ],
  },
  posY: {
    flag: ChunkVisibilityFlags.POS_Y,
    bounds: [
      [0, 16, 0],
      [16, 16, 16],
    ],
  },
  negY: {
    flag: ChunkVisibilityFlags.NEG_Y,
    bounds: [
      [0, 0, 0],
      [16, 0, 16],
    ],
  },
  posZ: {
    flag: ChunkVisibilityFlags.POS_Z,
    bounds: [
      [0, 0, 16],
      [16, 16, 16],
    ],
  },
  negZ: {
    flag: ChunkVisibilityFlags.NEG_Z,
    bounds: [
      [0, 0, 0],
      [16, 16, 0],
    ],
  },
};

function testRaycast(
  chunk: VoxelView,
  startX: number,
  startY: number,
  startZ: number,
  endX: number,
  endY: number,
  endZ: number,
) {
  const nx = chunk.shape[0];
  const ny = chunk.shape[1];
  const nz = chunk.shape[2];
  const dx = endX - startX;
  const dy = endY - startY;
  const dz = endZ - startZ;
  for (let i = 0; i <= RAY_STEPS; ++i) {
    const t = i / RAY_STEPS;
    const x = Math.floor(startX + dx * t);
    const y = Math.floor(startY + dy * t);
    const z = Math.floor(startZ + dz * t);
    if (x < 0 || x >= nx || y < 0 || y >= ny || z < 0 || z >= nz) {
      continue;
    }
    if (chunk.getVoxel(x, y, z) & 1) {
      return false;
    }
  }
  return true;
}

function testFaceVisibility(
  n: number,
  chunk: VoxelView,
  alox: number,
  aloy: number,
  aloz: number,
  ahix: number,
  ahiy: number,
  ahiz: number,
  blox: number,
  bloy: number,
  bloz: number,
  bhix: number,
  bhiy: number,
  bhiz: number,
) {
  const dax = ahix - alox;
  const day = ahiy - aloy;
  const daz = ahiz - aloz;
  const dbx = bhix - blox;
  const dby = bhiy - bloy;
  const dbz = bhiz - bloz;
  for (let i = 0; i < n; ++i) {
    if (
      !testRaycast(
        chunk,
        alox + dax * Math.random(),
        aloy + day * Math.random(),
        aloz + daz * Math.random(),
        blox + dbx * Math.random(),
        bloy + dby * Math.random(),
        bloz + dbz * Math.random(),
      )
    ) {
      return false;
    }
  }
  return true;
}

test('voxel visibility', () => {
  function checkVisibility(chunk: VoxelView) {
    const actualVisibility = new ChunkVisibilityTable();
    chunkVisibility(
      actualVisibility,
      chunk.getVoxelByPtr,
      chunk.offset,
      chunk.stride[0],
      chunk.stride[1],
      chunk.stride[2],
    );
    const faces = Object.keys(FACE_DIMS);
    for (let i = 0; i < faces.length; ++i) {
      const aFace = FACE_DIMS[faces[i]];
      const visFlags = +actualVisibility[faces[i]];
      console.log(faces[i] + ' = ' + visFlags.toString(2));
      for (let j = 0; j < faces.length; ++j) {
        const bFace = FACE_DIMS[faces[j]];
        if (i === j) {
          expect(visFlags & bFace.flag).toBe(0);
        } else {
          const isVisible = testFaceVisibility(
            CHUNK_SIZE * CHUNK_SIZE * 10,
            chunk,
            aFace.bounds[0][0],
            aFace.bounds[0][1],
            aFace.bounds[0][2],
            aFace.bounds[1][0],
            aFace.bounds[1][1],
            aFace.bounds[1][2],
            bFace.bounds[0][0],
            bFace.bounds[0][1],
            bFace.bounds[0][2],
            bFace.bounds[1][0],
            bFace.bounds[1][1],
            bFace.bounds[1][2],
          );
          if (isVisible) {
            expect(visFlags & bFace.flag).toBe(bFace.flag);
          } else {
            if (visFlags & bFace.flag) {
              console.log(
                'WARNING!  Should not be visible ' +
                  faces[i] +
                  ' can see ' +
                  faces[j],
              );
            } else {
              expect(visFlags & bFace.flag).toBe(0);
            }
            expect(!!(visFlags & bFace.flag)).toBe(
              !!(actualVisibility[faces[j]] & aFace.flag),
            );
          }
        }
      }
    }
  }

  {
    const paddedChunk = allocVoxels(
      CHUNK_SIZE + 2,
      CHUNK_SIZE + 2,
      CHUNK_SIZE + 2,
    );
    const chunk = paddedChunk.slice(
      [1, 1, 1],
      [CHUNK_SIZE + 1, CHUNK_SIZE + 1, CHUNK_SIZE + 1],
    );
    paddedChunk.fill(0);

    // test empty chunk visibility
    {
      chunk.fill(0);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(0x3f & ~ChunkVisibilityFlags.POS_X);
      expect(result.posY).toBe(0x3f & ~ChunkVisibilityFlags.POS_Y);
      expect(result.posZ).toBe(0x3f & ~ChunkVisibilityFlags.POS_Z);
      expect(result.negX).toBe(0x3f & ~ChunkVisibilityFlags.NEG_X);
      expect(result.negY).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Y);
      expect(result.negZ).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Z);
    }

    {
      chunk.fill(1);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(0);
      expect(result.posY).toBe(0);
      expect(result.posZ).toBe(0);
      expect(result.negX).toBe(0);
      expect(result.negY).toBe(0);
      expect(result.negZ).toBe(0);
    }

    {
      chunk.fill(2);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(0x3f & ~ChunkVisibilityFlags.POS_X);
      expect(result.posY).toBe(0x3f & ~ChunkVisibilityFlags.POS_Y);
      expect(result.posZ).toBe(0x3f & ~ChunkVisibilityFlags.POS_Z);
      expect(result.negX).toBe(0x3f & ~ChunkVisibilityFlags.NEG_X);
      expect(result.negY).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Y);
      expect(result.negZ).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Z);
    }

    {
      chunk.fill(0);
      chunk.slice([0, 0, 0], [CHUNK_SIZE, 4, CHUNK_SIZE]).fill(1);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(
        0x3f & ~(ChunkVisibilityFlags.POS_X | ChunkVisibilityFlags.NEG_Y),
      );
      expect(result.posY).toBe(
        0x3f & ~(ChunkVisibilityFlags.POS_Y | ChunkVisibilityFlags.NEG_Y),
      );
      expect(result.posZ).toBe(
        0x3f & ~(ChunkVisibilityFlags.POS_Z | ChunkVisibilityFlags.NEG_Y),
      );
      expect(result.negX).toBe(
        0x3f & ~(ChunkVisibilityFlags.NEG_X | ChunkVisibilityFlags.NEG_Y),
      );
      expect(result.negY).toBe(0);
      expect(result.negZ).toBe(
        0x3f & ~(ChunkVisibilityFlags.NEG_Z | ChunkVisibilityFlags.NEG_Y),
      );
    }

    {
      chunk.fill(0);
      chunk.slice([8, 0, 0], [9, CHUNK_SIZE, CHUNK_SIZE]).fill(1);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(
        0x3f & ~(ChunkVisibilityFlags.POS_X | ChunkVisibilityFlags.NEG_X),
      );
      expect(result.posY).toBe(0x3f & ~ChunkVisibilityFlags.POS_Y);
      expect(result.posZ).toBe(0x3f & ~ChunkVisibilityFlags.POS_Z);
      expect(result.negX).toBe(
        0x3f & ~(ChunkVisibilityFlags.NEG_X | ChunkVisibilityFlags.POS_X),
      );
      expect(result.negY).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Y);
      expect(result.negZ).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Z);
    }

    {
      chunk.fill(0);
      chunk.slice([0, 8, 0], [CHUNK_SIZE, 9, CHUNK_SIZE]).fill(1);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(0x3f & ~ChunkVisibilityFlags.POS_X);
      expect(result.posY).toBe(
        0x3f & ~(ChunkVisibilityFlags.POS_Y | ChunkVisibilityFlags.NEG_Y),
      );
      expect(result.posZ).toBe(0x3f & ~ChunkVisibilityFlags.POS_Z);
      expect(result.negX).toBe(0x3f & ~ChunkVisibilityFlags.NEG_X);
      expect(result.negY).toBe(
        0x3f & ~(ChunkVisibilityFlags.NEG_Y | ChunkVisibilityFlags.POS_Y),
      );
      expect(result.negZ).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Z);
    }

    {
      chunk.fill(0);
      chunk.slice([0, 0, 8], [CHUNK_SIZE, CHUNK_SIZE, 9]).fill(1);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(0x3f & ~ChunkVisibilityFlags.POS_X);
      expect(result.posY).toBe(0x3f & ~ChunkVisibilityFlags.POS_Y);
      expect(result.posZ).toBe(
        0x3f & ~(ChunkVisibilityFlags.POS_Z | ChunkVisibilityFlags.NEG_Z),
      );
      expect(result.negX).toBe(0x3f & ~ChunkVisibilityFlags.NEG_X);
      expect(result.negY).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Y);
      expect(result.negZ).toBe(
        0x3f & ~(ChunkVisibilityFlags.NEG_Z | ChunkVisibilityFlags.POS_Z),
      );
    }

    {
      chunk.fill(0);
      chunk.slice([8, 0, 0], [9, CHUNK_SIZE, 12]).fill(1);
      chunk.slice([12, 0, 4], [13, CHUNK_SIZE, CHUNK_SIZE]).fill(1);
      chunk.slice([15, 0, 0], [16, CHUNK_SIZE, 12]).fill(1);
      const result = new ChunkVisibilityTable();
      chunkVisibility(
        result,
        chunk.getVoxelByPtr,
        chunk.offset,
        chunk.stride[0],
        chunk.stride[1],
        chunk.stride[2],
      );
      expect(result.posX).toBe(
        0x3f & ~(ChunkVisibilityFlags.POS_X | ChunkVisibilityFlags.NEG_X),
      );
      expect(result.posY).toBe(0x3f & ~ChunkVisibilityFlags.POS_Y);
      expect(result.posZ).toBe(0x3f & ~ChunkVisibilityFlags.POS_Z);
      expect(result.negX).toBe(
        0x3f & ~(ChunkVisibilityFlags.NEG_X | ChunkVisibilityFlags.POS_X),
      );
      expect(result.negY).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Y);
      expect(result.negZ).toBe(0x3f & ~ChunkVisibilityFlags.NEG_Z);
    }

    {
      // do some random tests
      for (let i = 0; i < 10; ++i) {
        chunk.fill(0);
        for (let j = 0; j < 20; ++j) {
          const lo = [
            (Math.random() * CHUNK_SIZE) | 0,
            (Math.random() * CHUNK_SIZE) | 0,
            (Math.random() * CHUNK_SIZE) | 0,
          ];
          const hi = [
            (Math.random() * CHUNK_SIZE) | 0,
            (Math.random() * CHUNK_SIZE) | 0,
            (Math.random() * CHUNK_SIZE) | 0,
          ];
          chunk
            .slice(
              [
                Math.min(lo[0], hi[0]),
                Math.min(lo[1], hi[1]),
                Math.min(lo[2], hi[2]),
              ],
              [
                Math.max(lo[0], hi[0]),
                Math.max(lo[1], hi[1]),
                Math.max(lo[2], hi[2]),
              ],
            )
            .fill(1);
        }
        checkVisibility(chunk);
      }
    }
  }
});
