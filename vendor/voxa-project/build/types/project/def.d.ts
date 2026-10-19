import { ProjectDataV1 } from './schema-v1';
import { ProjectDataV2 } from './schema-v2';
import { ProjectDataV3 } from './schema-v3';
import { ProjectDataV4 } from './schema-v4';
import { ProjectDataV5 } from './schema-v5';
import { ProjectDataV6 } from './schema-v6';
import { ProjectDataV7 } from './schema-v7';
import { ProjectDataV8 } from './schema-v8';
import { ProjectDataV9 } from './schema-v9';
import { ProjectDataV10 } from './schema-v10';
export type ProjectDataTypes = ProjectDataV1 | ProjectDataV2 | ProjectDataV3 | ProjectDataV4 | ProjectDataV5 | ProjectDataV6 | ProjectDataV7 | ProjectDataV8 | ProjectDataV9 | ProjectDataV10;
export type ProjectData = ProjectDataV10;
export declare const VOXA_PROJECT_VERSION = 10;
export declare const PROJECT_SCHEMA: {
    1: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
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
    2: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            alpha: import("@box/mudb/schema").MuFloat32;
            pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
            position: import("@box/mudb/schema").MuVector<"float32", 3>;
            quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
            euler: import("@box/mudb/schema").MuVector<"float32", 3>;
            flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
        }>>;
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
    }>;
    3: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            alpha: import("@box/mudb/schema").MuFloat32;
            pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
            position: import("@box/mudb/schema").MuVector<"float32", 3>;
            quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
            euler: import("@box/mudb/schema").MuVector<"float32", 3>;
            flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
        }>>;
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            name: import("@box/mudb/schema").MuUTF8;
            channels: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                target: import("@box/mudb/schema").MuStruct<{
                    nodeId: import("@box/mudb/schema").MuASCII;
                    path: import("@box/mudb/schema").MuSchema<import("./schema-v3").ChannelNodePath>;
                }>;
                sampler: import("@box/mudb/schema").MuStruct<{
                    input: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                    output: import("@box/mudb/schema").MuUnion<{
                        rotation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        translation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        alpha: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                        scale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    }>;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                }>;
            }>>;
        }>>;
    }>;
    4: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            alpha: import("@box/mudb/schema").MuFloat32;
            pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
            position: import("@box/mudb/schema").MuVector<"float32", 3>;
            quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
            euler: import("@box/mudb/schema").MuVector<"float32", 3>;
            flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
        }>>;
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            name: import("@box/mudb/schema").MuUTF8;
            channels: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                target: import("@box/mudb/schema").MuStruct<{
                    nodeId: import("@box/mudb/schema").MuASCII;
                    path: import("@box/mudb/schema").MuSchema<import("./schema-v3").ChannelNodePath>;
                }>;
                sampler: import("@box/mudb/schema").MuStruct<{
                    input: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                    output: import("@box/mudb/schema").MuUnion<{
                        rotation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        translation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        alpha: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                        scale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    }>;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                }>;
            }>>;
        }>>;
    }>;
    5: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            skinId: import("@box/mudb/schema").MuASCII;
            boneId: import("@box/mudb/schema").MuASCII;
            alpha: import("@box/mudb/schema").MuFloat32;
            pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
            position: import("@box/mudb/schema").MuVector<"float32", 3>;
            quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
            euler: import("@box/mudb/schema").MuVector<"float32", 3>;
            flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
        }>>;
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                nodeId: import("@box/mudb/schema").MuASCII;
                keyframeList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    time: import("@box/mudb/schema").MuASCII;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                    offset: import("@box/mudb/schema").MuStruct<{
                        translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        alpha: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuFloat32>;
                    }>;
                }>>;
            }>>;
        }>>;
    }>;
    6: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
            skinId: import("@box/mudb/schema").MuASCII;
            boneId: import("@box/mudb/schema").MuASCII;
            alpha: import("@box/mudb/schema").MuFloat32;
            pivot: import("@box/mudb/schema").MuVector<"float32", 3>;
            position: import("@box/mudb/schema").MuVector<"float32", 3>;
            quaternion: import("@box/mudb/schema").MuVector<"float32", 4>;
            euler: import("@box/mudb/schema").MuVector<"float32", 3>;
            flip: import("@box/mudb/schema").MuVector<"uint8", 3>;
            scale: import("@box/mudb/schema").MuVector<"float32", 3>;
        }>>;
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                nodeId: import("@box/mudb/schema").MuASCII;
                keyframeList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    time: import("@box/mudb/schema").MuASCII;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                    offset: import("@box/mudb/schema").MuStruct<{
                        translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        scale: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        alpha: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuFloat32>;
                    }>;
                }>>;
            }>>;
        }>>;
    }>;
    7: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
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
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                nodeId: import("@box/mudb/schema").MuASCII;
                keyframeList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    time: import("@box/mudb/schema").MuASCII;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                    offset: import("@box/mudb/schema").MuStruct<{
                        translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        scale: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        alpha: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuFloat32>;
                    }>;
                }>>;
            }>>;
        }>>;
    }>;
    8: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
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
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            dimension: import("@box/mudb/schema").MuSchema<import("..").VoxelDimension>;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                nodeId: import("@box/mudb/schema").MuASCII;
                keyframeList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    time: import("@box/mudb/schema").MuASCII;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                    offset: import("@box/mudb/schema").MuStruct<{
                        translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        scale: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        alpha: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuFloat32>;
                    }>;
                }>>;
            }>>;
        }>>;
    }>;
    9: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
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
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            dimension: import("@box/mudb/schema").MuSchema<import("..").VoxelDimension>;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                nodeId: import("@box/mudb/schema").MuASCII;
                keyframeList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    time: import("@box/mudb/schema").MuASCII;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                    offset: import("@box/mudb/schema").MuStruct<{
                        translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        scale: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        alpha: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuFloat32>;
                    }>;
                }>>;
            }>>;
        }>>;
        hitBox: import("@box/mudb/schema").MuStruct<{
            mode: import("@box/mudb/schema").MuSchema<import("..").HitBoxMode>;
            customBox: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuStruct<{
                position: import("@box/mudb/schema").MuVector<"float32", 3>;
                size: import("@box/mudb/schema").MuVector<"float32", 3>;
            }>>;
        }>;
    }>;
    10: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            type: import("@box/mudb/schema").MuSchema<import("..").ProjectNodeType>;
            name: import("@box/mudb/schema").MuUTF8;
            voxelId: import("@box/mudb/schema").MuASCII;
            parentId: import("@box/mudb/schema").MuASCII;
            childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
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
        voxels: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            dimension: import("@box/mudb/schema").MuSchema<import("..").VoxelDimension>;
            encodedView: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        }>>;
        palette: import("@box/mudb/schema").MuStruct<{
            items: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuVarint;
                rgb: import("@box/mudb/schema").MuVector<"uint8", 3>;
                hsv: import("@box/mudb/schema").MuVector<"uint16", 3>;
                material: import("@box/mudb/schema").MuStruct<{
                    emissive: import("@box/mudb/schema").MuFloat32;
                }>;
            }>>;
            groups: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                id: import("@box/mudb/schema").MuASCII;
                name: import("@box/mudb/schema").MuUTF8;
                itemIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint16>;
            }>>;
            groupList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        }>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            nodes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
                nodeId: import("@box/mudb/schema").MuASCII;
                keyframeList: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                    time: import("@box/mudb/schema").MuASCII;
                    interpolation: import("@box/mudb/schema").MuSchema<import("./schema-v3").ProjectInterpolationType>;
                    offset: import("@box/mudb/schema").MuStruct<{
                        translation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        rotation: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 4>>;
                        scale: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
                        alpha: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuFloat32>;
                    }>;
                }>>;
            }>>;
        }>>;
        hitBox: import("@box/mudb/schema").MuStruct<{
            mode: import("@box/mudb/schema").MuSchema<import("..").HitBoxMode>;
            customBox: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuStruct<{
                position: import("@box/mudb/schema").MuVector<"float32", 3>;
                size: import("@box/mudb/schema").MuVector<"float32", 3>;
            }>>;
        }>;
        modelPivot: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuVector<"float32", 3>>;
    }>;
};
