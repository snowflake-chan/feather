import { MuSchema } from '@box/mudb/schema';
import { ProjectDataTypes, ProjectData } from '../def';
export declare function migrate(bytes: Uint8Array): ProjectData | undefined;
export declare function projectBytesToSchema(bytes: Uint8Array): {
    version: number;
    schema: import("@box/mudb/schema/struct").Struct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: MuSchema<import("../..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
            position: import("@box/mudb/schema").MuVector<"float32", 3>;
            quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
        }>>;
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            localPalette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuInt32>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                color: import("@box/mudb/schema").MuStruct<{
                    r: import("@box/mudb/schema").MuUint8;
                    g: import("@box/mudb/schema").MuUint8;
                    b: import("@box/mudb/schema").MuUint8;
                }>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                colorIndices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
    }>;
} | {
    version: 4 | 3 | 8 | 1 | 2 | 5 | 7 | 10 | 6 | 9;
    schema: ProjectDataTypes;
} | undefined;
export declare function projectSchemaToBytes(value: ProjectDataTypes): Uint8Array;
