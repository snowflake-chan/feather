import { MuArray, MuOption, MuSchema, MuStruct, MuVarint } from '@box/mudb/schema';
import { HitBoxMode } from '../util';
export { PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ProjectInterpolationType, KeyframeOffsetSchema, KeyframeSchema, KeyframeListSchema, MotionNodeSchema, MotionNodesSchema, ProjectAnimationSchema, NodeSchema, NodesSchema, VoxelsSchema, VoxelSchema, } from './schema-v8';
export declare const HitBoxDataSchema: MuStruct<{
    position: import("@box/mudb/schema").MuVector<"float32", 3>;
    size: import("@box/mudb/schema").MuVector<"float32", 3>;
}>;
export declare const HitBoxSchema: MuStruct<{
    mode: MuSchema<HitBoxMode>;
    customBox: MuOption<MuStruct<{
        position: import("@box/mudb/schema").MuVector<"float32", 3>;
        size: import("@box/mudb/schema").MuVector<"float32", 3>;
    }>>;
}>;
export declare const ProjectDataV9Schema: MuStruct<{
    version: MuVarint;
    nodes: import("@box/mudb/schema").MuDictionary<MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        type: MuSchema<import("../util").ProjectNodeType>;
        name: import("@box/mudb/schema").MuUTF8;
        voxelId: import("@box/mudb/schema").MuASCII;
        parentId: import("@box/mudb/schema").MuASCII;
        childrenIds: MuArray<import("@box/mudb/schema").MuASCII>;
        skinId: import("@box/mudb/schema").MuASCII;
        boneId: import("@box/mudb/schema").MuASCII;
        alpha: import("@box/mudb/schema").MuFloat32;
        pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
        position: import("@box/mudb/schema").MuVector<"float32", 3>;
        quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
        euler: import("@box/mudb/schema").MuVector<"float32", 3>;
        flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
        scale: import("@box/mudb/schema").MuVector<"float32", 3>;
        parentScaleMat3: import("@box/mudb/schema").MuVector<"float32", 9>;
    }>>;
    voxels: import("@box/mudb/schema").MuDictionary<MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        dimension: MuSchema<import("../util").VoxelDimension>;
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
        id: import("@box/mudb/schema").MuASCII;
        name: import("@box/mudb/schema").MuUTF8;
        nodes: import("@box/mudb/schema").MuDictionary<MuStruct<{
            nodeId: import("@box/mudb/schema").MuASCII;
            keyframeList: MuArray<MuStruct<{
                time: import("@box/mudb/schema").MuASCII;
                interpolation: MuSchema<import("./schema-v8").ProjectInterpolationType>;
                offset: MuStruct<{
                    translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: MuOption<import("@box/mudb/schema").MuFloat32>;
                }>;
            }>>;
        }>>;
    }>>;
    hitBox: MuStruct<{
        mode: MuSchema<HitBoxMode>;
        customBox: MuOption<MuStruct<{
            position: import("@box/mudb/schema").MuVector<"float32", 3>;
            size: import("@box/mudb/schema").MuVector<"float32", 3>;
        }>>;
    }>;
}>;
export type ProjectDataV9 = typeof ProjectDataV9Schema.identity;
