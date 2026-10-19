import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { GameServerState } from '../game-server-schema';
import {
  VoxelProtocol,
  VoxelWriteSchema,
  VoxelResetSchema,
  BatchWriteSchema,
  BatchVoxelRunSchema,
  BatchVoxelRun,
  HashesResponseSchema,
  HashesResponse,
  ChunkIdsSchema,
} from '@box/schema/voxel/voxel-protocol';
import { VoxelInfo, VoxelRDA } from '@box/schema/project/project-rda';
import { Hash, ContentServer } from '@box/content-server';
import {
  ServerVoxelChunk,
  ServerVoxelPreloadData,
  ServerVoxelPreloadDataSchema,
  ServerVoxelStateSchema,
  ServerVoxelChunkSchema,
  PendingVoxelWriteSchema,
} from './voxel-server-schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
import { boxCompress, meshChunkToBoxes, interleave3 } from './box-encode';
import { freeVoxels, allocVoxels, VoxelView } from '@box/utils/voxel';
import {
  CHUNK_SIZE,
  CHUNK_SHIFT,
  CHUNK_MASK,
} from '@box/schema/voxel/voxel-collision-schema';
import { boxDecompress, blitBoxesToChunk } from '@box/schema/voxel/box-decode';
import {
  rebuildCollisionChunk,
  intializeCollision,
  setBlockIndex,
} from '@box/schema/voxel/voxel-collision';
import { VoxelChangeEventSchema } from '@box/schema/events/voxel-event-schema';
import {
  compareBox,
  VoxelCollisionBoxListSchema,
} from '@box/schema/utils/rbush-schema';
import { BlockInfo, BlockInfoSchema } from '@box/schema/voxel/block-schema';
import { unpackBlockIndex } from '@box/schema/voxel/blocks';
import { Semaphore } from '@box/utils/semaphore';

const VOXEL_SEND_RATE = 64;

function compareBatchRun(a: BatchVoxelRun, b: BatchVoxelRun) {
  return a.offset - b.offset || a.count - b.count;
}

export async function saveVoxelPreloadData(
  content: ContentServer,
  voxels: VoxelView,
): Promise<ServerVoxelPreloadData | null> {
  // allocate result
  const result = ServerVoxelPreloadDataSchema.alloc();
  const nx = (result.nx = voxels.shape[0]);
  const ny = (result.ny = voxels.shape[1]);
  const nz = (result.nz = voxels.shape[2]);
  result.boxes.length = 0;
  result.hashes.length = 0;

  // store all voxels to server
  const contentChunks: Promise<string | undefined>[] = [];
  for (let z = 0; z < nz; z += CHUNK_SIZE) {
    for (let y = 0; y < ny; y += CHUNK_SIZE) {
      for (let x = 0; x < nx; x += CHUNK_SIZE) {
        const boxes = meshChunkToBoxes(
          voxels.slice(
            [x, y, z],
            [x + CHUNK_SIZE, y + CHUNK_SIZE, z + CHUNK_SIZE],
          ),
        );
        result.boxes.push(boxes);

        const stream = new MuWriteStream(1024);
        boxCompress(boxes, stream);
        contentChunks.push(content.store(stream.bytes()));
        stream.destroy();
      }
    }
  }

  // wait for results and pack into encoded voxel data structure
  for (let i = 0; i < contentChunks.length; ++i) {
    const chunkHash = await contentChunks[i];
    if (chunkHash) {
      result.hashes.push(chunkHash);
    } else {
      ServerVoxelPreloadDataSchema.free(result);
      return null;
    }
  }

  return result;
}

function stripPreloadData(preload: ServerVoxelPreloadData): VoxelInfo {
  const result = VoxelRDA.stateSchema.alloc();
  result.shape.x = preload.nx;
  result.shape.y = preload.ny;
  result.shape.z = preload.nz;
  result.chunks = VoxelRDA.stateSchema.muData.chunks.assign(
    result.chunks,
    preload.hashes,
  );
  return result;
}

export async function saveVoxelData(
  content: ContentServer,
  voxels: VoxelView,
): Promise<VoxelInfo | null> {
  const preload = await saveVoxelPreloadData(content, voxels);
  if (!preload) {
    return null;
  }
  const info = stripPreloadData(preload);
  ServerVoxelPreloadDataSchema.free(preload);
  return info;
}

