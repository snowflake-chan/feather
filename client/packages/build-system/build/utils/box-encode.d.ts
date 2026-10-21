import { MuWriteStream } from '@box/mudb/stream';
import { VoxelView } from '@box/utils/voxel';
import { VoxelCollisionBox, VoxelCollisionBoxList } from '@box/schema/utils/rbush-schema';
export declare function interleave3(x_: number, y_: number, z_: number): number;
export declare function boxCompress(boxes: VoxelCollisionBox[], out: MuWriteStream): void;
export declare function meshChunkToBoxes(chunk: VoxelView): VoxelCollisionBoxList;
//# sourceMappingURL=box-encode.d.ts.map