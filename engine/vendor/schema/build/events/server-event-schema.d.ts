import { MuStruct, MuArray, MuUTF8, MuSchema } from '@box/mudb/schema';
export declare const ServerEventSchema: MuStruct<{
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
    chat: MuStruct<{
        chats: MuArray<MuStruct<{
            senderId: import("@box/mudb/schema").MuInt32;
            targetId: import("@box/mudb/schema").MuInt32;
            name: MuUTF8;
            msgType: MuSchema<import("../chat/chat-schema").MsgType>;
            message: MuUTF8;
            private: import("@box/mudb/schema").MuBoolean;
            duration: import("@box/mudb/schema").MuInt32;
        }>>;
    }>;
    physics: MuStruct<{
        bodyContact: MuArray<MuStruct<{
            otherId: import("@box/mudb/schema").MuVarint;
            nx: import("@box/mudb/schema").MuFloat32;
            ny: import("@box/mudb/schema").MuFloat32;
            nz: import("@box/mudb/schema").MuFloat32;
            fx: import("@box/mudb/schema").MuFloat32;
            fy: import("@box/mudb/schema").MuFloat32;
            fz: import("@box/mudb/schema").MuFloat32;
            id: import("@box/mudb/schema").MuVarint;
            tick: import("@box/mudb/schema").MuVarint;
        }>>;
        voxelContact: MuArray<MuStruct<{
            x: import("@box/mudb/schema").MuVarint;
            y: import("@box/mudb/schema").MuVarint;
            z: import("@box/mudb/schema").MuVarint;
            b: import("@box/mudb/schema").MuVarint;
            axis: import("@box/mudb/schema").MuInt8;
            fx: import("@box/mudb/schema").MuFloat32;
            fy: import("@box/mudb/schema").MuFloat32;
            fz: import("@box/mudb/schema").MuFloat32;
            id: import("@box/mudb/schema").MuVarint;
            tick: import("@box/mudb/schema").MuVarint;
        }>>;
        fluidContact: MuArray<MuStruct<{
            b: import("@box/mudb/schema").MuVarint;
            volumeFraction: import("@box/mudb/schema").MuQuantizedFloat;
            id: import("@box/mudb/schema").MuVarint;
            tick: import("@box/mudb/schema").MuVarint;
        }>>;
        bodySeparate: MuArray<MuStruct<{
            otherId: import("@box/mudb/schema").MuVarint;
            nx: import("@box/mudb/schema").MuFloat32;
            ny: import("@box/mudb/schema").MuFloat32;
            nz: import("@box/mudb/schema").MuFloat32;
            fx: import("@box/mudb/schema").MuFloat32;
            fy: import("@box/mudb/schema").MuFloat32;
            fz: import("@box/mudb/schema").MuFloat32;
            id: import("@box/mudb/schema").MuVarint;
            tick: import("@box/mudb/schema").MuVarint;
        }>>;
        voxelSeparate: MuArray<MuStruct<{
            x: import("@box/mudb/schema").MuVarint;
            y: import("@box/mudb/schema").MuVarint;
            z: import("@box/mudb/schema").MuVarint;
            b: import("@box/mudb/schema").MuVarint;
            axis: import("@box/mudb/schema").MuInt8;
            fx: import("@box/mudb/schema").MuFloat32;
            fy: import("@box/mudb/schema").MuFloat32;
            fz: import("@box/mudb/schema").MuFloat32;
            id: import("@box/mudb/schema").MuVarint;
            tick: import("@box/mudb/schema").MuVarint;
        }>>;
        fluidSeparate: MuArray<MuStruct<{
            b: import("@box/mudb/schema").MuVarint;
            volumeFraction: import("@box/mudb/schema").MuQuantizedFloat;
            id: import("@box/mudb/schema").MuVarint;
            tick: import("@box/mudb/schema").MuVarint;
        }>>;
    }>;
    net: MuArray<MuStruct<{
        tick: import("@box/mudb/schema").MuQuantizedFloat;
        position: import("../utils/quantized-schema").QuantizedVec3Schema;
        rayTime: import("@box/mudb/schema").MuQuantizedFloat;
        rayHitEntity: import("@box/mudb/schema").MuVarint;
        rayHitVoxelX: import("@box/mudb/schema").MuVarint;
        rayHitVoxelY: import("@box/mudb/schema").MuVarint;
        rayHitVoxelZ: import("@box/mudb/schema").MuVarint;
        rayHitNormal: MuSchema<import("gl-matrix").vec3>;
        rayOrigin: import("../utils/quantized-schema").QuantizedVec3Schema;
        rayDirection: import("../utils/quantized-schema").QuantizedVec3Schema;
        buttonState: MuSchema<import("../net/net-schema").NetInputEventBits>;
        prevButtonState: MuSchema<import("../net/net-schema").NetInputEventBits>;
        id: import("@box/mudb/schema").MuVarint;
    }>>;
    connect: MuArray<MuSchema<string>>;
    join: MuArray<MuSchema<string>>;
    disconnect: MuArray<MuSchema<string>>;
    keyboard: MuArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        tick: import("@box/mudb/schema").MuVarint;
        keyDownState: MuArray<import("@box/mudb/schema").MuUint8>;
        prevKeyDownState: MuArray<import("@box/mudb/schema").MuUint8>;
    }>>;
}>;
//# sourceMappingURL=server-event-schema.d.ts.map