export function loadVoxelData(
  content: ContentServer,
  voxelInfo: VoxelInfo,
): Promise<VoxelView | null> {
  return new Promise((resolve, reject) => {
    const { x: nx, y: ny, z: nz } = voxelInfo.shape;
    const voxels = allocVoxels(nx, ny, nz);
    let count = voxelInfo.chunks.length;

    function abort(e) {
      if (count > 0) {
        count = 0;
        freeVoxels(voxels);
        resolve(null);
      }
    }

    function readChunk(x: number, y: number, z: number) {
      return (data: Uint8Array | undefined) => {
        if (count <= 0) {
          return;
        }
        if (!data) {
          resolve(null);
          return;
        }
        const stream = new MuReadStream(data);
        const boxes = boxDecompress(stream);
        blitBoxesToChunk(
          voxels.slice(
            [x, y, z],
            [x + CHUNK_SIZE, y + CHUNK_SIZE, z + CHUNK_SIZE],
          ),
          boxes,
        );
        VoxelCollisionBoxListSchema.free(boxes);
        if (--count !== 0) {
          return;
        }
        resolve(voxels);
      };
    }

    let chunkPtr = 0;
    for (let z = 0; z < nz; z += CHUNK_SIZE) {
      for (let y = 0; y < ny; y += CHUNK_SIZE) {
        for (let x = 0; x < nx; x += CHUNK_SIZE) {
          content
            .retrieve(voxelInfo.chunks[chunkPtr++])
            .then(readChunk(x, y, z))
            .catch(abort);
        }
      }
    }
  });
}

export async function preloadVoxelData(
  content: ContentServer,
  voxelInfo: VoxelInfo,
): Promise<ServerVoxelPreloadData | null> {
  const result = ServerVoxelPreloadDataSchema.clone(
    ServerVoxelPreloadDataSchema.identity,
  );
  result.nx = voxelInfo.shape.x;
  result.ny = voxelInfo.shape.y;
  result.nz = voxelInfo.shape.z;

  result.hashes = voxelInfo.chunks.slice();
  result.boxes.length = voxelInfo.chunks.length;

  const pending = voxelInfo.chunks.map((hash) => content.retrieve(hash));

  for (let i = 0; i < pending.length; ++i) {
    const bytes = await pending[i];
    if (!bytes) {
      for (let j = i - 1; j >= 0; --j) {
        VoxelCollisionBoxListSchema.free(result.boxes[j]);
      }
      result.boxes.length = 0;
      ServerVoxelPreloadDataSchema.free(result);
      return null;
    }
    result.boxes[i] = boxDecompress(new MuReadStream(bytes));
  }

  return result;
}

export function parsePrebakeVoxelData(
  voxelInfo: VoxelInfo,
  chunkBytes: Uint8Array[],
): ServerVoxelPreloadData {
  const result = ServerVoxelPreloadDataSchema.clone(
    ServerVoxelPreloadDataSchema.identity,
  );
  result.nx = voxelInfo.shape.x;
  result.ny = voxelInfo.shape.y;
  result.nz = voxelInfo.shape.z;

  result.hashes = voxelInfo.chunks.slice();
  result.boxes.length = voxelInfo.chunks.length;

  for (let i = 0; i < chunkBytes.length; ++i) {
    const bytes = chunkBytes[i];
    result.boxes[i] = boxDecompress(new MuReadStream(bytes));
  }

  return result;
}

export function voxelServerChanged(
  state: GameServerState,
  voxelSpec: VoxelInfo,
): boolean {
  const {
    shape: { x, y, z },
    chunks,
  } = voxelSpec;
  const shape = state.voxels.shape;
  const chunkData = state.voxelState.chunks;

  if (
    x !== shape[0] ||
    y !== shape[1] ||
    z !== shape[2] ||
    chunks.length !== chunkData.length
  ) {
    return true;
  }

  for (let i = 0; i < chunkData.length; ++i) {
    const c = chunkData[i];
    if (c.dirtyHash || c.hash !== chunks[i]) {
      return true;
    }
  }

  return false;
}

export function getServerChunkBoxes(chunk: ServerVoxelChunk) {
  if (chunk.dirtyBoxes) {
    VoxelCollisionBoxListSchema.free(chunk.boxes);
    chunk.boxes = meshChunkToBoxes(chunk.voxels);
    chunk.dirtyBoxes = false;
  }
  return chunk.boxes;
}

