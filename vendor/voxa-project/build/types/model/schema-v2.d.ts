import { MuArray, MuFloat32, MuInt32, MuStruct, MuVarint } from '@box/mudb/schema';
import { MeshSchema } from './schema-v1';
export { MeshSchema };
export declare const ModelNodeSchema: MuStruct<{
    mesh: MuInt32;
    rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
    translation: import("@box/mudb/schema").MuVector<"float32", 3>;
    children: MuArray<MuVarint>;
    alpha: MuFloat32;
}>;
export type ModelNode = typeof ModelNodeSchema.identity;
export declare const ModelNodesSchema: MuArray<MuStruct<{
    mesh: MuInt32;
    rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
    translation: import("@box/mudb/schema").MuVector<"float32", 3>;
    children: MuArray<MuVarint>;
    alpha: MuFloat32;
}>>;
export declare const ModelDataV2Schema: MuStruct<{
    version: MuVarint;
    bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
    nodes: MuArray<MuStruct<{
        mesh: MuInt32;
        rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
        translation: import("@box/mudb/schema").MuVector<"float32", 3>;
        children: MuArray<MuVarint>;
        alpha: MuFloat32;
    }>>;
    meshes: MuArray<MuArray<import("@box/mudb/schema").MuUint8>>;
}>;
export type ModelDataV2 = typeof ModelDataV2Schema.identity;
