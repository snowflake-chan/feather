import {
  MAX_BODIES,
  MAX_VELOCITY,
  calcQuatByVelocity,
  clampVelocityAndSleep,
} from './def';
import { VoxelCollision } from '../voxel/voxel-collision-schema';
import { collideFluid } from '../voxel/voxel-collision';
import {
  RigidBodyFlags,
  RigidBody,
  PhysicsParams,
  ContactRecord,
} from './physics-schema';
import { BodyCollisionBox } from './body-rbush';
import {
  VoxelCollisionBox,
  VoxelCollisionBoxSchema,
} from '../utils/rbush-schema';
import { BlockIndex } from '../voxel/block-schema';
import { PhysicsZoneIndex } from './zone-index';

export let DT = 1;
export let INV_DT = 1;
export let GRAVITY = -0.1;
export let VELOCITY_DAMPING = 0;
export let VELOCITY_SCALE = 1;
export let ACCEL_FACTOR = 0.1;

export let BLOCK_MASS: number[] = [];
export let BLOCK_RESTITUTION: number[] = [];
export let BLOCK_FRICTION: number[] = [];
export let BLOCK_VELOCITY: number[] = [];

function ALLOC(size: number) {
  return new Float32Array(size);
}
export type ArrayType = ReturnType<typeof ALLOC>;

// active body list
/**
 * 开启物理引擎，会被推动的物理模型
 * 索引值为BodyCollisionBox的ID
 */
export const ACTIVE_BODIES: RigidBody[] = [];

// mass
export const MASS = ALLOC(MAX_BODIES);
export const INV_MASS = ALLOC(MAX_BODIES);

// previous position
export const X0 = ALLOC(MAX_BODIES);
export const Y0 = ALLOC(MAX_BODIES);
export const Z0 = ALLOC(MAX_BODIES);

// next position
export const X1 = ALLOC(MAX_BODIES);
export const Y1 = ALLOC(MAX_BODIES);
export const Z1 = ALLOC(MAX_BODIES);

// velocity
export const DX = ALLOC(MAX_BODIES);
export const DY = ALLOC(MAX_BODIES);
export const DZ = ALLOC(MAX_BODIES);

// 角速度
export const AX = ALLOC(MAX_BODIES);
export const AY = ALLOC(MAX_BODIES);
export const AZ = ALLOC(MAX_BODIES);

// bounding radius
export const RX = ALLOC(MAX_BODIES);
export const RY = ALLOC(MAX_BODIES);
export const RZ = ALLOC(MAX_BODIES);

// half size
export const HSX = ALLOC(MAX_BODIES);
export const HSY = ALLOC(MAX_BODIES);
export const HSZ = ALLOC(MAX_BODIES);

// quat
export const QX = ALLOC(MAX_BODIES);
export const QY = ALLOC(MAX_BODIES);
export const QZ = ALLOC(MAX_BODIES);
export const QW = ALLOC(MAX_BODIES);

// restitution and friction
/**
 * active bodies的弹性
 */
export const CR = ALLOC(MAX_BODIES);
/**
 * active bodies的摩擦力
 */
export const MU = ALLOC(MAX_BODIES);

// active group
/**
 * 物理模型的碰撞组标志位
 * 索引值同active_bodies，value是body.group的值
 */
export const ACTIVE_GROUP = new Int32Array(MAX_BODIES);

// bounding boxes
/**
 * 碰撞盒，是个AABB的数据
 */
export const ACTIVE_BOXES: BodyCollisionBox[] = [];

// fluid contacts for all active boxes
export const FLUID_CONTACTS: number[] = [];

// fixed body list
/**
 * 开启物理引擎，不会被推动的物理模型
 */
export const FIXED_BODIES: RigidBody[] = [];

// initial position for fixed body
export const FIX_X0 = ALLOC(MAX_BODIES);
export const FIX_Y0 = ALLOC(MAX_BODIES);
export const FIX_Z0 = ALLOC(MAX_BODIES);

