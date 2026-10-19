"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactIndexSchema = exports.ContactRecordSchema = exports.FluidContactSetSchema = exports.FluidContactSchema = exports.VoxelContactSetSchema = exports.VoxelContactSchema = exports.BodyContactSetSchema = exports.BodyContactSchema = exports.CubeAxisSchema = exports.CUBE_AXIS = exports.CubeAxis = exports.RigidBodySetSchema = exports.RigidBodySchema = exports.RIGID_BODY_POOL = exports.RigidBody = exports.RigidBodyFlags = exports.PhysicsForceSchema = exports.PhysicsQuatComponentSchema = exports.PhysicsQuatComponentDefaultSchema = exports.PhysicsVelocotyComponentSchema = exports.PhysicsVelocitySchema = exports.PhysicsPositionComponentSchema = exports.PhysicsPositionSchema = exports.PhysicsSizeComponentSchema = exports.PhysicsBoundsComponentSchema = exports.PhysicsBoundsSchema = exports.PhysicsParamsSchema = void 0;
exports.encodeCubeAxis = encodeCubeAxis;
exports.compareBodyContact = compareBodyContact;
exports.compareVoxelContact = compareVoxelContact;
exports.compareFluidContact = compareFluidContact;
const array_1 = require("@box/mudb/schema/array");
const float32_1 = require("@box/mudb/schema/float32");
const int8_1 = require("@box/mudb/schema/int8");
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const varint_1 = require("@box/mudb/schema/varint");
const id_1 = require("@box/utils/id");
const math_schema_1 = require("../utils/math-schema");
const project_rda_1 = require("../project/project-rda");
const gl_matrix_1 = require("gl-matrix");
const quantized_schema_1 = require("../utils/quantized-schema");
exports.PhysicsParamsSchema = project_rda_1.PhysicsRDA.stateSchema;
const MASS_PRECISION = 256;
const FRICTION_PRECISION = 256;
const RESTITUTION_PRECISION = 256;
const BOUNDS_PRECISION = 256;
const POSITION_PRECISION = 256;
const VELOCITY_PRECISION = 256;
const QUAT_PRECISION = 256;
const SIZE_PRECISION = 256;
const MASS_SCALE = 1 / MASS_PRECISION;
const FRICTION_SCALE = 1 / FRICTION_PRECISION;
const RESTITUTION_SCALE = 1 / RESTITUTION_PRECISION;
const BOUNDS_SCALE = 1 / BOUNDS_PRECISION;
const POSITION_SCALE = 1 / POSITION_PRECISION;
const VELOCITY_SCALE = 1 / VELOCITY_PRECISION;
const QUAT_SCALE = 1 / QUAT_PRECISION;
const SIZE_SCALE = 1 / SIZE_PRECISION;
exports.PhysicsBoundsSchema = new quantized_schema_1.QuantizedVec3Schema(BOUNDS_SCALE, gl_matrix_1.vec3.fromValues(1, 1, 1));
exports.PhysicsBoundsComponentSchema = new quantized_float_1.MuQuantizedFloat(BOUNDS_SCALE, 1);
exports.PhysicsSizeComponentSchema = new quantized_float_1.MuQuantizedFloat(SIZE_SCALE, 1);
exports.PhysicsPositionSchema = new quantized_schema_1.QuantizedVec3Schema(POSITION_SCALE);
exports.PhysicsPositionComponentSchema = new quantized_float_1.MuQuantizedFloat(POSITION_SCALE);
exports.PhysicsVelocitySchema = new quantized_schema_1.QuantizedVec3Schema(VELOCITY_SCALE);
exports.PhysicsVelocotyComponentSchema = new quantized_float_1.MuQuantizedFloat(VELOCITY_SCALE);
exports.PhysicsQuatComponentDefaultSchema = new quantized_float_1.MuQuantizedFloat(QUAT_SCALE, 1);
exports.PhysicsQuatComponentSchema = new quantized_float_1.MuQuantizedFloat(QUAT_SCALE);
exports.PhysicsForceSchema = new quantized_schema_1.QuantizedVec3Schema(1 / 256);
var RigidBodyFlags;
(function (RigidBodyFlags) {
    // local network lock flag.  if set then the local host has authority on its body
    RigidBodyFlags[RigidBodyFlags["LOCKED"] = 1] = "LOCKED";
    // modifies body dynamics
    RigidBodyFlags[RigidBodyFlags["COLLIDES"] = 2] = "COLLIDES";
    RigidBodyFlags[RigidBodyFlags["GRAVITY"] = 4] = "GRAVITY";
    RigidBodyFlags[RigidBodyFlags["PLAYER"] = 8] = "PLAYER";
    RigidBodyFlags[RigidBodyFlags["FIXED"] = 16] = "FIXED";
    // remote controlled body.  if set, then the remote host has authority on this body, is just following path
    RigidBodyFlags[RigidBodyFlags["REMOTE"] = 32] = "REMOTE";
    // animated object, set if the object's position is currently being controlled by an animation
    RigidBodyFlags[RigidBodyFlags["ANIMATED"] = 64] = "ANIMATED";
})(RigidBodyFlags || (exports.RigidBodyFlags = RigidBodyFlags = {}));
// skip remote flag when serializing objects
const RIGID_BODY_FLAG_SHIFT = 5;
const RIGID_BODY_FLAG_MASK = (1 << RIGID_BODY_FLAG_SHIFT) - 1;
// bit mask offsets, should experiment with order to optimize bandwidth
// tracker只是用于立flag看是否diff有变化，每个参数占一位，只要mask_offset在「32位以内」就有效
let MASK_OFFSET = 0;
const POSITION_TRACKER = MASK_OFFSET;
MASK_OFFSET += 3;
const VELOCITY_TRACKER = MASK_OFFSET;
MASK_OFFSET += 3;
const FLAG_TRACKER = MASK_OFFSET;
MASK_OFFSET += RIGID_BODY_FLAG_SHIFT;
const BOUNDS_TRACKER = MASK_OFFSET;
MASK_OFFSET += 3;
const GROUP_TRACKER = MASK_OFFSET;
MASK_OFFSET += 1;
const MASS_TRACKER = MASK_OFFSET;
MASK_OFFSET += 1;
const FRICTION_TRACKER = MASK_OFFSET;
MASK_OFFSET += 1;
const RESTITUTION_TRACKER = MASK_OFFSET;
MASK_OFFSET += 1;
const ID_TRACKER = MASK_OFFSET;
MASK_OFFSET += 1;
const QUAT_TRACKER = MASK_OFFSET;
MASK_OFFSET += 4;
const SIZE_TRACKER = MASK_OFFSET;
MASK_OFFSET += 3;
const ANGULAR_VELOCITY_TRACKER = MASK_OFFSET;
MASK_OFFSET += 3;
// struct size
// 一个数字最多占 Varint 5个字节，先把size膨胀到最大尺寸
const RIGID_BODY_SIZE = 5 * MASK_OFFSET;
class RigidBody {
    constructor() {
        this.id = 0;
        this.flags = RigidBodyFlags.COLLIDES | RigidBodyFlags.GRAVITY;
        this.mass = 1;
        this.friction = 0;
        this.restitution = 0;
        this.group = 0;
        // bounds
        this.rx = 1;
        this.ry = 1;
        this.rz = 1;
        // position
        this.px = 0;
        this.py = 0;
        this.pz = 0;
        // velocity
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        // quaternion
        this.qx = 0;
        this.qy = 0;
        this.qz = 0;
        this.qw = 1;
        // half size
        this.hsx = 1;
        this.hsy = 1;
        this.hsz = 1;
        // angular velocity
        this.ax = 0;
        this.ay = 0;
        this.az = 0;
    }
    getBounds() {
        return gl_matrix_1.vec3.fromValues(this.rx, this.ry, this.rz);
    }
    setBounds(v) {
        this.rx = v[0];
        this.ry = v[1];
        this.rz = v[2];
    }
    copyBounds(out) {
        out[0] = this.rx;
        out[1] = this.ry;
        out[2] = this.rz;
    }
    getPosition() {
        return gl_matrix_1.vec3.fromValues(this.px, this.py, this.pz);
    }
    setPosition(v) {
        this.px = v[0];
        this.py = v[1];
        this.pz = v[2];
    }
    copyPosition(out) {
        out[0] = this.px;
        out[1] = this.py;
        out[2] = this.pz;
    }
    getVelocity() {
        return gl_matrix_1.vec3.fromValues(this.vx, this.vy, this.vz);
    }
    setVelocity(v) {
        this.vx = v[0];
        this.vy = v[1];
        this.vz = v[2];
    }
    copyVelocity(out) {
        out[0] = this.vx;
        out[1] = this.vy;
        out[2] = this.vz;
    }
    // distance helper
    dist(other) {
        return Math.sqrt(Math.pow(this.px - other.px, 2) +
            Math.pow(this.py - other.py, 2) +
            Math.pow(this.pz - other.pz, 2));
    }
    vecDist(v) {
        return Math.sqrt(Math.pow(this.px - v[0], 2) +
            Math.pow(this.py - v[1], 2) +
            Math.pow(this.pz - v[2], 2));
    }
    getRotation() {
        // get bounding axes from quaternion
        const x2 = this.qx + this.qx;
        const y2 = this.qy + this.qy;
        const z2 = this.qz + this.qz;
        const xx = this.qx * x2;
        const yx = this.qy * x2;
        const yy = this.qy * y2;
        const zx = this.qz * x2;
        const zy = this.qz * y2;
        const zz = this.qz * z2;
        const wx = this.qw * x2;
        const wy = this.qw * y2;
        const wz = this.qw * z2;
        const m0 = 1 - yy - zz;
        const m1 = yx + wz;
        const m2 = zx - wy;
        const m3 = yx - wz;
        const m4 = 1 - xx - zz;
        const m5 = zy + wx;
        const m6 = zx + wy;
        const m7 = zy - wx;
        const m8 = 1 - xx - yy;
        return gl_matrix_1.mat3.fromValues(m0, m1, m2, m3, m4, m5, m6, m7, m8);
    }
}
exports.RigidBody = RigidBody;
exports.RIGID_BODY_POOL = [];
// keep legacy schema around so we can debug stuff
const LegacyRigidBodySchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    flags: (new varint_1.MuVarint(RigidBodyFlags.COLLIDES | RigidBodyFlags.GRAVITY)),
    group: new varint_1.MuVarint(),
    mass: new quantized_float_1.MuQuantizedFloat(MASS_SCALE, 1),
    friction: new quantized_float_1.MuQuantizedFloat(FRICTION_SCALE, 0),
    restitution: new quantized_float_1.MuQuantizedFloat(RESTITUTION_SCALE, 0),
    rx: exports.PhysicsBoundsComponentSchema,
    ry: exports.PhysicsBoundsComponentSchema,
    rz: exports.PhysicsBoundsComponentSchema,
    px: exports.PhysicsPositionComponentSchema,
    py: exports.PhysicsPositionComponentSchema,
    pz: exports.PhysicsPositionComponentSchema,
    vx: exports.PhysicsVelocotyComponentSchema,
    vy: exports.PhysicsVelocotyComponentSchema,
    vz: exports.PhysicsVelocotyComponentSchema,
    qx: exports.PhysicsQuatComponentSchema,
    qy: exports.PhysicsQuatComponentSchema,
    qz: exports.PhysicsQuatComponentSchema,
    qw: exports.PhysicsQuatComponentDefaultSchema,
    hsx: exports.PhysicsSizeComponentSchema,
    hsy: exports.PhysicsSizeComponentSchema,
    hsz: exports.PhysicsSizeComponentSchema,
    ax: exports.PhysicsVelocotyComponentSchema,
    ay: exports.PhysicsVelocotyComponentSchema,
    az: exports.PhysicsVelocotyComponentSchema,
});
const SCHROEPPEL2 = 0xaaaaaaaa;
/**
 * 用于读取以-2为底数的二进制数据，方便记录负数
 * https://en.wikipedia.org/wiki/Negative_base#To_Negabinary
 * @param stream
 * @returns
 */
