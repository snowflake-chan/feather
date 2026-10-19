/**
 * 引擎侧体素服务 —— shell 与引擎的**类型边界**。
 *
 * `VoxelServer` 在上游是 `voxel/voxel-server.ts`（1,205 行）。shell 只用到：
 *   - 类型标注（`voxel-update.ts:14`）
 *   - 一个方法调用：`setVoxel(x, y, z, b)`（`voxel-update.ts:33`）
 *
 * 因此这里只声明用到的方法，不移植整个 VoxelServer。
 *
 * 注意 `getServerChunkBoxes` **不在这里** —— 它是纯函数，已按上游实现
 * 真实移植到 `voxel/chunk-boxes.ts`。
 */
import type { ServerVoxelChunk } from '../../voxel/voxel-server-schema';

export interface VoxelServer {
  setVoxel(x: number, y: number, z: number, block: number): void;
}

export type { ServerVoxelChunk };