// final position for fixed body
export const FIX_X1 = ALLOC(MAX_BODIES);
export const FIX_Y1 = ALLOC(MAX_BODIES);
export const FIX_Z1 = ALLOC(MAX_BODIES);

// fixed body velocity
export const FIX_DX = ALLOC(MAX_BODIES);
export const FIX_DY = ALLOC(MAX_BODIES);
export const FIX_DZ = ALLOC(MAX_BODIES);

// fixed body 角速度
export const FIX_AX = ALLOC(MAX_BODIES);
export const FIX_AY = ALLOC(MAX_BODIES);
export const FIX_AZ = ALLOC(MAX_BODIES);

// bounding boxes for fixed bodies
export const FIX_RX = ALLOC(MAX_BODIES);
export const FIX_RY = ALLOC(MAX_BODIES);
export const FIX_RZ = ALLOC(MAX_BODIES);

// half sizes for fixed bodies
export const FIX_HSX = ALLOC(MAX_BODIES);
export const FIX_HSY = ALLOC(MAX_BODIES);
export const FIX_HSZ = ALLOC(MAX_BODIES);

// fixed quat
export const FIX_QX = ALLOC(MAX_BODIES);
export const FIX_QY = ALLOC(MAX_BODIES);
export const FIX_QZ = ALLOC(MAX_BODIES);
export const FIX_QW = ALLOC(MAX_BODIES);

export const FIX_CR = ALLOC(MAX_BODIES);
export const FIX_MU = ALLOC(MAX_BODIES);

// fixed group
/**
 * 开了物理引擎但是不会被撞动的物体group
 */
export const FIX_GROUP = new Int32Array(MAX_BODIES);

/**
 * 开了物理引擎但是不会被撞动的box，但会撞别人
 */
export const FIXED_BOXES: BodyCollisionBox[] = [];

// contact record stuff
function ALLOC_CONTACT_REF() {
  const result: (ContactRecord | null)[] = new Array(MAX_BODIES);
  for (let i = 0; i < MAX_BODIES; ++i) {
    result[i] = null;
  }
  return result;
}

export const ACTIVE_CONTACTS: (ContactRecord | null)[] = ALLOC_CONTACT_REF();
export const FIXED_CONTACTS: (ContactRecord | null)[] = ALLOC_CONTACT_REF();

// flags
const STATIC_FLAGS = RigidBodyFlags.FIXED | RigidBodyFlags.ANIMATED;
const ANIMATED_FLAG = RigidBodyFlags.ANIMATED;
const FIXED_FLAG = RigidBodyFlags.FIXED;
const COLLIDES_FLAG = RigidBodyFlags.COLLIDES;
const REMOTE_FLAG = RigidBodyFlags.REMOTE;
const GRAVITY_FLAG = RigidBodyFlags.GRAVITY;

// temporary collision box pool
export const BOX_POOL: BodyCollisionBox[] = [];
let BOX_POOL_PTR = 0;
{
  for (let i = 0; i < MAX_BODIES; ++i) {
    BOX_POOL.push(new BodyCollisionBox());
  }
}

// hit result from terrain query
export const TERRAIN_HITS: VoxelCollisionBox[] = [
  VoxelCollisionBoxSchema.identity,
];

export function updateGlobalVariables(
  physics: PhysicsParams,
  dt: number,
  blockIndex: BlockIndex,
) {
  // update global variables

  // 先算全局参数：重力，速度阻尼，地形数据
  DT = Math.max(dt, 1e-4);
  INV_DT = 1 / DT;
  GRAVITY = +physics.gravity || 0;
  if (physics.velocityDamping > 1e-6) {
    VELOCITY_DAMPING = physics.velocityDamping;
    VELOCITY_SCALE = Math.exp(-VELOCITY_DAMPING * DT);
    ACCEL_FACTOR = (1 - VELOCITY_SCALE) / VELOCITY_DAMPING;
  } else {
    VELOCITY_DAMPING = 0;
    VELOCITY_SCALE = 1;
    ACCEL_FACTOR = DT;
  }
  BLOCK_MASS = blockIndex.mass;
  BLOCK_RESTITUTION = blockIndex.restitution;
  BLOCK_FRICTION = blockIndex.friction;
  BLOCK_VELOCITY = blockIndex.velocity;
}

