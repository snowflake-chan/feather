"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIX_DZ = exports.FIX_DY = exports.FIX_DX = exports.FIX_Z1 = exports.FIX_Y1 = exports.FIX_X1 = exports.FIX_Z0 = exports.FIX_Y0 = exports.FIX_X0 = exports.FIXED_BODIES = exports.FLUID_CONTACTS = exports.ACTIVE_BOXES = exports.ACTIVE_GROUP = exports.MU = exports.CR = exports.QW = exports.QZ = exports.QY = exports.QX = exports.HSZ = exports.HSY = exports.HSX = exports.RZ = exports.RY = exports.RX = exports.AZ = exports.AY = exports.AX = exports.DZ = exports.DY = exports.DX = exports.Z1 = exports.Y1 = exports.X1 = exports.Z0 = exports.Y0 = exports.X0 = exports.INV_MASS = exports.MASS = exports.ACTIVE_BODIES = exports.BLOCK_VELOCITY = exports.BLOCK_FRICTION = exports.BLOCK_RESTITUTION = exports.BLOCK_MASS = exports.ACCEL_FACTOR = exports.VELOCITY_SCALE = exports.VELOCITY_DAMPING = exports.GRAVITY = exports.INV_DT = exports.DT = void 0;
exports.TERRAIN_HITS = exports.BOX_POOL = exports.FIXED_CONTACTS = exports.ACTIVE_CONTACTS = exports.FIXED_BOXES = exports.FIX_GROUP = exports.FIX_MU = exports.FIX_CR = exports.FIX_QW = exports.FIX_QZ = exports.FIX_QY = exports.FIX_QX = exports.FIX_HSZ = exports.FIX_HSY = exports.FIX_HSX = exports.FIX_RZ = exports.FIX_RY = exports.FIX_RX = exports.FIX_AZ = exports.FIX_AY = exports.FIX_AX = void 0;
exports.updateGlobalVariables = updateGlobalVariables;
exports.prepareBodies = prepareBodies;
const def_1 = require("./def");
const voxel_collision_1 = require("../voxel/voxel-collision");
const physics_schema_1 = require("./physics-schema");
const body_rbush_1 = require("./body-rbush");
const rbush_schema_1 = require("../utils/rbush-schema");
exports.DT = 1;
exports.INV_DT = 1;
exports.GRAVITY = -0.1;
exports.VELOCITY_DAMPING = 0;
exports.VELOCITY_SCALE = 1;
exports.ACCEL_FACTOR = 0.1;
exports.BLOCK_MASS = [];
exports.BLOCK_RESTITUTION = [];
exports.BLOCK_FRICTION = [];
exports.BLOCK_VELOCITY = [];
function ALLOC(size) {
    return new Float32Array(size);
}
// active body list
/**
 * 开启物理引擎，会被推动的物理模型
 * 索引值为BodyCollisionBox的ID
 */
exports.ACTIVE_BODIES = [];
// mass
exports.MASS = ALLOC(def_1.MAX_BODIES);
exports.INV_MASS = ALLOC(def_1.MAX_BODIES);
// previous position
exports.X0 = ALLOC(def_1.MAX_BODIES);
exports.Y0 = ALLOC(def_1.MAX_BODIES);
exports.Z0 = ALLOC(def_1.MAX_BODIES);
// next position
exports.X1 = ALLOC(def_1.MAX_BODIES);
exports.Y1 = ALLOC(def_1.MAX_BODIES);
exports.Z1 = ALLOC(def_1.MAX_BODIES);
// velocity
exports.DX = ALLOC(def_1.MAX_BODIES);
exports.DY = ALLOC(def_1.MAX_BODIES);
exports.DZ = ALLOC(def_1.MAX_BODIES);
// 角速度
exports.AX = ALLOC(def_1.MAX_BODIES);
exports.AY = ALLOC(def_1.MAX_BODIES);
exports.AZ = ALLOC(def_1.MAX_BODIES);
// bounding radius
exports.RX = ALLOC(def_1.MAX_BODIES);
exports.RY = ALLOC(def_1.MAX_BODIES);
exports.RZ = ALLOC(def_1.MAX_BODIES);
// half size
exports.HSX = ALLOC(def_1.MAX_BODIES);
exports.HSY = ALLOC(def_1.MAX_BODIES);
exports.HSZ = ALLOC(def_1.MAX_BODIES);
// quat
exports.QX = ALLOC(def_1.MAX_BODIES);
exports.QY = ALLOC(def_1.MAX_BODIES);
exports.QZ = ALLOC(def_1.MAX_BODIES);
exports.QW = ALLOC(def_1.MAX_BODIES);
// restitution and friction
/**
 * active bodies的弹性
 */
