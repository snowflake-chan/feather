import { VoxelView } from '@box/utils/voxel';
export declare function generateNewMesh(voxel: VoxelView, palette: number[] | [number, number, number][], emissivePalette: number[], surfaceOnly?: boolean): Promise<import("@box/mudb/schema/struct").Struct<{
    texture: import("@box/mudb/schema").MuStruct<{
        palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
        data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        width: import("@box/mudb/schema").MuVarint;
    }>;
    data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
        vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
    }>>;
}>>;
//# sourceMappingURL=new-mesher.d.ts.map