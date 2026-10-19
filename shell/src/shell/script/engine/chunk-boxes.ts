/**
 * `getServerChunkBoxes` —— 从上游 `voxel/voxel-server.ts:266-273` 移植。
 *
 * ## 为什么真实移植而不是 stub
 *
 * 与 `GameServerState`/`VoxelServer` 不同，这个函数是**真运行时调用**
 * （`voxel-update.ts:25`），必须要有实现。
 *
 * 上游它在 `voxel-server.ts`（1,205 行）里，但函数本身只依赖
 * `meshChunkToBoxes`（来自 `box-encode.ts`）和 `VoxelCollisionBoxListSchema`，
 * 所以可以单独摘出来，不必引入整个 VoxelServer。
 *
 * 函数体与上游逐字一致。
 */
import { VoxelCollisionBoxListSchema } from '@box/schema/utils/rbush-schema';
import { meshChunkToBoxes } from '../../voxel/box-encode';
import type { ServerVoxelChunk } from '../../voxel/voxel-server-schema';

export function getServerChunkBoxes(chunk: ServerVoxelChunk) {
  if (chunk.dirtyBoxes) {
    VoxelCollisionBoxListSchema.free(chunk.boxes);
    chunk.boxes = meshChunkToBoxes(chunk.voxels);
    chunk.dirtyBoxes = false;
  }
  return chunk.boxes;
}
