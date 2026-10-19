import { MuStruct, MuVarint, MuDictionary, MuASCII, MuUTF8, MuArray, MuFloat32, MuSchema } from '@box/mudb/schema';
import { ProjectNodeType } from '../util';
import { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ProjectInterpolationType, KeyframeOffsetSchema, KeyframeSchema, KeyframeListSchema, MotionNodeSchema, MotionNodesSchema, ProjectAnimationSchema } from './schema-v6';
export { VoxelsSchema, VoxelSchema, PaletteDataSchema, PaletteItemsSchema, PaletteItemSchema, PaletteGroupsSchema, PaletteGroupSchema, ProjectInterpolationType, KeyframeOffsetSchema, KeyframeSchema, KeyframeListSchema, MotionNodeSchema, MotionNodesSchema, ProjectAnimationSchema, };
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
    parentScaleMat3: import("@box/mudb/schema").MuVector<"float32", 9>;
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
    parentScaleMat3: import("@box/mudb/schema").MuVector<"float32", 9>;
}>>;
export declare const ProjectDataV7Schema: MuStruct<{
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
        parentScaleMat3: import("@box/mudb/schema").MuVector<"float32", 9>;
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
                    translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    scale: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: import("@box/mudb/schema").MuOption<MuFloat32>;
                }>;
            }>>;
        }>>;
    }>>;
}>;
export type ProjectDataV7 = typeof ProjectDataV7Schema.identity;
