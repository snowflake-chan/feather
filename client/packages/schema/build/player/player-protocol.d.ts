import { MuStruct, MuUTF8, MuVoid } from '@box/mudb/schema';
export declare const PlayerProtocolSchema: {
    name: string;
    client: {
        playerJoin: MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>;
        playerLeave: MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>;
        openUserProfileDialog: MuStruct<{
            userId: MuUTF8;
        }>;
    };
    server: {
        updateAvatarSkin: MuVoid;
        selectBuiltInAvatarSkin: MuUTF8;
    };
};
//# sourceMappingURL=player-protocol.d.ts.map