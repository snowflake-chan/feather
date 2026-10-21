import { MuBuffer, allocBuffer, freeBuffer } from '@box/mudb/stream';
import {
  CHUNK_SHIFT,
  CHUNK_SIZE,
} from '@box/schema/voxel/voxel-collision-schema';
import { TaskTypeEnum } from '@box/utils/loading/loading-schema';
import { levels, type Logger } from 'pino';
import uniq from 'uniq';
import { GameClientState } from '../game-client-schema';
import { testFrustumBox, testFrustumChunkFaces } from '../utils/frustum';
import { ChunkVisibilityFlags } from '../voxel/visibility-flags';
import { GLRenderer } from './gl-voxel/gl-voxel-controller';
import { GPURenderer } from './gpu-voxel/gpu-voxel-controller';
import { VoxelRenderer, VoxelTypeMap } from './interface';
import {
  LIGHTMAP_CACHE_AGE,
  LightProbe,
  LightProbeSchema,
  LightState,
} from './light-schema';
import {
  VoxelMessageType,
  VoxelUpdateLightMessage,
  WorkerMessage,
  WorkerMessageType,
} from './voxel-worker-schema';
import { GLVoxelState } from './gl-voxel/gl-voxel-schema';
import { GPUVoxelState } from './gpu-voxel/gpu-voxel-schema';
import { EnvironmentState } from '@box/schema/environment/environment-schema';
import { getById } from '@box/utils/id';
import { calcStartIJK, VoxelClient } from './voxel-client';
import { FetchHashesSchema } from '@box/schema/voxel/voxel-protocol';
import { ClientVoxelStateSchema } from './voxel-client-schema';
import { Frustum } from '@box/schema/utils/frustum-schema';

export const CHUNK_BUFFER_SIZE =
  6 * 4 * 8 * CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE;

function compareNum(a: number, b: number) {
  return a - b;
}

// light map bias factor, prevent light bleeding
const W = 0.95;
const WI = (1 - W) / 8;

export function testChunkVisibility(
  state: GameClientState,
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
) {
  const voxelState = voxelRenderer.getVoxelState(state);
  const { nx, ny, nz, chunks } = voxelState;
  if (
    lox < 0 ||
    hix > nx - 1 ||
    loy < 0 ||
    hiy > ny - 1 ||
    loz < 0 ||
    hiz > nz - 1
  ) {
    return true;
  }

  const x0 = Math.floor(lox) >> CHUNK_SHIFT;
  const y0 = Math.floor(loy) >> CHUNK_SHIFT;
  const z0 = Math.floor(loz) >> CHUNK_SHIFT;

  const x1 = Math.ceil(hix) >> CHUNK_SHIFT;
  const y1 = Math.ceil(hiy) >> CHUNK_SHIFT;
  const z1 = Math.ceil(hiz) >> CHUNK_SHIFT;

  const ncx = nx >>> CHUNK_SHIFT;
  const ncy = ny >>> CHUNK_SHIFT;

  for (let z = z0; z <= z1; ++z) {
    for (let y = y0; y <= y1; ++y) {
      for (let x = x0; x <= x1; ++x) {
        const i = x + ncx * (y + ncy * z);
        const c = chunks[i];
        if (c.visible) {
          return true;
        }
      }
    }
  }

  return false;
}

let voxelRenderer: VoxelRenderer<'gl'> | VoxelRenderer<'gpu'> = GLRenderer;

