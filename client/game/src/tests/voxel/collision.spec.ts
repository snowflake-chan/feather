import { expect, test } from '@jest/globals';

import { VoxelView, allocVoxels, freeVoxels } from '@box/utils/voxel';
import {
  CHUNK_SIZE,
  VoxelCollisionSchema,
} from '@box/schema/voxel/voxel-collision-schema';
import {
  intializeCollision,
  rebuildCollisionChunk,
  collideSolid,
  collideFluid,
  setBlockIndex,
} from '@box/schema/voxel/voxel-collision';
import { blitBoxesToChunk } from '@box/schema/voxel/box-decode';
import {
  VoxelCollisionBoxList,
  VoxelCollisionBoxListSchema,
  RBushNode,
  VoxelCollisionBox,
} from '@box/schema/utils/rbush-schema';
import { TEST_BLOCK_INDEX, TEST_BLOCK_INFO } from './test-block-index';

const REPORT_STACK: RBushNode[] = [];
function reportAll(result: VoxelCollisionBox[], node: RBushNode) {
  for (let n: RBushNode | undefined = node; !!n; n = REPORT_STACK.pop()) {
    if (n.boxes.length > 0) {
      for (let i = 0; i < n.boxes.length; ++i) {
        result.push(n.boxes[i]);
      }
    } else {
      for (let i = 0; i < n.children.length; ++i) {
        REPORT_STACK.push(n.children[i]);
      }
    }
  }
}

function rbushBoxes(node: RBushNode) {
  const result = VoxelCollisionBoxListSchema.alloc();
  reportAll(result, node);
  result.sort(VoxelCollisionBoxListSchema.compare);
  return result;
}

// allocate a test 2x2x2 group of chunks
function allocTestChunks() {
  const paddedVoxels = allocVoxels(
    2 + 2 * CHUNK_SIZE,
    2 + 2 * CHUNK_SIZE,
    2 * CHUNK_SIZE,
  );
  const voxels = paddedVoxels.slice(
    [1, 1, 1],
    [1 + 2 * CHUNK_SIZE, 1 + 2 * CHUNK_SIZE, 1 + 2 * CHUNK_SIZE],
  );
  paddedVoxels.fill(0);

  // cut out chunks
  const chunks = [
    voxels.slice([0, 0, 0], [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE]),
    voxels.slice([CHUNK_SIZE, 0, 0], [2 * CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE]),
    voxels.slice([0, CHUNK_SIZE, 0], [CHUNK_SIZE, 2 * CHUNK_SIZE, CHUNK_SIZE]),
    voxels.slice(
      [CHUNK_SIZE, CHUNK_SIZE, 0],
      [2 * CHUNK_SIZE, 2 * CHUNK_SIZE, CHUNK_SIZE],
    ),
    voxels.slice([0, 0, CHUNK_SIZE], [CHUNK_SIZE, CHUNK_SIZE, 2 * CHUNK_SIZE]),
    voxels.slice(
      [CHUNK_SIZE, 0, CHUNK_SIZE],
      [2 * CHUNK_SIZE, CHUNK_SIZE, 2 * CHUNK_SIZE],
    ),
    voxels.slice(
      [0, CHUNK_SIZE, CHUNK_SIZE],
      [CHUNK_SIZE, 2 * CHUNK_SIZE, 2 * CHUNK_SIZE],
    ),
    voxels.slice(
      [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE],
      [2 * CHUNK_SIZE, 2 * CHUNK_SIZE, 2 * CHUNK_SIZE],
    ),
  ];

  return { paddedVoxels, voxels, chunks };
}

function writeRandom(voxels: VoxelView, b: number) {
  const x0 = Math.floor(Math.random() * voxels.shape[0]);
  const y0 = Math.floor(Math.random() * voxels.shape[1]);
  const z0 = Math.floor(Math.random() * voxels.shape[2]);
  const x1 = Math.floor(Math.random() * voxels.shape[0]);
  const y1 = Math.floor(Math.random() * voxels.shape[1]);
  const z1 = Math.floor(Math.random() * voxels.shape[2]);
  voxels
    .slice(
      [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)],
      [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)],
    )
    .fill(b);
}

