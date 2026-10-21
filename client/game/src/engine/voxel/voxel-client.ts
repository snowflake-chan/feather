import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { MuScheduler } from '@box/mudb/scheduler';
import { GameClientState } from '../game-client-schema';
import {
  VoxelProtocol,
  VoxelWriteSchema,
  BatchWrite,
  FetchHashes,
  HashesResponse,
} from '@box/schema/voxel/voxel-protocol';
import {
  rebuildCollisionChunk,
  intializeCollision,
  setBlockIndex,
} from '@box/schema/voxel/voxel-collision';
import { Hash } from '@box/schema/content-server/index';
import { MuReadStream } from '@box/mudb/stream';
import {
  boxDecompress,
  blitBoxesToChunk,
  deinterleave3,
} from '@box/schema/voxel/box-decode';
import {
  CHUNK_SHIFT,
  CHUNK_MASK,
  CHUNK_SIZE,
} from '@box/schema/voxel/voxel-collision-schema';
import { freeVoxels, allocVoxels } from '@box/utils/voxel';
import {
  ClientVoxelStateSchema,
  ClientVoxelChunkSchema,
} from './voxel-client-schema';
import { VoxelChangeEventSchema } from '@box/schema/events/voxel-event-schema';
import {
  VoxelCollisionBoxList,
  VoxelCollisionBoxListSchema,
} from '@box/schema/utils/rbush-schema';
import { BlockInfoSchema } from '@box/schema/voxel/block-schema';
import { unpackBlockIndex } from '@box/schema/voxel/blocks';
import { TaskTypeEnum } from '@box/utils/loading/loading-schema';
import EventEmitter from 'events';
import { clientConfig } from 'src/config/client';
import { ChunkBoxes, VoxelMessageType } from './voxel-worker-schema';

function clamp(lo: number, hi: number, v: number) {
  return Math.max(Math.min(v, hi), lo);
}

function getChunks(configChunks?: number) {
  // 编辑模式/配置为undefined的情况下不使用按需加载地形，即chunks是Infinity
  if (clientConfig.mode === 'edit' || configChunks === undefined) {
    return Infinity;
  }
  return configChunks;
}

export function calcStartIJK(
  state: GameClientState,
  pi: number,
  pj: number,
  pk: number,
) {
  const halfChunks = getChunks(clientConfig.MAX_HALF_CHUNKS);
  const halfYChunks = getChunks(clientConfig.MAX_Y_HALF_CHUNKS);

  const { voxelDataChunkI, voxelDataChunkJ, voxelDataChunkK } =
    state.voxelState;
  const { chunkDimI, chunkDimJ, chunkDimK } = state.collision;
  return {
    startI: clamp(0, chunkDimI - voxelDataChunkI, pi - halfChunks),
    startJ: clamp(0, chunkDimJ - voxelDataChunkJ, pj - halfYChunks),
    startK: clamp(0, chunkDimK - voxelDataChunkK, pk - halfChunks),
  };
}

function markChunk(
  state: GameClientState,
  chunkI: number,
  chunkJ: number,
  chunkK: number,
) {
  const { chunkDimI, chunkDimJ } = state.collision;
  const voxelState = state.voxelState;
  const c =
    voxelState.chunks[chunkI + chunkDimI * (chunkJ + chunkDimJ * chunkK)];
  if (!c.dirty) {
    voxelState.dirty.push(c);
  }
  c.dirty = true;
}