export async function initializeVoxelWorker(
  state: GameClientState,
  logger: Logger,
) {
  if (state.gpu.rewgpu) {
    voxelRenderer = GPURenderer;
  }
  const {
    getVoxelState,
    updateChunk,
    clearHeightTexture,
    clearChunk,
    updateHeightmap,
  } = voxelRenderer as VoxelRenderer<keyof VoxelTypeMap>;

  const voxelMesh = getVoxelState(state);

  voxelMesh.chunks.length = 0;
  voxelMesh.nx = 0;
  voxelMesh.ny = 0;
  voxelMesh.nz = 0;

  clearHeightTexture(state);

  // start worker
  let vWorker: Worker;

  if (!process.env.RUSTY) {
    vWorker = new Worker(new URL('./voxel.worker', import.meta.url));
  } else {
    vWorker = new Worker(`${__webpack_public_path__}/voxel.worker.js`);
  }

  state.voxelWorker = vWorker;

  vWorker.onmessage = (ev) => {
    const message = <WorkerMessage>ev.data;
    const cx = voxelMesh.nx >>> CHUNK_SHIFT;
    const cy = voxelMesh.ny >>> CHUNK_SHIFT;
    const cz = voxelMesh.nz >>> CHUNK_SHIFT;

    const now = state.clock.clock;

    switch (message.type) {
      case WorkerMessageType.UPDATE_LIGHTMAP:
        state.light.pending = false;
        state.light.ambient = message.ambient;

        const index = state.light.probes;

        const nextIds = state.light.nextIds;
        const sampleData = new Uint8Array(message.buffer, 0, message.size);
        let ptr = 0;
        for (let i = 0; i < nextIds.length; ++i) {
          const sample = index[nextIds[i]];
          if (!sample) {
            ptr += 32;
            continue;
          }

          sample.lastAccess = now;

          sample.R0 = (1 / 255) * sampleData[ptr++];
          sample.G0 = (1 / 255) * sampleData[ptr++];
          sample.B0 = (1 / 255) * sampleData[ptr++];
          sample.A0 = (1 / 255) * sampleData[ptr++];

          sample.R1 = (1 / 255) * sampleData[ptr++];
          sample.G1 = (1 / 255) * sampleData[ptr++];
          sample.B1 = (1 / 255) * sampleData[ptr++];
          sample.A1 = (1 / 255) * sampleData[ptr++];

          sample.R2 = (1 / 255) * sampleData[ptr++];
          sample.G2 = (1 / 255) * sampleData[ptr++];
          sample.B2 = (1 / 255) * sampleData[ptr++];
          sample.A2 = (1 / 255) * sampleData[ptr++];

          sample.R3 = (1 / 255) * sampleData[ptr++];
          sample.G3 = (1 / 255) * sampleData[ptr++];
          sample.B3 = (1 / 255) * sampleData[ptr++];
          sample.A3 = (1 / 255) * sampleData[ptr++];

          sample.R4 = (1 / 255) * sampleData[ptr++];
          sample.G4 = (1 / 255) * sampleData[ptr++];
          sample.B4 = (1 / 255) * sampleData[ptr++];
          sample.A4 = (1 / 255) * sampleData[ptr++];

          sample.R5 = (1 / 255) * sampleData[ptr++];
          sample.G5 = (1 / 255) * sampleData[ptr++];
          sample.B5 = (1 / 255) * sampleData[ptr++];
          sample.A5 = (1 / 255) * sampleData[ptr++];

          sample.R6 = (1 / 255) * sampleData[ptr++];
          sample.G6 = (1 / 255) * sampleData[ptr++];
          sample.B6 = (1 / 255) * sampleData[ptr++];
          sample.A6 = (1 / 255) * sampleData[ptr++];

          sample.R7 = (1 / 255) * sampleData[ptr++];
          sample.G7 = (1 / 255) * sampleData[ptr++];
          sample.B7 = (1 / 255) * sampleData[ptr++];
          sample.A7 = (1 / 255) * sampleData[ptr++];
        }

        freeBuffer(new MuBuffer(message.buffer));

        //clear stale light map probes
        const cutoffTick = now - LIGHTMAP_CACHE_AGE;
        const ids = Object.keys(index);
        for (let i = 0; i < ids.length; ++i) {
          const id = ids[i];
          const probe = index[id];
          if (probe && probe.lastAccess < cutoffTick) {
            LightProbeSchema.free(probe);
            delete index[id];
          }
        }
        break;

      case WorkerMessageType.UPDATE_CHUNK:
        const {
          ix,
          iy,
          iz,
          meshStart,
          meshEnd,
          meshBounds,
          alphaStart,
          alphaEnd,
          alphaBounds,
          fluidStart,
          fluidEnd,
          fluidBounds,
          data,
        } = message;
        // update chunk
        if (ix < cx && iy < cy && iz < cz) {
          const id = ix + cx * (iy + cy * iz);
          const chunk = voxelMesh.chunks[id];
          const buffer = new Uint8Array(data);
          updateChunk(
            state,
            chunk,
            buffer.subarray(meshStart, meshEnd),
            buffer.subarray(alphaStart, alphaEnd),
            buffer.subarray(fluidStart, fluidEnd),
            meshBounds,
            alphaBounds,
            fluidBounds,
          );

          chunk.posX = message.posX;
          chunk.posY = message.posY;
          chunk.posZ = message.posZ;
          chunk.negX = message.negX;
          chunk.negY = message.negY;
          chunk.negZ = message.negZ;

          vWorker.postMessage(
            {
              type: VoxelMessageType.RETURN_MEMORY,
              data,
            },
            [data],
          );

          if (!state.loadFinished) {
            state.loadEvents.task(`${ix}, ${iy}, ${iz}`, TaskTypeEnum.Mesh);
          }
        }
        break;

      case WorkerMessageType.CLEAR_CHUNK:
        // update chunk
        if (message.ix < cx && message.iy < cy && message.iz < cz) {
          const id = message.ix + cx * (message.iy + cy * message.iz);
          clearChunk(state, voxelMesh.chunks[id], message.solid);
        }
        break;

      case WorkerMessageType.POLL:
        voxelMesh.updateInProgress = false;
        break;

      case WorkerMessageType.UPDATE_HEIGHTMAP:
        // update heightmap
        const { x, y, width, height } = message;
        updateHeightmap(state, x, y, width, height, message.data);
        vWorker.postMessage(
          {
            type: VoxelMessageType.RETURN_MEMORY,
            data: message.data,
          },
          [message.data],
        );
        break;
      case WorkerMessageType.LOG:
        logger[levels.labels[message.message['level']] || 'info'](
          message.message,
        );
        break;
      case WorkerMessageType.UPDATE_VOXEL_VIEW:
        const { paddedVoxels } = state;
        if (!paddedVoxels.dataStart || !paddedVoxels.dataEnd) {
          break;
        }
        paddedVoxels.dataStart[0] = message.dataStart[0];
        paddedVoxels.dataStart[1] = message.dataStart[1];
        paddedVoxels.dataStart[2] = message.dataStart[2];

        paddedVoxels.dataEnd[0] = message.dataEnd[0];
        paddedVoxels.dataEnd[1] = message.dataEnd[1];
        paddedVoxels.dataEnd[2] = message.dataEnd[2];

        paddedVoxels.data.set(new Uint16Array(message.data));

        state.voxelState.voxelViewUpdating = false;
        break;
    }
  };
}

