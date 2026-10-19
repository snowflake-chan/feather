import { MuStruct, MuInt32, MuArray, MuBoolean } from '@box/mudb/schema';
export declare const CHUNK_SHIFT = 5;
export declare const CHUNK_SIZE: number;
export declare const CHUNK_MASK: number;
export declare const VoxelCollisionChunkSchema: MuStruct<{
    i: MuInt32;
    j: MuInt32;
    k: MuInt32;
    hasSolid: MuBoolean;
    rbush: import("@box/mudb/schema").MuSchema<import("../utils/rbush-schema").RBushNode>;
    hasFluid: MuBoolean;
    fluidRBush: import("@box/mudb/schema").MuSchema<import("../utils/rbush-schema").RBushNode>;
}>;
export type VoxelCollisionChunk = typeof VoxelCollisionChunkSchema.identity;
export declare const VoxelCollisionSchema: MuStruct<{
    chunkDimI: MuInt32;
    chunkDimJ: MuInt32;
    chunkDimK: MuInt32;
    chunks: MuArray<MuStruct<{
        i: MuInt32;
        j: MuInt32;
        k: MuInt32;
        hasSolid: MuBoolean;
        rbush: import("@box/mudb/schema").MuSchema<import("../utils/rbush-schema").RBushNode>;
        hasFluid: MuBoolean;
        fluidRBush: import("@box/mudb/schema").MuSchema<import("../utils/rbush-schema").RBushNode>;
    }>>;
}>;
export type VoxelCollision = typeof VoxelCollisionSchema.identity;
//# sourceMappingURL=voxel-collision-schema.d.ts.map