// unpack and prepare all bodies for solver
export function prepareBodies(
  bodies: RigidBody[],
  geom: VoxelCollision,
  zones: PhysicsZoneIndex,
) {
  // clear buffers
  FLUID_CONTACTS.length =
    ACTIVE_BODIES.length =
    ACTIVE_BOXES.length =
    FIXED_BODIES.length =
    FIXED_BOXES.length =
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
function sortBodies(bodies: RigidBody[]) {
  for (let i = 0; i < bodies.length; ++i) {
    const b = bodies[i];
    const flags = b.flags;

    if (!(flags & REMOTE_FLAG) || flags & ANIMATED_FLAG) {
      if (flags & COLLIDES_FLAG) {
        if (flags & STATIC_FLAGS) {
          FIXED_BODIES.push(b);
        } else {
          ACTIVE_BODIES.push(b);
        }
      } else if (flags & ANIMATED_FLAG) {
        integrateAnimated(b);
      } else if (flags & FIXED_FLAG) {
        integrateStatic(b);
      } else {
        integrateDynamic(b);
      }
    }
  }
}

// non-colliding animated objects get velocity cleared
function integrateAnimated(body: RigidBody) {
  body.px += body.vx;
  body.py += body.vy;
  body.pz += body.vz;

  const q: [number, number, number, number] = [
    body.qx,
    body.qy,
    body.qz,
    body.qw,
  ];
  calcQuatByVelocity(q, body.ax, body.ay, body.az, 1);
  body.qx = q[0];
  body.qy = q[1];
  body.qz = q[2];
  body.qw = q[3];

  body.vx = body.vy = body.vz = 0;
  body.ax = body.ay = body.az = 0;
  body.flags &= ~ANIMATED_FLAG;
}

// static non-interacting objects just get their position updated
function integrateStatic(body: RigidBody) {
  body.px += DT * body.vx;
  body.py += DT * body.vy;
  body.pz += DT * body.vz;

  const q: [number, number, number, number] = [
    body.qx,
    body.qy,
    body.qz,
    body.qw,
  ];
  calcQuatByVelocity(q, body.ax, body.ay, body.az, DT);
  body.qx = q[0];
  body.qy = q[1];
  body.qz = q[2];
  body.qw = q[3];
}

// non-colliding objects can be directly integrated
function integrateDynamic(body: RigidBody) {
  const vx = (body.vx = VELOCITY_SCALE * body.vx);
  const vy = (body.vy = clampVelocity(
    body.flags & GRAVITY_FLAG
      ? explicitIntegrateVelocity(+body.vy, ACCEL_FACTOR * GRAVITY)
      : VELOCITY_SCALE * body.vy,
  ));
  const vz = (body.vz = VELOCITY_SCALE * body.vz);
  body.px += DT * vx;
  body.py += DT * vy;
  body.pz += DT * vz;

  body.ax = VELOCITY_SCALE * body.ax;
  body.ay = VELOCITY_SCALE * body.ay;
  body.az = VELOCITY_SCALE * body.az;

  const q: [number, number, number, number] = [
    body.qx,
    body.qy,
    body.qz,
    body.qw,
  ];
  calcQuatByVelocity(q, body.ax, body.ay, body.az, DT);
  body.qx = q[0];
  body.qy = q[1];
  body.qz = q[2];
  body.qw = q[3];
}

function clampVelocity(v: number) {
  return Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, +v || 0));
}

function explicitIntegrateVelocity(v0: number, f: number) {
  return VELOCITY_SCALE * v0 + f;
}

