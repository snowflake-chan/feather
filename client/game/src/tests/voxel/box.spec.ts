import { describe, expect, test } from '@jest/globals';

import { VoxelView, allocVoxels, freeVoxels } from '@box/utils/voxel';
import { meshChunkToBoxes, boxCompress } from '@box/build-system/utils/box-encode';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
import { blitBoxesToChunk, boxDecompress } from '@box/schema/voxel/box-decode';
import {
  VoxelCollisionBoxListSchema,
  VoxelCollisionBoxSchema,
} from '@box/schema/utils/rbush-schema';

function randomVoxels(nx: number, ny: number, nz: number, count: number) {
  const result = allocVoxels(nx, ny, nz);
  const sz = nx * ny * nz;
  for (let i = 0; i < sz; ++i) {
    result.data[i] = 0;
  }
  for (let j = 0; j < count; ++j) {
    result.data[(Math.random() * sz) | 0] = Math.random() * (1 << 12);
  }
  return result;
}

function voxelsEqual(a: VoxelView, b: VoxelView) {
  expect(a.shape).toEqual(b.shape);
  for (let i = 0; i < a.shape[0]; ++i) {
    for (let j = 0; j < a.shape[1]; ++j) {
      for (let k = 0; k < a.shape[2]; ++k) {
        expect(a.getVoxel(i, j, k)).toEqual(b.getVoxel(i, j, k));
      }
    }
  }
}

function testVoxels(voxels: VoxelView) {
  const boxes = meshChunkToBoxes(voxels);

  const p = VoxelCollisionBoxListSchema.clone(boxes);
  p.sort(VoxelCollisionBoxListSchema.compare);
  expect(boxes).toEqual(p);
  VoxelCollisionBoxListSchema.free(p);

  const padded = allocVoxels(CHUNK_SIZE + 2, CHUNK_SIZE + 2, CHUNK_SIZE + 2);
  padded.fill(0);
  const result = padded.slice(
    [1, 1, 1],
    [CHUNK_SIZE + 1, CHUNK_SIZE + 1, CHUNK_SIZE + 1],
  );
  blitBoxesToChunk(result, boxes);
  voxelsEqual(result, voxels);
  freeVoxels(padded);
  VoxelCollisionBoxListSchema.free(boxes);
}

describe('voxel box/blit test', () => {
  test.each(
    Array(20)
      .fill(0)
      .map((v, i) => [(v + i) * 10 + 10]),
  )('count %i', (count) => {
    const x = randomVoxels(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE, count);
    testVoxels(x);
    freeVoxels(x);
  });
});

test('box encode/decode', () => {
  function randomVoxels(nx: number, ny: number, nz: number, count: number) {
    const result = allocVoxels(nx, ny, nz);
    const sz = nx * ny * nz;
    for (let i = 0; i < sz; ++i) {
      result.data[i] = 0;
    }
    for (let j = 0; j < count; ++j) {
      const ax = Math.floor(Math.random() * nx);
      const ay = Math.floor(Math.random() * ny);
      const az = Math.floor(Math.random() * nz);
      const bx = Math.floor(Math.random() * nx);
      const by = Math.floor(Math.random() * ny);
      const bz = Math.floor(Math.random() * nz);

      result
        .slice(
          [Math.min(ax, bx), Math.min(ay, by), Math.min(az, bz)],
          [Math.max(ax, bx), Math.max(ay, by), Math.max(az, bz)],
        )
        .fill((Math.random() * 30) | 0);
    }
    return result;
  }

  function testVoxels(voxels: VoxelView) {
    const boxes = meshChunkToBoxes(voxels);

    const out = new MuWriteStream(1024);
    boxCompress(boxes, out);
    const result = boxDecompress(new MuReadStream(out.bytes()));
    console.log(`boxes: ${boxes.length}`, `bytes: ${out.offset}`);

    if (!VoxelCollisionBoxListSchema.equal(result, boxes)) {
      for (let i = 0; i < Math.max(result.length, boxes.length); ++i) {
        console.log(`i: `, i);
        for (const prop of Object.keys(VoxelCollisionBoxSchema.identity)) {
          console.log(`\t${prop}\t${result[i][prop]}\t${boxes[i][prop]}`);
        }
      }
    }

    expect(result).toEqual(boxes);

    out.destroy();
    VoxelCollisionBoxListSchema.free(boxes);
    VoxelCollisionBoxListSchema.free(result);
  }

  for (let i = 0; i < 100; ++i) {
    const voxels = randomVoxels(
      CHUNK_SIZE,
      CHUNK_SIZE,
      CHUNK_SIZE,
      Math.round(Math.random() * 30),
    );
    testVoxels(voxels);
    freeVoxels(voxels);
  }
});
