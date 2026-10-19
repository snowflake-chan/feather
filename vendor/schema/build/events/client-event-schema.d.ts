import { MuStruct, MuArray, MuUint8 } from '@box/mudb/schema';
export declare const ClientEventSchema: MuStruct<{
    voxel: MuStruct<{
        voxelChange: MuArray<MuStruct<{
            x: import("@box/mudb/schema").MuUint32;
            y: import("@box/mudb/schema").MuUint32;
            z: import("@box/mudb/schema").MuUint32;
            b: import("@box/mudb/schema").MuUint16;
            p: import("@box/mudb/schema").MuUint16;
        }>>;
        voxelReset: import("@box/mudb/schema").MuBoolean;
    }>;
    animation: MuStruct<{
        footStep: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuUint32;
            blockType: import("@box/mudb/schema").MuUint16;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            foot: import("@box/mudb/schema").MuSchema<import("./animation-event-schema").FootType>;
        }>>;
        jump: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            scale: import("@box/mudb/schema").MuFloat32;
        }>>;
        doubleJump: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
            scale: import("@box/mudb/schema").MuFloat32;
        }>>;
        land: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
        swim: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
        enterWater: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
        leaveWater: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
        crouch: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
        startFly: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
        stopFly: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
        }>>;
    }>;
    chat: MuStruct<{
        chats: MuArray<MuStruct<{
            senderId: import("@box/mudb/schema").MuInt32;
            targetId: import("@box/mudb/schema").MuInt32;
            name: import("@box/mudb/schema").MuUTF8;
            msgType: import("@box/mudb/schema").MuSchema<import("../chat/chat-schema").MsgType>;
            message: import("@box/mudb/schema").MuUTF8;
            private: import("@box/mudb/schema").MuBoolean;
            duration: import("@box/mudb/schema").MuInt32;
        }>>;
    }>;
    damage: MuStruct<{
        hurt: MuArray<MuStruct<{
            id: import("@box/mudb/schema").MuVarint;
            damage: import("@box/mudb/schema").MuVarint;
        }>>;
        respawn: MuArray<import("@box/mudb/schema").MuVarint>;
        die: MuArray<import("@box/mudb/schema").MuVarint>;
    }>;
    emote: MuArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        emote: import("@box/mudb/schema").MuSchema<import("../animation/ik-schema").GroundEmote>;
    }>>;
    lookAxisMovement: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec2>;
    keyTap: MuArray<MuUint8>;
    playerInput: MuArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        button: import("@box/mudb/schema").MuVarint;
        press: import("@box/mudb/schema").MuBoolean;
        position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    }>>;
    playerJoin: MuArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    }>>;
    playerLeave: MuArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        position: import("@box/mudb/schema").MuSchema<import("gl-matrix").vec3>;
    }>>;
}>;
export type ClientEvents = typeof ClientEventSchema.identity;
//# sourceMappingURL=client-event-schema.d.ts.map