function markVoxel(state: GameClientState, i: number, j: number, k: number) {
  const { chunkDimI, chunkDimJ, chunkDimK } = state.collision;

  // chunk idx
  const chunkI = i >> CHUNK_SHIFT;
  const chunkJ = j >> CHUNK_SHIFT;
  const chunkK = k >> CHUNK_SHIFT;

  // mask === 0 和 === CHUNK_MASK 代表此地形在本chunk的边界处
  const iMask = i & CHUNK_MASK;
  const jMask = j & CHUNK_MASK;
  const kMask = k & CHUNK_MASK;

  markChunk(state, chunkI, chunkJ, chunkK);

  // 更改的地形在chunk边界处会影响隔壁chunk的物理模型
  if (chunkI > 0 && iMask === 0) {
    markChunk(state, chunkI - 1, chunkJ, chunkK);
  }
  if (chunkI < chunkDimI - 1 && iMask === CHUNK_MASK) {
    markChunk(state, chunkI + 1, chunkJ, chunkK);
  }
  if (chunkJ > 0 && jMask === 0) {
    markChunk(state, chunkI, chunkJ - 1, chunkK);
  }
  if (chunkJ < chunkDimJ - 1 && jMask === CHUNK_MASK) {
    markChunk(state, chunkI, chunkJ + 1, chunkK);
  }
  if (chunkK > 0 && kMask === 0) {
    markChunk(state, chunkI, chunkJ, chunkK - 1);
  }
  if (chunkK < chunkDimK - 1 && kMask === CHUNK_MASK) {
    markChunk(state, chunkI, chunkJ, chunkK + 1);
  }
}

const MAX_DIRTY_LEN = 10;
/**
 * 在voxelView做动态加载的时候积攒的需要更新的地形物理模型个数
 */
let voxelUpdatingNum = 0;
export function updateClientGeometry(state: GameClientState) {
  if (state.voxelState.voxelViewUpdating) {
    // voxelView正在加载，记录累计的物理模型个数
    voxelUpdatingNum = state.voxelState.dirty.length;
    return;
  }
  // update all server geometry
  const dirty = state.voxelState.dirty.splice(
    0,
    Math.min(MAX_DIRTY_LEN, state.voxelState.dirty.length),
  );
  if (voxelUpdatingNum) {
    voxelUpdatingNum = Math.max(0, voxelUpdatingNum - dirty.length);
    // voxelUpdatingNum为0表示voxelView加载期间积攒的物理模型已全部rebuild完成
    // 此刻地形全部加载完成，需要重置数据：
    // 1. 设置新的startI,startJ,startK
    // 2. 设置updating为false
    if (!voxelUpdatingNum) {
      if (state.paddedVoxels.dataStart) {
        state.voxelState.startI =
          state.paddedVoxels.dataStart[0] >> CHUNK_SHIFT;
        state.voxelState.startJ =
          state.paddedVoxels.dataStart[1] >> CHUNK_SHIFT;
        state.voxelState.startK =
          state.paddedVoxels.dataStart[2] >> CHUNK_SHIFT;
      }
      state.voxelState.voxelUpdating = false;
    }
  }
  setBlockIndex(state.blockIndex);
  for (let i = 0; i < dirty.length; ++i) {
    const c = dirty[i];
    rebuildCollisionChunk(c.voxels, c.geom);
    c.dirty = false;
  }
}

async function updateBlockInfo(state: GameClientState, blockInfoHash: string) {
  if (blockInfoHash === state.blockInfoHash) {
    return null;
  }
  if (!state.loadFinished) {
    state.loadEvents.startTask('updateBlockInfoTable', TaskTypeEnum.Normal);
  }
  const blockInfo = await state.content.fetchSchema(
    BlockInfoSchema,
    blockInfoHash,
  );
  if (!blockInfo) {
    state.logger.error(`error loading block info: ${blockInfoHash}`);
    return null;
  }
  if (!state.loadFinished) {
    state.loadEvents.endTask('blockInfoTableUpdated', TaskTypeEnum.Normal);
  }
  return blockInfo;
}

export enum VoxelClientEvents {
  Ready = 'ready',
}

export class VoxelClient extends EventEmitter {
  private _protocol: MuClientProtocol<typeof VoxelProtocol>;
  private _state: GameClientState;
  private _scheduler: MuScheduler;

