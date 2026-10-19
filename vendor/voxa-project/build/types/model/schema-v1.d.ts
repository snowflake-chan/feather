import { MuArray, MuDictionary, MuStruct, MuUint8 } from '@box/mudb/schema';
export declare const MeshSchema: MuArray<MuUint8>;
export type Mesh = typeof MeshSchema.identity;
export declare const ModelDataV1Schema: MuStruct<{
    bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
    meshes: MuDictionary<MuArray<MuUint8>>;
}>;
export type ModelDataV1 = typeof ModelDataV1Schema.identity;
