import { BlockIndexSchema } from '@box/schema/voxel/block-schema';
import { unpackBlockIndex } from '@box/schema/voxel/blocks';
import {
  CHUNK_SHIFT,
  CHUNK_SIZE,
} from '@box/schema/voxel/voxel-collision-schema';
import {
  VoxelRaycastHitResult,
  raycast,
} from '@box/schema/voxel/voxel-raycast';
import { VoxelView, allocVoxels } from '@box/utils/voxel';
import { vec3 } from 'gl-matrix';
import pino from 'pino';
import { alloc, free } from '../utils/pool';
import { ChunkVisibilityTable, chunkVisibility } from './chunk-visibility';
import { ChunkVisibilityFlags } from './visibility-flags';
import { VoxelLightMap } from './voxel-light';
import {
  FLUID_VERTEX_SIZE,
  SimpleMeshBuilder,
  VERTEX_SIZE,
} from './voxel-mesher';
import {
  VoxelMessage,
  VoxelMessageType,
  WorkerClearChunkMessage,
  WorkerLogMessage,
  WorkerMessageType,
  WorkerUpdateChunkMessage,
  WorkerUpdateHeightMessage,
  WorkerUpdateLightMessage,
  WorkerUpdateVoxelViewMessage,
} from './voxel-worker-schema';
import { blitBoxesToChunk } from '@box/schema/voxel/box-decode';

const logger = pino({
  browser: {
    serialize: true,
    write(o) {
      postMessage(<WorkerLogMessage>{
        type: WorkerMessageType.LOG,
        message: o,
      });
    },
  },
});

const MAX_RAY_LENGTH = 128;
const NUM_SPHERE_SAMPLES = 64;
const NUM_EXPOSURE_SAMPLES = NUM_SPHERE_SAMPLES + 1;

class ChunkInfo {
  public voxels: VoxelView;
  public dirty = true;
  public ix: number;
  public iy: number;
  public iz: number;

  constructor(ix: number, iy: number, iz: number, voxels: VoxelView) {
    this.ix = ix;
    this.iy = iy;
    this.iz = iz;
    this.voxels = voxels;
  }
}

function compareChunk(a: ChunkInfo, b: ChunkInfo) {
  return a.ix - b.ix || a.iy - b.iy || a.iz - b.iz;
}

