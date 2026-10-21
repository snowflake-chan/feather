import { vec3 } from 'gl-matrix';
import { MuStruct, MuFloat64, MuBoolean, MuSchema, MuVarint, MuUint8 } from '@box/mudb/schema';
import { QuantizedScalar, QuantizedVec3Schema } from '../utils/quantized-schema';
export declare const UP: vec3;
export declare const EMISSIVE_SCALE = 100;
export declare const MIN_CAMERA_DISTANCE = 0.01;
export declare enum CameraMode {
    FOLLOW = 0,
    FIXED = 1,
    FPS = 2,
    RELATIVE = 3
}
export declare enum CameraFreezedAxis {
    NONE = 0,
    X = 1,
    Y = 2,
    Z = 4
}
export declare const CameraConfigurationSchema: MuStruct<{
    mode: MuSchema<CameraMode>;
    targetId: MuVarint;
    eye: QuantizedVec3Schema;
    up: QuantizedVec3Schema;
    target: QuantizedVec3Schema;
    freezedAxis: MuUint8;
    fovY: QuantizedScalar;
    distance: QuantizedScalar;
}>;
export type CameraConfiguration = typeof CameraConfigurationSchema.identity;
export declare const CameraSchema: MuStruct<{
    viewport: MuSchema<import("gl-matrix").vec2>;
    cursor: MuSchema<import("gl-matrix").vec2>;
    cursorRay: MuSchema<vec3>;
    axis: MuSchema<vec3>;
    view: MuSchema<import("gl-matrix").mat4>;
    projection: MuSchema<import("gl-matrix").mat4>;
    viewProjection: MuSchema<import("gl-matrix").mat4>;
    invView: MuSchema<import("gl-matrix").mat4>;
    invProjection: MuSchema<import("gl-matrix").mat4>;
    invViewProjection: MuSchema<import("gl-matrix").mat4>;
    frustum: MuStruct<{
        matrix: MuSchema<import("gl-matrix").mat4>;
        invMatrix: MuSchema<import("gl-matrix").mat4>;
        lox: MuFloat64;
        loy: MuFloat64;
        loz: MuFloat64;
        hix: MuFloat64;
        hiy: MuFloat64;
        hiz: MuFloat64;
        h0x: MuFloat64;
        h0y: MuFloat64;
        h0z: MuFloat64;
        h0w: MuFloat64;
        h1x: MuFloat64;
        h1y: MuFloat64;
        h1z: MuFloat64;
        h1w: MuFloat64;
        h2x: MuFloat64;
        h2y: MuFloat64;
        h2z: MuFloat64;
        h2w: MuFloat64;
        h3x: MuFloat64;
        h3y: MuFloat64;
        h3z: MuFloat64;
        h3w: MuFloat64;
        h4x: MuFloat64;
        h4y: MuFloat64;
        h4z: MuFloat64;
        h4w: MuFloat64;
        h5x: MuFloat64;
        h5y: MuFloat64;
        h5z: MuFloat64;
        h5w: MuFloat64;
        p0x: MuFloat64;
        p0y: MuFloat64;
        p0z: MuFloat64;
        p1x: MuFloat64;
        p1y: MuFloat64;
        p1z: MuFloat64;
        p2x: MuFloat64;
        p2y: MuFloat64;
        p2z: MuFloat64;
        p3x: MuFloat64;
        p3y: MuFloat64;
        p3z: MuFloat64;
        p4x: MuFloat64;
        p4y: MuFloat64;
        p4z: MuFloat64;
        p5x: MuFloat64;
        p5y: MuFloat64;
        p5z: MuFloat64;
        p6x: MuFloat64;
        p6y: MuFloat64;
        p6z: MuFloat64;
        p7x: MuFloat64;
        p7y: MuFloat64;
        p7z: MuFloat64;
        nearX0: MuFloat64;
        nearY0: MuFloat64;
        nearZ0: MuFloat64;
        nearX1: MuFloat64;
        nearY1: MuFloat64;
        nearZ1: MuFloat64;
    }>;
    eye: MuSchema<vec3>;
    eyeVelocity: MuSchema<vec3>;
    rotation: MuSchema<import("gl-matrix").quat>;
    distance: MuFloat64;
    currentDistance: MuFloat64;
    targetEye: MuSchema<vec3>;
    targetLook: MuSchema<vec3>;
    targetRotation: MuSchema<import("gl-matrix").quat>;
    fovY: MuFloat64;
    zNear: MuFloat64;
    zFar: MuFloat64;
    freezeFovY: MuBoolean;
    eyeVoxel: MuVarint;
    underwater: MuBoolean;
    focalDistance: MuFloat64;
    crosshairSeparation: MuFloat64;
    targetExposure: MuFloat64;
    currentExposure: MuFloat64;
    logExposureVelocity: MuFloat64;
    screenLightPos: MuSchema<vec3>;
    eyeFogAmount: MuFloat64;
    fpsID: MuVarint;
}>;
export type Camera = typeof CameraSchema.identity;
//# sourceMappingURL=camera-schema.d.ts.map