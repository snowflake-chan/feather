import { MuStruct, MuSortedArray, MuSchema, MuVarint, MuInt8, MuArray, MuFloat32, MuQuantizedFloat } from '@box/mudb/schema';
import { mat3, vec3 } from 'gl-matrix';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
export declare const PhysicsParamsSchema: MuStruct<{
    gravity: import("@box/mudb/schema").MuFloat64;
    velocityDamping: import("@box/mudb/schema").MuFloat64;
    useOBB: import("@box/mudb/schema").MuBoolean;
}>;
export type PhysicsParams = typeof PhysicsParamsSchema.identity;
export declare const PhysicsBoundsSchema: QuantizedVec3Schema;
export declare const PhysicsBoundsComponentSchema: MuQuantizedFloat;
export declare const PhysicsSizeComponentSchema: MuQuantizedFloat;
export declare const PhysicsPositionSchema: QuantizedVec3Schema;
export declare const PhysicsPositionComponentSchema: MuQuantizedFloat;
export declare const PhysicsVelocitySchema: QuantizedVec3Schema;
export declare const PhysicsVelocotyComponentSchema: MuQuantizedFloat;
export declare const PhysicsQuatComponentDefaultSchema: MuQuantizedFloat;
export declare const PhysicsQuatComponentSchema: MuQuantizedFloat;
export declare const PhysicsForceSchema: QuantizedVec3Schema;
export declare enum RigidBodyFlags {
    LOCKED = 1,
    COLLIDES = 2,
    GRAVITY = 4,
    PLAYER = 8,
    FIXED = 16,
    REMOTE = 32,
    ANIMATED = 64
}
export declare class RigidBody {
    id: number;
    flags: number;
    mass: number;
    friction: number;
    restitution: number;
    group: number;
    rx: number;
    ry: number;
    rz: number;
    getBounds(): vec3;
    setBounds(v: vec3 | number[]): void;
    copyBounds(out: vec3 | number[]): void;
    px: number;
    py: number;
    pz: number;
    getPosition(): vec3;
    setPosition(v: vec3 | number[]): void;
    copyPosition(out: vec3 | number[]): void;
    vx: number;
    vy: number;
    vz: number;
    getVelocity(): vec3;
    setVelocity(v: vec3 | number[]): void;
    copyVelocity(out: vec3 | number[]): void;
    dist(other: RigidBody): number;
    vecDist(v: vec3): number;
    qx: number;
    qy: number;
    qz: number;
    qw: number;
    getRotation(): mat3;
    hsx: number;
    hsy: number;
    hsz: number;
    ax: number;
    ay: number;
    az: number;
}
export declare const RIGID_BODY_POOL: RigidBody[];
/**
 * 原注释：
 * tedious implementation of rigid body serialization for performance
 * because we use this schema *everywhere* it makes a big performance difference
 * optimizing this thing by hand.
 * on larger maps with many objects, can get about 12% performance boost
 *
 * 猜测是原来用LegacyRigidBodySchema直接做diff，patch等计算。
 * 然而大佬觉得mudb的二进制计算在物理模型上还是慢的，自己重新实现了物理模型的schema
 * 通过自己手动制定规则，舍弃了struct中的key，只记录数据。还有Negabinary的计算，达到了一定的优化效果
 * 虽然代码看起来不是很美妙，但是快
 */
