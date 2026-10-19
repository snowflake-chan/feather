import { vec3 } from 'gl-matrix';
import { VoxelView } from '@box/utils/voxel';
import { BlockIndex } from './block-schema';
export declare class VoxelRaycastHitResult {
    hitPosition: vec3;
    hitNormal: vec3;
    hitVoxel: [number, number, number];
    hitDistance: number;
    hitBlock: number;
    constructor();
}
export declare function raycast(result: VoxelRaycastHitResult, blockIndex: BlockIndex, voxels: VoxelView, origin: vec3, direction: vec3, maxDistance: number, ignoreFluid?: boolean, ignoreTransparent?: boolean): boolean;