  private _processPendingRuns(runs: BatchWrite) {
    let nextOffset = 0;
    let nextBlock = 0;
    for (let i = 0; i < runs.length; ++i) {
      const { offset, count, block } = runs[i];
      nextOffset += offset;
      nextBlock += block;
      for (let j = 0; j < count; ++j) {
        const write = VoxelWriteSchema.alloc();
        write.x = deinterleave3(nextOffset);
        write.y = deinterleave3(nextOffset >>> 1);
        write.z = deinterleave3(nextOffset >>> 2);
        write.b = nextBlock;
        this._state.voxelState.pendingWrites.push(write);
        nextOffset++;
      }
    }
  }

  private _pendingChunks: {
    [rpcId: number]: {
      resolve: (boxes: VoxelCollisionBoxList) => void;
      reject: (err: any) => void;
    };
  } = {};
  private _rpcCounter = 0;
  private _fetchChunk(chunkId: number): Promise<VoxelCollisionBoxList> {
    return new Promise((resolve, reject) => {
      const rpcId = ++this._rpcCounter;
      this._pendingChunks[rpcId] = { resolve, reject };
      this._protocol.server.message.fetchChunk({ rpcId, chunkId });
    });
  }

  private async _resetClientVoxels(
    resetCounter: number,
    nx: number,
    ny: number,
    nz: number,
    hashes: Hash[],
    blockInfoHash: string,
    positionX: number,
    positionY: number,
    positionZ: number,
  ) {
    const state = this._state;
    const updateBlocks = updateBlockInfo(state, blockInfoHash);

    const pending = hashes.map(async (hash, chunkId) => {
      if (!state.loadFinished) {
        this._state.loadEvents.startTask(
          hash || '' + chunkId,
          TaskTypeEnum.Chunk,
        );
      }
      const bytes = hash ? await state.content.retrieve(hash) : null;
      if (!bytes) {
        if (hash) {
          this._state.logger.warn(
            'failed to fetch ' + hash + ' for chunk ' + chunkId,
          );
        }
        if (!state.loadFinished) {
          this._state.loadEvents.task(hash || '' + chunkId, TaskTypeEnum.Steam);
        }
        const r = await this._fetchChunk(chunkId);
        if (!state.loadFinished) {
          this._state.loadEvents.endTask(
            hash || '' + chunkId,
            TaskTypeEnum.Steam,
          );
        }
        return r;
      }
      const stream = new MuReadStream(bytes);
      if (!state.loadFinished) {
        this._state.loadEvents.endTask(hash, TaskTypeEnum.Decompress);
      }
      return boxDecompress(stream);
    });

    const chunkBoxes: VoxelCollisionBoxList[] = new Array(pending.length);
    for (let i = 0; i < pending.length; ++i) {
      const b = await pending[i];
      if (!b) {
        // FIXME: as a fallback, maybe query server if a chunk hash is missing
        throw new Error(`error loading chunk hash: ${hashes[i]}`);
      }
      chunkBoxes[i] = b;
    }

    if (resetCounter !== state.voxelState.resetCounter) {
      return false;
    }

    // reallocate voxels
    let start: [number, number, number] | undefined = undefined;
    let end: [number, number, number] | undefined = undefined;

    const cx = (state.collision.chunkDimI = nx >> CHUNK_SHIFT);
    const cy = (state.collision.chunkDimJ = ny >> CHUNK_SHIFT);
    const cz = (state.collision.chunkDimK = nz >> CHUNK_SHIFT);

    const halfChunks = getChunks(clientConfig.MAX_HALF_CHUNKS);
    if (isFinite(halfChunks)) {
      const maxChunks = halfChunks * 2 + 1;
      state.voxelState.voxelDataChunkI = Math.min(cx, maxChunks);
      state.voxelState.voxelDataChunkK = Math.min(cz, maxChunks);
    } else {
      state.voxelState.voxelDataChunkI = cx;
      state.voxelState.voxelDataChunkK = cz;
    }

    const halfYChunks = getChunks(clientConfig.MAX_Y_HALF_CHUNKS);
    if (isFinite(halfYChunks)) {
      const maxYChunks = halfYChunks * 2 + 1;
      state.voxelState.voxelDataChunkJ = Math.min(cy, maxYChunks);
    } else {
      state.voxelState.voxelDataChunkJ = cy;
    }

    // 地形大于client最大承载力，做地形动态加载
    if (
      cx > state.voxelState.voxelDataChunkI ||
      cy > state.voxelState.voxelDataChunkJ ||
      cz > state.voxelState.voxelDataChunkK
    ) {
      const { startI, startJ, startK } = calcStartIJK(
        state,
        positionX >> CHUNK_SHIFT,
        positionY >> CHUNK_SHIFT,
        positionZ >> CHUNK_SHIFT,
      );
      state.voxelState.startI = startI;
      state.voxelState.startJ = startJ;
      state.voxelState.startK = startK;

      start = [
        CHUNK_SIZE * state.voxelState.startI,
        CHUNK_SIZE * state.voxelState.startJ,
        CHUNK_SIZE * state.voxelState.startK,
      ];
      end = [
        start[0] + CHUNK_SIZE * state.voxelState.voxelDataChunkI + 2,
        start[1] + CHUNK_SIZE * state.voxelState.voxelDataChunkJ + 2,
        start[2] + CHUNK_SIZE * state.voxelState.voxelDataChunkK + 2,
      ];
    }

    if (state.paddedVoxels) {
      const [px, py, pz] = state.paddedVoxels.shape;
      if (px !== nx + 2 || py !== ny + 2 || pz !== nz + 2) {
        freeVoxels(state.paddedVoxels);
        state.paddedVoxels = allocVoxels(2 + nx, 2 + ny, 2 + nz, start, end);
      }
    } else {
      state.paddedVoxels = allocVoxels(2 + nx, 2 + ny, 2 + nz, start, end);
    }

    // clear voxel array
    state.paddedVoxels.fill(0);

    // create voxel reference
    const voxels = (state.voxel = state.paddedVoxels.slice(
      [1, 1, 1],
      [1 + nx, 1 + ny, 1 + nz],
    ));

    // first pass: initialize voxel state chunks and copy boxes
    const voxelState = state.voxelState;
    const serverChunks = (voxelState.chunks =
      ClientVoxelStateSchema.muData.chunks.assign(voxelState.chunks, []));
    for (let z = 0; z < nz; z += CHUNK_SIZE) {
      for (let y = 0; y < ny; y += CHUNK_SIZE) {
        for (let x = 0; x < nx; x += CHUNK_SIZE) {
          const ptr = voxelState.chunks.length;
          const chunk = ClientVoxelChunkSchema.alloc();
          chunk.dirty = false;
          chunk.voxels = voxels.slice(
            [x, y, z],
            [x + CHUNK_SIZE, y + CHUNK_SIZE, z + CHUNK_SIZE],
          );
          const boxes = chunkBoxes[ptr];
          blitBoxesToChunk(chunk.voxels, boxes);
          VoxelCollisionBoxListSchema.free(boxes);
          serverChunks.push(chunk);
        }
      }
    }

    // next apply all pending writes
    const writes = voxelState.pendingWrites;
    for (let i = 0; i < writes.length; ++i) {
      const { x, y, z, b } = writes[i];
      voxels.setVoxel(x, y, z, b);
    }
    voxelState.pendingWrites =
      ClientVoxelStateSchema.muData.pendingWrites.assign(writes, []);

    // wait for block index update
    const blockInfo = await updateBlocks;
    if (blockInfo) {
      state.blockInfoHash = blockInfoHash;
      BlockInfoSchema.assign(state.blockInfo, blockInfo);
      unpackBlockIndex(state.blockInfo, state.blockIndex);
    }

    // initialize collision geometry
    intializeCollision(state.blockIndex, state.collision, state.voxel);

    // update chunk references
    for (let i = 0; i < serverChunks.length; ++i) {
      serverChunks[i].geom = state.collision.chunks[i];
    }

    // update ready flags, clear dirty queue
    voxelState.ready = true;
    voxelState.dirty.length = 0;

    // notify voxel reset event
    state.events.voxel.voxelReset = true;

    if (!state.loadFinished) {
      this._state.loadEvents.endTask('voxelsDownloaded', TaskTypeEnum.Normal);
      state.logger.info(
        'voxel ready ' +
          ((Date.now() - state.enginePreconnectTimeStamp) / 1000).toFixed(2),
      );
    }

    return true;
  }

