import { MuFloat32, MuVector, MuArray, MuSchema, MuStruct, MuUnion } from '@box/mudb/schema';
export declare const Vec3Schema: MuVector<"float32", 3>;
export declare const Vec4Schema: MuVector<"float32", 4>;
export declare const Uint8Vec3Schema: MuVector<"uint8", 3>;
export declare const Uint16Vec3Schema: MuVector<"uint16", 3>;
export declare const Mat4Schema: MuVector<"float32", 16>;
export declare const Mat3Schema: MuVector<"float32", 9>;
export declare const TimeAccessorSchema: MuArray<MuFloat32>;
export declare const RotationAccessorSchema: MuArray<MuVector<"float32", 4>>;
export declare const TranslationAccessorSchema: MuArray<MuVector<"float32", 3>>;
export declare const AlphaAccessorSchema: MuArray<MuFloat32>;
export declare enum ProjectNodeType {
    Root = 0,
    SkinPart = 1,
    Group = 2,
    Bone = 3
}
export declare enum VoxelDimension {
    YZ = 0,
    XZ = 1,
    XY = 2,
    XYZ = 3
}
export declare enum HitBoxMode {
    Default = 0,
    Custom = 1
}
export declare enum ChannelNodePath {
    Rotation = "rotation",
    Translation = "translation",
    Alpha = "alpha",
    Scale = "scale"
}
export declare enum ProjectInterpolationType {
    Step = "STEP",
    Linear = "LINEAR",
    EaseInSine = "EASE_IN_SINE",
    EaseOutSine = "EASE_OUT_SINE",
    EaseInOutSine = "EASE_IN_OUT_SINE"
}
export declare function calcEasing(type: ProjectInterpolationType, weight: number): number;
export declare function lerp(a: number, b: number, weight: number): number;
export declare const OutputSchema: MuUnion<{
    rotation: MuArray<MuVector<"float32", 4>>;
    translation: MuArray<MuVector<"float32", 3>>;
    alpha: MuArray<MuFloat32>;
    scale: MuArray<MuVector<"float32", 3>>;
}>;
export declare const SamplerSchema: MuStruct<{
    input: MuArray<MuFloat32>;
    output: MuUnion<{
        rotation: MuArray<MuVector<"float32", 4>>;
        translation: MuArray<MuVector<"float32", 3>>;
        alpha: MuArray<MuFloat32>;
        scale: MuArray<MuVector<"float32", 3>>;
    }>;
    interpolation: MuSchema<ProjectInterpolationType>;
}>;
