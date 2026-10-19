import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { MuArray, MuASCII, MuFloat32, MuInt32, MuSchema, MuStruct, MuUTF8, MuVarint } from '@box/mudb/schema';
import { ChannelNodePath } from '../util';
export { MeshTextureSchema, MeshDataSchema };
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
        input: MuArray<MuFloat32>;
        output: import("@box/mudb/schema").MuUnion<{
            rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
            translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
            alpha: MuArray<MuFloat32>;
            scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
        }>;
        interpolation: MuSchema<import("../util").ProjectInterpolationType>;
    }>>;
}>;
export declare const ModelNodeSchema: MuStruct<{
    mesh: MuInt32;
    rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
    translation: import("@box/mudb/schema").MuVector<"float32", 3>;
    scale: import("@box/mudb/schema").MuVector<"float32", 3>;
    children: MuArray<MuVarint>;
    alpha: MuFloat32;
}>;
export type ModelNode = typeof ModelNodeSchema.identity;
export declare const ModelNodesSchema: MuArray<MuStruct<{
    mesh: MuInt32;
    rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
    translation: import("@box/mudb/schema").MuVector<"float32", 3>;
    scale: import("@box/mudb/schema").MuVector<"float32", 3>;
    children: MuArray<MuVarint>;
    alpha: MuFloat32;
}>>;
export declare const ModelDataV6Schema: MuStruct<{
    version: MuVarint;
    nodes: MuArray<MuStruct<{
        mesh: MuInt32;
        rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
        translation: import("@box/mudb/schema").MuVector<"float32", 3>;
        scale: import("@box/mudb/schema").MuVector<"float32", 3>;
        children: MuArray<MuVarint>;
        alpha: MuFloat32;
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
            input: MuArray<MuFloat32>;
            output: import("@box/mudb/schema").MuUnion<{
                rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                alpha: MuArray<MuFloat32>;
                scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
            }>;
            interpolation: MuSchema<import("../util").ProjectInterpolationType>;
        }>>;
    }>>;
}>;
export type ModelDataV6 = typeof ModelDataV6Schema.identity;
