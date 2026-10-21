import {
  MuStruct,
  MuBoolean,
  MuArray,
  MuInt32,
  MuSchema,
  MuVarint,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { VoxelView } from '@box/utils/voxel';
import { VoxelCollisionChunk } from '@box/schema/voxel/voxel-collision-schema';
import { VoxelWriteSchema } from '@box/schema/voxel/voxel-protocol';

export const ClientVoxelChunkSchema = new MuStruct({
  dirty: new MuBoolean(false),
  voxels: <MuSchema<VoxelView>>new MuRefSchema<VoxelView>(),
  geom: <MuSchema<VoxelCollisionChunk>>new MuRefSchema<VoxelCollisionChunk>(),
});

export type ClientVoxelChunk = typeof ClientVoxelChunkSchema.identity;

export const ClientVoxelStateSchema = new MuStruct({
  resetCounter: new MuInt32(-1),
  ready: new MuBoolean(false),
  pendingWrites: new MuArray(VoxelWriteSchema, Infinity, []),
  innerAO: new MuBoolean(false),

  chunks: new MuArray(ClientVoxelChunkSchema, Infinity),
  dirty: new MuArray(
    <MuSchema<ClientVoxelChunk>>new MuRefSchema<ClientVoxelChunk>(),
    Infinity,
  ),

  /**
   * voxelView数据正在更新
   */
  voxelViewUpdating: new MuBoolean(false),
  /**
   * 地形正在更新，包括
   * 1. voxelView数据正在更新
   * 2. voxel物理模型正在更新
   *
   * 等voxelView和voxel物理模型全部更新完成设为false
   */
  voxelUpdating: new MuBoolean(false),
  /**
   * 地形物理模型是否已更新完毕
   * 若地形物理模型没有更新完成，暂停客户端计算人物物理位置
   */
  voxelCollisionReady: new MuBoolean(true),

  voxelDataChunkI: new MuVarint(),
  voxelDataChunkJ: new MuVarint(),
  voxelDataChunkK: new MuVarint(),
  startI: new MuVarint(),
  startJ: new MuVarint(),
  startK: new MuVarint(),
});

export type ClientVoxelState = typeof ClientVoxelStateSchema.identity;
