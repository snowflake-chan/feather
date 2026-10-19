import { VoxelCollisionChunk, VoxelCollision } from './voxel-collision-schema';
import { BlockIndex } from './block-schema';
import { VoxelCollisionBox } from '../utils/rbush-schema';
import { VoxelView } from '@box/utils/voxel';
export declare function setBlockIndex(blockIndex: BlockIndex): void;
export declare function rebuildCollisionChunk(voxels: VoxelView, chunk: VoxelCollisionChunk): void;
export declare function intializeCollision(blockIndex: BlockIndex, collision: VoxelCollision, voxels: VoxelView): void;
export declare function testCollideSolid(collision: VoxelCollision, lox: number, loy: number, loz: number, hix: number, hiy: number, hiz: number): boolean;
export declare function collideSolid(result: VoxelCollisionBox[], collision: VoxelCollision, lox: number, loy: number, loz: number, hix: number, hiy: number, hiz: number): void;
export declare function collideFluid(result: VoxelCollisionBox[], collision: VoxelCollision, lox: number, loy: number, loz: number, hix: number, hiy: number, hiz: number): void;
//# sourceMappingURL=voxel-collision.d.ts.map