  private _setVoxel(x: number, y: number, z: number, b: number) {
    const state = this._state;
    const voxel = state.voxel;
    const p = voxel.getVoxel(x, y, z);
    if (p !== b) {
      const change = VoxelChangeEventSchema.alloc();
      change.x = x;
      change.y = y;
      change.z = z;
      change.b = b;
      change.p = p;
      state.events.voxel.voxelChange.push(change);
      voxel.setVoxel(x, y, z, b);
      markVoxel(state, x, y, z);
    }
  }

  private _processActiveRuns(runs: BatchWrite) {
    let nextOffset = 0;
    let nextBlock = 0;
    for (let i = 0; i < runs.length; ++i) {
      const { offset, count, block } = runs[i];
      nextOffset += offset;
      nextBlock += block;
      for (let j = 0; j < count; ++j) {
        const x = deinterleave3(nextOffset);
        const y = deinterleave3(nextOffset >>> 1);
        const z = deinterleave3(nextOffset >>> 2);
        this._setVoxel(x, y, z, nextBlock);
        ++nextOffset;
      }
    }
  }

  private async _hashesResponse(info: HashesResponse) {
    const w = this._state.voxelWorker;
    if (!w) {
      this._state.voxelState.voxelUpdating = false;
      return;
    }

    const { voxelState, content, logger } = this._state;

    info.dirtyChunks.forEach((idx) => {
      const chunk = voxelState.chunks[idx];
      if (!chunk) {
        return;
      }
      if (!chunk.dirty) {
        voxelState.dirty.push(chunk);
      }
      chunk.dirty = true;
    });

    const pending: Promise<ChunkBoxes>[] = info.chunksInfo.map(async (i) => {
      const bytes = i.hash ? await content.retrieve(i.hash) : null;
      const chunkOffset = voxelState.chunks[i.idx]?.voxels.offset || 0;
      if (!bytes) {
        if (i.hash) {
          logger.warn('failed to fetch ' + i.hash + ' for chunk ' + i.idx);
        }
        const r = await this._fetchChunk(i.idx);
        return {
          idx: i.idx,
          chunkOffset,
          boxes: r,
        };
      }
      const stream = new MuReadStream(bytes);
      return {
        idx: i.idx,
        chunkOffset,
        boxes: boxDecompress(stream),
      };
    });

    const chunkBoxes: ChunkBoxes[] = new Array(pending.length);
    for (let i = 0; i < pending.length; ++i) {
      const b = await pending[i];
      if (!b) {
        continue;
      }
      chunkBoxes[i] = b;
    }

    const dataStart = [
      CHUNK_SIZE * info.startI,
      CHUNK_SIZE * info.startJ,
      CHUNK_SIZE * info.startK,
    ];
    const dataEnd = [
      dataStart[0] + CHUNK_SIZE * voxelState.voxelDataChunkI + 2,
      dataStart[1] + CHUNK_SIZE * voxelState.voxelDataChunkJ + 2,
      dataStart[2] + CHUNK_SIZE * voxelState.voxelDataChunkK + 2,
    ];
    w.postMessage({
      type: VoxelMessageType.CALC_VOXEL_BY_BOXES,
      dataStart,
      dataEnd,
      chunkBoxes: chunkBoxes,
    });
  }