export function restoreVoxelWebGL(state: GameClientState) {
  const { getVoxelState, clearChunk } = voxelRenderer as VoxelRenderer<
    keyof VoxelTypeMap
  >;
  const voxelMesh = getVoxelState(state);
  for (let i = 0; i < voxelMesh.chunks.length; ++i) {
    clearChunk(state, voxelMesh.chunks[i], false);
  }
  const w = state.voxelWorker;
  if (w) {
    w.postMessage({
      type: VoxelMessageType.REMESH_ALL,
    });
  }
  state.light.pending = false;
}

export function tickVoxelClient(
  state: GameClientState,
  voxelClient: VoxelClient,
) {
  const { voxelState } = state;

  if (!voxelState.voxelUpdating && voxelState.pendingWrites.length) {
    const writes = voxelState.pendingWrites;
    for (let i = 0; i < writes.length; ++i) {
      const { x, y, z, b } = writes[i];
      voxelClient.setVoxelOptimistic(x, y, z, b);
    }
    voxelState.pendingWrites =
      ClientVoxelStateSchema.muData.pendingWrites.assign(writes, []);
  }

  // 每帧根据人物位置来更新地形数据
  const { dataStart, dataEnd } = state.voxel;
  // 如果地形比较小不需要做动态加载，就不需要执行这个方法
  if (!dataStart || !dataEnd) {
    return;
  }

  const player = getById(state.bodies, state.secret.id);
  if (!player) {
    return;
  }
  const { voxelDataChunkI, voxelDataChunkJ, voxelDataChunkK } =
    state.voxelState;
  const { chunkDimI, chunkDimJ, chunkDimK } = state.collision;

  const pi = Math.max(Math.min(player.px >> CHUNK_SHIFT, chunkDimI - 1), 0);
  const pj = Math.max(Math.min(player.py >> CHUNK_SHIFT, chunkDimJ - 1), 0);
  const pk = Math.max(Math.min(player.pz >> CHUNK_SHIFT, chunkDimK - 1), 0);

  const currStartI = state.voxelState.startI;
  const currStartJ = state.voxelState.startJ;
  const currStartK = state.voxelState.startK;

  const currEndI = currStartI + voxelDataChunkI;
  const currEndJ = currStartJ + voxelDataChunkJ;
  const currEndK = currStartK + voxelDataChunkK;

  // 如果当前角色位置不在动态地形范围内，需要设置voxelCollisionReady为false，让客户端暂停计算人物位置
  // 如果人物在动态地形范围内，设置voxelCollisionReady为true，客户端继续正常计算
  const playerInVoxels = !(
    pi < currStartI ||
    pi >= currEndI ||
    pj < currStartJ ||
    pj >= currEndJ ||
    pk < currStartK ||
    pk >= currEndK
  );
  if (state.voxelState.voxelCollisionReady !== playerInVoxels) {
    state.voxelState.voxelCollisionReady = playerInVoxels;
  }

  // 检查是否需要获取新的地形范围，做地形动态加载
  if (voxelState.voxelUpdating) {
    return;
  }

  const { startI, startJ, startK } = calcStartIJK(state, pi, pj, pk);

  const endI = startI + voxelDataChunkI;
  const endJ = startJ + voxelDataChunkJ;
  const endK = startK + voxelDataChunkK;

  const needToUpdate = (
    newChunk: number,
    currChunk: number,
    maxChunk: number,
  ) => {
    const diffAtEdge =
      newChunk !== currChunk && (newChunk === 0 || newChunk === maxChunk);
    return Math.abs(newChunk - currChunk) > 1 || diffAtEdge;
  };
  if (
    needToUpdate(startI, currStartI, chunkDimI - voxelDataChunkI) ||
    needToUpdate(startJ, currStartJ, chunkDimJ - voxelDataChunkJ) ||
    needToUpdate(startK, currStartK, chunkDimK - voxelDataChunkK)
  ) {
    const fetchHashes = FetchHashesSchema.alloc();
    fetchHashes.chunkIds.length = 0;
    fetchHashes.dirtyChunks.length = 0;

    fetchHashes.startI = startI;
    fetchHashes.startJ = startJ;
    fetchHashes.startK = startK;

    for (let z = startK; z < endK; z++) {
      for (let y = startJ; y < endJ; y++) {
        for (let x = startI; x < endI; x++) {
          const idx = x + chunkDimI * (y + chunkDimJ * z);
          fetchHashes.chunkIds.push(idx);
          // 跟原本物理模型不相交的chunk，以及边界处的chunk
          // 需要标记dirty来更新物理模型
          if (
            x <= currStartI ||
            x >= currStartI + voxelDataChunkI - 1 ||
            y <= currStartJ ||
            y >= currStartJ + voxelDataChunkJ - 1 ||
            z <= currStartK ||
            z >= currStartK + voxelDataChunkK - 1
          ) {
            fetchHashes.dirtyChunks.push(idx);
          }
        }
      }
    }

    voxelClient.fetchHashes(fetchHashes);
    state.voxelState.voxelViewUpdating = true;
    state.voxelState.voxelUpdating = true;
  }
}