function readShroeppel(stream) {
    return ((SCHROEPPEL2 ^ stream.readVarint()) - SCHROEPPEL2) >> 0;
}
let BODY_ALLOC_COUNTER = 0;
let BODY_FREE_COUNTER = 0;
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
exports.RigidBodySchema = {
    identity: new RigidBody(),
    muType: LegacyRigidBodySchema.muType,
    json: LegacyRigidBodySchema.json,
    muData: LegacyRigidBodySchema.muData,
    pool: exports.RIGID_BODY_POOL,
    stats: function () {
        return {
            allocCount: BODY_ALLOC_COUNTER,
            freeCount: BODY_FREE_COUNTER,
            poolSize: exports.RIGID_BODY_POOL.length,
        };
    },
    alloc: function () {
        BODY_ALLOC_COUNTER++;
        return exports.RIGID_BODY_POOL.pop() || new RigidBody();
    },
    clone: function (b) {
        BODY_ALLOC_COUNTER++;
        const result = exports.RIGID_BODY_POOL.pop() || new RigidBody();
        result.id = b.id;
        result.flags = b.flags;
        result.group = b.group;
        result.mass = b.mass;
        result.friction = b.friction;
        result.restitution = b.restitution;
        result.rx = b.rx;
        result.ry = b.ry;
        result.rz = b.rz;
        result.px = b.px;
        result.py = b.py;
        result.pz = b.pz;
        result.vx = b.vx;
        result.vy = b.vy;
        result.vz = b.vz;
        result.qx = b.qx;
        result.qy = b.qy;
        result.qz = b.qz;
        result.qw = b.qw;
        result.hsx = b.hsx;
        result.hsy = b.hsy;
        result.hsz = b.hsz;
        result.ax = b.ax;
        result.ay = b.ay;
        result.az = b.az;
        return result;
    },
    free: function (b) {
        BODY_FREE_COUNTER++;
        exports.RIGID_BODY_POOL.push(b);
    },
    equal: function (a, b) {
        return (a.id === b.id &&
            a.flags === b.flags &&
            a.group === b.group &&
            a.mass === b.mass &&
            a.friction === b.friction &&
            a.restitution === b.restitution &&
            a.rx === b.rx &&
            a.ry === b.ry &&
            a.rz === b.rz &&
            a.px === b.px &&
            a.py === b.py &&
            a.pz === b.pz &&
            a.vx === b.vx &&
            a.vy === b.vy &&
            a.vz === b.vz &&
            a.qx === b.qx &&
            a.qy === b.qy &&
            a.qz === b.qz &&
            a.qw === b.qw &&
            a.hsx === b.hsx &&
            a.hsy === b.hsy &&
            a.hsz === b.hsz &&
            a.ax === b.ax &&
            a.ay === b.ay &&
            a.az === b.az);
    },
    assign: function (dst, src) {
        dst.id = src.id;
        dst.flags = src.flags;
        dst.group = src.group;
        dst.mass = src.mass;
        dst.friction = src.friction;
        dst.restitution = src.restitution;
        dst.rx = src.rx;
        dst.ry = src.ry;
        dst.rz = src.rz;
        dst.px = src.px;
        dst.py = src.py;
        dst.pz = src.pz;
        dst.vx = src.vx;
        dst.vy = src.vy;
        dst.vz = src.vz;
        dst.qx = src.qx;
        dst.qy = src.qy;
        dst.qz = src.qz;
        dst.qw = src.qw;
        dst.hsx = src.hsx;
        dst.hsy = src.hsy;
        dst.hsz = src.hsz;
        dst.ax = src.ax;
        dst.ay = src.ay;
        dst.az = src.az;
        return dst;
    },
    patch: function (base, inp) {
        BODY_ALLOC_COUNTER++;
        const result = exports.RIGID_BODY_POOL.pop() || new RigidBody();
        // read in tracker
        const tracker = inp.readVarint();
        // update flags
        result.flags =
            base.flags ^ ((tracker >>> FLAG_TRACKER) & RIGID_BODY_FLAG_MASK);
        // patch all properties manually
        // patch时候read的顺序，必须严格按照diff时候写入的顺序
        if (tracker & (1 << ID_TRACKER)) {
            result.id = base.id + readShroeppel(inp);
        }
        else {
            result.id = base.id;
        }
        if (tracker & (1 << GROUP_TRACKER)) {
            result.group = base.group + readShroeppel(inp);
        }
        else {
            result.group = base.group;
        }
        if (tracker & (1 << MASS_TRACKER)) {
            result.mass =
                MASS_SCALE *
                    (Math.round(base.mass * MASS_PRECISION) + readShroeppel(inp));
        }
        else {
            result.mass = base.mass;
        }
        if (tracker & (1 << FRICTION_TRACKER)) {
            result.friction =
                FRICTION_SCALE *
                    (Math.round(base.friction * FRICTION_PRECISION) + readShroeppel(inp));
        }
        else {
            result.friction = base.friction;
        }
        if (tracker & (1 << RESTITUTION_TRACKER)) {
            result.restitution =
                RESTITUTION_SCALE *
                    (Math.round(base.restitution * RESTITUTION_PRECISION) +
                        readShroeppel(inp));
        }
        else {
            result.restitution = base.restitution;
        }
        if (tracker & (1 << BOUNDS_TRACKER)) {
            result.rx =
                BOUNDS_SCALE *
                    (Math.round(base.rx * BOUNDS_PRECISION) + readShroeppel(inp));
        }
        else {
            result.rx = base.rx;
        }
        if (tracker & (2 << BOUNDS_TRACKER)) {
            result.ry =
                BOUNDS_SCALE *
                    (Math.round(base.ry * BOUNDS_PRECISION) + readShroeppel(inp));
        }
        else {
            result.ry = base.ry;
        }
        if (tracker & (4 << BOUNDS_TRACKER)) {
            result.rz =
                BOUNDS_SCALE *
                    (Math.round(base.rz * BOUNDS_PRECISION) + readShroeppel(inp));
        }
        else {
            result.rz = base.rz;
        }
        if (tracker & (1 << POSITION_TRACKER)) {
            result.px =
                POSITION_SCALE *
                    (Math.round(base.px * POSITION_PRECISION) + readShroeppel(inp));
        }
        else {
            result.px = base.px;
        }
        if (tracker & (2 << POSITION_TRACKER)) {
            result.py =
                POSITION_SCALE *
                    (Math.round(base.py * POSITION_PRECISION) + readShroeppel(inp));
        }
        else {
            result.py = base.py;
        }
        if (tracker & (4 << POSITION_TRACKER)) {
            result.pz =
                POSITION_SCALE *
                    (Math.round(base.pz * POSITION_PRECISION) + readShroeppel(inp));
        }
        else {
            result.pz = base.pz;
        }
        if (tracker & (1 << VELOCITY_TRACKER)) {
            result.vx =
                VELOCITY_SCALE *
                    (Math.round(base.vx * VELOCITY_PRECISION) + readShroeppel(inp));
        }
        else {
            result.vx = base.vx;
        }
        if (tracker & (2 << VELOCITY_TRACKER)) {
            result.vy =
                VELOCITY_SCALE *
                    (Math.round(base.vy * VELOCITY_PRECISION) + readShroeppel(inp));
        }
        else {
            result.vy = base.vy;
        }
        if (tracker & (4 << VELOCITY_TRACKER)) {
            result.vz =
                VELOCITY_SCALE *
                    (Math.round(base.vz * VELOCITY_PRECISION) + readShroeppel(inp));
        }
        else {
            result.vz = base.vz;
        }
        if (tracker & (1 << QUAT_TRACKER)) {
            result.qx =
                QUAT_SCALE *
                    (Math.round(base.qx * QUAT_PRECISION) + readShroeppel(inp));
        }
        else {
            result.qx = base.qx;
        }
        if (tracker & (2 << QUAT_TRACKER)) {
            result.qy =
                QUAT_SCALE *
                    (Math.round(base.qy * QUAT_PRECISION) + readShroeppel(inp));
        }
        else {
            result.qy = base.qy;
        }
        if (tracker & (4 << QUAT_TRACKER)) {
            result.qz =
                QUAT_SCALE *
                    (Math.round(base.qz * QUAT_PRECISION) + readShroeppel(inp));
        }
        else {
            result.qz = base.qz;
        }
        if (tracker & (8 << QUAT_TRACKER)) {
            result.qw =
                QUAT_SCALE *
                    (Math.round(base.qw * QUAT_PRECISION) + readShroeppel(inp));
        }
        else {
            result.qw = base.qw;
        }
        if (tracker & (1 << SIZE_TRACKER)) {
            result.hsx =
                SIZE_SCALE *
                    (Math.round(base.hsx * SIZE_PRECISION) + readShroeppel(inp));
        }
        else {
            result.hsx = base.hsx;
        }
        if (tracker & (2 << SIZE_TRACKER)) {
            result.hsy =
                SIZE_SCALE *
                    (Math.round(base.hsy * SIZE_PRECISION) + readShroeppel(inp));
        }
        else {
            result.hsy = base.hsy;
        }
        if (tracker & (4 << SIZE_TRACKER)) {
            result.hsz =
                SIZE_SCALE *
                    (Math.round(base.hsz * SIZE_PRECISION) + readShroeppel(inp));
        }
        else {
            result.hsz = base.hsz;
        }
        if (tracker & (1 << ANGULAR_VELOCITY_TRACKER)) {
            result.ax =
                VELOCITY_SCALE *
                    (Math.round(base.ax * VELOCITY_PRECISION) + readShroeppel(inp));
        }
        else {
            result.ax = base.ax;
        }
        if (tracker & (2 << ANGULAR_VELOCITY_TRACKER)) {
            result.ay =
                VELOCITY_SCALE *
                    (Math.round(base.ay * VELOCITY_PRECISION) + readShroeppel(inp));
        }
        else {
            result.ay = base.ay;
        }
        if (tracker & (4 << ANGULAR_VELOCITY_TRACKER)) {
            result.az =
                VELOCITY_SCALE *
                    (Math.round(base.az * VELOCITY_PRECISION) + readShroeppel(inp));
        }
        else {
            result.az = base.az;
        }
        return result;
    },
    diff: function (base, target, out) {
        // compute base values
        const dId = (target.id - base.id) | 0;
        const dGroup = (target.group - base.group) | 0;
        const dMass = (Math.round(target.mass * MASS_PRECISION) -
            Math.round(base.mass * MASS_PRECISION)) |
            0;
        const dFriction = (Math.round(target.friction * FRICTION_PRECISION) -
            Math.round(base.friction * FRICTION_PRECISION)) |
            0;
        const dRestitution = (Math.round(target.restitution * RESTITUTION_PRECISION) -
            Math.round(base.restitution * RESTITUTION_PRECISION)) |
            0;
        const dRx = (Math.round(target.rx * BOUNDS_PRECISION) -
            Math.round(base.rx * BOUNDS_PRECISION)) |
            0;
        const dRy = (Math.round(target.ry * BOUNDS_PRECISION) -
            Math.round(base.ry * BOUNDS_PRECISION)) |
            0;
        const dRz = (Math.round(target.rz * BOUNDS_PRECISION) -
            Math.round(base.rz * BOUNDS_PRECISION)) |
            0;
        const dPx = (Math.round(target.px * POSITION_PRECISION) -
            Math.round(base.px * POSITION_PRECISION)) |
            0;
        const dPy = (Math.round(target.py * POSITION_PRECISION) -
            Math.round(base.py * POSITION_PRECISION)) |
            0;
        const dPz = (Math.round(target.pz * POSITION_PRECISION) -
            Math.round(base.pz * POSITION_PRECISION)) |
            0;
        const dVx = (Math.round(target.vx * VELOCITY_PRECISION) -
            Math.round(base.vx * VELOCITY_PRECISION)) |
            0;
        const dVy = (Math.round(target.vy * VELOCITY_PRECISION) -
            Math.round(base.vy * VELOCITY_PRECISION)) |
            0;
        const dVz = (Math.round(target.vz * VELOCITY_PRECISION) -
            Math.round(base.vz * VELOCITY_PRECISION)) |
            0;
        const dQx = (Math.round(target.qx * QUAT_PRECISION) -
            Math.round(base.qx * QUAT_PRECISION)) |
            0;
        const dQy = (Math.round(target.qy * QUAT_PRECISION) -
            Math.round(base.qy * QUAT_PRECISION)) |
            0;
        const dQz = (Math.round(target.qz * QUAT_PRECISION) -
            Math.round(base.qz * QUAT_PRECISION)) |
            0;
        const dQw = (Math.round(target.qw * QUAT_PRECISION) -
            Math.round(base.qw * QUAT_PRECISION)) |
            0;
        const dHsx = (Math.round(target.hsx * SIZE_PRECISION) -
            Math.round(base.hsx * SIZE_PRECISION)) |
            0;
        const dHsy = (Math.round(target.hsy * SIZE_PRECISION) -
            Math.round(base.hsy * SIZE_PRECISION)) |
            0;
        const dHsz = (Math.round(target.hsz * SIZE_PRECISION) -
            Math.round(base.hsz * SIZE_PRECISION)) |
            0;
        const dAx = (Math.round(target.ax * VELOCITY_PRECISION) -
            Math.round(base.ax * VELOCITY_PRECISION)) |
            0;
        const dAy = (Math.round(target.ay * VELOCITY_PRECISION) -
            Math.round(base.ay * VELOCITY_PRECISION)) |
            0;
        const dAz = (Math.round(target.az * VELOCITY_PRECISION) -
            Math.round(base.az * VELOCITY_PRECISION)) |
            0;
        // flag delta
        const flagDelta = (base.flags ^ target.flags) & RIGID_BODY_FLAG_MASK;
        // compute bit mask
        const tracker = (!!dId << ID_TRACKER) +
            (!!dGroup << GROUP_TRACKER) +
            (!!dMass << MASS_TRACKER) +
            (!!dFriction << FRICTION_TRACKER) +
            (!!dRestitution << RESTITUTION_TRACKER) +
            (!!dRx << BOUNDS_TRACKER) +
            (!!dRy << (BOUNDS_TRACKER + 1)) +
            (!!dRz << (BOUNDS_TRACKER + 2)) +
            (!!dPx << POSITION_TRACKER) +
            (!!dPy << (POSITION_TRACKER + 1)) +
            (!!dPz << (POSITION_TRACKER + 2)) +
            (!!dVx << VELOCITY_TRACKER) +
            (!!dVy << (VELOCITY_TRACKER + 1)) +
            (!!dVz << (VELOCITY_TRACKER + 2)) +
            (!!dQx << QUAT_TRACKER) +
            (!!dQy << (QUAT_TRACKER + 1)) +
            (!!dQz << (QUAT_TRACKER + 2)) +
            (!!dQw << (QUAT_TRACKER + 3)) +
            (!!dHsx << SIZE_TRACKER) +
            (!!dHsy << (SIZE_TRACKER + 1)) +
            (!!dHsz << (SIZE_TRACKER + 2)) +
            (!!dAx << ANGULAR_VELOCITY_TRACKER) +
            (!!dAy << (ANGULAR_VELOCITY_TRACKER + 1)) +
            (!!dAz << (ANGULAR_VELOCITY_TRACKER + 2)) +
            (flagDelta << FLAG_TRACKER);
        // if identical, skip delta
        if (!tracker) {
            return false;
        }
        // write mask
        out.grow(RIGID_BODY_SIZE);
        out.writeVarint(tracker);
        // write deltas
        if (dId) {
            out.writeVarint((SCHROEPPEL2 + dId) ^ SCHROEPPEL2);
        }
        if (dGroup) {
            out.writeVarint((SCHROEPPEL2 + dGroup) ^ SCHROEPPEL2);
        }
        if (dMass) {
            out.writeVarint((SCHROEPPEL2 + dMass) ^ SCHROEPPEL2);
        }
        if (dFriction) {
            out.writeVarint((SCHROEPPEL2 + dFriction) ^ SCHROEPPEL2);
        }
        if (dRestitution) {
            out.writeVarint((SCHROEPPEL2 + dRestitution) ^ SCHROEPPEL2);
        }
        if (dRx) {
            out.writeVarint((SCHROEPPEL2 + dRx) ^ SCHROEPPEL2);
        }
        if (dRy) {
            out.writeVarint((SCHROEPPEL2 + dRy) ^ SCHROEPPEL2);
        }
        if (dRz) {
            out.writeVarint((SCHROEPPEL2 + dRz) ^ SCHROEPPEL2);
        }
        if (dPx) {
            out.writeVarint((SCHROEPPEL2 + dPx) ^ SCHROEPPEL2);
        }
        if (dPy) {
            out.writeVarint((SCHROEPPEL2 + dPy) ^ SCHROEPPEL2);
        }
        if (dPz) {
            out.writeVarint((SCHROEPPEL2 + dPz) ^ SCHROEPPEL2);
        }
        if (dVx) {
            out.writeVarint((SCHROEPPEL2 + dVx) ^ SCHROEPPEL2);
        }
        if (dVy) {
            out.writeVarint((SCHROEPPEL2 + dVy) ^ SCHROEPPEL2);
        }
        if (dVz) {
            out.writeVarint((SCHROEPPEL2 + dVz) ^ SCHROEPPEL2);
        }
        if (dQx) {
            out.writeVarint((SCHROEPPEL2 + dQx) ^ SCHROEPPEL2);
        }
        if (dQy) {
            out.writeVarint((SCHROEPPEL2 + dQy) ^ SCHROEPPEL2);
        }
        if (dQz) {
            out.writeVarint((SCHROEPPEL2 + dQz) ^ SCHROEPPEL2);
        }
        if (dQw) {
            out.writeVarint((SCHROEPPEL2 + dQw) ^ SCHROEPPEL2);
        }
        if (dHsx) {
            out.writeVarint((SCHROEPPEL2 + dHsx) ^ SCHROEPPEL2);
        }
        if (dHsy) {
            out.writeVarint((SCHROEPPEL2 + dHsy) ^ SCHROEPPEL2);
        }
        if (dHsz) {
            out.writeVarint((SCHROEPPEL2 + dHsz) ^ SCHROEPPEL2);
        }
        if (dAx) {
            out.writeVarint((SCHROEPPEL2 + dAx) ^ SCHROEPPEL2);
        }
        if (dAy) {
            out.writeVarint((SCHROEPPEL2 + dAy) ^ SCHROEPPEL2);
        }
        if (dAz) {
            out.writeVarint((SCHROEPPEL2 + dAz) ^ SCHROEPPEL2);
        }
        return true;
    },
    toJSON: function (body) {
        return {
            id: body.id,
            flags: body.flags,
            mass: body.mass,
            group: body.group,
            friction: body.friction,
            restitution: body.restitution,
            bounds: [body.rx, body.ry, body.rz],
            position: [body.px, body.py, body.pz],
            velocity: [body.vx, body.vy, body.vz],
            quaternion: [body.qx, body.qy, body.qz, body.qw],
            halfSize: [body.hsx, body.hsy, body.hsz],
            angularVelocity: [body.ax, body.ay, body.az],
        };
    },
    fromJSON: function (_json) {
        const json = _json || {};
        const result = exports.RIGID_BODY_POOL.pop() || new RigidBody();
        result.id = json.id | 0;
        result.flags = json.flag & RIGID_BODY_FLAG_MASK;
        result.mass = +json.mass || 1;
        result.group = json.group | 0;
        result.friction = +json.friction || 0;
        result.restitution = +json.restitution || 0;
        if (Array.isArray(json.bounds)) {
            result.rx = +json.bounds[0] || 1;
            result.ry = +json.bounds[1] || 1;
            result.rz = +json.bounds[2] || 1;
        }
        if (Array.isArray(json.position)) {
            result.px = +json.position[0] || 0;
            result.py = +json.position[1] || 0;
            result.pz = +json.position[2] || 0;
        }
        if (Array.isArray(json.velocity)) {
            result.vx = +json.velocity[0] || 0;
            result.vy = +json.velocity[1] || 0;
            result.vz = +json.velocity[2] || 0;
        }
        if (Array.isArray(json.quaternion)) {
            result.qx = +json.quaternion[0] || 0;
            result.qy = +json.quaternion[1] || 0;
            result.qz = +json.quaternion[2] || 0;
            result.qw = +json.quaternion[3] || 1;
        }
        if (Array.isArray(json.halfSize)) {
            result.hsx = +json.halfSize[0] || 1;
            result.hsy = +json.halfSize[1] || 1;
            result.hsz = +json.halfSize[2] || 1;
        }
        if (Array.isArray(json.angularVelocity)) {
            result.ax = +json.angularVelocity[0] || 0;
            result.ay = +json.angularVelocity[1] || 0;
            result.az = +json.angularVelocity[2] || 0;
        }
        return result;
    },
};
exports.RigidBodySetSchema = new sorted_array_1.MuSortedArray(exports.RigidBodySchema, Infinity, id_1.compareId);
var CubeAxis;
(function (CubeAxis) {
    CubeAxis[CubeAxis["X_POS"] = 0] = "X_POS";
    CubeAxis[CubeAxis["X_NEG"] = 1] = "X_NEG";
    CubeAxis[CubeAxis["Y_POS"] = 2] = "Y_POS";
    CubeAxis[CubeAxis["Y_NEG"] = 3] = "Y_NEG";
    CubeAxis[CubeAxis["Z_POS"] = 4] = "Z_POS";
    CubeAxis[CubeAxis["Z_NEG"] = 5] = "Z_NEG";
})(CubeAxis || (exports.CubeAxis = CubeAxis = {}));
exports.CUBE_AXIS = [
    gl_matrix_1.vec3.fromValues(1, 0, 0),
    gl_matrix_1.vec3.fromValues(-1, 0, 0),
    gl_matrix_1.vec3.fromValues(0, 1, 0),
    gl_matrix_1.vec3.fromValues(0, -1, 0),
    gl_matrix_1.vec3.fromValues(0, 0, 1),
    gl_matrix_1.vec3.fromValues(0, 0, -1),
];
function encodeCubeAxis(axis) {
    if (axis[0] > 0) {
        return CubeAxis.X_POS;
    }
    if (axis[0] < 0) {
        return CubeAxis.X_NEG;
    }
    if (axis[1] > 0) {
        return CubeAxis.Y_POS;
    }
    if (axis[1] < 0) {
        return CubeAxis.Y_NEG;
    }
    if (axis[2] > 0) {
        return CubeAxis.Z_POS;
    }
    return CubeAxis.Z_NEG;
}
exports.CubeAxisSchema = {
    muType: 'cube-axis',
    muData: {
        type: 'cube-axis',
    },
    json: { type: 'cube-axis' },
    identity: gl_matrix_1.vec3.fromValues(1, 0, 0),
    diff: function (base, target, stream) {
        const b = encodeCubeAxis(base);
        const t = encodeCubeAxis(target);
        if (b === t) {
            return false;
        }
        stream.grow(1);
        stream.writeUint8(t);
        return true;
    },
    patch: function (base, stream) {
        const code = stream.readUint8();
        if (code < 0 || code >= 6) {
            gl_matrix_1.vec3.set(base, 0, 0, 0);
        }
        return math_schema_1.Vec3Schema.clone(exports.CUBE_AXIS[code]);
    },
    alloc: () => math_schema_1.Vec3Schema.alloc(),
    free: (x) => math_schema_1.Vec3Schema.free(x),
    equal: (x, y) => encodeCubeAxis(x) === encodeCubeAxis(y),
    clone: (x) => math_schema_1.Vec3Schema.clone(x),
    assign: (x, y) => gl_matrix_1.vec3.copy(x, y),
    toJSON: (x) => encodeCubeAxis(x),
    fromJSON: (y) => {
        if (typeof y === 'number' && y >= 0 && y <= 5) {
            return math_schema_1.Vec3Schema.clone(exports.CUBE_AXIS[y | 0]);
        }
        return math_schema_1.Vec3Schema.clone(exports.CUBE_AXIS[0]);
    },
};
exports.BodyContactSchema = new struct_1.MuStruct({
    // 碰撞ID
    otherId: new varint_1.MuVarint(),
    /**
     * 碰撞分离轴x轴方向
     */
    nx: new float32_1.MuFloat32(),
    /**
     * 碰撞分离轴y轴方向
     */
    ny: new float32_1.MuFloat32(),
    /**
     * 碰撞分离轴z轴方向
     */
    nz: new float32_1.MuFloat32(),
    /**
     * x方向碰撞力的大小
     */
    fx: new float32_1.MuFloat32(),
    /**
     * y方向碰撞力的大小
     */
    fy: new float32_1.MuFloat32(),
    /**
     * z方向碰撞力的大小
     */
    fz: new float32_1.MuFloat32(),
});
function compareBodyContact(a, b) {
    return a.otherId - b.otherId;
}
exports.BodyContactSetSchema = new sorted_array_1.MuSortedArray(exports.BodyContactSchema, Infinity, compareBodyContact);
exports.VoxelContactSchema = new struct_1.MuStruct({
    /**
     * 地形坐标x
     */
    x: new varint_1.MuVarint(0),
    /**
     * 地形坐标y
     */
    y: new varint_1.MuVarint(0),
    /**
     * 地形坐标z
     */
    z: new varint_1.MuVarint(0),
    /**
     * block: 地形ID
     * 在体素中代表的是色板中的颜色索引值，在地形中就指地形材质
     */
    b: new varint_1.MuVarint(0),
    /**
     * 碰撞分离轴
     * 1: x正方向
     * -1: x反方向
     * 2: y正方向
     * -2: y反方向
     * 3: z正方向
     * -3: z反方向
     */
    axis: new int8_1.MuInt8(),
    fx: new float32_1.MuFloat32(),
    fy: new float32_1.MuFloat32(),
    fz: new float32_1.MuFloat32(),
});
function compareVoxelContact(a, b) {
    const daxis = a.axis - b.axis;
    if (daxis) {
        return daxis;
    }
    switch (a.axis) {
        case -1:
        case 1:
            return a.x - b.x || a.y - b.y || a.z - b.z || a.b - b.b;
        case 2:
        case -2:
            return a.y - b.y || a.z - b.z || a.x - b.x || a.b - b.b;
        default:
            return a.z - b.z || a.x - b.x || a.y - b.y || a.b - b.b;
    }
}
exports.VoxelContactSetSchema = new sorted_array_1.MuSortedArray(exports.VoxelContactSchema, Infinity, compareVoxelContact);
exports.FluidContactSchema = new struct_1.MuStruct({
    b: new varint_1.MuVarint(),
    volumeFraction: new quantized_float_1.MuQuantizedFloat(1 / 256, 0),
});
function compareFluidContact(a, b) {
    return a.b - b.b;
}
exports.FluidContactSetSchema = new sorted_array_1.MuSortedArray(exports.FluidContactSchema, Infinity, compareFluidContact);
// ignoring stuff for event reporting (for now...)
//
// need to figure out:
//  1.  how is each field used?
//  2.  what information do we need?
//  3.  does it make sense to split contact reporting into 2 phases:
//      a. one for normal event generation
//      b. one for tick/update phase
//  4.  how to map the result back to the old contact index?
exports.ContactRecordSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    // not much to say about this one
    //      can inline the force vector
    //      normal vector should be a single number
    //  used in following:
    //      a. animations: only when player on ground  (this could be replaced probably)
    //      b. player move: to get platform velocity (seems essential)
    //      c. script bindings: also essential, needed to report events to script
    //      d. test and debug:  not really essential
    //      e. locking bodies (only uses the index of body contacts, nothing else)
    //      f. random event generation (also essential)
    body: exports.BodyContactSetSchema,
    // could replace this with a flat array
    //  maybe store one array per axis, and one force direction per axis
    //  need only one global force accumulator for all voxels
    //      voxel array can just be a list of voxel coordinates
    //      voxel id can be recovered later in a script or whatever when the event is processed
    //  used in the following places:
    //      a. debug & test: not really essential
    //      b. player movement: (again platform velocity)
    //      c. player animations: could probably be replaced by a summary
    //      d. scripts
    //      e. event generation
    voxel: exports.VoxelContactSetSchema,
    // already not bad, but could be better
    // should just store a single flat array and could insert new fluids by insertion sort and linear scan
    //  used in the following places:
    //      a. debug and test
    //      b. scripts
    //      c. events
    //      d. player movement controller
    fluidVoxels: new array_1.MuArray(new varint_1.MuVarint(), Infinity),
    fluidVolumeFraction: new array_1.MuArray(new float32_1.MuFloat32(), Infinity),
});
exports.ContactIndexSchema = new sorted_array_1.MuSortedArray(exports.ContactRecordSchema, Infinity, id_1.compareId);
