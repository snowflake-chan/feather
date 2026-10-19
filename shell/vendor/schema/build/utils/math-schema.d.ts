import { vec2, vec3, vec4, quat, mat2, mat3, mat4 } from 'gl-matrix';
import { MuFloat32 } from '@box/mudb/schema/float32';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuStruct } from '@box/mudb/schema/struct';
export declare const NumSchema: MuFloat32;
export declare const Vec2Schema: MuSchema<vec2>;
export declare const Vec3Schema: MuSchema<vec3>;
export declare const Vec4Schema: MuSchema<vec4>;
export declare const QuatSchema: MuSchema<quat>;
export declare const Mat2Schema: MuSchema<mat2>;
export declare const Mat3Schema: MuSchema<mat3>;
export declare const Mat4Schema: MuSchema<mat4>;
export declare const BoundsSchema: MuStruct<{
    lo: MuSchema<vec3>;
    hi: MuSchema<vec3>;
}>;