export function tickVoxelWorker(state: GameClientState) {
  const { getVoxelState, initChunks, clearHeightTexture, resetChunks } =
    voxelRenderer as VoxelRenderer<keyof VoxelTypeMap>;
  const mesh = getVoxelState(state);
  const w = state.voxelWorker;
  if (!w) {
    return;
  }

  if (state.events.voxel.voxelReset) {
    clearHeightTexture(state);
    resetChunks(state, mesh);

    const { voxel, paddedVoxels, voxelState } = state;
    const [nx, ny, nz] = voxel.shape;
    mesh.nx = nx;
    mesh.ny = ny;
    mesh.nz = nz;

    const cx = nx >>> CHUNK_SHIFT;
    const cy = ny >>> CHUNK_SHIFT;
    const cz = nz >>> CHUNK_SHIFT;

    initChunks(state, mesh, cx, cy, cz);

    // send message to worker
    const copy = new Uint16Array(paddedVoxels.data);
    w.postMessage(
      {
        type: VoxelMessageType.RESET_VOXELS,
        shape: paddedVoxels.shape,
        stride: paddedVoxels.stride,
        offset: paddedVoxels.offset,
        data: copy.buffer,
        dataStart: paddedVoxels.dataStart,
        dataEnd: paddedVoxels.dataEnd,
        dataStride: paddedVoxels.dataStride,
        blockInfo: state.blockInfo,
        innerAO: voxelState.innerAO,
      },
      [copy.buffer],
    );

    // clear write queue
    mesh.workerWrites.length = 0;
    mesh.needsRemesh = true;
  } else {
    const writes = mesh.workerWrites;
    for (let i = 0; i < state.events.voxel.voxelChange.length; ++i) {
      const e = state.events.voxel.voxelChange[i];
      writes.push(state.voxel.index(e.x, e.y, e.z));
    }
    if (writes.length > 0) {
      mesh.needsRemesh = true;
      uniq(writes, compareNum);
    }
  }

  if (!mesh.updateInProgress) {
    const pendingProbes = state.light.pendingProbes;
    if (!state.light.pending && pendingProbes.length > 0) {
      const size = pendingProbes.length * 8 * 3;
      const buffer = allocBuffer(4 * size).buffer;
      const data = new Float32Array(buffer, 0, size);
      const nextIds = state.light.nextIds;
      nextIds.length = pendingProbes.length;
      let ptr = 0;
      for (let i = 0; i < pendingProbes.length; ++i) {
        const probe = pendingProbes[i];
        nextIds[i] = probe.id;

        const {
          X0,
          X1,
          X2,
          X3,
          X4,
          X5,
          X6,
          X7,
          Y0,
          Y1,
          Y2,
          Y3,
          Y4,
          Y5,
          Y6,
          Y7,
          Z0,
          Z1,
          Z2,
          Z3,
          Z4,
          Z5,
          Z6,
          Z7,
        } = probe;

        const cx = WI * (X0 + X1 + X2 + X3 + X4 + X5 + X6 + X7);
        const cy = WI * (Y0 + X1 + Y2 + Y3 + Y4 + Y5 + Y6 + Y7);
        const cz = WI * (Z0 + X1 + Z2 + Z3 + Z4 + Z5 + Z6 + Z7);

        probe.dirty = false;

        data[ptr++] = cx + W * X0;
        data[ptr++] = cy + W * Y0;
        data[ptr++] = cz + W * Z0;

        data[ptr++] = cx + W * X1;
        data[ptr++] = cy + W * Y1;
        data[ptr++] = cz + W * Z1;

        data[ptr++] = cx + W * X2;
        data[ptr++] = cy + W * Y2;
        data[ptr++] = cz + W * Z2;

        data[ptr++] = cx + W * X3;
        data[ptr++] = cy + W * Y3;
        data[ptr++] = cz + W * Z3;

        data[ptr++] = cx + W * X4;
        data[ptr++] = cy + W * Y4;
        data[ptr++] = cz + W * Z4;

        data[ptr++] = cx + W * X5;
        data[ptr++] = cy + W * Y5;
        data[ptr++] = cz + W * Z5;

        data[ptr++] = cx + W * X6;
        data[ptr++] = cy + W * Y6;
        data[ptr++] = cz + W * Z6;

        data[ptr++] = cx + W * X7;
        data[ptr++] = cy + W * Y7;
        data[ptr++] = cz + W * Z7;
      }
      pendingProbes.length = 0;

      w.postMessage(
        <VoxelUpdateLightMessage>{
          type: VoxelMessageType.UPDATE_LIGHTMAP,
          eyeX: state.camera.eye[0],
          eyeY: state.camera.eye[1],
          eyeZ: state.camera.eye[2],
          buffer,
          size,
        },
        [buffer],
      );

      state.light.pending = true;
    }

    if (mesh.needsRemesh) {
      const writes = mesh.workerWrites;
      const { getVoxelByPtr } = state.voxel;
      const data = new Uint32Array(2 * writes.length);

      for (let ptr = 0, i = 0; i < writes.length; ++i, ptr += 2) {
        const idx = (data[ptr] = writes[i]);
        data[ptr + 1] = getVoxelByPtr(idx);
      }

      w.postMessage(
        {
          type: VoxelMessageType.POLL,
          data: data.buffer,
        },
        [data.buffer],
      );

      writes.length = 0;
      mesh.updateInProgress = true;
      mesh.needsRemesh = false;
    }
  }
}