// compute buoyancy and update fluid contact record at the same time
function computeBuoyancy(
  id: number,
  invMass: number,
  px: number,
  py: number,
  pz: number,
  rx: number,
  ry: number,
  rz: number,
  geom: VoxelCollision,
) {
  // query contact structure
  const lox = px - rx;
  const loy = py - ry;
  const loz = pz - rz;
  const hix = px + rx;
  const hiy = py + ry;
  const hiz = pz + rz;
  TERRAIN_HITS.length = 0;
  collideFluid(TERRAIN_HITS, geom, lox, loy, loz, hix, hiy, hiz);
  if (TERRAIN_HITS.length === 0) {
    return GRAVITY;
  }
  let fluidMass = 0;
  const volumeScale = 1 / (8 * rx * ry * rz);
  for (let j = 0; j < TERRAIN_HITS.length; ++j) {
    const hit = TERRAIN_HITS[j];
    const block = hit.block;
    const density = BLOCK_MASS[block & 0x0fff];
    const volume =
      Math.max(0, Math.min(hit.maxX, hix) - Math.max(hit.minX, lox)) *
      Math.max(0, Math.min(hit.maxY, hiy) - Math.max(hit.minY, loy)) *
      Math.max(0, Math.min(hit.maxZ, hiz) - Math.max(hit.minZ, loz));
    fluidMass += density * volume;

    // append fluid contact
    FLUID_CONTACTS.push(id, block, volumeScale * volume);
  }
  return (1 - fluidMass * invMass) * GRAVITY;
}

// unpack and preintegrate active object
function prepareActiveBodies(geom: VoxelCollision, zone: PhysicsZoneIndex) {
  for (let i = 0; i < ACTIVE_BODIES.length; ++i) {
    const body = ACTIVE_BODIES[i];
    const flags = body.flags;
    const m = (MASS[i] = body.mass);
    const mv = (INV_MASS[i] = 1 / m);
    MU[i] = body.friction;
    CR[i] = body.restitution;

    const group = (ACTIVE_GROUP[i] = body.group);

    const x0 = (X0[i] = body.px);
    const y0 = (Y0[i] = body.py);
    const z0 = (Z0[i] = body.pz);

    const rx = (RX[i] = body.rx);
    const ry = (RY[i] = body.ry);
    const rz = (RZ[i] = body.rz);

    HSX[i] = body.hsx;
    HSY[i] = body.hsy;
    HSZ[i] = body.hsz;

    QX[i] = body.qx;
    QY[i] = body.qy;
    QZ[i] = body.qz;
    QW[i] = body.qw;

    // accumulate body forces
    zone.accumulateForce(
      x0 - rx,
      y0 - ry,
      z0 - rz,
      x0 + rx,
      y0 + ry,
      z0 + rz,
      group,
      mv,
    );
    const fx = zone.fx;
    let fy = zone.fy;
    const fz = zone.fz;
    if (flags & GRAVITY_FLAG) {
      fy += computeBuoyancy(body.id, mv, x0, y0, z0, rx, ry, rz, geom);
    }

    const vx = (DX[i] = clampVelocity(
      VELOCITY_SCALE * body.vx + ACCEL_FACTOR * fx,
    ));
    const vy = (DY[i] = clampVelocity(
      VELOCITY_SCALE * body.vy + ACCEL_FACTOR * fy,
    ));
    const vz = (DZ[i] = clampVelocity(
      VELOCITY_SCALE * body.vz + ACCEL_FACTOR * fz,
    ));

    AX[i] = clampVelocityAndSleep(VELOCITY_SCALE * body.ax);
    AY[i] = clampVelocityAndSleep(VELOCITY_SCALE * body.ay);
    AZ[i] = clampVelocityAndSleep(VELOCITY_SCALE * body.az);

    const x1 = (X1[i] = x0 + vx * DT);
    const y1 = (Y1[i] = y0 + vy * DT);
    const z1 = (Z1[i] = z0 + vz * DT);

    // 计算碰撞盒的地方。碰撞初筛
    // 取运动过程当中包括残影最大的AABB盒子
    const box = BOX_POOL[BOX_POOL_PTR++];
    box.minX = Math.min(x0, x1) - rx;
    box.minY = Math.min(y0, y1) - ry;
    box.minZ = Math.min(z0, z1) - rz;
    box.maxX = Math.max(x0, x1) + rx;
    box.maxY = Math.max(y0, y1) + ry;
    box.maxZ = Math.max(z0, z1) + rz;
    box.id = i;
    ACTIVE_BOXES.push(box);
  }
}

