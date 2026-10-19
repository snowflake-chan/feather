import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { MuArray, MuASCII, MuSchema, MuStruct, MuUTF8, MuVarint } from '@box/mudb/schema';
import { ChannelNodePath } from '../util';
import { ModelNodesSchema } from './schema-v4';
export { ModelNodeSchema, ModelNode } from './schema-v4';
export { ModelNodesSchema, MeshTextureSchema, MeshDataSchema };
export declare const ChannelSchema: MuStruct<{
    sampler: MuVarint;
    target: MuStruct<{
        node: MuVarint;
        path: MuSchema<ChannelNodePath>;
    }>;
}>;
export declare const AnimationSchema: MuStruct<{
    id: MuASCII;
    name: MuUTF8;
    channels: MuArray<MuStruct<{
        sampler: MuVarint;
        target: MuStruct<{
            node: MuVarint;
            path: MuSchema<ChannelNodePath>;
        }>;
    }>>;
    samplers: MuArray<MuStruct<{
        input: MuArray<import("@box/mudb/schema").MuFloat32>;
        output: import("@box/mudb/schema").MuUnion<{
            rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
            translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
            alpha: MuArray<import("@box/mudb/schema").MuFloat32>;
            scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
        }>;
        interpolation: MuSchema<import("../util").ProjectInterpolationType>;
    }>>;
}>;
export declare const ModelDataV5Schema: MuStruct<{
    version: MuVarint;
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
    animations: MuArray<MuStruct<{
        id: MuASCII;
        name: MuUTF8;
        channels: MuArray<MuStruct<{
            sampler: MuVarint;
            target: MuStruct<{
                node: MuVarint;
                path: MuSchema<ChannelNodePath>;
            }>;
        }>>;
        samplers: MuArray<MuStruct<{
            input: MuArray<import("@box/mudb/schema").MuFloat32>;
            output: import("@box/mudb/schema").MuUnion<{
                rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                alpha: MuArray<import("@box/mudb/schema").MuFloat32>;
                scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
            }>;
            interpolation: MuSchema<import("../util").ProjectInterpolationType>;
        }>>;
    }>>;
}>;
export type ModelDataV5 = typeof ModelDataV5Schema.identity;