function getChunkHash(
  content: ContentServer,
  chunk: ServerVoxelChunk,
  running: boolean,
) {
  if (!chunk.dirtyHash) {
    return Promise.resolve(chunk.hash);
  } else if (running) {
    return Promise.resolve('');
  }
  const versionCounter = ++chunk.versionCounter;
  const boxes = getServerChunkBoxes(chunk);
  const stream = new MuWriteStream(1024);
  boxCompress(boxes, stream);
  return (async () => {
    try {
      const hash = await content.store(stream.bytes());
      if (!hash) {
        return '';
      }
      if (chunk.versionCounter === versionCounter && !chunk.dirtyBoxes) {
        chunk.dirtyHash = false;
        chunk.hash = hash;
      }
      return hash;
    } finally {
      stream.destroy();
    }
  })();
}

export async function recordVoxelInfo(
  state: GameServerState,
): Promise<VoxelInfo | null> {
  const voxels = state.voxels;
  const result = VoxelRDA.stateSchema.alloc();
  result.shape.x = voxels.shape[0];
  result.shape.y = voxels.shape[1];
  result.shape.z = voxels.shape[2];

  const contentServer = state.content;
  const chunks = state.voxelState.chunks;
  const pending: Promise<Hash | null>[] = new Array(chunks.length);
  for (let i = 0; i < chunks.length; ++i) {
    pending[i] = getChunkHash(contentServer, chunks[i], state.replica.running);
  }
  result.chunks.length = pending.length;
  for (let i = 0; i < pending.length; ++i) {
    const x = await pending[i];
    if (x) {
      result.chunks[i] = x;
    } else {
      if (state.replica.running) {
        result.chunks[i] = '';
      } else {
        return null;
      }
    }
  }

  return result;
}

export async function recordHashesByChunkIds(
  state: GameServerState,
  result: HashesResponse,
  chunkIds: number[],
): Promise<HashesResponse | null> {
  const contentServer = state.content;
  const chunks = state.voxelState.chunks;
  const pending: {
    idx: number;
    hash: Promise<Hash | null>;
  }[] = new Array(chunkIds.length);
  for (let i = 0; i < chunkIds.length; ++i) {
    pending[i] = {
      idx: chunkIds[i],
      hash: getChunkHash(
        contentServer,
        chunks[chunkIds[i]],
        state.replica.running,
      ),
    };
  }
  result.chunksInfo.length = pending.length;
  for (let i = 0; i < pending.length; ++i) {
    const x = await pending[i].hash;
    if (x) {
      result.chunksInfo[i] = {
        idx: pending[i].idx,
        hash: x,
      };
    } else {
      if (state.replica.running) {
        result.chunksInfo[i] = {
          idx: pending[i].idx,
          hash: '',
        };
      } else {
        return null;
      }
    }
  }

  return result;
}

export async function computeVoxelPrefetchHashes(
  state: GameServerState,
): Promise<Hash[]> {
  const info = await recordVoxelInfo(state);
  if (!info) {
    return [];
  }
  const hashes = info.chunks.filter((h) => !!h);
  VoxelRDA.stateSchema.free(info);
  return hashes;
}

function markChunk(
  state: GameServerState,
  chunkI: number,
  chunkJ: number,
  chunkK: number,
) {
  const { chunkDimI, chunkDimJ } = state.collision;
  const voxelState = state.voxelState;
  const c =
    voxelState.chunks[chunkI + chunkDimI * (chunkJ + chunkDimJ * chunkK)];
  if (!c.dirtyGeom) {
    voxelState.dirty.push(c);
  }
  c.dirtyGeom = c.dirtyBoxes = c.dirtyHash = true;
}

