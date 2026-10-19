import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuFloat64 } from '@box/mudb/schema/float64';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint32 } from '@box/mudb/schema/uint32';
import { RigidBodySet } from '../physics/physics-schema';
import { vec3 } from 'gl-matrix';
import { RenderBoxSet } from '../render-box/schema';
export declare const BodyRaycastSchema: MuStruct<{
    hit: MuBoolean;
    hitTime: MuFloat64;
    hitId: MuUint32;
    hitPosition: import("@box/mudb/schema").MuSchema<vec3>;
    hitNormal: import("@box/mudb/schema").MuSchema<vec3>;
}>;
export type BodyRaycast = typeof BodyRaycastSchema.identity;
export declare function raycastBoxes(result: BodyRaycast, boxes: RigidBodySet | RenderBoxSet, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, skipId: number): boolean;
