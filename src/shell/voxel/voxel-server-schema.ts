import {
  MuStruct,
  MuBoolean,
  MuArray,
  MuUint32,
  MuSchema,
  MuVarint,
} from '@box/mudb/schema';
import { HashSchema } from '@box/content-server';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { VoxelView } from '@box/utils/voxel';
import type { VoxelCollisionChunk } from '@box/schema/voxel/voxel-collision-schema';
import {
  VoxelWriteSchema,
  BatchWriteSchema,
} from '@box/schema/voxel/voxel-protocol';
import { VoxelCollisionBoxListSchema } from '@box/schema/utils/rbush-schema';

export const ServerVoxelPreloadDataSchema = new MuStruct({
  nx: new MuUint32(),
  ny: new MuUint32(),
  nz: new MuUint32(),
  hashes: new MuArray(HashSchema, Infinity, []),
  boxes: new MuArray(VoxelCollisionBoxListSchema, Infinity, []),
});

export type ServerVoxelPreloadData =
  typeof ServerVoxelPreloadDataSchema.identity;

export const ServerVoxelChunkSchema = new MuStruct({
  hash: HashSchema,
  versionCounter: new MuVarint(0),
  dirtyGeom: new MuBoolean(false),
  dirtyBoxes: new MuBoolean(false),
  dirtyHash: new MuBoolean(false),
  voxels: <MuSchema<VoxelView>>new MuRefSchema<VoxelView>(),
  geom: <MuSchema<VoxelCollisionChunk>>new MuRefSchema<VoxelCollisionChunk>(),
  boxes: VoxelCollisionBoxListSchema,
});

export type ServerVoxelChunk = typeof ServerVoxelChunkSchema.identity;

export const PendingVoxelWriteSchema = new MuArray(
  VoxelWriteSchema,
  Infinity,
  [],
);

export const ServerVoxelConnectionSchema = new MuStruct({
  ready: new MuBoolean(false),
  runs: BatchWriteSchema,
});

export const ServerVoxelStateSchema = new MuStruct({
  // reset state
  ready: new MuBoolean(false),
  resetCounter: new MuUint32(0),
  pendingWrites: PendingVoxelWriteSchema,
  innerAO: new MuBoolean(false),

  chunks: new MuArray(ServerVoxelChunkSchema, Infinity),
  dirty: new MuArray(
    <MuSchema<ServerVoxelChunk>>new MuRefSchema<ServerVoxelChunk>(),
    Infinity,
  ),
});

export type ServerVoxelState = typeof ServerVoxelStateSchema.identity;
