import {
  MuStruct,
  MuUint16,
  MuArray,
  MuUint32,
  MuVarint,
  MuRelativeVarint,
  MuBoolean,
  MuFloat64,
} from '@box/mudb/schema';
import { HashSchema } from '../content-server/index';
import { VoxelCollisionBoxListSchema } from '../utils/rbush-schema';

export const VOXEL_ROTATION_SHIFT = 14;
export const VOXEL_TYPE_MASK = ~(3 << VOXEL_ROTATION_SHIFT);

export const VoxelWriteSchema = new MuStruct({
  x: new MuUint16(),
  y: new MuUint16(),
  z: new MuUint16(),
  b: new MuUint16(),
});
export type VoxelWrite = typeof VoxelWriteSchema.identity;

export const VoxelResetSchema = new MuStruct({
  resetCounter: new MuUint32(),
  nx: new MuUint16(),
  ny: new MuUint16(),
  nz: new MuUint16(),
  blocks: HashSchema,
  hashes: new MuArray(HashSchema, Infinity, []),
  innerAO: new MuBoolean(false),
  positionX: new MuFloat64(),
  positionY: new MuFloat64(),
  positionZ: new MuFloat64(),
});

export const BatchVoxelRunSchema = new MuStruct({
  offset: new MuVarint(0),
  count: new MuVarint(1),
  block: new MuRelativeVarint(0),
});

export type BatchVoxelRun = typeof BatchVoxelRunSchema.identity;

export const BatchWriteSchema = new MuArray(BatchVoxelRunSchema, Infinity);

export type BatchWrite = typeof BatchWriteSchema.identity;

export const ChunkIdsSchema = new MuArray(new MuVarint(), Infinity);
export const FetchHashesSchema = new MuStruct({
  startI: new MuVarint(),
  startJ: new MuVarint(),
  startK: new MuVarint(),
  chunkIds: ChunkIdsSchema,
  dirtyChunks: ChunkIdsSchema,
});

export type FetchHashes = typeof FetchHashesSchema.identity;

export const HashesResponseSchema = new MuStruct({
  startI: new MuVarint(),
  startJ: new MuVarint(),
  startK: new MuVarint(),
  dirtyChunks: ChunkIdsSchema,
  chunksInfo: new MuArray(
    new MuStruct({
      idx: new MuVarint(),
      hash: HashSchema,
    }),
    Infinity,
  ),
});

export type HashesResponse = typeof HashesResponseSchema.identity;

export const VoxelProtocol = {
  name: 'game-terrain',
  client: {
    reset: VoxelResetSchema,
    voxelChange: BatchWriteSchema,

    chunkResponse: new MuStruct({
      rpcId: new MuVarint(),
      boxes: VoxelCollisionBoxListSchema,
    }),
    lightMapResponse: new MuBoolean(),
    hashesResponse: HashesResponseSchema,
  },
  server: {
    ready: new MuVarint(),

    fetchChunk: new MuStruct({
      chunkId: new MuVarint(),
      rpcId: new MuVarint(),
    }),
    rebuildLightMap: new MuBoolean(),
    fetchHashes: FetchHashesSchema,
  },
};
