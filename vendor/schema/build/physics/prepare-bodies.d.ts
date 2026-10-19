import { VoxelCollision } from '../voxel/voxel-collision-schema';
import { RigidBody, PhysicsParams, ContactRecord } from './physics-schema';
import { BodyCollisionBox } from './body-rbush';
import { VoxelCollisionBox } from '../utils/rbush-schema';
import { BlockIndex } from '../voxel/block-schema';
import { PhysicsZoneIndex } from './zone-index';
export declare let DT: number;
export declare let INV_DT: number;
export declare let GRAVITY: number;
export declare let VELOCITY_DAMPING: number;
export declare let VELOCITY_SCALE: number;
export declare let ACCEL_FACTOR: number;
export declare let BLOCK_MASS: number[];
export declare let BLOCK_RESTITUTION: number[];
export declare let BLOCK_FRICTION: number[];
export declare let BLOCK_VELOCITY: number[];
declare function ALLOC(size: number): Float32Array;
export type ArrayType = ReturnType<typeof ALLOC>;
/**
 * 开启物理引擎，会被推动的物理模型
 * 索引值为BodyCollisionBox的ID
 */
export declare const ACTIVE_BODIES: RigidBody[];
export declare const MASS: Float32Array;
export declare const INV_MASS: Float32Array;
export declare const X0: Float32Array;
export declare const Y0: Float32Array;
export declare const Z0: Float32Array;
export declare const X1: Float32Array;
export declare const Y1: Float32Array;
export declare const Z1: Float32Array;
export declare const DX: Float32Array;
export declare const DY: Float32Array;
export declare const DZ: Float32Array;
export declare const AX: Float32Array;
export declare const AY: Float32Array;
export declare const AZ: Float32Array;
export declare const RX: Float32Array;
export declare const RY: Float32Array;
export declare const RZ: Float32Array;
export declare const HSX: Float32Array;
export declare const HSY: Float32Array;
export declare const HSZ: Float32Array;
export declare const QX: Float32Array;
export declare const QY: Float32Array;
export declare const QZ: Float32Array;
export declare const QW: Float32Array;
/**
 * active bodies的弹性
 */
export declare const CR: Float32Array;
/**
 * active bodies的摩擦力
 */
export declare const MU: Float32Array;
/**
 * 物理模型的碰撞组标志位
 * 索引值同active_bodies，value是body.group的值
 */
export declare const ACTIVE_GROUP: Int32Array;
/**
 * 碰撞盒，是个AABB的数据
 */
export declare const ACTIVE_BOXES: BodyCollisionBox[];
export declare const FLUID_CONTACTS: number[];
/**
 * 开启物理引擎，不会被推动的物理模型
 */
export declare const FIXED_BODIES: RigidBody[];
export declare const FIX_X0: Float32Array;
export declare const FIX_Y0: Float32Array;
export declare const FIX_Z0: Float32Array;
export declare const FIX_X1: Float32Array;
export declare const FIX_Y1: Float32Array;
export declare const FIX_Z1: Float32Array;
export declare const FIX_DX: Float32Array;
export declare const FIX_DY: Float32Array;
export declare const FIX_DZ: Float32Array;
export declare const FIX_AX: Float32Array;
export declare const FIX_AY: Float32Array;
export declare const FIX_AZ: Float32Array;
export declare const FIX_RX: Float32Array;
export declare const FIX_RY: Float32Array;
export declare const FIX_RZ: Float32Array;
export declare const FIX_HSX: Float32Array;
export declare const FIX_HSY: Float32Array;
export declare const FIX_HSZ: Float32Array;
export declare const FIX_QX: Float32Array;
export declare const FIX_QY: Float32Array;
export declare const FIX_QZ: Float32Array;
export declare const FIX_QW: Float32Array;
export declare const FIX_CR: Float32Array;
export declare const FIX_MU: Float32Array;
/**
 * 开了物理引擎但是不会被撞动的物体group
 */
export declare const FIX_GROUP: Int32Array;
/**
 * 开了物理引擎但是不会被撞动的box，但会撞别人
 */
export declare const FIXED_BOXES: BodyCollisionBox[];
export declare const ACTIVE_CONTACTS: (ContactRecord | null)[];
export declare const FIXED_CONTACTS: (ContactRecord | null)[];
export declare const BOX_POOL: BodyCollisionBox[];
export declare const TERRAIN_HITS: VoxelCollisionBox[];
export declare function updateGlobalVariables(physics: PhysicsParams, dt: number, blockIndex: BlockIndex): void;
export declare function prepareBodies(bodies: RigidBody[], geom: VoxelCollision, zones: PhysicsZoneIndex): void;
export {};
