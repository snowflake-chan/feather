import { MuStruct, MuArray, MuVarint } from '@box/mudb/schema';
export declare const BodyContactEventSchema: MuStruct<{
    otherId: MuVarint;
    nx: import("@box/mudb/schema").MuFloat32;
    ny: import("@box/mudb/schema").MuFloat32;
    nz: import("@box/mudb/schema").MuFloat32;
    fx: import("@box/mudb/schema").MuFloat32;
    fy: import("@box/mudb/schema").MuFloat32;
    fz: import("@box/mudb/schema").MuFloat32;
    id: MuVarint;
    tick: MuVarint;
}>;
export declare const VoxelContactEventSchema: MuStruct<{
    x: MuVarint;
    y: MuVarint;
    z: MuVarint;
    b: MuVarint;
    axis: import("@box/mudb/schema").MuInt8;
    fx: import("@box/mudb/schema").MuFloat32;
    fy: import("@box/mudb/schema").MuFloat32;
    fz: import("@box/mudb/schema").MuFloat32;
    id: MuVarint;
    tick: MuVarint;
}>;
export declare const FluidContactEventSchema: MuStruct<{
    b: MuVarint;
    volumeFraction: import("@box/mudb/schema").MuQuantizedFloat;
    id: MuVarint;
    tick: MuVarint;
}>;
export declare const PhysicsEventSchema: MuStruct<{
    bodyContact: MuArray<MuStruct<{
        otherId: MuVarint;
        nx: import("@box/mudb/schema").MuFloat32;
        ny: import("@box/mudb/schema").MuFloat32;
        nz: import("@box/mudb/schema").MuFloat32;
        fx: import("@box/mudb/schema").MuFloat32;
        fy: import("@box/mudb/schema").MuFloat32;
        fz: import("@box/mudb/schema").MuFloat32;
        id: MuVarint;
        tick: MuVarint;
    }>>;
    voxelContact: MuArray<MuStruct<{
        x: MuVarint;
        y: MuVarint;
        z: MuVarint;
        b: MuVarint;
        axis: import("@box/mudb/schema").MuInt8;
        fx: import("@box/mudb/schema").MuFloat32;
        fy: import("@box/mudb/schema").MuFloat32;
        fz: import("@box/mudb/schema").MuFloat32;
        id: MuVarint;
        tick: MuVarint;
    }>>;
    fluidContact: MuArray<MuStruct<{
        b: MuVarint;
        volumeFraction: import("@box/mudb/schema").MuQuantizedFloat;
        id: MuVarint;
        tick: MuVarint;
    }>>;
    bodySeparate: MuArray<MuStruct<{
        otherId: MuVarint;
        nx: import("@box/mudb/schema").MuFloat32;
        ny: import("@box/mudb/schema").MuFloat32;
        nz: import("@box/mudb/schema").MuFloat32;
        fx: import("@box/mudb/schema").MuFloat32;
        fy: import("@box/mudb/schema").MuFloat32;
        fz: import("@box/mudb/schema").MuFloat32;
        id: MuVarint;
        tick: MuVarint;
    }>>;
    voxelSeparate: MuArray<MuStruct<{
        x: MuVarint;
        y: MuVarint;
        z: MuVarint;
        b: MuVarint;
        axis: import("@box/mudb/schema").MuInt8;
        fx: import("@box/mudb/schema").MuFloat32;
        fy: import("@box/mudb/schema").MuFloat32;
        fz: import("@box/mudb/schema").MuFloat32;
        id: MuVarint;
        tick: MuVarint;
    }>>;
    fluidSeparate: MuArray<MuStruct<{
        b: MuVarint;
        volumeFraction: import("@box/mudb/schema").MuQuantizedFloat;
        id: MuVarint;
        tick: MuVarint;
    }>>;
}>;
export type PhysicsEvent = typeof PhysicsEventSchema.identity;
//# sourceMappingURL=physics-event-schema.d.ts.map