// unpack and preintegrate a fixed object
function prepareFixedBodies() {
  for (let i = 0; i < FIXED_BODIES.length; ++i) {
    const body = FIXED_BODIES[i];

    FIX_GROUP[i] = body.group;

    FIX_MU[i] = body.friction;
    FIX_CR[i] = body.restitution;

    const vx = body.vx;
    const vy = body.vy;
    const vz = body.vz;

    const ax = body.ax;
    const ay = body.ay;
    const az = body.az;

    const x0 = (FIX_X0[i] = body.px);
    const y0 = (FIX_Y0[i] = body.py);
    const z0 = (FIX_Z0[i] = body.pz);

    const rx = (FIX_RX[i] = body.rx);
    const ry = (FIX_RY[i] = body.ry);
    const rz = (FIX_RZ[i] = body.rz);

    FIX_HSX[i] = body.hsx;
    FIX_HSY[i] = body.hsy;
    FIX_HSZ[i] = body.hsz;

    FIX_QX[i] = body.qx;
    FIX_QY[i] = body.qy;
    FIX_QZ[i] = body.qz;
    FIX_QW[i] = body.qw;

    let x1: number;
    let y1: number;
    let z1: number;
    const q: [number, number, number, number] = [
      FIX_QX[i],
      FIX_QY[i],
      FIX_QZ[i],
      FIX_QW[i],
    ];
    if (body.flags & ANIMATED_FLAG) {
      x1 = x0 + vx;
      y1 = y0 + vy;
      z1 = z0 + vz;
      calcQuatByVelocity(q, ax, ay, az, 1);

      FIX_DX[i] = INV_DT * vx;
      FIX_DY[i] = INV_DT * vy;
      FIX_DZ[i] = INV_DT * vz;

      FIX_AX[i] = INV_DT * ax;
      FIX_AY[i] = INV_DT * ay;
      FIX_AZ[i] = INV_DT * az;

      // clear animated flag and velocity
      body.flags &= ~ANIMATED_FLAG;
      body.vx = body.vy = body.vz = 0;
      body.ax = body.ay = body.az = 0;
    } else {
      x1 = x0 + DT * vx;
      y1 = y0 + DT * vy;
      z1 = z0 + DT * vz;
      calcQuatByVelocity(q, ax, ay, az, DT);

      FIX_DX[i] = vx;
      FIX_DY[i] = vy;
      FIX_DZ[i] = vz;

      FIX_AX[i] = ax;
      FIX_AY[i] = ay;
      FIX_AZ[i] = az;
    }

    FIX_X1[i] = body.px = x1;
    FIX_Y1[i] = body.py = y1;
    FIX_Z1[i] = body.pz = z1;

    body.qx = q[0];
    body.qy = q[1];
    body.qz = q[2];
    body.qw = q[3];

    const box = BOX_POOL[BOX_POOL_PTR++];
    box.minX = Math.min(x0, x1) - rx;
    box.minY = Math.min(y0, y1) - ry;
    box.minZ = Math.min(z0, z1) - rz;
    box.maxX = Math.max(x0, x1) + rx;
    box.maxY = Math.max(y0, y1) + ry;
    box.maxZ = Math.max(z0, z1) + rz;
    box.id = i;
    FIXED_BOXES.push(box);
  }
}