exports.CR = ALLOC(def_1.MAX_BODIES);
/**
 * active bodies的摩擦力
 */
exports.MU = ALLOC(def_1.MAX_BODIES);
// active group
/**
 * 物理模型的碰撞组标志位
 * 索引值同active_bodies，value是body.group的值
 */
exports.ACTIVE_GROUP = new Int32Array(def_1.MAX_BODIES);
// bounding boxes
/**
 * 碰撞盒，是个AABB的数据
 */
exports.ACTIVE_BOXES = [];
// fluid contacts for all active boxes
exports.FLUID_CONTACTS = [];
// fixed body list
/**
 * 开启物理引擎，不会被推动的物理模型
 */
exports.FIXED_BODIES = [];
// initial position for fixed body
exports.FIX_X0 = ALLOC(def_1.MAX_BODIES);
exports.FIX_Y0 = ALLOC(def_1.MAX_BODIES);
exports.FIX_Z0 = ALLOC(def_1.MAX_BODIES);
// final position for fixed body
exports.FIX_X1 = ALLOC(def_1.MAX_BODIES);
exports.FIX_Y1 = ALLOC(def_1.MAX_BODIES);
exports.FIX_Z1 = ALLOC(def_1.MAX_BODIES);
// fixed body velocity
exports.FIX_DX = ALLOC(def_1.MAX_BODIES);
exports.FIX_DY = ALLOC(def_1.MAX_BODIES);
exports.FIX_DZ = ALLOC(def_1.MAX_BODIES);
// fixed body 角速度
exports.FIX_AX = ALLOC(def_1.MAX_BODIES);
exports.FIX_AY = ALLOC(def_1.MAX_BODIES);
exports.FIX_AZ = ALLOC(def_1.MAX_BODIES);
// bounding boxes for fixed bodies
exports.FIX_RX = ALLOC(def_1.MAX_BODIES);
exports.FIX_RY = ALLOC(def_1.MAX_BODIES);
exports.FIX_RZ = ALLOC(def_1.MAX_BODIES);
// half sizes for fixed bodies
exports.FIX_HSX = ALLOC(def_1.MAX_BODIES);
exports.FIX_HSY = ALLOC(def_1.MAX_BODIES);
exports.FIX_HSZ = ALLOC(def_1.MAX_BODIES);
// fixed quat
exports.FIX_QX = ALLOC(def_1.MAX_BODIES);
exports.FIX_QY = ALLOC(def_1.MAX_BODIES);
exports.FIX_QZ = ALLOC(def_1.MAX_BODIES);
exports.FIX_QW = ALLOC(def_1.MAX_BODIES);
exports.FIX_CR = ALLOC(def_1.MAX_BODIES);
exports.FIX_MU = ALLOC(def_1.MAX_BODIES);
// fixed group
/**
 * 开了物理引擎但是不会被撞动的物体group
 */
exports.FIX_GROUP = new Int32Array(def_1.MAX_BODIES);
/**
 * 开了物理引擎但是不会被撞动的box，但会撞别人
 */