export function sampleLightBox(state: LightState, id: number): LightProbe {
  let probe = state.probes[id];
  if (!probe) {
    probe = LightProbeSchema.clone(LightProbeSchema.identity);
    probe.id = id;
    probe.dirty = false;
    probe.lastGeomAccess = 0;
    state.probes[id] = probe;
  }

  if (!probe.dirty) {
    probe.dirty = true;
    probe.lastAccess = Infinity;
    state.pendingProbes.push(probe);
  }

  return probe;
}

export function destroyVoxelWorker(state: GameClientState) {
  voxelRenderer.destroyChunks(state);
  const w = state.voxelWorker;
  if (w) {
    w.terminate();
  }
}

const BFS_X = 0;
const BFS_Y = 1;
const BFS_Z = 2;

let bfsQueueEnd = 0;
let bfsAdj = new Uint16Array(2 * 65536);
let bfsVisited = new Uint8Array(65536);
let bfsQueue = new Uint32Array(4 * 65536);
let bfsNX = 0;
let bfsNY = 0;
let bfsNZ = 0;
let bfsOffset = 0;
let bfsStepX = 0;
let bfsStepY = 0;
let bfsStepZ = 0;
let bfsAdjOffset = 0;
let bfsAdjStepX = 0;
let bfsAdjStepY = 0;
let bfsAdjStepZ = 0;

// const BFS_INFO = {
//     nx: 0,
//     ny: 0,
//     nz: 0,
//     adj: bfsAdj,
//     visited: bfsVisited,
//     queue: bfsQueue,
//     queueTail: 0,
// };

// (<any>window).BFS_INFO = BFS_INFO;

function bfsClear(nx: number, ny: number, nz: number) {
  // update dimensions
  bfsNX = 2 + nx;
  bfsNY = 2 + ny;
  bfsNZ = 2 + nz;
  bfsStepX = 4;
  bfsStepY = 4 * bfsNX;
  bfsStepZ = 4 * bfsNX * bfsNY;
  bfsOffset = bfsStepX + bfsStepY + bfsStepZ;
  bfsAdjStepX = 3;
  bfsAdjStepY = 3 * bfsNX;
  bfsAdjStepZ = 3 * bfsNX * bfsNY;
  bfsAdjOffset = bfsAdjStepX + bfsAdjStepY + bfsAdjStepZ;

  // reallocate adjacency list and queue if needed
  const size = 3 * bfsNX * bfsNY * bfsNZ;
  if (bfsAdj.length < size) {
    bfsAdj = new Uint16Array(2 * size);
    bfsVisited = new Uint8Array(size);
    bfsQueue = new Uint32Array(4 * size);
  }

  // adjacency graph
  for (let i = 0; i < size; ++i) {
    bfsAdj[i] = 0;
  }

  // clear visit flag
  for (let i = 0; i < size; ++i) {
    bfsVisited[i] = 0;
  }

  // clear queue
  bfsQueueEnd = 0;
}

function bfsPushFace(nodePtr: number, adjPtr: number) {
  if (bfsVisited[adjPtr]) {
    return;
  }
  bfsVisited[adjPtr] = 1;
  bfsQueue[bfsQueueEnd++] = nodePtr;
}

function bfsPushChunk(nodePtr: number, adjPtr: number, adj: number) {
  if (adj & ChunkVisibilityFlags.NEG_X) {
    bfsPushFace(nodePtr + BFS_X, adjPtr + BFS_X);
  }
  if (adj & ChunkVisibilityFlags.NEG_Y) {
    bfsPushFace(nodePtr + BFS_Y, adjPtr + BFS_Y);
  }
  if (adj & ChunkVisibilityFlags.NEG_Z) {
    bfsPushFace(nodePtr + BFS_Z, adjPtr + BFS_Z);
  }
  if (adj & ChunkVisibilityFlags.POS_X) {
    bfsPushFace(nodePtr + bfsStepX + BFS_X, adjPtr + bfsAdjStepX + BFS_X);
  }
  if (adj & ChunkVisibilityFlags.POS_Y) {
    bfsPushFace(nodePtr + bfsStepY + BFS_Y, adjPtr + bfsAdjStepY + BFS_Y);
  }
  if (adj & ChunkVisibilityFlags.POS_Z) {
    bfsPushFace(nodePtr + bfsStepZ + BFS_Z, adjPtr + bfsAdjStepZ + BFS_Z);
  }
}

function bfs() {
  for (let i = 0; i < bfsQueueEnd; ++i) {
    const code = bfsQueue[i];
    const chunkId = code >> 2;
    const faceId = code & 3;
    const adjPtr = 3 * chunkId;
    const nodePtr = code & ~3;
    let adj = bfsAdj[adjPtr + faceId];

    if (adj & ChunkVisibilityFlags.MASK) {
      bfsPushChunk(nodePtr, adjPtr, adj);
    }

    adj >>= 6;
    if (adj) {
      let nodeOpp = nodePtr;
      let adjOpp = adjPtr;
      if (faceId === 0) {
        nodeOpp -= bfsStepX;
        adjOpp -= bfsAdjStepX;
      } else if (faceId === 1) {
        nodeOpp -= bfsStepY;
        adjOpp -= bfsAdjStepY;
      } else {
        nodeOpp -= bfsStepZ;
        adjOpp -= bfsAdjStepZ;
      }
      bfsPushChunk(nodeOpp, adjOpp, adj);
    }
  }
}

