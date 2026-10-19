import { MuStruct, MuVarint, MuDictionary, MuASCII, MuUTF8, MuArray, MuFloat32, MuSchema } from '@box/mudb/schema';
import { ChannelNodePath, ProjectInterpolationType, OutputSchema, SamplerSchema, TimeAccessorSchema, ProjectNodeType } from '../util';
import { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema } from './schema-v2';
export { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ChannelNodePath, ProjectInterpolationType, OutputSchema, SamplerSchema, TimeAccessorSchema, };
export declare const NodeSchema: MuStruct<{
    id: MuASCII;
    type: MuSchema<ProjectNodeType>;
    name: MuUTF8;
    voxelId: MuASCII;
    parentId: MuASCII;
    childrenIds: MuArray<MuASCII>;
    alpha: MuFloat32;
    pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
    position: import("@box/mudb/schema").MuVector<"float32", 3>;
    quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
    euler: import("@box/mudb/schema").MuVector<"float32", 3>;
    flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
}>;
export declare const NodesSchema: MuDictionary<MuStruct<{
    id: MuASCII;
    type: MuSchema<ProjectNodeType>;
    name: MuUTF8;
    voxelId: MuASCII;
    parentId: MuASCII;
    childrenIds: MuArray<MuASCII>;
    alpha: MuFloat32;
    pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
    position: import("@box/mudb/schema").MuVector<"float32", 3>;
    quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
    euler: import("@box/mudb/schema").MuVector<"float32", 3>;
    flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
}>>;
export declare const ProjectChannelSchema: MuStruct<{
    target: MuStruct<{
        nodeId: MuASCII;
        path: MuSchema<ChannelNodePath>;
    }>;
    sampler: MuStruct<{
        input: MuArray<MuFloat32>;
        output: import("@box/mudb/schema").MuUnion<{
            rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
            translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
            alpha: MuArray<MuFloat32>;
            scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
        }>;
        interpolation: MuSchema<ProjectInterpolationType>;
    }>;
}>;
export declare const ProjectAnimationSchema: MuStruct<{
    name: MuUTF8;
    channels: MuArray<MuStruct<{
        target: MuStruct<{
            nodeId: MuASCII;
            path: MuSchema<ChannelNodePath>;
        }>;
        sampler: MuStruct<{
            input: MuArray<MuFloat32>;
            output: import("@box/mudb/schema").MuUnion<{
                rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                alpha: MuArray<MuFloat32>;
                scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
            }>;
            interpolation: MuSchema<ProjectInterpolationType>;
        }>;
    }>>;
}>;
export declare const ProjectDataV3Schema: MuStruct<{
    version: MuVarint;
    nodes: MuDictionary<MuStruct<{
        id: MuASCII;
        type: MuSchema<ProjectNodeType>;
        name: MuUTF8;
        voxelId: MuASCII;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        alpha: MuFloat32;
        pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
        position: import("@box/mudb/schema").MuVector<"float32", 3>;
        quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
        euler: import("@box/mudb/schema").MuVector<"float32", 3>;
        flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
    }>>;
    voxels: MuDictionary<MuStruct<{
        id: MuASCII;
        encodedView: MuArray<MuVarint>;
    }>>;
    palette: MuStruct<{
        items: MuArray<MuStruct<{
            id: MuVarint;
            rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
            hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
            material: MuStruct<{
                emissive: MuFloat32;
            }>;
        }>>;
        groups: MuDictionary<MuStruct<{
            id: MuASCII;
            name: MuUTF8;
            itemIds: MuArray<import("@box/mudb/schema").MuUint16>;
        }>>;
        groupList: MuArray<MuASCII>;
    }>;
    animations: MuArray<MuStruct<{
        name: MuUTF8;
        channels: MuArray<MuStruct<{
            target: MuStruct<{
                nodeId: MuASCII;
                path: MuSchema<ChannelNodePath>;
            }>;
            sampler: MuStruct<{
                input: MuArray<MuFloat32>;
                output: import("@box/mudb/schema").MuUnion<{
                    rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: MuArray<MuFloat32>;
                    scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                }>;
                interpolation: MuSchema<ProjectInterpolationType>;
            }>;
        }>>;
    }>>;
}>;
export type ProjectDataV3 = typeof ProjectDataV3Schema.identity;
