import { MuStruct, MuVarint, MuArray, MuASCII, MuDictionary, MuSchema } from '@box/mudb/schema';
import { PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ProjectInterpolationType, KeyframeOffsetSchema, KeyframeSchema, KeyframeListSchema, MotionNodeSchema, MotionNodesSchema, ProjectAnimationSchema, NodeSchema, NodesSchema } from './schema-v7';
import { VoxelDimension } from '../util';
export { PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ProjectInterpolationType, KeyframeOffsetSchema, KeyframeSchema, KeyframeListSchema, MotionNodeSchema, MotionNodesSchema, ProjectAnimationSchema, NodeSchema, NodesSchema, };
export declare const VoxelSchema: MuStruct<{
    id: MuASCII;
    dimension: MuSchema<VoxelDimension>;
    encodedView: MuArray<MuVarint>;
}>;
export declare const VoxelsSchema: MuDictionary<MuStruct<{
    id: MuASCII;
    dimension: MuSchema<VoxelDimension>;
    encodedView: MuArray<MuVarint>;
}>>;
export declare const ProjectDataV8Schema: MuStruct<{
    version: MuVarint;
    nodes: MuDictionary<MuStruct<{
        id: MuASCII;
        type: MuSchema<import("../util").ProjectNodeType>;
        name: import("@box/mudb/schema").MuUTF8;
        voxelId: MuASCII;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        skinId: MuASCII;
        boneId: MuASCII;
        alpha: import("@box/mudb/schema").MuFloat32;
        pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
        position: import("@box/mudb/schema").MuVector<"float32", 3>;
        quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
        euler: import("@box/mudb/schema").MuVector<"float32", 3>;
        flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
        scale: import("@box/mudb/schema").MuVector<"float32", 3>;
        parentScaleMat3: import("@box/mudb/schema").MuVector<"float32", 9>;
    }>>;
    voxels: MuDictionary<MuStruct<{
        id: MuASCII;
        dimension: MuSchema<VoxelDimension>;
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
        groups: MuDictionary<MuStruct<{
            id: MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            itemIds: MuArray<import("@box/mudb/schema").MuUint16>;
        }>>;
        groupList: MuArray<MuASCII>;
    }>;
    animations: MuArray<MuStruct<{
        id: MuASCII;
        name: import("@box/mudb/schema").MuUTF8;
        nodes: MuDictionary<MuStruct<{
            nodeId: MuASCII;
            keyframeList: MuArray<MuStruct<{
                time: MuASCII;
                interpolation: MuSchema<ProjectInterpolationType>;
                offset: MuStruct<{
                    translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    scale: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuFloat32>;
                }>;
            }>>;
        }>>;
    }>>;
}>;
export type ProjectDataV8 = typeof ProjectDataV8Schema.identity;