export function prepareVoxels(state: GameClientState) {
  const voxels = voxelRenderer.getVoxelState(state);
  const {
    parallaxChunks,
    noParallaxChunks,
    alphaParallaxChunks,
    alphaNoParallaxChunks,
    fluidChunks,
  } = voxels;

  // Clear out all frame geometry
  parallaxChunks.length =
    noParallaxChunks.length =
    alphaParallaxChunks.length =
    alphaNoParallaxChunks.length =
    fluidChunks.length =
      0;
  voxels.parallaxChunksKey = '';
  voxels.noParallaxChunksKey = '';
  voxels.alphaParallaxChunksKey = '';
  voxels.alphaNoParallaxChunksKey = '';
  voxels.fluidChunksKey = '';

  const eye = state.camera.eye;
  const eyeX = eye[0];
  const eyeY = eye[1];
  const eyeZ = eye[2];

  const frustum = state.camera.frustum;

  const ncx = voxels.nx >> CHUNK_SHIFT;
  const ncy = voxels.ny >> CHUNK_SHIFT;
  const ncz = voxels.nz >> CHUNK_SHIFT;

  // clear bfs queue
  bfsClear(ncx, ncy, ncz);

  const x0 = Math.floor(Math.min(ncx, Math.max(0, frustum.lox / CHUNK_SIZE)));
  const y0 = Math.floor(Math.min(ncy, Math.max(0, frustum.loy / CHUNK_SIZE)));
  const z0 = Math.floor(Math.min(ncz, Math.max(0, frustum.loz / CHUNK_SIZE)));

  const x1 = Math.ceil(Math.min(ncx, Math.max(0, frustum.hix / CHUNK_SIZE)));
  const y1 = Math.ceil(Math.min(ncy, Math.max(0, frustum.hiy / CHUNK_SIZE)));
  const z1 = Math.ceil(Math.min(ncz, Math.max(0, frustum.hiz / CHUNK_SIZE)));

  const parallaxDistance = state.settings.parallaxMap
    ? state.settings.parallaxDistance
    : -Infinity;

  const { nearX0, nearX1, nearY0, nearY1, nearZ0, nearZ1 } = frustum;

  for (let iz = z0; iz < z1; ++iz) {
    for (let iy = y0; iy < y1; ++iy) {
      for (let ix = x0; ix < x1; ++ix) {
        const i = ix + ncx * (iy + ncy * iz);

        const cx = ix << CHUNK_SHIFT;
        const cy = iy << CHUNK_SHIFT;
        const cz = iz << CHUNK_SHIFT;

        // clear visibility flag
        const chunk = voxels.chunks[i];
        chunk.visible = false;

        // compute visibile face masks
        const frustumMask = testFrustumChunkFaces(frustum, cx, cy, cz);
        if (!frustumMask) {
          continue;
        }

        // face orientation mask
        const orientationMask =
          (cx <= eyeX ? ChunkVisibilityFlags.NEG_X : 0) |
          (cy <= eyeY ? ChunkVisibilityFlags.NEG_Y : 0) |
          (cz <= eyeZ ? ChunkVisibilityFlags.NEG_Z : 0) |
          (eyeX <= cx + CHUNK_SIZE ? ChunkVisibilityFlags.POS_X : 0) |
          (eyeY <= cy + CHUNK_SIZE ? ChunkVisibilityFlags.POS_Y : 0) |
          (eyeZ <= cz + CHUNK_SIZE ? ChunkVisibilityFlags.POS_Z : 0);

        // link nodes in visibility graph
        const nodePtr =
          bfsOffset + ix * bfsStepX + iy * bfsStepY + iz * bfsStepZ;
        const adjPtr =
          bfsAdjOffset + ix * bfsAdjStepX + iy * bfsAdjStepY + iz * bfsAdjStepZ;

        // check for starting chunk
        if (
          nearX1 < cx ||
          cx + CHUNK_SIZE < nearX0 ||
          nearY1 < cy ||
          cy + CHUNK_SIZE < nearY0 ||
          nearZ1 < cz ||
          cz + CHUNK_SIZE < nearZ0
        ) {
          // eye is outside chunk, so instead we update the adjacency matrix
          const outMask = orientationMask & frustumMask;
          const inMask = ~orientationMask & frustumMask;
          if (inMask & ChunkVisibilityFlags.NEG_X) {
            const ptr = adjPtr + BFS_X;
            bfsAdj[ptr] |= outMask & chunk.negX;
            if (ix === 0) {
              bfsPushFace(nodePtr + BFS_X, ptr);
            }
          }
          if (inMask & ChunkVisibilityFlags.NEG_Y) {
            const ptr = adjPtr + BFS_Y;
            bfsAdj[ptr] |= outMask & chunk.negY;
            if (iy === 0) {
              bfsPushFace(nodePtr + BFS_Y, ptr);
            }
          }
          if (inMask & ChunkVisibilityFlags.NEG_Z) {
            const ptr = adjPtr + BFS_Z;
            bfsAdj[ptr] |= outMask & chunk.negZ;
            if (iz === 0) {
              bfsPushFace(nodePtr + BFS_Z, ptr);
            }
          }
          if (inMask & ChunkVisibilityFlags.POS_X) {
            const ptr = adjPtr + bfsAdjStepX + BFS_X;
            bfsAdj[ptr] |= (outMask & chunk.posX) << 6;
            if (ix === ncx - 1) {
              bfsPushFace(nodePtr + bfsStepX + BFS_X, ptr);
            }
          }
          if (inMask & ChunkVisibilityFlags.POS_Y) {
            const ptr = adjPtr + bfsAdjStepY + BFS_Y;
            bfsAdj[ptr] |= (outMask & chunk.posY) << 6;
            if (iy === ncy - 1) {
              bfsPushFace(nodePtr + bfsStepY + BFS_Y, ptr);
            }
          }
          if (inMask & ChunkVisibilityFlags.POS_Z) {
            const ptr = adjPtr + bfsAdjStepZ + BFS_Z;
            bfsAdj[ptr] |= (outMask & chunk.posZ) << 6;
            if (iz === ncz - 1) {
              bfsPushFace(nodePtr + bfsStepZ + BFS_Z, ptr);
            }
          }
        } else {
          // if near clip is inside a chunk then push all faces into queue
          bfsPushChunk(nodePtr, adjPtr, orientationMask & frustumMask);
        }
      }
    }
  }

  bfs();

  for (let iz = z0; iz < z1; ++iz) {
    for (let iy = y0; iy < y1; ++iy) {
      for (let ix = x0; ix < x1; ++ix) {
        // check chunk visibility
        const adjPtr =
          bfsAdjOffset + ix * bfsAdjStepX + iy * bfsAdjStepY + iz * bfsAdjStepZ;

        const visCount =
          bfsVisited[adjPtr + BFS_X] +
          bfsVisited[adjPtr + BFS_Y] +
          bfsVisited[adjPtr + BFS_Z] +
          bfsVisited[adjPtr + bfsAdjStepX + BFS_X] +
          bfsVisited[adjPtr + bfsAdjStepY + BFS_Y] +
          bfsVisited[adjPtr + bfsAdjStepZ + BFS_Z];
        if (visCount === 0) {
          continue;
        }

        const cx = ix << CHUNK_SHIFT;
        const cy = iy << CHUNK_SHIFT;
        const cz = iz << CHUNK_SHIFT;

        const chunkIdx = ix + ncx * (iy + ncy * iz);
        const chunk = voxels.chunks[chunkIdx];
        chunk.visible = true;

        // push geometry into quque
        const { geom, alphaGeom, fluidGeom } = chunk;
        const d = Math.max(
          1,
          Math.sqrt(
            Math.pow(cx + 0.5 * CHUNK_SIZE - eye[0], 2) +
              Math.pow(cy + 0.5 * CHUNK_SIZE - eye[1], 2) +
              Math.pow(cz + 0.5 * CHUNK_SIZE - eye[2], 2),
          ) -
            3 * CHUNK_SIZE,
        );
        if (0 < geom.count) {
          if (
            visCount === 6 ||
            testFrustumBox(
              frustum,
              geom.minX,
              geom.minY,
              geom.minZ,
              geom.maxX,
              geom.maxY,
              geom.maxZ,
            )
          ) {
            geom.distance = d;
            if (d <= parallaxDistance) {
              parallaxChunks.push(geom);
              voxels.parallaxChunksKey += `${chunkIdx}`;
            } else {
              noParallaxChunks.push(geom);
              voxels.noParallaxChunksKey += `${chunkIdx}`;
            }
          }
        }
        if (0 < alphaGeom.count) {
          if (
            visCount === 6 ||
            testFrustumBox(
              frustum,
              alphaGeom.minX,
              alphaGeom.minY,
              alphaGeom.minZ,
              alphaGeom.maxX,
              alphaGeom.maxY,
              alphaGeom.maxZ,
            )
          ) {
            alphaGeom.distance = d;
            if (d <= parallaxDistance) {
              alphaParallaxChunks.push(alphaGeom);
              voxels.alphaParallaxChunksKey += `${chunkIdx}`;
            } else {
              alphaNoParallaxChunks.push(alphaGeom);
              voxels.alphaNoParallaxChunksKey += `${chunkIdx}`;
            }
          }
        }
        if (0 < fluidGeom.count) {
          if (
            visCount === 6 ||
            testFrustumBox(
              frustum,
              fluidGeom.minX,
              fluidGeom.minY,
              fluidGeom.minZ,
              fluidGeom.maxX,
              fluidGeom.maxY,
              fluidGeom.maxZ,
            )
          ) {
            fluidGeom.distance = d;
            fluidChunks.push(fluidGeom);
            voxels.fluidChunksKey += `${chunkIdx}`;
          }
        }
      }
    }
  }
}

