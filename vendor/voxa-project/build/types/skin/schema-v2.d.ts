import { MuArray, MuVarint, MuStruct, MuUint8, MuSchema } from '@box/mudb/schema';
import { BodyPart } from '@box/schema/player/player-schema';
export declare const BodyPartDataV2Schema: MuStruct<{
    version: MuVarint;
    partId: MuSchema<BodyPart>;
    bindMat: import("@box/mudb/schema").MuVector<"float32", 16>;
    bounds: import("@box/mudb/schema").MuVector<"float32", 3>;
    nodes: MuArray<MuStruct<{
        mesh: import("@box/mudb/schema").MuInt32;
        rotation: import("@box/mudb/schema").MuVector<"float32", 4>;
        translation: import("@box/mudb/schema").MuVector<"float32", 3>;
        scale: import("@box/mudb/schema").MuVector<"float32", 3>;
        children: MuArray<MuVarint>;
        alpha: import("@box/mudb/schema").MuFloat32;
    }>>;
    texture: MuStruct<{
        palette: MuArray<import("@box/mudb/schema").MuUint32>;
        data: MuArray<MuVarint>;
        width: MuVarint;
    }>;
    meshes: MuArray<MuArray<MuStruct<{
        vertices: MuArray<MuVarint>;
        sizes: MuArray<MuVarint>;
        uvs: MuArray<MuVarint>;
        uvFlags: MuArray<MuUint8>;
    }>>>;
}>;
export type BodyPartDataV2 = typeof BodyPartDataV2Schema.identity;
