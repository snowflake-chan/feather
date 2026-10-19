import { MuStruct, MuUint16, MuArray, MuUint32, MuVarint, MuRelativeVarint, MuBoolean, MuFloat64 } from '@box/mudb/schema';
export declare const VOXEL_ROTATION_SHIFT = 14;
export declare const VOXEL_TYPE_MASK: number;
export declare const VoxelWriteSchema: MuStruct<{
    x: MuUint16;
    y: MuUint16;
    z: MuUint16;
    b: MuUint16;
}>;
export type VoxelWrite = typeof VoxelWriteSchema.identity;
export declare const VoxelResetSchema: MuStruct<{
    resetCounter: MuUint32;
    nx: MuUint16;
    ny: MuUint16;
    nz: MuUint16;
    blocks: import("@box/mudb/schema").MuASCII;
    hashes: MuArray<import("@box/mudb/schema").MuASCII>;
    innerAO: MuBoolean;
    positionX: MuFloat64;
    positionY: MuFloat64;
    positionZ: MuFloat64;
}>;
export declare const BatchVoxelRunSchema: MuStruct<{
    offset: MuVarint;
    count: MuVarint;
    block: MuRelativeVarint;
}>;
export type BatchVoxelRun = typeof BatchVoxelRunSchema.identity;
export declare const BatchWriteSchema: MuArray<MuStruct<{
    offset: MuVarint;
    count: MuVarint;
    block: MuRelativeVarint;
}>>;
export type BatchWrite = typeof BatchWriteSchema.identity;
export declare const ChunkIdsSchema: MuArray<MuVarint>;
export declare const FetchHashesSchema: MuStruct<{
    startI: MuVarint;
    startJ: MuVarint;
    startK: MuVarint;
    chunkIds: MuArray<MuVarint>;
    dirtyChunks: MuArray<MuVarint>;
}>;
export type FetchHashes = typeof FetchHashesSchema.identity;
export declare const HashesResponseSchema: MuStruct<{
    startI: MuVarint;
    startJ: MuVarint;
    startK: MuVarint;
    dirtyChunks: MuArray<MuVarint>;
    chunksInfo: MuArray<MuStruct<{
        idx: MuVarint;
        hash: import("@box/mudb/schema").MuASCII;
    }>>;
}>;
export type HashesResponse = typeof HashesResponseSchema.identity;
export declare const VoxelProtocol: {
    name: string;
    client: {
        reset: MuStruct<{
            resetCounter: MuUint32;
            nx: MuUint16;
            ny: MuUint16;
            nz: MuUint16;
            blocks: import("@box/mudb/schema").MuASCII;
            hashes: MuArray<import("@box/mudb/schema").MuASCII>;
            innerAO: MuBoolean;
            positionX: MuFloat64;
            positionY: MuFloat64;
            positionZ: MuFloat64;
        }>;
        voxelChange: MuArray<MuStruct<{
            offset: MuVarint;
            count: MuVarint;
            block: MuRelativeVarint;
        }>>;
        chunkResponse: MuStruct<{
            rpcId: MuVarint;
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
        lightMapResponse: MuBoolean;
        hashesResponse: MuStruct<{
            startI: MuVarint;
            startJ: MuVarint;
            startK: MuVarint;
            dirtyChunks: MuArray<MuVarint>;
            chunksInfo: MuArray<MuStruct<{
                idx: MuVarint;
                hash: import("@box/mudb/schema").MuASCII;
            }>>;
        }>;
    };
    server: {
        ready: MuVarint;
        fetchChunk: MuStruct<{
            chunkId: MuVarint;
            rpcId: MuVarint;
        }>;
        rebuildLightMap: MuBoolean;
        fetchHashes: MuStruct<{
            startI: MuVarint;
            startJ: MuVarint;
            startK: MuVarint;
            chunkIds: MuArray<MuVarint>;
            dirtyChunks: MuArray<MuVarint>;
        }>;
    };
};
//# sourceMappingURL=voxel-protocol.d.ts.map