export declare const RigidBodySchema: MuSchema<RigidBody> & {
    pool: RigidBody[];
    stats: () => any;
};
export declare const RigidBodySetSchema: MuSortedArray<MuSchema<RigidBody> & {
    pool: RigidBody[];
    stats: () => any;
}>;
export type RigidBodySet = typeof RigidBodySetSchema.identity;
export declare enum CubeAxis {
    X_POS = 0,
    X_NEG = 1,
    Y_POS = 2,
    Y_NEG = 3,
    Z_POS = 4,
    Z_NEG = 5
}
export declare const CUBE_AXIS: vec3[];
export declare function encodeCubeAxis(axis: vec3): CubeAxis;
export declare const CubeAxisSchema: MuSchema<vec3>;
export declare const BodyContactSchema: MuStruct<{
    otherId: MuVarint;
    /**
     * 碰撞分离轴x轴方向
     */
    nx: MuFloat32;
    /**
     * 碰撞分离轴y轴方向
     */
    ny: MuFloat32;
    /**
     * 碰撞分离轴z轴方向
     */
    nz: MuFloat32;
    /**
     * x方向碰撞力的大小
     */
    fx: MuFloat32;
    /**
     * y方向碰撞力的大小
     */
    fy: MuFloat32;
    /**
     * z方向碰撞力的大小
     */
    fz: MuFloat32;
}>;
export type BodyContact = typeof BodyContactSchema.identity;
export declare function compareBodyContact(a: BodyContact, b: BodyContact): number;
export declare const BodyContactSetSchema: MuSortedArray<MuStruct<{
    otherId: MuVarint;
    /**
     * 碰撞分离轴x轴方向
     */
    nx: MuFloat32;
    /**
     * 碰撞分离轴y轴方向
     */
    ny: MuFloat32;
    /**
     * 碰撞分离轴z轴方向
     */
    nz: MuFloat32;
    /**
     * x方向碰撞力的大小
     */
    fx: MuFloat32;
    /**
     * y方向碰撞力的大小
     */
    fy: MuFloat32;
    /**
     * z方向碰撞力的大小
     */
    fz: MuFloat32;
}>>;
export declare const VoxelContactSchema: MuStruct<{
    /**
     * 地形坐标x
     */
    x: MuVarint;
    /**
     * 地形坐标y
     */
    y: MuVarint;
    /**
     * 地形坐标z
     */
    z: MuVarint;
    /**
     * block: 地形ID
     * 在体素中代表的是色板中的颜色索引值，在地形中就指地形材质
     */
    b: MuVarint;
    /**
     * 碰撞分离轴
     * 1: x正方向
     * -1: x反方向
     * 2: y正方向
     * -2: y反方向
     * 3: z正方向
     * -3: z反方向
     */
    axis: MuInt8;
    fx: MuFloat32;
    fy: MuFloat32;
    fz: MuFloat32;
}>;
export type VoxelContact = typeof VoxelContactSchema.identity;
export declare function compareVoxelContact(a: VoxelContact, b: VoxelContact): number;
export declare const VoxelContactSetSchema: MuSortedArray<MuStruct<{
    /**
     * 地形坐标x
     */
    x: MuVarint;
    /**
     * 地形坐标y
     */
    y: MuVarint;
    /**
     * 地形坐标z
     */
    z: MuVarint;
    /**
     * block: 地形ID
     * 在体素中代表的是色板中的颜色索引值，在地形中就指地形材质
     */
    b: MuVarint;
    /**
     * 碰撞分离轴
     * 1: x正方向
     * -1: x反方向
     * 2: y正方向
     * -2: y反方向
     * 3: z正方向
     * -3: z反方向
     */
    axis: MuInt8;
    fx: MuFloat32;
    fy: MuFloat32;
    fz: MuFloat32;
}>>;
export declare const FluidContactSchema: MuStruct<{
    b: MuVarint;
    volumeFraction: MuQuantizedFloat;
}>;
export type FluidContact = typeof FluidContactSchema.identity;
export declare function compareFluidContact(a: FluidContact, b: FluidContact): number;
export declare const FluidContactSetSchema: MuSortedArray<MuStruct<{
    b: MuVarint;
    volumeFraction: MuQuantizedFloat;
}>>;
export declare const ContactRecordSchema: MuStruct<{
    id: MuVarint;
    body: MuSortedArray<MuStruct<{
        otherId: MuVarint;
        /**
         * 碰撞分离轴x轴方向
         */
        nx: MuFloat32;
        /**
         * 碰撞分离轴y轴方向
         */
        ny: MuFloat32;
        /**
         * 碰撞分离轴z轴方向
         */
        nz: MuFloat32;
        /**
         * x方向碰撞力的大小
         */
        fx: MuFloat32;
        /**
         * y方向碰撞力的大小
         */
        fy: MuFloat32;
        /**
         * z方向碰撞力的大小
         */
        fz: MuFloat32;
    }>>;
    voxel: MuSortedArray<MuStruct<{
        /**
         * 地形坐标x
         */
        x: MuVarint;
        /**
         * 地形坐标y
         */
        y: MuVarint;
        /**
         * 地形坐标z
         */
        z: MuVarint;
        /**
         * block: 地形ID
         * 在体素中代表的是色板中的颜色索引值，在地形中就指地形材质
         */
        b: MuVarint;
        /**
         * 碰撞分离轴
         * 1: x正方向
         * -1: x反方向
         * 2: y正方向
         * -2: y反方向
         * 3: z正方向
         * -3: z反方向
         */
        axis: MuInt8;
        fx: MuFloat32;
        fy: MuFloat32;
        fz: MuFloat32;
    }>>;
    fluidVoxels: MuArray<MuVarint>;
    fluidVolumeFraction: MuArray<MuFloat32>;
}>;
export type ContactRecord = typeof ContactRecordSchema.identity;
export declare const ContactIndexSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    body: MuSortedArray<MuStruct<{
        otherId: MuVarint;
        /**
         * 碰撞分离轴x轴方向
         */
        nx: MuFloat32;
        /**
         * 碰撞分离轴y轴方向
         */
        ny: MuFloat32;
        /**
         * 碰撞分离轴z轴方向
         */
        nz: MuFloat32;
        /**
         * x方向碰撞力的大小
         */
        fx: MuFloat32;
        /**
         * y方向碰撞力的大小
         */
        fy: MuFloat32;
        /**
         * z方向碰撞力的大小
         */
        fz: MuFloat32;
    }>>;
    voxel: MuSortedArray<MuStruct<{
        /**
         * 地形坐标x
         */
        x: MuVarint;
        /**
         * 地形坐标y
         */
        y: MuVarint;
        /**
         * 地形坐标z
         */
        z: MuVarint;
        /**
         * block: 地形ID
         * 在体素中代表的是色板中的颜色索引值，在地形中就指地形材质
         */
        b: MuVarint;
        /**
         * 碰撞分离轴
         * 1: x正方向
         * -1: x反方向
         * 2: y正方向
         * -2: y反方向
         * 3: z正方向
         * -3: z反方向
         */
        axis: MuInt8;
        fx: MuFloat32;
        fy: MuFloat32;
        fz: MuFloat32;
    }>>;
    fluidVoxels: MuArray<MuVarint>;
    fluidVolumeFraction: MuArray<MuFloat32>;
}>>;
export type ContactIndex = typeof ContactIndexSchema.identity;
//# sourceMappingURL=physics-schema.d.ts.map