import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { MuArray, MuStruct, MuVarint } from '@box/mudb/schema';
import { ModelNodesSchema } from './schema-v2';
export { ModelNodeSchema, ModelNode } from './schema-v2';
export { ModelNodesSchema, MeshTextureSchema, MeshDataSchema };
export declare const ModelDataV3Schema: MuStruct<{
    version: MuVarint;
    bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
    nodes: MuArray<MuStruct<{
        mesh: import("@box/mudb/schema").MuInt32;
        rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
        translation: import("@box/mudb/schema").MuVector<"float32", 3>;
        children: MuArray<MuVarint>;
        alpha: import("@box/mudb/schema").MuFloat32;
    }>>;
    texture: MuStruct<{
        palette: MuArray<import("@box/mudb/schema").MuUint32>;
        data: MuArray<MuVarint>;
        width: MuVarint;
    }>;
    meshes: MuArray<MuArray<MuStruct<{
        vertices: MuArray<MuVarint>;
        sizes: MuArray<MuVarint>;
        uvs: MuArray<MuVarint>;
        uvFlags: MuArray<import("@box/mudb/schema").MuUint8>;
    }>>>;
}>;
export type ModelDataV3 = typeof ModelDataV3Schema.identity;