function filterInternalVoxels(chunk: VoxelView, base: VoxelView) {
  const out = allocVoxels(chunk.shape[0], chunk.shape[1], chunk.shape[2]);
  out.copy(base);
  for (let k = 1; k < chunk.shape[2] - 1; ++k) {
    for (let j = 1; j < chunk.shape[1] - 1; ++j) {
      for (let i = 1; i < chunk.shape[0] - 1; ++i) {
        const x0 = chunk.getVoxel(i - 1, j, k);
        const x1 = chunk.getVoxel(i + 1, j, k);
        const y0 = chunk.getVoxel(i, j - 1, k);
        const y1 = chunk.getVoxel(i, j + 1, k);
        const z0 = chunk.getVoxel(i, j, k - 1);
        const z1 = chunk.getVoxel(i, j, k + 1);
        if (x0 && x1 && y0 && y1 && z0 && z1) {
          out.setVoxel(i, j, k, 0);
        }
      }
    }
  }
  return out;
}

test('collision construction consistency', () => {
  const { voxels, paddedVoxels, chunks } = allocTestChunks();

  for (let i = 0; i < 100; ++i) {
    writeRandom(
      voxels,
      TEST_BLOCK_INFO.ids[(Math.random() * TEST_BLOCK_INFO.ids.length) | 0],
    );
  }

  const collision = VoxelCollisionSchema.clone(VoxelCollisionSchema.identity);
  intializeCollision(TEST_BLOCK_INDEX, collision, voxels);

  expect(collision.chunkDimI).toBe(2);
  expect(collision.chunkDimJ).toBe(2);
  expect(collision.chunkDimK).toBe(2);

  // test that initialization produces a consistent mesh
  const compareVoxels = allocVoxels(
    voxels.shape[0],
    voxels.shape[1],
    voxels.shape[2],
  );
  compareVoxels.fill(0);
  for (let i = 0; i < collision.chunks.length; ++i) {
    blitBoxesToChunk(compareVoxels, rbushBoxes(collision.chunks[i].rbush));
    blitBoxesToChunk(compareVoxels, rbushBoxes(collision.chunks[i].fluidRBush));
  }
  const expectedVoxels = filterInternalVoxels(voxels, voxels);
  const actualVoxels = filterInternalVoxels(voxels, compareVoxels);
  // for (let i = 0; i < expectedVoxels.shape[0]; ++i) {
  //     console.log(i);
  //     for (let j = 0; j < expectedVoxels.shape[1]; ++j) {
  //         const rowF:number[] = [];
  //         const rowH:number[] = [];
  //         for (let k = 0; k < expectedVoxels.shape[2]; ++k) {
  //             rowF.push(expectedVoxels.getVoxel(i, j, k));
  //             rowH.push(actualVoxels.getVoxel(i, j, k));
  //         }
  //         console.log(rowF.join(''), rowH.join(''));
  //     }
  //     console.log('');
  // }
  expect(actualVoxels.equals(expectedVoxels)).toBeTruthy();
  freeVoxels(compareVoxels);
  freeVoxels(expectedVoxels);

  // test that chunks are in the correct order
  setBlockIndex(TEST_BLOCK_INDEX);
  for (let i = 0; i < chunks.length; ++i) {
    const corner = chunks[i].slice(
      [1, 1, 1],
      [CHUNK_SIZE - 1, CHUNK_SIZE - 1, CHUNK_SIZE - 1],
    );
    for (let j = 0; j < 20; ++j) {
      writeRandom(corner, Math.floor(Math.random() * 3));
    }
    rebuildCollisionChunk(chunks[i], collision.chunks[i]);

    const expected = VoxelCollisionSchema.clone(VoxelCollisionSchema.identity);
    intializeCollision(TEST_BLOCK_INDEX, expected, voxels);
    expect(VoxelCollisionSchema.equal(collision, expected)).toBeTruthy();
    VoxelCollisionSchema.free(expected);
  }

  freeVoxels(paddedVoxels);
});