function renderVoxelsShadow(
  environment: EnvironmentState,
  voxelMesh: GLVoxelState | GPUVoxelState,
  shadowFrustum: Frustum,
): void {
  const voxels = voxelMesh;
  const shadowChunks = voxels.shadowChunks;
  shadowChunks.length = 0;
  voxels.shadowChunksKey = '';

  const frustum = shadowFrustum;

  const ncx = voxels.nx / CHUNK_SIZE;
  const ncy = voxels.ny / CHUNK_SIZE;
  const ncz = voxels.nz / CHUNK_SIZE;

  const x0 = Math.floor(Math.min(ncx, Math.max(0, frustum.lox / CHUNK_SIZE)));
  const y0 = Math.floor(Math.min(ncy, Math.max(0, frustum.loy / CHUNK_SIZE)));
  const z0 = Math.floor(Math.min(ncz, Math.max(0, frustum.loz / CHUNK_SIZE)));

  const x1 = Math.ceil(Math.min(ncx, Math.max(0, frustum.hix / CHUNK_SIZE)));
  const y1 = Math.ceil(Math.min(ncy, Math.max(0, frustum.hiy / CHUNK_SIZE)));
  const z1 = Math.ceil(Math.min(ncz, Math.max(0, frustum.hiz / CHUNK_SIZE)));

  bfsClear(ncx, ncy, ncz);

  const dirX = environment.sunDirection[0];
  const dirY = environment.sunDirection[1];
  const dirZ = environment.sunDirection[2];

  const orientationMask =
    (dirX > 0 ? ChunkVisibilityFlags.NEG_X : ChunkVisibilityFlags.POS_X) |
    (dirY > 0 ? ChunkVisibilityFlags.NEG_Y : ChunkVisibilityFlags.POS_Y) |
    (dirZ > 0 ? ChunkVisibilityFlags.NEG_Z : ChunkVisibilityFlags.POS_Z);

  for (let iz = z0; iz < z1; ++iz) {
    for (let iy = y0; iy < y1; ++iy) {
      for (let ix = x0; ix < x1; ++ix) {
        const i = ix + ncx * (iy + ncy * iz);
        const chunk = voxels.chunks[i];
        chunk.visible = false;

        const cx = ix << CHUNK_SHIFT;
        const cy = iy << CHUNK_SHIFT;
        const cz = iz << CHUNK_SHIFT;

        const frustumMask = testFrustumChunkFaces(frustum, cx, cy, cz);
        if (!frustumMask) {
          continue;
        }

        // link nodes in visibility graph
        const nodePtr =
          bfsOffset + ix * bfsStepX + iy * bfsStepY + iz * bfsStepZ;
        const adjPtr =
          bfsAdjOffset + ix * bfsAdjStepX + iy * bfsAdjStepY + iz * bfsAdjStepZ;

        // eye is outside chunk, so instead we update the adjacency matrix
        const outMask = orientationMask & frustumMask;
        const inMask = ~orientationMask & frustumMask;
        if (inMask & ChunkVisibilityFlags.NEG_X) {
          const ptr = adjPtr + BFS_X;
          bfsAdj[ptr] |= outMask & chunk.negX;
          if (ix === 0) {
            bfsPushFace(nodePtr + BFS_X, ptr);
          }
        }
        if (inMask & ChunkVisibilityFlags.NEG_Y) {
          const ptr = adjPtr + BFS_Y;
          bfsAdj[ptr] |= outMask & chunk.negY;
          if (iy === 0) {
            bfsPushFace(nodePtr + BFS_Y, ptr);
          }
        }
        if (inMask & ChunkVisibilityFlags.NEG_Z) {
          const ptr = adjPtr + BFS_Z;
          bfsAdj[ptr] |= outMask & chunk.negZ;
          if (iz === 0) {
            bfsPushFace(nodePtr + BFS_Z, ptr);
          }
        }
        if (inMask & ChunkVisibilityFlags.POS_X) {
          const ptr = adjPtr + bfsAdjStepX + BFS_X;
          bfsAdj[ptr] |= (outMask & chunk.posX) << 6;
          if (ix === ncx - 1) {
            bfsPushFace(nodePtr + bfsStepX + BFS_X, ptr);
          }
        }
        if (inMask & ChunkVisibilityFlags.POS_Y) {
          const ptr = adjPtr + bfsAdjStepY + BFS_Y;
          bfsAdj[ptr] |= (outMask & chunk.posY) << 6;
          if (iy === ncy - 1) {
            bfsPushFace(nodePtr + bfsStepY + BFS_Y, ptr);
          }
        }
        if (inMask & ChunkVisibilityFlags.POS_Z) {
          const ptr = adjPtr + bfsAdjStepZ + BFS_Z;
          bfsAdj[ptr] |= (outMask & chunk.posZ) << 6;
          if (iz === ncz - 1) {
            bfsPushFace(nodePtr + bfsStepZ + BFS_Z, ptr);
          }
        }
      }
    }
  }

  bfs();

  for (let iz = z0; iz < z1; ++iz) {
    for (let iy = y0; iy < y1; ++iy) {
      for (let ix = x0; ix < x1; ++ix) {
        // check chunk visibility
        const adjPtr =
          bfsAdjOffset + ix * bfsAdjStepX + iy * bfsAdjStepY + iz * bfsAdjStepZ;

        const visCount =
          bfsVisited[adjPtr + BFS_X] +
          bfsVisited[adjPtr + BFS_Y] +
          bfsVisited[adjPtr + BFS_Z] +
          bfsVisited[adjPtr + bfsAdjStepX + BFS_X] +
          bfsVisited[adjPtr + bfsAdjStepY + BFS_Y] +
          bfsVisited[adjPtr + bfsAdjStepZ + BFS_Z];
        if (visCount === 0) {
          continue;
        }

        const i = ix + ncx * (iy + ncy * iz);
        const chunk = voxels.chunks[i];
        chunk.visible = true;

        const geom = chunk.geom;
        if (
          0 < geom.count &&
          (visCount === 6 ||
            testFrustumBox(
              frustum,
              geom.minX,
              geom.minY,
              geom.minZ,
              geom.maxX,
              geom.maxY,
              geom.maxZ,
            ))
        ) {
          geom.distance = dirX * ix + dirY * iy + dirZ * iz;
          shadowChunks.push(geom);
          voxels.shadowChunksKey += `${i}`;
        }
      }
    }
  }
}
export { renderVoxelsShadow };
