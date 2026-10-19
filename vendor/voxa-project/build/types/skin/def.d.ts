import { BodyPartDataV1 } from './schema-v1';
import { BodyPartDataV2 } from './schema-v2';
import { BodyPartDataV3 } from './schema-v3';
export type BodyPartData = BodyPartDataV3;
export type BodyPartDataTypes = BodyPartDataV1 | BodyPartDataV2 | BodyPartDataV3;
export declare const VOXA_SKIN_VERSION = 3;
export declare const BODY_PART_SCHEMA: {
    1: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        partId: import("@box/mudb/schema").MuSchema<import("@box/schema/player/player-schema").BodyPart>;
        bindMat: import("@box/mudb/schema").MuVector<"float32", 16>;
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
    2: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        partId: import("@box/mudb/schema").MuSchema<import("@box/schema/player/player-schema").BodyPart>;
        bindMat: import("@box/mudb/schema").MuVector<"float32", 16>;
        bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
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
    }>;
    3: import("@box/mudb/schema").MuStruct<{
        version: import("@box/mudb/schema").MuVarint;
        partId: import("@box/mudb/schema").MuSchema<import("@box/schema/player/player-schema").BodyPart>;
        bindMat: import("@box/mudb/schema").MuVector<"float32", 16>;
        bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
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
    }>;
};