function collideBoxListBruteForce(
  boxes: VoxelCollisionBoxList,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
) {
  const result: VoxelCollisionBoxList = [];
  for (let i = 0; i < boxes.length; ++i) {
    const b = boxes[i];
    if (
      b.maxX < x0 ||
      x1 < b.minX ||
      b.maxY < y0 ||
      y1 < b.minY ||
      b.maxZ < z0 ||
      z1 < b.minZ
    ) {
      continue;
    }
    result.push(b);
  }
  return result;
}

test('collision solid correctness', () => {
  const { voxels, paddedVoxels } = allocTestChunks();

  for (let i = 0; i < 100; ++i) {
    writeRandom(voxels, Math.floor(Math.random() * 2) + 1);
  }

  const collision = VoxelCollisionSchema.clone(VoxelCollisionSchema.identity);
  intializeCollision(TEST_BLOCK_INDEX, collision, voxels);

  // extract list of all solid boxes
  const solidBoxes: VoxelCollisionBoxList = [];
  for (let i = 0; i < collision.chunks.length; ++i) {
    solidBoxes.push.apply(solidBoxes, rbushBoxes(collision.chunks[i].rbush));
  }
  solidBoxes.sort(VoxelCollisionBoxListSchema.compare);

  // test a random box
  for (let i = 0; i < 200; ++i) {
    const x0 = Math.random() * voxels.shape[0];
    const y0 = Math.random() * voxels.shape[1];
    const z0 = Math.random() * voxels.shape[2];
    const x1 = Math.random() * voxels.shape[0];
    const y1 = Math.random() * voxels.shape[1];
    const z1 = Math.random() * voxels.shape[2];

    const lo = [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)];
    const hi = [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)];

    const actual: VoxelCollisionBoxList = [];
    collideSolid(actual, collision, lo[0], lo[1], lo[2], hi[0], hi[1], hi[2]);
    actual.sort(VoxelCollisionBoxListSchema.compare);

    expect(
      VoxelCollisionBoxListSchema.equal(
        actual,
        collideBoxListBruteForce(
          solidBoxes,
          lo[0],
          lo[1],
          lo[2],
          hi[0],
          hi[1],
          hi[2],
        ),
      ),
    ).toBeTruthy();
  }

  freeVoxels(paddedVoxels);
});

test('collision fluid correctness', () => {
  const { voxels, paddedVoxels } = allocTestChunks();

  for (let i = 0; i < 100; ++i) {
    writeRandom(voxels, Math.floor(Math.random() * 2) + 1);
  }

  const collision = VoxelCollisionSchema.clone(VoxelCollisionSchema.identity);
  intializeCollision(TEST_BLOCK_INDEX, collision, voxels);

  // extract list of all solid boxes
  const fluidBoxes: VoxelCollisionBoxList = [];
  for (let i = 0; i < collision.chunks.length; ++i) {
    fluidBoxes.push.apply(
      fluidBoxes,
      rbushBoxes(collision.chunks[i].fluidRBush),
    );
  }
  fluidBoxes.sort(VoxelCollisionBoxListSchema.compare);

  // test a random box
  for (let i = 0; i < 200; ++i) {
    const x0 = Math.random() * voxels.shape[0];
    const y0 = Math.random() * voxels.shape[1];
    const z0 = Math.random() * voxels.shape[2];
    const x1 = Math.random() * voxels.shape[0];
    const y1 = Math.random() * voxels.shape[1];
    const z1 = Math.random() * voxels.shape[2];

    const lo = [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)];
    const hi = [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)];

    const actual: VoxelCollisionBoxList = [];
    collideFluid(actual, collision, lo[0], lo[1], lo[2], hi[0], hi[1], hi[2]);
    actual.sort(VoxelCollisionBoxListSchema.compare);

    expect(
      VoxelCollisionBoxListSchema.equal(
        actual,
        collideBoxListBruteForce(
          fluidBoxes,
          lo[0],
          lo[1],
          lo[2],
          hi[0],
          hi[1],
          hi[2],
        ),
      ),
    ).toBeTruthy();
  }

  freeVoxels(paddedVoxels);
});
