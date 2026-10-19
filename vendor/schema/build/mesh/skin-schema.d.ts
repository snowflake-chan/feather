import { MuStruct, MuUint8, MuSchema } from '@box/mudb/schema';
import { BodyPart } from '../player/player-schema';
export declare const PlayerSkinPartSchema: MuStruct<{
    partId: MuSchema<BodyPart>;
    bindMat: MuSchema<import("gl-matrix").mat4>;
    mesh: import("@box/mudb/schema").MuArray<MuStruct<{
        vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvFlags: import("@box/mudb/schema").MuArray<MuUint8>;
    }>>;
    texture: MuStruct<{
        palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
        data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        width: import("@box/mudb/schema").MuVarint;
    }>;
}>;
//# sourceMappingURL=skin-schema.d.ts.map