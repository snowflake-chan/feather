import { MuStruct, MuVarint, MuDictionary, MuASCII, MuUTF8, MuArray, MuFloat32, MuSchema, MuOption } from '@box/mudb/schema';
import { ProjectNodeType } from '../util';
import { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ProjectInterpolationType } from './schema-v5';
export { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ProjectInterpolationType, };
export declare const NodeSchema: MuStruct<{
    id: MuASCII;
    type: MuSchema<ProjectNodeType>;
    name: MuUTF8;
    voxelId: MuASCII;
    parentId: MuASCII;
    childrenIds: MuArray<MuASCII>;
    skinId: MuASCII;
    boneId: MuASCII;
    alpha: MuFloat32;
    pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
    position: import("@box/mudb/schema").MuVector<"float32", 3>;
    quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
    euler: import("@box/mudb/schema").MuVector<"float32", 3>;
    flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
    scale: import("@box/mudb/schema").MuVector<"float32", 3>;
}>;
export declare const NodesSchema: MuDictionary<MuStruct<{
    id: MuASCII;
    type: MuSchema<ProjectNodeType>;
    name: MuUTF8;
    voxelId: MuASCII;
    parentId: MuASCII;
    childrenIds: MuArray<MuASCII>;
    skinId: MuASCII;
    boneId: MuASCII;
    alpha: MuFloat32;
    pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
    position: import("@box/mudb/schema").MuVector<"float32", 3>;
    quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
    euler: import("@box/mudb/schema").MuVector<"float32", 3>;
    flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
    scale: import("@box/mudb/schema").MuVector<"float32", 3>;
}>>;
export declare const KeyframeOffsetSchema: MuStruct<{
    translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
    rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
    scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
    alpha: MuOption<MuFloat32>;
}>;
export declare const KeyframeSchema: MuStruct<{
    time: MuASCII;
    interpolation: MuSchema<ProjectInterpolationType>;
    offset: MuStruct<{
        translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
        rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
        scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
        alpha: MuOption<MuFloat32>;
    }>;
}>;
export declare const KeyframeListSchema: MuArray<MuStruct<{
    time: MuASCII;
    interpolation: MuSchema<ProjectInterpolationType>;
    offset: MuStruct<{
        translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
        rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
        scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
        alpha: MuOption<MuFloat32>;
    }>;
}>>;
export declare const MotionNodeSchema: MuStruct<{
    nodeId: MuASCII;
    keyframeList: MuArray<MuStruct<{
        time: MuASCII;
        interpolation: MuSchema<ProjectInterpolationType>;
        offset: MuStruct<{
            translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
            rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
            scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
            alpha: MuOption<MuFloat32>;
        }>;
    }>>;
}>;
export declare const MotionNodesSchema: MuDictionary<MuStruct<{
    nodeId: MuASCII;
    keyframeList: MuArray<MuStruct<{
        time: MuASCII;
        interpolation: MuSchema<ProjectInterpolationType>;
        offset: MuStruct<{
            translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
            rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
            scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
            alpha: MuOption<MuFloat32>;
        }>;
    }>>;
}>>;
export declare const ProjectAnimationSchema: MuStruct<{
    id: MuASCII;
    name: MuUTF8;
    nodes: MuDictionary<MuStruct<{
        nodeId: MuASCII;
        keyframeList: MuArray<MuStruct<{
            time: MuASCII;
            interpolation: MuSchema<ProjectInterpolationType>;
            offset: MuStruct<{
                translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                alpha: MuOption<MuFloat32>;
            }>;
        }>>;
    }>>;
}>;
export declare const ProjectDataV6Schema: MuStruct<{
    version: MuVarint;
    nodes: MuDictionary<MuStruct<{
        id: MuASCII;
        type: MuSchema<ProjectNodeType>;
        name: MuUTF8;
        voxelId: MuASCII;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        skinId: MuASCII;
        boneId: MuASCII;
        alpha: MuFloat32;
        pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
        position: import("@box/mudb/schema").MuVector<"float32", 3>;
        quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
        euler: import("@box/mudb/schema").MuVector<"float32", 3>;
        flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
        scale: import("@box/mudb/schema").MuVector<"float32", 3>;
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
        id: MuASCII;
        name: MuUTF8;
        nodes: MuDictionary<MuStruct<{
            nodeId: MuASCII;
            keyframeList: MuArray<MuStruct<{
                time: MuASCII;
                interpolation: MuSchema<ProjectInterpolationType>;
                offset: MuStruct<{
                    translation: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    rotation: MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    scale: MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: MuOption<MuFloat32>;
                }>;
            }>>;
        }>>;
    }>>;
}>;
export type ProjectDataV6 = typeof ProjectDataV6Schema.identity;