exports.FIXED_BOXES = [];
// contact record stuff
function ALLOC_CONTACT_REF() {
    const result = new Array(def_1.MAX_BODIES);
    for (let i = 0; i < def_1.MAX_BODIES; ++i) {
        result[i] = null;
    }
    return result;
}
exports.ACTIVE_CONTACTS = ALLOC_CONTACT_REF();
exports.FIXED_CONTACTS = ALLOC_CONTACT_REF();
// flags
const STATIC_FLAGS = physics_schema_1.RigidBodyFlags.FIXED | physics_schema_1.RigidBodyFlags.ANIMATED;
const ANIMATED_FLAG = physics_schema_1.RigidBodyFlags.ANIMATED;
const FIXED_FLAG = physics_schema_1.RigidBodyFlags.FIXED;
const COLLIDES_FLAG = physics_schema_1.RigidBodyFlags.COLLIDES;
const REMOTE_FLAG = physics_schema_1.RigidBodyFlags.REMOTE;
const GRAVITY_FLAG = physics_schema_1.RigidBodyFlags.GRAVITY;
// temporary collision box pool
exports.BOX_POOL = [];
let BOX_POOL_PTR = 0;
{
    for (let i = 0; i < def_1.MAX_BODIES; ++i) {
        exports.BOX_POOL.push(new body_rbush_1.BodyCollisionBox());
    }
}
// hit result from terrain query
exports.TERRAIN_HITS = [
    rbush_schema_1.VoxelCollisionBoxSchema.identity,
];
function updateGlobalVariables(physics, dt, blockIndex) {
    // update global variables
    // 先算全局参数：重力，速度阻尼，地形数据
    exports.DT = Math.max(dt, 1e-4);
    exports.INV_DT = 1 / exports.DT;
    exports.GRAVITY = +physics.gravity || 0;
    if (physics.velocityDamping > 1e-6) {
        exports.VELOCITY_DAMPING = physics.velocityDamping;
        exports.VELOCITY_SCALE = Math.exp(-exports.VELOCITY_DAMPING * exports.DT);
        exports.ACCEL_FACTOR = (1 - exports.VELOCITY_SCALE) / exports.VELOCITY_DAMPING;
    }
    else {
        exports.VELOCITY_DAMPING = 0;
        exports.VELOCITY_SCALE = 1;
        exports.ACCEL_FACTOR = exports.DT;
    }
    exports.BLOCK_MASS = blockIndex.mass;
    exports.BLOCK_RESTITUTION = blockIndex.restitution;
    exports.BLOCK_FRICTION = blockIndex.friction;
    exports.BLOCK_VELOCITY = blockIndex.velocity;
}
// unpack and prepare all bodies for solver
function prepareBodies(bodies, geom, zones) {
    // clear buffers
    exports.FLUID_CONTACTS.length =
        exports.ACTIVE_BODIES.length =
            exports.ACTIVE_BOXES.length =
                exports.FIXED_BODIES.length =
                    exports.FIXED_BOXES.length =
                        BOX_POOL_PTR =
                            0;
    // classify bodies into different types
    sortBodies(bodies);
    // unpack active and fixed bodies into internal arrays
    prepareActiveBodies(geom, zones);
    prepareFixedBodies();
}
/**
 * 根据bodies的flag状态，将所有可被server修改的，开启物理引擎的bodies分为：FIXED_BODIES，ACTIVE_BODIES
 * 根据flag状态算速度
 * @param bodies
 */
