import { MuArray, MuStruct, MuVarint, MuUint8, MuUint32 } from '@box/mudb/schema';
export declare const MeshTextureSchema: MuStruct<{
    palette: MuArray<MuUint32>;
    data: MuArray<MuVarint>;
    width: MuVarint;
}>;
export declare const MeshDataSchema: MuArray<MuStruct<{
    vertices: MuArray<MuVarint>;
    sizes: MuArray<MuVarint>;
    uvs: MuArray<MuVarint>;
    uvFlags: MuArray<MuUint8>;
}>>;
