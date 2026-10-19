import { ModelDataV1 } from './schema-v1';
import { ModelDataV2 } from './schema-v2';
import { ModelDataV3 } from './schema-v3';
import { ModelDataV4 } from './schema-v4';
import { ModelDataV5 } from './schema-v5';
import { ModelDataV6 } from './schema-v6';
import { ModelDataV7 } from './schema-v7';
export type ModelData = ModelDataV7;
export type ModelDataTypes = ModelDataV1 | ModelDataV2 | ModelDataV3 | ModelDataV4 | ModelDataV5 | ModelDataV6 | ModelDataV7;
export declare const VOXA_MODEL_VERSION = 7;
export declare const MODEL_SCHEMA: {
    1: import("@box/mudb/schema").MuStruct<{
        bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
        meshes: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>>;
    }>;
    2: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
        nodes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuInt32;
            rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
            translation: import("@box/mudb/schema").MuVector<"float32", 3>;
            children: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            alpha: import("@box/mudb/schema").MuFloat32;
        }>>;
        meshes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>>;
    }>;
    3: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
        nodes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuInt32;
            rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
            translation: import("@box/mudb/schema").MuVector<"float32", 3>;
            children: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            alpha: import("@box/mudb/schema").MuFloat32;
        }>>;
        texture: import("@box/mudb/schema").MuStruct<{
            palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            width: import("@box/mudb/schema").MuVarint;
        }>;
        meshes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
        }>>>;
    }>;
    4: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuInt32;
            rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
            translation: import("@box/mudb/schema").MuVector<"float32", 3>;
            children: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            alpha: import("@box/mudb/schema").MuFloat32;
        }>>;
        texture: import("@box/mudb/schema").MuStruct<{
            palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            width: import("@box/mudb/schema").MuVarint;
        }>;
        meshes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
        }>>>;
    }>;
    5: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuInt32;
            rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
            translation: import("@box/mudb/schema").MuVector<"float32", 3>;
            children: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            alpha: import("@box/mudb/schema").MuFloat32;
        }>>;
        texture: import("@box/mudb/schema").MuStruct<{
            palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            width: import("@box/mudb/schema").MuVarint;
        }>;
        meshes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
        }>>>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            channels: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                sampler: import("@box/mudb/schema").MuVarint;
                target: import("@box/mudb/schema").MuStruct<{
                    node: import("@box/mudb/schema").MuVarint;
                    path: import("@box/mudb/schema").MuSchema<import("..").ChannelNodePath>;
                }>;
            }>>;
            samplers: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                input: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                output: import("@box/mudb/schema").MuUnion<{
                    rotation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    translation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                    scale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                }>;
                interpolation: import("@box/mudb/schema").MuSchema<import("..").ProjectInterpolationType>;
            }>>;
        }>>;
    }>;
    6: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuInt32;
            rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
            translation: import("@box/mudb/schema").MuVector<"float32", 3>;
            scale: import("@box/mudb/schema").MuVector<"float32", 3>;
            children: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            alpha: import("@box/mudb/schema").MuFloat32;
        }>>;
        texture: import("@box/mudb/schema").MuStruct<{
            palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            width: import("@box/mudb/schema").MuVarint;
        }>;
        meshes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
        }>>>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            channels: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                sampler: import("@box/mudb/schema").MuVarint;
                target: import("@box/mudb/schema").MuStruct<{
                    node: import("@box/mudb/schema").MuVarint;
                    path: import("@box/mudb/schema").MuSchema<import("..").ChannelNodePath>;
                }>;
            }>>;
            samplers: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                input: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                output: import("@box/mudb/schema").MuUnion<{
                    rotation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    translation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                    scale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                }>;
                interpolation: import("@box/mudb/schema").MuSchema<import("..").ProjectInterpolationType>;
            }>>;
        }>>;
    }>;
    7: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        nodes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            mesh: import("@box/mudb/schema").MuInt32;
            rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
            translation: import("@box/mudb/schema").MuVector<"float32", 3>;
            scale: import("@box/mudb/schema").MuVector<"float32", 3>;
            parentScaleMat3: import("@box/mudb/schema").MuVector<"float32", 9>;
            children: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            alpha: import("@box/mudb/schema").MuFloat32;
        }>>;
        texture: import("@box/mudb/schema").MuStruct<{
            palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
            data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            width: import("@box/mudb/schema").MuVarint;
        }>;
        meshes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
            uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
        }>>>;
        animations: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
            id: import("@box/mudb/schema").MuASCII;
            name: import("@box/mudb/schema").MuUTF8;
            channels: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                sampler: import("@box/mudb/schema").MuVarint;
                target: import("@box/mudb/schema").MuStruct<{
                    node: import("@box/mudb/schema").MuVarint;
                    path: import("@box/mudb/schema").MuSchema<import("..").ChannelNodePath>;
                }>;
            }>>;
            samplers: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuStruct<{
                input: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                output: import("@box/mudb/schema").MuUnion<{
                    rotation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 4>>;
                    translation: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                    alpha: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuFloat32>;
                    scale: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVector<"float32", 3>>;
                }>;
                interpolation: import("@box/mudb/schema").MuSchema<import("..").ProjectInterpolationType>;
            }>>;
        }>>;
    }>;
};