function sortBodies(bodies) {
    for (let i = 0; i < bodies.length; ++i) {
        const b = bodies[i];
        const flags = b.flags;
        if (!(flags & REMOTE_FLAG) || flags & ANIMATED_FLAG) {
            if (flags & COLLIDES_FLAG) {
                if (flags & STATIC_FLAGS) {
                    exports.FIXED_BODIES.push(b);
                }
                else {
                    exports.ACTIVE_BODIES.push(b);
                }
            }
            else if (flags & ANIMATED_FLAG) {
                integrateAnimated(b);
            }
            else if (flags & FIXED_FLAG) {
                integrateStatic(b);
            }
            else {
                integrateDynamic(b);
            }
        }
    }
}
// non-colliding animated objects get velocity cleared
function integrateAnimated(body) {
    body.px += body.vx;
    body.py += body.vy;
    body.pz += body.vz;
    const q = [
        body.qx,
        body.qy,
        body.qz,
        body.qw,
    ];
    (0, def_1.calcQuatByVelocity)(q, body.ax, body.ay, body.az, 1);
    body.qx = q[0];
    body.qy = q[1];
    body.qz = q[2];
    body.qw = q[3];
    body.vx = body.vy = body.vz = 0;
    body.ax = body.ay = body.az = 0;
    body.flags &= ~ANIMATED_FLAG;
}
// static non-interacting objects just get their position updated
function integrateStatic(body) {
    body.px += exports.DT * body.vx;
    body.py += exports.DT * body.vy;
    body.pz += exports.DT * body.vz;
    const q = [
        body.qx,
        body.qy,
        body.qz,
        body.qw,
    ];
    (0, def_1.calcQuatByVelocity)(q, body.ax, body.ay, body.az, exports.DT);
    body.qx = q[0];
    body.qy = q[1];
    body.qz = q[2];
    body.qw = q[3];
}
// non-colliding objects can be directly integrated
function integrateDynamic(body) {
    const vx = (body.vx = exports.VELOCITY_SCALE * body.vx);
    const vy = (body.vy = clampVelocity(body.flags & GRAVITY_FLAG
        ? explicitIntegrateVelocity(+body.vy, exports.ACCEL_FACTOR * exports.GRAVITY)
        : exports.VELOCITY_SCALE * body.vy));
    const vz = (body.vz = exports.VELOCITY_SCALE * body.vz);
    body.px += exports.DT * vx;
    body.py += exports.DT * vy;
    body.pz += exports.DT * vz;
    body.ax = exports.VELOCITY_SCALE * body.ax;
    body.ay = exports.VELOCITY_SCALE * body.ay;
    body.az = exports.VELOCITY_SCALE * body.az;
    const q = [
        body.qx,
        body.qy,
        body.qz,
        body.qw,
    ];
    (0, def_1.calcQuatByVelocity)(q, body.ax, body.ay, body.az, exports.DT);
    body.qx = q[0];
    body.qy = q[1];
    body.qz = q[2];
    body.qw = q[3];
}
function clampVelocity(v) {
    return Math.min(def_1.MAX_VELOCITY, Math.max(-def_1.MAX_VELOCITY, +v || 0));
}
function explicitIntegrateVelocity(v0, f) {
    return exports.VELOCITY_SCALE * v0 + f;
}
// compute buoyancy and update fluid contact record at the same time
function computeBuoyancy(id, invMass, px, py, pz, rx, ry, rz, geom) {
    // query contact structure
    const lox = px - rx;
    const loy = py - ry;
    const loz = pz - rz;
    const hix = px + rx;
    const hiy = py + ry;
    const hiz = pz + rz;
    exports.TERRAIN_HITS.length = 0;
    (0, voxel_collision_1.collideFluid)(exports.TERRAIN_HITS, geom, lox, loy, loz, hix, hiy, hiz);
    if (exports.TERRAIN_HITS.length === 0) {
        return exports.GRAVITY;
    }
    let fluidMass = 0;
    const volumeScale = 1 / (8 * rx * ry * rz);
    for (let j = 0; j < exports.TERRAIN_HITS.length; ++j) {
        const hit = exports.TERRAIN_HITS[j];
        const block = hit.block;
        const density = exports.BLOCK_MASS[block & 0x0fff];
        const volume = Math.max(0, Math.min(hit.maxX, hix) - Math.max(hit.minX, lox)) *
            Math.max(0, Math.min(hit.maxY, hiy) - Math.max(hit.minY, loy)) *
            Math.max(0, Math.min(hit.maxZ, hiz) - Math.max(hit.minZ, loz));
        fluidMass += density * volume;
        // append fluid contact
        exports.FLUID_CONTACTS.push(id, block, volumeScale * volume);
    }
    return (1 - fluidMass * invMass) * exports.GRAVITY;
}
// unpack and preintegrate active object
function prepareActiveBodies(geom, zone) {
    for (let i = 0; i < exports.ACTIVE_BODIES.length; ++i) {
        const body = exports.ACTIVE_BODIES[i];
        const flags = body.flags;
        const m = (exports.MASS[i] = body.mass);
        const mv = (exports.INV_MASS[i] = 1 / m);
        exports.MU[i] = body.friction;
        exports.CR[i] = body.restitution;
        const group = (exports.ACTIVE_GROUP[i] = body.group);
        const x0 = (exports.X0[i] = body.px);
        const y0 = (exports.Y0[i] = body.py);
        const z0 = (exports.Z0[i] = body.pz);
        const rx = (exports.RX[i] = body.rx);
        const ry = (exports.RY[i] = body.ry);
        const rz = (exports.RZ[i] = body.rz);
        exports.HSX[i] = body.hsx;
        exports.HSY[i] = body.hsy;
        exports.HSZ[i] = body.hsz;
        exports.QX[i] = body.qx;
        exports.QY[i] = body.qy;
        exports.QZ[i] = body.qz;
        exports.QW[i] = body.qw;
        // accumulate body forces
        zone.accumulateForce(x0 - rx, y0 - ry, z0 - rz, x0 + rx, y0 + ry, z0 + rz, group, mv);
        const fx = zone.fx;
        let fy = zone.fy;
        const fz = zone.fz;
        if (flags & GRAVITY_FLAG) {
            fy += computeBuoyancy(body.id, mv, x0, y0, z0, rx, ry, rz, geom);
        }
        const vx = (exports.DX[i] = clampVelocity(exports.VELOCITY_SCALE * body.vx + exports.ACCEL_FACTOR * fx));
        const vy = (exports.DY[i] = clampVelocity(exports.VELOCITY_SCALE * body.vy + exports.ACCEL_FACTOR * fy));
        const vz = (exports.DZ[i] = clampVelocity(exports.VELOCITY_SCALE * body.vz + exports.ACCEL_FACTOR * fz));
        exports.AX[i] = (0, def_1.clampVelocityAndSleep)(exports.VELOCITY_SCALE * body.ax);
        exports.AY[i] = (0, def_1.clampVelocityAndSleep)(exports.VELOCITY_SCALE * body.ay);
        exports.AZ[i] = (0, def_1.clampVelocityAndSleep)(exports.VELOCITY_SCALE * body.az);
        const x1 = (exports.X1[i] = x0 + vx * exports.DT);
        const y1 = (exports.Y1[i] = y0 + vy * exports.DT);
        const z1 = (exports.Z1[i] = z0 + vz * exports.DT);
        // 计算碰撞盒的地方。碰撞初筛
        // 取运动过程当中包括残影最大的AABB盒子
        const box = exports.BOX_POOL[BOX_POOL_PTR++];
        box.minX = Math.min(x0, x1) - rx;
        box.minY = Math.min(y0, y1) - ry;
        box.minZ = Math.min(z0, z1) - rz;
        box.maxX = Math.max(x0, x1) + rx;
        box.maxY = Math.max(y0, y1) + ry;
        box.maxZ = Math.max(z0, z1) + rz;
        box.id = i;
        exports.ACTIVE_BOXES.push(box);
    }
}
// unpack and preintegrate a fixed object
function prepareFixedBodies() {
    for (let i = 0; i < exports.FIXED_BODIES.length; ++i) {
        const body = exports.FIXED_BODIES[i];
        exports.FIX_GROUP[i] = body.group;
        exports.FIX_MU[i] = body.friction;
        exports.FIX_CR[i] = body.restitution;
        const vx = body.vx;
        const vy = body.vy;
        const vz = body.vz;
        const ax = body.ax;
        const ay = body.ay;
        const az = body.az;
        const x0 = (exports.FIX_X0[i] = body.px);
        const y0 = (exports.FIX_Y0[i] = body.py);
        const z0 = (exports.FIX_Z0[i] = body.pz);
        const rx = (exports.FIX_RX[i] = body.rx);
        const ry = (exports.FIX_RY[i] = body.ry);
        const rz = (exports.FIX_RZ[i] = body.rz);
        exports.FIX_HSX[i] = body.hsx;
        exports.FIX_HSY[i] = body.hsy;
        exports.FIX_HSZ[i] = body.hsz;
        exports.FIX_QX[i] = body.qx;
        exports.FIX_QY[i] = body.qy;
        exports.FIX_QZ[i] = body.qz;
        exports.FIX_QW[i] = body.qw;
        let x1;
        let y1;
        let z1;
        const q = [
            exports.FIX_QX[i],
            exports.FIX_QY[i],
            exports.FIX_QZ[i],
            exports.FIX_QW[i],
        ];
        if (body.flags & ANIMATED_FLAG) {
            x1 = x0 + vx;
            y1 = y0 + vy;
            z1 = z0 + vz;
            (0, def_1.calcQuatByVelocity)(q, ax, ay, az, 1);
            exports.FIX_DX[i] = exports.INV_DT * vx;
            exports.FIX_DY[i] = exports.INV_DT * vy;
            exports.FIX_DZ[i] = exports.INV_DT * vz;
            exports.FIX_AX[i] = exports.INV_DT * ax;
            exports.FIX_AY[i] = exports.INV_DT * ay;
            exports.FIX_AZ[i] = exports.INV_DT * az;
            // clear animated flag and velocity
            body.flags &= ~ANIMATED_FLAG;
            body.vx = body.vy = body.vz = 0;
            body.ax = body.ay = body.az = 0;
        }
        else {
            x1 = x0 + exports.DT * vx;
            y1 = y0 + exports.DT * vy;
            z1 = z0 + exports.DT * vz;
            (0, def_1.calcQuatByVelocity)(q, ax, ay, az, exports.DT);
            exports.FIX_DX[i] = vx;
            exports.FIX_DY[i] = vy;
            exports.FIX_DZ[i] = vz;
            exports.FIX_AX[i] = ax;
            exports.FIX_AY[i] = ay;
            exports.FIX_AZ[i] = az;
        }
        exports.FIX_X1[i] = body.px = x1;
        exports.FIX_Y1[i] = body.py = y1;
        exports.FIX_Z1[i] = body.pz = z1;
        body.qx = q[0];
        body.qy = q[1];
        body.qz = q[2];
        body.qw = q[3];
        const box = exports.BOX_POOL[BOX_POOL_PTR++];
        box.minX = Math.min(x0, x1) - rx;
        box.minY = Math.min(y0, y1) - ry;
        box.minZ = Math.min(z0, z1) - rz;
        box.maxX = Math.max(x0, x1) + rx;
        box.maxY = Math.max(y0, y1) + ry;
        box.maxZ = Math.max(z0, z1) + rz;
        box.id = i;
        exports.FIXED_BOXES.push(box);
    }
}
