import { MuStruct, MuUint32, MuUint16, MuSchema, MuArray, MuVarint, MuFloat32 } from '@box/mudb/schema';
export declare enum FootType {
    LEFT = 0,
    RIGHT = 1
}
export declare const FootStepEventSchema: MuStruct<{
    id: MuUint32;
    blockType: MuUint16;
    position: MuSchema<import("gl-matrix").vec3>;
    foot: MuSchema<FootType>;
}>;
export declare const JumpEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
    scale: MuFloat32;
}>;
export declare const DoubleJumpEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
    scale: MuFloat32;
}>;
export declare const LandEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
}>;
export declare const SwimStrokeEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
}>;
export declare const EnterWaterEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
}>;
export declare const LeaveWaterEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
}>;
export declare const CrouchEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
}>;
export declare const FlyEventSchema: MuStruct<{
    id: MuVarint;
    position: MuSchema<import("gl-matrix").vec3>;
}>;
export declare const AnimationEventSchema: MuStruct<{
    footStep: MuArray<MuStruct<{
        id: MuUint32;
        blockType: MuUint16;
        position: MuSchema<import("gl-matrix").vec3>;
        foot: MuSchema<FootType>;
    }>>;
    jump: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
        scale: MuFloat32;
    }>>;
    doubleJump: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
        scale: MuFloat32;
    }>>;
    land: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
    }>>;
    swim: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
    }>>;
    enterWater: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
    }>>;
    leaveWater: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
    }>>;
    crouch: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
    }>>;
    startFly: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
    }>>;
    stopFly: MuArray<MuStruct<{
        id: MuVarint;
        position: MuSchema<import("gl-matrix").vec3>;
    }>>;
}>;
export type AnimationEvent = typeof AnimationEventSchema.identity;
//# sourceMappingURL=animation-event-schema.d.ts.map