function markVoxel(state: GameServerState, i: number, j: number, k: number) {
  const { chunkDimI, chunkDimJ, chunkDimK } = state.collision;

  const chunkI = i >> CHUNK_SHIFT;
  const chunkJ = j >> CHUNK_SHIFT;
  const chunkK = k >> CHUNK_SHIFT;

  const iMask = i & CHUNK_MASK;
  const jMask = j & CHUNK_MASK;
  const kMask = k & CHUNK_MASK;

  markChunk(state, chunkI, chunkJ, chunkK);

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

export class VoxelServer {
  private _protocol: MuServerProtocol<typeof VoxelProtocol>;
  private _state: GameServerState;
  private _resetSemaphore = new Semaphore(1);

  constructor(spec: {
    server: MuServer;
    state: GameServerState;
    preloadVoxels: ServerVoxelPreloadData;
    blockInfo: BlockInfo;
    blockInfoHash: string;
  }) {
    this._state = spec.state;
    this._protocol = spec.server.protocol(VoxelProtocol);
    this._protocol.configure({
      message: {
        ready: (client, resetCounter) => {
          const connection = this._state.connections[client.sessionId];
          if (
            connection &&
            resetCounter === this._state.voxelState.resetCounter
          ) {
            connection.voxel.ready = true;
          }
        },

        fetchChunk: (client, { chunkId, rpcId }) => {
          const chunk = this._state.voxelState.chunks[chunkId];
          if (!chunk) {
            client.message.chunkResponse({
              rpcId,
              boxes: [],
            });
          } else {
            client.message.chunkResponse({
              rpcId,
              boxes: getServerChunkBoxes(chunk),
            });
          }
        },

        rebuildLightMap: (client, innerAO) => {
          if (this._state.voxelState.innerAO !== innerAO) {
            this._state.voxelState.innerAO = innerAO;
            this._protocol.broadcast.lightMapResponse(innerAO);
          }
        },
        fetchHashes: (
          client,
          { chunkIds, startI, startJ, startK, dirtyChunks },
        ) => {
          const res = HashesResponseSchema.alloc();
          res.startI = startI;
          res.startJ = startJ;
          res.startK = startK;
          ChunkIdsSchema.assign(res.dirtyChunks, dirtyChunks);
          recordHashesByChunkIds(this._state, res, chunkIds).then((info) => {
            if (!info) {
              return;
            }
            client.message.hashesResponse(info);
          });
        },
      },
      connect: (client) => {
        const packet = VoxelResetSchema.alloc();
        packet.resetCounter = this._state.voxelState.resetCounter;
        packet.innerAO = this._state.voxelState.innerAO =
          !!this._state.project.environment.sky.globalLight;
        packet.blocks = this._state.blockInfoHash;
        const { initialPosition } = this._state.project.player;
        packet.positionX = initialPosition.x;
        packet.positionY = initialPosition.y;
        packet.positionZ = initialPosition.z;
        recordVoxelInfo(this._state)
          .then((info) => {
            if (!info) {
              this._state.logger.error(
                `error initializing client voxel data.  ${client.sessionId}`,
              );
              client.close();
              return;
            }
            packet.nx = info.shape.x;
            packet.ny = info.shape.y;
            packet.nz = info.shape.z;
            packet.hashes = info.chunks;
            client.message.reset(packet);
          })
          .catch((e) => {
            this._state.logger.error(
              `error initializing client voxel data: ${e}`,
            );
          });
      },
    });
    this._initVoxelInfo(spec.preloadVoxels, spec.blockInfo, spec.blockInfoHash);
  }

  private async _enterResetState() {
    await this._resetSemaphore.p();
    this._state.logger.info('enter voxel reset state');

    const state = this._state.voxelState;
    state.ready = false;

    const counter = ++state.resetCounter;

    // clear pending runs
    state.pendingWrites = ServerVoxelStateSchema.muData.pendingWrites.assign(
      state.pendingWrites,
      ServerVoxelStateSchema.muData.pendingWrites.identity,
    );

    // clear client buffered runs
    const connections = this._state.connectionSet;
    for (let i = 0; i < connections.length; ++i) {
      connections[i].voxel.ready = false;
      BatchWriteSchema.assign(
        connections[i].voxel.runs,
        BatchWriteSchema.identity,
      );
    }

    return counter;
  }

  private _exitResetState() {
    this._state.logger.info('exit reset state');
    this._state.voxelState.ready = true;
    this._resetSemaphore.v();
  }

  private _broadcastWrites() {
    const pending = this._state.voxelState.pendingWrites;
    if (pending.length === 0) {
      return;
    }

    // run length encode all voxel writes
    const connections = this._state.connectionSet;
    for (let n = 0; n < connections.length; ++n) {
      const connection = connections[n];
      const client = this._protocol.clients[connection.sessionId];
      if (!client) {
        continue;
      }

      // convert pending writes into runs and append to connection run set
      const runs = connection.voxel.runs;
      for (let i = 0; i < pending.length; ++i) {
        const write = pending[i];
        const run = BatchVoxelRunSchema.alloc();
        run.offset = interleave3(write.x, write.y, write.z);
        run.count = runs.length;
        run.block = write.b;
        runs.push(run);
      }

      // sort by offset and recency
      runs.sort(compareBatchRun);

      if (
        !connection.voxel.ready ||
        connection.net.bufferedAmount > VOXEL_SEND_RATE
      ) {
        // if client isn't done downloading terrain or they're tcp connection is saturated we buffer writes
        let ptr = 0;
        for (let i = 0; i < runs.length; ++i) {
          const offset = runs[i].offset;
          while (i + 1 < runs.length && runs[i + 1].offset === offset) {
            ++i;
          }
          const block = runs[i].block;
          const run = runs[ptr];
          run.offset = offset;
          run.count = ptr++;
          run.block = block;
        }
        for (let i = runs.length - 1; i >= ptr; --i) {
          BatchVoxelRunSchema.free(runs[i]);
        }
        runs.length = ptr;
      } else {
        // combine redundant runs and send to client
        let ptr = 0;
        let prevOffset = 0;
        let prevBlock = 0;
        for (let i = 0; i < runs.length; ) {
          const offset = runs[i].offset;
          while (i + 1 < runs.length && runs[i + 1].offset === offset) {
            ++i;
          }
          const block = runs[i].block;
          let nextOffset = offset + 1;
          ++i;
          while (i < runs.length && runs[i].offset === nextOffset) {
            while (i + 1 < runs.length && runs[i + 1].offset === nextOffset) {
              ++i;
            }
            if (runs[i].block !== block) {
              break;
            }
            ++nextOffset;
            ++i;
          }
          const run = runs[ptr++];
          run.offset = offset - prevOffset;
          run.count = nextOffset - offset;
          run.block = block - prevBlock;
          prevOffset = nextOffset;
          prevBlock = block;
        }
        for (let i = runs.length - 1; i >= ptr; --i) {
          BatchVoxelRunSchema.free(runs[i]);
        }
        runs.length = ptr;

        // send to client
        client.message.voxelChange(runs);

        // clear runs
        BatchWriteSchema.assign(runs, BatchWriteSchema.identity);
      }
    }

    // clear all pendign writes
    PendingVoxelWriteSchema.assign(pending, PendingVoxelWriteSchema.identity);
  }

  private _initVoxelInfo(
    data: ServerVoxelPreloadData,
    blockInfo: BlockInfo,
    blockInfoHash: string,
  ) {
    const { nx, ny, nz, boxes, hashes } = data;

    // update block info tables
    if (blockInfoHash !== this._state.blockInfoHash) {
      this._state.blockInfoHash = blockInfoHash;
      BlockInfoSchema.assign(this._state.blockInfo, blockInfo);
      unpackBlockIndex(blockInfo, this._state.blockIndex);
    }

    // reallocate padded voxels
    if (this._state.paddedVoxels) {
      const [px, py, pz] = this._state.paddedVoxels.shape;
      if (px !== nx + 2 || py !== ny + 2 || pz !== nz + 2) {
        freeVoxels(this._state.paddedVoxels);
        this._state.paddedVoxels = allocVoxels(nx + 2, ny + 2, nz + 2);
      }
    } else {
      this._state.paddedVoxels = allocVoxels(nx + 2, ny + 2, nz + 2);
    }

    // intialize voxel array
    this._state.paddedVoxels.fill(0);

    // slice out main voxel view from padded voxels
    const voxels = (this._state.voxels = this._state.paddedVoxels.slice(
      [1, 1, 1],
      [1 + nx, 1 + ny, 1 + nz],
    ));

    // clear server voxel state
    this._state.voxelState.dirty.length = 0;
    const serverChunks = this._state.voxelState.chunks;
    for (let i = 0; i < serverChunks.length; ++i) {
      ServerVoxelChunkSchema.free(serverChunks[i]);
    }

    // cut out server voxel chunks
    let ptr = 0;
    serverChunks.length = boxes.length;
    for (let z = 0; z < nz; z += CHUNK_SIZE) {
      for (let y = 0; y < ny; y += CHUNK_SIZE) {
        for (let x = 0; x < nx; x += CHUNK_SIZE) {
          const chunk = ServerVoxelChunkSchema.alloc();
          chunk.boxes = VoxelCollisionBoxListSchema.assign(
            chunk.boxes,
            boxes[ptr],
          );
          chunk.hash = hashes[ptr];
          chunk.dirtyBoxes = chunk.dirtyGeom = chunk.dirtyHash = false;
          chunk.voxels = voxels.slice(
            [x, y, z],
            [x + CHUNK_SIZE, y + CHUNK_SIZE, z + CHUNK_SIZE],
          );
          blitBoxesToChunk(chunk.voxels, chunk.boxes);
          serverChunks[ptr++] = chunk;
        }
      }
    }

    // set up collision data structures
    intializeCollision(this._state.blockIndex, this._state.collision, voxels);

    // copy collision data structure references
    const collisionChunks = this._state.collision.chunks;
    for (let i = 0; i < serverChunks.length; ++i) {
      serverChunks[i].geom = collisionChunks[i];
      serverChunks[i].dirtyGeom = false;
    }

    // clear reset flag
    this._state.voxelState.ready = true;

    // broadcast reset packet and writes
    if (this._protocol.server.running) {
      const resetPacket = VoxelResetSchema.alloc();
      resetPacket.nx = data.nx;
      resetPacket.ny = data.ny;
      resetPacket.nz = data.nz;
      resetPacket.blocks = this._state.blockInfoHash;
      resetPacket.hashes.length = data.hashes.length;
      for (let i = 0; i < data.hashes.length; ++i) {
        resetPacket.hashes[i] = data.hashes[i];
      }
      resetPacket.resetCounter = this._state.voxelState.resetCounter;
      resetPacket.innerAO = this._state.voxelState.innerAO;
      this._protocol.broadcast.reset(resetPacket);
      VoxelResetSchema.free(resetPacket);
    }

    // raise reset flag
    this._state.events.voxel.voxelReset = true;
  }

  public async synchronizeVoxelInfo(
    voxelSpec: VoxelInfo,
    blockInfo: BlockInfo,
    blockInfoHash: string,
  ): Promise<(() => void) | null> {
    const resetCounter = await this._enterResetState();
    const preload = await preloadVoxelData(this._state.content, voxelSpec);
    if (this._state.voxelState.resetCounter !== resetCounter) {
      return null;
    }
    if (!preload) {
      this._exitResetState();
      return null;
    }
    return () => {
      this._initVoxelInfo(preload, blockInfo, blockInfoHash);
      ServerVoxelPreloadDataSchema.free(preload);
      this._exitResetState();
    };
  }

  // resets the server terrain
  public async reset(voxel: VoxelView) {
    const counter = await this._enterResetState();
    const preload = await saveVoxelPreloadData(this._state.content, voxel);
    if (counter !== this._state.voxelState.resetCounter) {
      this._exitResetState();
      return false;
    }
    if (!preload) {
      this._exitResetState();
      return false;
    }
    this._initVoxelInfo(
      preload,
      this._state.blockInfo,
      this._state.blockInfoHash,
    );
    ServerVoxelPreloadDataSchema.free(preload);
    this._exitResetState();
    return true;
  }

  public setVoxel(x: number, y: number, z: number, b_: number) {
    if (!this._state.voxelState.ready) {
      return;
    }

    if (!this._state.blockIndex.valid[b_ & 0xfff]) {
      return;
    }

    const voxels = this._state.voxels;
    if (
      x >= 0 &&
      x < voxels.shape[0] - 1 &&
      y >= 0 &&
      y < voxels.shape[1] - 1 &&
      z >= 0 &&
      z < voxels.shape[2] - 1
    ) {
      const p = this._state.voxels.getVoxel(x, y, z);
      let b = b_;
      if (this._state.blockIndex.fluid[b & 0xfff]) {
        b &= 0xfff;
      }
      if (p !== b) {
        voxels.setVoxel(x, y, z, b);
        markVoxel(this._state, x, y, z);
        if (this._protocol.server.running) {
          const write = VoxelWriteSchema.alloc();
          write.x = x;
          write.y = y;
          write.z = z;
          write.b = b;
          this._state.voxelState.pendingWrites.push(write);

          const change = VoxelChangeEventSchema.alloc();
          change.x = x;
          change.y = y;
          change.z = z;
          change.b = b;
          change.p = p;
          this._state.events.voxel.voxelChange.push(change);
        }
      }
    }
  }

  public getVoxel(x_: number, y_: number, z_: number) {
    const voxels = this._state.voxels;
    const shape = voxels.shape;
    if (
      x_ < 0 ||
      x_ >= shape[0] - 1 ||
      y_ < 0 ||
      y_ >= shape[1] - 1 ||
      z_ < 0 ||
      z_ >= shape[2] - 1
    ) {
      return 0;
    }
    return voxels.getVoxel(x_, y_, z_);
  }

  public tick() {
    if (!this._state.voxelState.ready) {
      return;
    }

    // send writes to all clients
    this._broadcastWrites();

    // update all server geometry
    const dirty = this._state.voxelState.dirty;
    setBlockIndex(this._state.blockIndex);
    for (let i = 0; i < dirty.length; ++i) {
      const c = dirty[i];
      rebuildCollisionChunk(c.voxels, c.geom);
      c.dirtyGeom = false;
    }
    dirty.length = 0;
  }
}
