import { MuStruct, MuVarint, MuDictionary, MuASCII, MuUTF8, MuArray, MuFloat32, MuUint16, MuSchema } from '@box/mudb/schema';
import { ProjectNodeType } from '../util';
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
export declare const VoxelSchema: MuStruct<{
    id: MuASCII;
    encodedView: MuArray<MuVarint>;
}>;
export declare const VoxelsSchema: MuDictionary<MuStruct<{
    id: MuASCII;
    encodedView: MuArray<MuVarint>;
}>>;
export declare const PaletteItemSchema: MuStruct<{
    id: MuVarint;
    rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
    hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
    material: MuStruct<{
        emissive: MuFloat32;
    }>;
}>;
export declare const PaletteItemsSchema: MuArray<MuStruct<{
    id: MuVarint;
    rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
    hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
    material: MuStruct<{
        emissive: MuFloat32;
    }>;
}>>;
export declare const PaletteGroupSchema: MuStruct<{
    id: MuASCII;
    name: MuUTF8;
    itemIds: MuArray<MuUint16>;
}>;
export declare const PaletteGroupsSchema: MuDictionary<MuStruct<{
    id: MuASCII;
    name: MuUTF8;
    itemIds: MuArray<MuUint16>;
}>>;
export declare const PaletteDataSchema: MuStruct<{
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
        itemIds: MuArray<MuUint16>;
    }>>;
    groupList: MuArray<MuASCII>;
}>;
export declare const ProjectDataV2Schema: MuStruct<{
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
            itemIds: MuArray<MuUint16>;
        }>>;
        groupList: MuArray<MuASCII>;
    }>;
}>;
export type ProjectDataV2 = typeof ProjectDataV2Schema.identity;