  public setVoxelOptimistic = (x: number, y: number, z: number, b: number) => {
    if (this._state.voxelState.ready && !this._state.voxelState.voxelUpdating) {
      if (this._state.blockIndex.fluid[b & 0x0fff]) {
        this._setVoxel(x, y, z, b & 0x0fff);
      } else {
        this._setVoxel(x, y, z, b & 0x0fff);
      }
    }
  };

  public getVoxel(x: number, y: number, z: number) {
    const voxels = this._state.voxel;
    if (
      x < 0 ||
      y < 0 ||
      z < 0 ||
      voxels.shape[0] <= x ||
      voxels.shape[1] <= y ||
      voxels.shape[2] <= z
    ) {
      return 0;
    }
    return voxels.getVoxel(x, y, z);
  }

  public rebuildLightMap = (innerAO: boolean) => {
    this._protocol.server.message.rebuildLightMap(innerAO);
  };
  public fetchHashes = (param: FetchHashes) => {
    this._protocol.server.message.fetchHashes(param);
  };

  public destroy = () => {
    this._state.voxel.destroy();
    this._state.paddedVoxels.destroy();
    const chunks = this._state.voxelState.chunks;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      chunk.voxels.destroy();
    }
  };

  constructor(spec: {
    client: MuClient;
    state: GameClientState;
    scheduler: MuScheduler;
  }) {
    super();
    this._state = spec.state;
    this._scheduler = spec.scheduler;
    this._protocol = spec.client.protocol(VoxelProtocol);
    this._protocol.configure({
      message: {
        reset: ({
          resetCounter,
          blocks,
          nx,
          ny,
          nz,
          hashes,
          innerAO,
          positionX,
          positionY,
          positionZ,
        }) => {
          if (!this._state.loadFinished) {
            this._state.loadEvents.startTask(
              'initializeVoxels',
              TaskTypeEnum.Normal,
            );
          }
          const voxelState = this._state.voxelState;
          if (resetCounter < voxelState.resetCounter) {
            return;
          }
          voxelState.resetCounter = resetCounter;
          voxelState.innerAO = innerAO;
          voxelState.ready = false;
          voxelState.pendingWrites =
            ClientVoxelStateSchema.muData.pendingWrites.assign(
              voxelState.pendingWrites,
              [],
            );
          this._resetClientVoxels(
            resetCounter,
            nx,
            ny,
            nz,
            hashes.slice(),
            blocks,
            positionX,
            positionY,
            positionZ,
          )
            .then(() => {
              this.emit(VoxelClientEvents.Ready);
              this._protocol.server.message.ready(resetCounter);
            })
            .catch((e) => {
              this._state.logger.error(
                `error initializing client voxels: ${e}`,
              );
            });
        },
        voxelChange: (runs) => {
          if (
            !this._state.voxelState.ready ||
            this._state.voxelState.voxelUpdating
          ) {
            return this._processPendingRuns(runs);
          } else {
            return this._processActiveRuns(runs);
          }
        },
        lightMapResponse: (innerAO) => {
          this._state.voxelState.innerAO = innerAO;
          this._state.events.voxel.voxelReset = true;
        },
        chunkResponse: ({ rpcId, boxes }) => {
          const handler = this._pendingChunks[rpcId];
          if (handler) {
            delete this._pendingChunks[rpcId];
            handler.resolve(VoxelCollisionBoxListSchema.clone(boxes));
          }
        },
        hashesResponse: (res) => {
          this._hashesResponse(res);
        },
      },
    });

    // initialize voxel state to empty voxel grid (0,0,0)
    this._state.paddedVoxels = allocVoxels(2, 2, 2);
    this._state.paddedVoxels.fill(0);
    this._state.voxel = this._state.paddedVoxels.slice([1, 1, 1], [1, 1, 1]);
    intializeCollision(
      this._state.blockIndex,
      this._state.collision,
      this._state.voxel,
    );
    this._state.voxelState.ready = false;
    this._state.voxelState.dirty.length = 0;
    this._state.voxelState.chunks.length = 0;
  }
}
