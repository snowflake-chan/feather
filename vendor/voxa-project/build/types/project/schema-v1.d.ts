import { MuArray, MuASCII, MuDictionary, MuFloat32, MuInt32, MuSchema, MuStruct, MuUint8, MuUTF8, MuVarint } from '@box/mudb/schema';
import { ProjectNodeType } from '../util';
export declare const NodeSchema: MuStruct<{
    id: MuASCII;
    type: MuSchema<ProjectNodeType>;
    name: MuUTF8;
    voxelId: MuASCII;
    parentId: MuASCII;
    childrenIds: MuArray<MuASCII>;
    pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
    position: import("@box/mudb/schema").MuVector<"float32", 3>;
    quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
}>;
export declare const NodesSchema: MuDictionary<MuStruct<{
    id: MuASCII;
    type: MuSchema<ProjectNodeType>;
    name: MuUTF8;
    voxelId: MuASCII;
    parentId: MuASCII;
    childrenIds: MuArray<MuASCII>;
    pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
    position: import("@box/mudb/schema").MuVector<"float32", 3>;
    quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
}>>;
export declare const VoxelSchema: MuStruct<{
    id: MuASCII;
    encodedView: MuArray<MuVarint>;
    localPalette: MuArray<MuInt32>;
}>;
export declare const VoxelsSchema: MuDictionary<MuStruct<{
    id: MuASCII;
    encodedView: MuArray<MuVarint>;
    localPalette: MuArray<MuInt32>;
}>>;
export declare const RGBSchema: MuStruct<{
    r: MuUint8;
    g: MuUint8;
    b: MuUint8;
}>;
export declare const PaletteItemsSchema: MuStruct<{
    id: MuASCII;
    color: MuStruct<{
        r: MuUint8;
        g: MuUint8;
        b: MuUint8;
    }>;
    hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
    material: MuStruct<{
        emissive: MuFloat32;
    }>;
}>;
export declare const PaletteGroupSchema: MuStruct<{
    id: MuASCII;
    name: MuUTF8;
    colorIndices: MuArray<MuVarint>;
}>;
export declare const PaletteDataSchema: MuStruct<{
    items: MuArray<MuStruct<{
        id: MuASCII;
        color: MuStruct<{
            r: MuUint8;
            g: MuUint8;
            b: MuUint8;
        }>;
        hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
        material: MuStruct<{
            emissive: MuFloat32;
        }>;
    }>>;
    groups: MuDictionary<MuStruct<{
        id: MuASCII;
        name: MuUTF8;
        colorIndices: MuArray<MuVarint>;
    }>>;
    groupList: MuArray<MuASCII>;
}>;
export declare const ProjectDataV1Schema: MuStruct<{
    version: MuVarint;
    nodes: MuDictionary<MuStruct<{
        id: MuASCII;
        type: MuSchema<ProjectNodeType>;
        name: MuUTF8;
        voxelId: MuASCII;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
        position: import("@box/mudb/schema").MuVector<"float32", 3>;
        quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
    }>>;
    voxels: MuDictionary<MuStruct<{
        id: MuASCII;
        encodedView: MuArray<MuVarint>;
        localPalette: MuArray<MuInt32>;
    }>>;
    palette: MuStruct<{
        items: MuArray<MuStruct<{
            id: MuASCII;
            color: MuStruct<{
                r: MuUint8;
                g: MuUint8;
                b: MuUint8;
            }>;
            hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
            material: MuStruct<{
                emissive: MuFloat32;
            }>;
        }>>;
        groups: MuDictionary<MuStruct<{
            id: MuASCII;
            name: MuUTF8;
            colorIndices: MuArray<MuVarint>;
        }>>;
        groupList: MuArray<MuASCII>;
    }>;
}>;
export type ProjectDataV1 = typeof ProjectDataV1Schema.identity;
