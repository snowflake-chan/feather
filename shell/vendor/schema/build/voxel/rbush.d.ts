import { VoxelCollisionBox, RBushNode } from '../utils/rbush-schema';
export declare function createRBush(items: VoxelCollisionBox[], left: number, right: number, _height: number): RBushNode;
export declare function searchRBush(result: VoxelCollisionBox[], root: RBushNode, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): void;
export declare function testRBush(root: RBushNode, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): boolean;
