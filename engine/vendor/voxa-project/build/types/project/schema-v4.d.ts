import { MuStruct, MuVarint, MuArray } from '@box/mudb/schema';
import { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, NodesSchema, NodeSchema, ProjectAnimationSchema, ProjectInterpolationType, ProjectChannelSchema } from './schema-v3';
export { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, NodeSchema, NodesSchema, ProjectAnimationSchema, ProjectInterpolationType, ProjectChannelSchema, };
export declare const ProjectDataV4Schema: MuStruct<{
    version: MuVarint;
    nodes: import("@box/mudb/schema").MuDictionary<MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
        name: import("@box/mudb/schema").MuUTF8;
        voxelId: import("@box/mudb/schema").MuASCII;
        parentId: import("@box/mudb/schema").MuASCII;
        childrenIds: MuArray<import("@box/mudb/schema").MuASCII>;
        alpha: import("@box/mudb/schema").MuFloat32;
        pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
        position: import("@box/mudb/schema").MuVector<"float32", 3>;
        quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
        euler: import("@box/mudb/schema").MuVector<"float32", 3>;
        flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
    }>>;
    voxels: import("@box/mudb/schema").MuDictionary<MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        encodedView: MuArray<MuVarint>;
    }>>;
    palette: MuStruct<{
        items: MuArray<MuStruct<{
            id: MuVarint;
            rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
            hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
            material: MuStruct<{
                emissive: import("@box/mudb/schema").MuFloat32;
            }>;
        }>>;
        groups: import("@box/mudb/schema").MuDictionary<MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            itemIds: MuArray<import("@box/mudb/schema").MuUint16>;
        }>>;
        groupList: MuArray<import("@box/mudb/schema").MuASCII>;
    }>;
    animations: MuArray<MuStruct<{
        name: import("@box/mudb/schema").MuUTF8;
        channels: MuArray<MuStruct<{
            target: MuStruct<{
                nodeId: import("@box/mudb/schema").MuASCII;
                path: import("@box/mudb/schema").MuSchema<import("./schema-v3").ChannelNodePath>;
            }>;
            sampler: MuStruct<{
                input: MuArray<import("@box/mudb/schema").MuFloat32>;
                output: import("@box/mudb/schema").MuUnion<{
                    rotation: MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    translation: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: MuArray<import("@box/mudb/schema").MuFloat32>;
                    scale: MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                }>;
                interpolation: import("@box/mudb/schema").MuSchema<ProjectInterpolationType>;
            }>;
        }>>;
    }>>;
}>;
export type ProjectDataV4 = typeof ProjectDataV4Schema.identity;
