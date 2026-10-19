import { MuStruct, MuBoolean, MuArray, MuUint32, MuSchema, MuVarint } from '@box/mudb/schema';
import { VoxelView } from '@box/utils/voxel';
import type { VoxelCollisionChunk } from './voxel-collision-schema';
export declare const ServerVoxelPreloadDataSchema: MuStruct<{
    nx: MuUint32;
    ny: MuUint32;
    nz: MuUint32;
    hashes: MuArray<import("@box/mudb/schema").MuASCII>;
    boxes: MuArray<import("@box/mudb/schema").MuSortedArray<MuStruct<{
        minX: import("@box/mudb/schema").MuUint8;
        minY: import("@box/mudb/schema").MuUint8;
        minZ: import("@box/mudb/schema").MuUint8;
        maxX: import("@box/mudb/schema").MuUint8;
        maxY: import("@box/mudb/schema").MuUint8;
        maxZ: import("@box/mudb/schema").MuUint8;
        faces: import("@box/mudb/schema").MuUint8;
        block: MuVarint;
    }>>>;
}>;
export type ServerVoxelPreloadData = typeof ServerVoxelPreloadDataSchema.identity;
export declare const ServerVoxelChunkSchema: MuStruct<{
    hash: import("@box/mudb/schema").MuASCII;
    versionCounter: MuVarint;
    dirtyGeom: MuBoolean;
    dirtyBoxes: MuBoolean;
    dirtyHash: MuBoolean;
    voxels: MuSchema<VoxelView>;
    geom: MuSchema<VoxelCollisionChunk>;
    boxes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        minX: import("@box/mudb/schema").MuUint8;
        minY: import("@box/mudb/schema").MuUint8;
        minZ: import("@box/mudb/schema").MuUint8;
        maxX: import("@box/mudb/schema").MuUint8;
        maxY: import("@box/mudb/schema").MuUint8;
        maxZ: import("@box/mudb/schema").MuUint8;
        faces: import("@box/mudb/schema").MuUint8;
        block: MuVarint;
    }>>;
}>;
export type ServerVoxelChunk = typeof ServerVoxelChunkSchema.identity;
export declare const PendingVoxelWriteSchema: MuArray<MuStruct<{
    x: import("@box/mudb/schema").MuUint16;
    y: import("@box/mudb/schema").MuUint16;
    z: import("@box/mudb/schema").MuUint16;
    b: import("@box/mudb/schema").MuUint16;
}>>;
export declare const ServerVoxelConnectionSchema: MuStruct<{
    ready: MuBoolean;
    runs: MuArray<MuStruct<{
        offset: MuVarint;
        count: MuVarint;
        block: import("@box/mudb/schema").MuRelativeVarint;
    }>>;
}>;
export declare const ServerVoxelStateSchema: MuStruct<{
    ready: MuBoolean;
    resetCounter: MuUint32;
    pendingWrites: MuArray<MuStruct<{
        x: import("@box/mudb/schema").MuUint16;
        y: import("@box/mudb/schema").MuUint16;
        z: import("@box/mudb/schema").MuUint16;
        b: import("@box/mudb/schema").MuUint16;
    }>>;
    innerAO: MuBoolean;
    chunks: MuArray<MuStruct<{
        hash: import("@box/mudb/schema").MuASCII;
        versionCounter: MuVarint;
        dirtyGeom: MuBoolean;
        dirtyBoxes: MuBoolean;
        dirtyHash: MuBoolean;
        voxels: MuSchema<VoxelView>;
        geom: MuSchema<VoxelCollisionChunk>;
        boxes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            minX: import("@box/mudb/schema").MuUint8;
            minY: import("@box/mudb/schema").MuUint8;
            minZ: import("@box/mudb/schema").MuUint8;
            maxX: import("@box/mudb/schema").MuUint8;
            maxY: import("@box/mudb/schema").MuUint8;
            maxZ: import("@box/mudb/schema").MuUint8;
            faces: import("@box/mudb/schema").MuUint8;
            block: MuVarint;
        }>>;
    }>>;
    dirty: MuArray<MuSchema<import("@box/mudb/schema/struct").Struct<{
        hash: import("@box/mudb/schema").MuASCII;
        versionCounter: MuVarint;
        dirtyGeom: MuBoolean;
        dirtyBoxes: MuBoolean;
        dirtyHash: MuBoolean;
        voxels: MuSchema<VoxelView>;
        geom: MuSchema<VoxelCollisionChunk>;
        boxes: import("@box/mudb/schema").MuSortedArray<MuStruct<{
            minX: import("@box/mudb/schema").MuUint8;
            minY: import("@box/mudb/schema").MuUint8;
            minZ: import("@box/mudb/schema").MuUint8;
            maxX: import("@box/mudb/schema").MuUint8;
            maxY: import("@box/mudb/schema").MuUint8;
            maxZ: import("@box/mudb/schema").MuUint8;
            faces: import("@box/mudb/schema").MuUint8;
            block: MuVarint;
        }>>;
    }>>>;
}>;
export type ServerVoxelState = typeof ServerVoxelStateSchema.identity;
//# sourceMappingURL=voxel-server-schema.d.ts.map