function calculateBoundingBox(
  ix: number,
  iy: number,
  iz: number,
  mesh: Uint8Array,
  end: number,
) {
  let minX = CHUNK_SIZE;
  let minY = CHUNK_SIZE;
  let minZ = CHUNK_SIZE;
  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;

  for (let ptr = 0; ptr < end; ptr += VERTEX_SIZE) {
    const x = mesh[ptr];
    const y = mesh[ptr + 1];
    const z = mesh[ptr + 2];

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  return {
    minX: minX + ix * CHUNK_SIZE,
    minY: minY + iy * CHUNK_SIZE,
    minZ: minZ + iz * CHUNK_SIZE,
    maxX: maxX + ix * CHUNK_SIZE,
    maxY: maxY + iy * CHUNK_SIZE,
    maxZ: maxZ + iz * CHUNK_SIZE,
  };
}

function calculateBoundingBoxFluid(
  ix: number,
  iy: number,
  iz: number,
  mesh: Uint8Array,
  end: number,
) {
  let minX = CHUNK_SIZE;
  let minY = CHUNK_SIZE;
  let minZ = CHUNK_SIZE;
  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;

  for (let ptr = 0; ptr < end; ptr += FLUID_VERTEX_SIZE) {
    const x = mesh[ptr];
    const y = mesh[ptr + 1];
    const z = mesh[ptr + 2];

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  return {
    minX: minX + ix * CHUNK_SIZE,
    minY: minY + iy * CHUNK_SIZE,
    minZ: minZ + iz * CHUNK_SIZE,
    maxX: maxX + ix * CHUNK_SIZE,
    maxY: maxY + iy * CHUNK_SIZE,
    maxZ: maxZ + iz * CHUNK_SIZE,
  };
}

export default function () {}

const chunks: ChunkInfo[] = [];
const dirtyChunks: ChunkInfo[] = [];

const blockIndex = BlockIndexSchema.clone(BlockIndexSchema.identity);
const meshBuilder = new SimpleMeshBuilder(
  blockIndex,
  CHUNK_SIZE,
  CHUNK_SIZE,
  CHUNK_SIZE,
);

let cx = 0;
let cy = 0;
let cz = 0;

let paddedVoxels = allocVoxels(34, 34, 34);
let voxels = paddedVoxels.slice([1, 1, 1], [33, 33, 33]);
let light = new VoxelLightMap(blockIndex, paddedVoxels);

let actualHeight = new Uint16Array(alloc(32 * 32 * 2));
let scaledHeight = new Uint8Array(alloc(32 * 32));

let activeLoX = 1 << 20;
let activeLoZ = 1 << 20;
let activeHiX = 0;
let activeHiZ = 0;

let invisibleVoxel = true;

function markActiveHeight(x: number, z: number) {
  activeLoX = Math.min(activeLoX, x);
  activeLoZ = Math.min(activeLoZ, z);
  activeHiX = Math.max(activeHiX, x + 1);
  activeHiZ = Math.max(activeHiZ, z + 1);
}

function lowerColumnHeight(x: number, y0: number, z: number) {
  markActiveHeight(x, z);
  for (let y = y0 - 1; y >= 0; --y) {
    if (voxels.getVoxel(x, y, z)) {
      actualHeight[x + voxels.shape[0] * z] = y + 1;
      return;
    }
  }
  actualHeight[x + voxels.shape[0] * z] = 0;
}

function raiseColumnHeight(x: number, y0: number, z: number) {
  const idx = x + voxels.shape[0] * z;
  actualHeight[idx] = Math.max(actualHeight[idx], y0 + 1);
  markActiveHeight(x, z);
}

function updateHeight() {
  // first copy any changes in the height map into buffer and compute bounding box for changed region
  const heightScale = 255 / voxels.shape[1];

  const yRays = actualHeight;
  const nx = voxels.shape[0];
  const nz = voxels.shape[2];

  let lox = nx;
  let loz = nz;
  let hix = 0;
  let hiz = 0;

  for (let z = activeLoZ; z < activeHiZ; ++z) {
    for (let x = activeLoX; x < activeHiX; ++x) {
      const h1 =
        Math.max(0, Math.min(255, heightScale * yRays[x + nx * z])) | 0;
      const h0 = scaledHeight[x + z * nx];
      if (h0 !== h1) {
        scaledHeight[x + z * nx] = h1;
        lox = Math.min(lox, x);
        loz = Math.min(loz, z);
        hix = Math.max(hix, x);
        hiz = Math.max(hiz, z);
      }
    }
  }

  hix += 1;
  hiz += 1;

  // then send updated region to main thread
  if (lox < hix && loz < hiz) {
    const mx = hix - lox;
    const mz = hiz - loz;
    try {
      const data = alloc(mx * mz);
      const result = new Uint8Array(data);

      let ptr = 0;
      for (let z = loz; z < hiz; ++z) {
        for (let x = lox; x < hix; ++x) {
          result[ptr++] = scaledHeight[x + nx * z];
        }
      }

      postMessage(
        <WorkerUpdateHeightMessage>{
          type: WorkerMessageType.UPDATE_HEIGHTMAP,
          x: lox,
          y: loz,
          width: mx,
          height: mz,
          data,
        },
        [data],
      );
    } catch (err) {
      // 如果高度图不更新，雨雪的计算会受到影响，但至少让他能玩
      logger.error(err, 'update height map failed with size (%d, %d)', mx, mz);
    }
  }

  // clear region
  activeLoX = activeLoX = 1 << 20;
  activeHiX = activeHiZ = 0;
}

const visibility = new ChunkVisibilityTable();

function drainDirtyQueue() {
  if (dirtyChunks.length === 0) {
    return;
  }

  updateHeight();

  dirtyChunks.sort(compareChunk);

  for (let i = 0; i < dirtyChunks.length; ++i) {
    const chunk = dirtyChunks[i];
    chunk.dirty = false;

    // remesh chunk
    meshBuilder.mesh(chunk.voxels, light.lightLevel, invisibleVoxel);
    const {
      meshBuffer,
      meshBuffer32,
      meshPtr,
      alphaBuffer,
      alphaBuffer32,
      alphaPtr,
      fluidBuffer,
      fluidBuffer32,
      fluidPtr,
    } = meshBuilder;

    // copy and concatenate data for chunk
    const bufferSize = 4 * (meshPtr + alphaPtr + fluidPtr);
    const data = alloc(bufferSize);

    const meshStart = 0;
    const meshEnd = meshStart + meshPtr;
    const alphaStart = meshEnd;
    const alphaEnd = alphaStart + alphaPtr;
    const fluidStart = alphaEnd;
    const fluidEnd = fluidStart + fluidPtr;

    const { ix, iy, iz } = chunk;

    const solid = !!(chunk.voxels.getVoxel(0, 0, 0) & 1);

    if (fluidEnd === 0) {
      postMessage(<WorkerClearChunkMessage>{
        type: WorkerMessageType.CLEAR_CHUNK,
        ix,
        iy,
        iz,
        solid,
      });
    } else {
      const buffer = new Uint32Array(data);
      buffer
        .subarray(meshStart, meshEnd)
        .set(meshBuffer32.subarray(0, meshPtr));
      buffer
        .subarray(alphaStart, alphaEnd)
        .set(alphaBuffer32.subarray(0, alphaPtr));
      buffer
        .subarray(fluidStart, fluidEnd)
        .set(fluidBuffer32.subarray(0, fluidPtr));

      if (meshStart < meshEnd) {
        chunkVisibility(
          visibility,
          chunk.voxels.getVoxelByPtr,
          chunk.voxels.offset,
          chunk.voxels.stride[0],
          chunk.voxels.stride[1],
          chunk.voxels.stride[2],
        );
      } else if (solid) {
        visibility.posX =
          visibility.posY =
          visibility.posZ =
          visibility.negX =
          visibility.negY =
          visibility.negZ =
            0;
      } else {
        visibility.posX = 0x3f & ~ChunkVisibilityFlags.POS_X;
        visibility.negX = 0x3f & ~ChunkVisibilityFlags.NEG_X;
        visibility.posY = 0x3f & ~ChunkVisibilityFlags.POS_Y;
        visibility.negY = 0x3f & ~ChunkVisibilityFlags.NEG_Y;
        visibility.posZ = 0x3f & ~ChunkVisibilityFlags.POS_Z;
        visibility.negZ = 0x3f & ~ChunkVisibilityFlags.NEG_Z;
      }

      postMessage(
        <WorkerUpdateChunkMessage>{
          type: WorkerMessageType.UPDATE_CHUNK,
          ix,
          iy,
          iz,
          meshStart: meshStart * 4,
          meshEnd: meshEnd * 4,
          meshBounds: calculateBoundingBox(ix, iy, iz, meshBuffer, 4 * meshPtr),
          alphaStart: alphaStart * 4,
          alphaEnd: alphaEnd * 4,
          alphaBounds: calculateBoundingBox(
            ix,
            iy,
            iz,
            alphaBuffer,
            4 * alphaPtr,
          ),
          fluidStart: fluidStart * 4,
          fluidEnd: fluidEnd * 4,
          fluidBounds: calculateBoundingBoxFluid(
            ix,
            iy,
            iz,
            fluidBuffer,
            4 * fluidPtr,
          ),
          posX: visibility.posX,
          posY: visibility.posY,
          posZ: visibility.posZ,
          negX: visibility.negX,
          negY: visibility.negY,
          negZ: visibility.negZ,
          data,
        },
        [data],
      );
    }
  }
  dirtyChunks.length = 0;
}

function chunkId(i: number, j: number, k: number): number {
  return i + cx * (j + cy * k);
}

function markChunk(chunk: ChunkInfo) {
  if (!chunk.dirty) {
    chunk.dirty = true;
    dirtyChunks.push(chunk);
  }
}

function markVoxel(x: number, y: number, z: number) {
  const [nx, ny, nz] = voxels.shape;
  for (let dx = -1; dx <= 1; ++dx) {
    if (x + dx < 0 || x + dx > nx - 1) {
      continue;
    }
    const ix = (x + dx) >> CHUNK_SHIFT;
    for (let dy = -1; dy <= 1; ++dy) {
      if (y + dy < 0 || y + dy > ny - 1) {
        continue;
      }
      const iy = (y + dy) >> CHUNK_SHIFT;
      for (let dz = -1; dz <= 1; ++dz) {
        if (z + dz < 0 || z + dz > nz - 1) {
          continue;
        }
        const iz = (z + dz) >> CHUNK_SHIFT;
        markChunk(chunks[chunkId(ix, iy, iz)]);
      }
    }
  }
}

function setVoxel(x: number, y: number, z: number, b: number) {
  if (voxels.getVoxel(x, y, z) === b) {
    return;
  }
  voxels.setVoxel(x, y, z, b);
  if (b) {
    raiseColumnHeight(x, y, z);
  } else {
    lowerColumnHeight(x, y, z);
  }
  light.updateLight(x + 1, y + 1, z + 1);
  markVoxel(x, y, z);
  for (let i = 0; i < light.ADD_PTR; i += 3) {
    markVoxel(
      light.ADD_QUEUE[i],
      light.ADD_QUEUE[i + 1],
      light.ADD_QUEUE[i + 2],
    );
  }
  for (let i = 0; i < light.REMOVE_PTR; i += 4) {
    markVoxel(
      light.REMOVE_QUEUE[i],
      light.REMOVE_QUEUE[i + 1],
      light.REMOVE_QUEUE[i + 2],
    );
  }
}

function resetVoxels(v: VoxelView, innerAO: boolean) {
  light.destroy();

  paddedVoxels = v;
  light = new VoxelLightMap(blockIndex, paddedVoxels, innerAO);
  voxels = paddedVoxels.slice(
    [1, 1, 1],
    [v.shape[0] - 1, v.shape[1] - 1, v.shape[2] - 1],
  );
  dirtyChunks.length = 0;
  chunks.length = 0;

  try {
    // reset height field
    free(scaledHeight.buffer);
    scaledHeight = new Uint8Array(alloc(v.shape[0] * v.shape[2]));
    for (let i = 0; i < scaledHeight.length; ++i) {
      scaledHeight[i] = 0;
    }

    // clear height buffer
    free(actualHeight.buffer);
    actualHeight = new Uint16Array(alloc(v.shape[0] * v.shape[2] * 2));
  } catch (err) {
    // 如果高度图不更新，雨雪的计算会受到影响，但至少让他能玩
    logger.error(
      err,
      'update height failed when reset voxels with size (%d, %d)',
      v.shape[0],
      v.shape[2],
    );
  }

  const [nx, ny, nz] = voxels.shape;
  cx = (nx / CHUNK_SIZE) | 0;
  cy = (ny / CHUNK_SIZE) | 0;
  cz = (nz / CHUNK_SIZE) | 0;
  for (let k = 0; k < cz; ++k) {
    for (let j = 0; j < cy; ++j) {
      for (let i = 0; i < cx; ++i) {
        const chunkVoxels = paddedVoxels.slice(
          [i * CHUNK_SIZE, j * CHUNK_SIZE, k * CHUNK_SIZE],
          [
            (i + 1) * CHUNK_SIZE + 2,
            (j + 1) * CHUNK_SIZE + 2,
            (k + 1) * CHUNK_SIZE + 2,
          ],
        );
        const chunk = new ChunkInfo(i, j, k, chunkVoxels);
        chunks.push(chunk);
        dirtyChunks.push(chunk);
      }
    }
  }

  // update height field
  activeLoX = activeLoZ = 1 << 20;
  activeHiX = activeHiZ = 0;
  for (let z = light.startZ; z < light.endZ; ++z) {
    for (let x = light.startX; x < light.endX; ++x) {
      lowerColumnHeight(x, light.endY, z);
    }
  }
}

const SPHERE_SAMPLES: vec3[] = new Array(NUM_SPHERE_SAMPLES);
for (let i = 0; i < NUM_SPHERE_SAMPLES; ++i) {
  const v = vec3.create();
  while (true) {
    vec3.random(v);
    v[1] = Math.abs(v[1]);
    vec3.normalize(v, v);
    let minDist = Infinity;
    for (let k = 0; k < i; ++k) {
      minDist = Math.min(minDist, vec3.dist(v, SPHERE_SAMPLES[k]));
    }
    if (minDist > 1 / NUM_SPHERE_SAMPLES) {
      break;
    }
  }
  SPHERE_SAMPLES[i] = v;
}

const eye = vec3.create();
const exposureSamples: number[] = new Array(NUM_EXPOSURE_SAMPLES + 1);
for (let i = 0; i <= NUM_EXPOSURE_SAMPLES; ++i) {
  exposureSamples[i] = 0;
}

function outsideScore(x: number, y: number, z: number) {
  light.sampleLight(lightSample, x + 1, y + 1, z + 1);
  return lightSample.a;
}

const raycastResult = new VoxelRaycastHitResult();
const sampleOrigin = vec3.create();
function sampleAmbientLight(x: number, y: number, z: number) {
  vec3.set(eye, x, y, z);

  // count how many end up landing outdoors vs. indoors
  let ptr = 0;
  exposureSamples[ptr++] = outsideScore(x, y, z);
  for (let i = 0; i < NUM_SPHERE_SAMPLES; ++i) {
    const ray = SPHERE_SAMPLES[i];
    if (
      raycast(raycastResult, blockIndex, voxels, eye, ray, MAX_RAY_LENGTH, true)
    ) {
      if (raycastResult.hitDistance < 0.5) {
        continue;
      }
      vec3.scaleAndAdd(
        sampleOrigin,
        raycastResult.hitPosition,
        raycastResult.hitNormal,
        0.5,
      );
    } else {
      vec3.scaleAndAdd(sampleOrigin, eye, ray, MAX_RAY_LENGTH);
    }
    exposureSamples[ptr++] = outsideScore(
      sampleOrigin[0],
      sampleOrigin[1],
      sampleOrigin[2],
    );
  }

  // use the number of outdoor rays to take a weighted vote based on wether we're outside
  // or inside
  let outdoor = 0;
  for (let i = 0; i < ptr; ++i) {
    outdoor += exposureSamples[i];
  }
  outdoor /= ptr;
  outdoor = 1 / (1 + Math.exp(40 * (0.125 - outdoor)));

  return outdoor;
}

const lightSample = { r: 0.1, g: 0.1, b: 0.1, a: 0.1 };
function sampleLightPoints(points: Float32Array, lights: Uint8Array) {
  for (let ptr = 0, optr = 0; ptr < points.length; ptr += 3) {
    const x = points[ptr];
    const y = points[ptr + 1];
    const z = points[ptr + 2];
    light.sampleLight(lightSample, x + 1, y + 1, z + 1);
    lights[optr++] = (255 * lightSample.r) >> 0;
    lights[optr++] = (255 * lightSample.g) >> 0;
    lights[optr++] = (255 * lightSample.b) >> 0;
    lights[optr++] = (255 * lightSample.a) >> 0;
  }
}

addEventListener('message', (ev) => {
  const message = <VoxelMessage>ev.data;
  switch (message.type) {
    case VoxelMessageType.RETURN_MEMORY:
      free(message.data);
      break;

    case VoxelMessageType.RESET_VOXELS:
      unpackBlockIndex(message.blockInfo, blockIndex);
      resetVoxels(
        new VoxelView(
          new Uint16Array(message.data),
          <[number, number, number]>message.shape,
          <[number, number, number]>message.stride,
          message.offset | 0,
          message.dataStart,
          message.dataEnd,
          message.dataStride,
        ),
        message.innerAO,
      );
      break;

    case VoxelMessageType.POLL:
      const writes = new Uint32Array(message.data);
      for (let i = 0; i < writes.length; i += 2) {
        const index = writes[i] - voxels.offset;
        const block = writes[i + 1];
        const z = Math.floor(index / voxels.stride[2]);
        const y = Math.floor((index % voxels.stride[2]) / voxels.stride[1]);
        const x = index % voxels.stride[1];
        setVoxel(x, y, z, block);
      }
      drainDirtyQueue();
      postMessage({ type: WorkerMessageType.POLL });
      break;

    case VoxelMessageType.SET_VOXEL_INVISIBLE:
      if (message.value === invisibleVoxel) {
        break;
      }
      invisibleVoxel = message.value;
    case VoxelMessageType.REMESH_ALL:
      for (let i = 0; i < chunks.length; ++i) {
        markChunk(chunks[i]);
      }
      drainDirtyQueue();
      postMessage({ type: WorkerMessageType.POLL });
      break;
    case VoxelMessageType.CALC_VOXEL_BY_BOXES:
      if (!paddedVoxels.dataStart || !paddedVoxels.dataEnd) {
        return;
      }

      paddedVoxels.dataStart[0] = message.dataStart[0];
      paddedVoxels.dataStart[1] = message.dataStart[1];
      paddedVoxels.dataStart[2] = message.dataStart[2];

      paddedVoxels.dataEnd[0] = message.dataEnd[0];
      paddedVoxels.dataEnd[1] = message.dataEnd[1];
      paddedVoxels.dataEnd[2] = message.dataEnd[2];

      paddedVoxels.data.fill(0);
      message.chunkBoxes.forEach(({ idx, boxes, chunkOffset }) => {
        blitBoxesToChunk(
          {
            setVoxelByPtr: paddedVoxels.setVoxelByPtr,
            stride: paddedVoxels.stride,
            offset: chunkOffset,
          },
          boxes,
        );
        markChunk(chunks[idx]);
      });

      const copy = new Uint16Array(paddedVoxels.data);
      postMessage(
        <WorkerUpdateVoxelViewMessage>{
          type: WorkerMessageType.UPDATE_VOXEL_VIEW,
          data: copy.buffer,
          dataStart: paddedVoxels.dataStart,
          dataEnd: paddedVoxels.dataEnd,
        },
        [copy.buffer],
      );

      light.updateAllLight();

      actualHeight.fill(0);
      for (let z = light.startZ; z < light.endZ; ++z) {
        for (let x = light.startX; x < light.endX; ++x) {
          lowerColumnHeight(x, light.endY, z);
        }
      }

      drainDirtyQueue();
      postMessage({ type: WorkerMessageType.POLL });
      break;
    case VoxelMessageType.UPDATE_LIGHTMAP:
      sampleLightPoints(
        new Float32Array(message.buffer, 0, message.size),
        new Uint8Array(message.buffer, 0, 4 * message.size),
      );
      postMessage(
        <WorkerUpdateLightMessage>{
          type: WorkerMessageType.UPDATE_LIGHTMAP,
          ambient: sampleAmbientLight(message.eyeX, message.eyeY, message.eyeZ),
          buffer: message.buffer,
          size: 4 * message.size,
        },
        [message.buffer],
      );
      break;
  }
});
