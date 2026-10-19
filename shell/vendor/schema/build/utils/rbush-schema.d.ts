import { MuSchema } from '@box/mudb/schema/schema';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint8 } from '@box/mudb/schema/uint8';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const VoxelCollisionBoxSchema: MuStruct<{
    minX: MuUint8;
    minY: MuUint8;
    minZ: MuUint8;
    maxX: MuUint8;
    maxY: MuUint8;
    maxZ: MuUint8;
    faces: MuUint8;
    block: MuVarint;
}>;
export type VoxelCollisionBox = typeof VoxelCollisionBoxSchema.identity;
export declare function compareBox(a: VoxelCollisionBox, b: VoxelCollisionBox): number;
export declare const VoxelCollisionBoxListSchema: MuSortedArray<MuStruct<{
    minX: MuUint8;
    minY: MuUint8;
    minZ: MuUint8;
    maxX: MuUint8;
    maxY: MuUint8;
    maxZ: MuUint8;
    faces: MuUint8;
    block: MuVarint;
}>>;
export type VoxelCollisionBoxList = typeof VoxelCollisionBoxListSchema.identity;
export interface RBushNode {
    children: RBushNode[];
    boxes: VoxelCollisionBox[];
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
}
export declare const RBushSchema: MuSchema<RBushNode>;
