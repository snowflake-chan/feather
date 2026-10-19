import {
  MuStruct,
  MuSortedArray,
  MuSchema,
  MuVarint,
  MuInt8,
  MuArray,
  MuFloat32,
  MuQuantizedFloat,
} from '@box/mudb/schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';

import { compareId } from '@box/utils/id';
import { Vec3Schema } from '../utils/math-schema';
import { PhysicsRDA } from '../project/project-rda';
import { mat3, vec3 } from 'gl-matrix';
import { QuantizedVec3Schema } from '../utils/quantized-schema';

export const PhysicsParamsSchema = PhysicsRDA.stateSchema;
export type PhysicsParams = typeof PhysicsParamsSchema.identity;

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

export const PhysicsBoundsSchema = new QuantizedVec3Schema(
  BOUNDS_SCALE,
  vec3.fromValues(1, 1, 1),
);
export const PhysicsBoundsComponentSchema = new MuQuantizedFloat(
  BOUNDS_SCALE,
  1,
);
export const PhysicsSizeComponentSchema = new MuQuantizedFloat(SIZE_SCALE, 1);
export const PhysicsPositionSchema = new QuantizedVec3Schema(POSITION_SCALE);
export const PhysicsPositionComponentSchema = new MuQuantizedFloat(
  POSITION_SCALE,
);
export const PhysicsVelocitySchema = new QuantizedVec3Schema(VELOCITY_SCALE);
export const PhysicsVelocotyComponentSchema = new MuQuantizedFloat(
  VELOCITY_SCALE,
);
export const PhysicsQuatComponentDefaultSchema = new MuQuantizedFloat(
  QUAT_SCALE,
  1,
);
export const PhysicsQuatComponentSchema = new MuQuantizedFloat(QUAT_SCALE);
export const PhysicsForceSchema = new QuantizedVec3Schema(1 / 256);

export enum RigidBodyFlags {
  // local network lock flag.  if set then the local host has authority on its body
  LOCKED = 1 << 0,

  // modifies body dynamics
  COLLIDES = 1 << 1,
  GRAVITY = 1 << 2,
  PLAYER = 1 << 3,
  FIXED = 1 << 4,

  // remote controlled body.  if set, then the remote host has authority on this body, is just following path
  REMOTE = 1 << 5,

  // animated object, set if the object's position is currently being controlled by an animation
  ANIMATED = 1 << 6,
}

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

export class RigidBody {
  public id = 0;
  public flags = RigidBodyFlags.COLLIDES | RigidBodyFlags.GRAVITY;
  public mass = 1;
  public friction = 0;
  public restitution = 0;
  public group = 0;

  // bounds
  public rx = 1;
  public ry = 1;
  public rz = 1;

  public getBounds() {
    return vec3.fromValues(this.rx, this.ry, this.rz);
  }

  public setBounds(v: vec3 | number[]) {
    this.rx = v[0];
    this.ry = v[1];
    this.rz = v[2];
  }

  public copyBounds(out: vec3 | number[]) {
    out[0] = this.rx;
    out[1] = this.ry;
    out[2] = this.rz;
  }

  // position
  public px = 0;
  public py = 0;
  public pz = 0;

  public getPosition() {
    return vec3.fromValues(this.px, this.py, this.pz);
  }

  public setPosition(v: vec3 | number[]) {
    this.px = v[0];
    this.py = v[1];
    this.pz = v[2];
  }

  public copyPosition(out: vec3 | number[]) {
    out[0] = this.px;
    out[1] = this.py;
    out[2] = this.pz;
  }

  // velocity
  public vx = 0;
  public vy = 0;
  public vz = 0;

  public getVelocity() {
    return vec3.fromValues(this.vx, this.vy, this.vz);
  }

  public setVelocity(v: vec3 | number[]) {
    this.vx = v[0];
    this.vy = v[1];
    this.vz = v[2];
  }

  public copyVelocity(out: vec3 | number[]) {
    out[0] = this.vx;
    out[1] = this.vy;
    out[2] = this.vz;
  }

  // distance helper
  public dist(other: RigidBody) {
    return Math.sqrt(
      Math.pow(this.px - other.px, 2) +
        Math.pow(this.py - other.py, 2) +
        Math.pow(this.pz - other.pz, 2),
    );
  }

  public vecDist(v: vec3) {
    return Math.sqrt(
      Math.pow(this.px - v[0], 2) +
        Math.pow(this.py - v[1], 2) +
        Math.pow(this.pz - v[2], 2),
    );
  }

  // quaternion
  public qx = 0;
  public qy = 0;
  public qz = 0;
  public qw = 1;

  public getRotation() {
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
    return mat3.fromValues(m0, m1, m2, m3, m4, m5, m6, m7, m8);
  }

  // half size
  public hsx = 1;
  public hsy = 1;
  public hsz = 1;

  // angular velocity
  public ax = 0;
  public ay = 0;
  public az = 0;
}

export const RIGID_BODY_POOL: RigidBody[] = [];

// keep legacy schema around so we can debug stuff
const LegacyRigidBodySchema = new MuStruct({
  id: new MuVarint(),
  flags: <MuSchema<RigidBodyFlags>>(
    new MuVarint(RigidBodyFlags.COLLIDES | RigidBodyFlags.GRAVITY)
  ),
  group: new MuVarint(),

  mass: new MuQuantizedFloat(MASS_SCALE, 1),
  friction: new MuQuantizedFloat(FRICTION_SCALE, 0),
  restitution: new MuQuantizedFloat(RESTITUTION_SCALE, 0),

  rx: PhysicsBoundsComponentSchema,
  ry: PhysicsBoundsComponentSchema,
  rz: PhysicsBoundsComponentSchema,

  px: PhysicsPositionComponentSchema,
  py: PhysicsPositionComponentSchema,
  pz: PhysicsPositionComponentSchema,

  vx: PhysicsVelocotyComponentSchema,
  vy: PhysicsVelocotyComponentSchema,
  vz: PhysicsVelocotyComponentSchema,

  qx: PhysicsQuatComponentSchema,
  qy: PhysicsQuatComponentSchema,
  qz: PhysicsQuatComponentSchema,
  qw: PhysicsQuatComponentDefaultSchema,

  hsx: PhysicsSizeComponentSchema,
  hsy: PhysicsSizeComponentSchema,
  hsz: PhysicsSizeComponentSchema,

  ax: PhysicsVelocotyComponentSchema,
  ay: PhysicsVelocotyComponentSchema,
  az: PhysicsVelocotyComponentSchema,
});

const SCHROEPPEL2 = 0xaaaaaaaa;
/**
 * 用于读取以-2为底数的二进制数据，方便记录负数
 * https://en.wikipedia.org/wiki/Negative_base#To_Negabinary
 * @param stream
 * @returns
 */
function readShroeppel(stream: MuReadStream) {
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
export const RigidBodySchema: MuSchema<RigidBody> & {
  pool: RigidBody[];
  stats: () => any;
} = {
  identity: new RigidBody(),
  muType: LegacyRigidBodySchema.muType,
  json: LegacyRigidBodySchema.json,
  muData: LegacyRigidBodySchema.muData,
  pool: RIGID_BODY_POOL,

  stats: function () {
    return {
      allocCount: BODY_ALLOC_COUNTER,
      freeCount: BODY_FREE_COUNTER,
      poolSize: RIGID_BODY_POOL.length,
    };
  },

  alloc: function () {
    BODY_ALLOC_COUNTER++;
    return RIGID_BODY_POOL.pop() || new RigidBody();
  },

  clone: function (b: RigidBody) {
    BODY_ALLOC_COUNTER++;
    const result = RIGID_BODY_POOL.pop() || new RigidBody();
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

  free: function (b: RigidBody) {
    BODY_FREE_COUNTER++;
    RIGID_BODY_POOL.push(b);
  },

  equal: function (a: RigidBody, b: RigidBody) {
    return (
      a.id === b.id &&
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
      a.az === b.az
    );
  },

  assign: function (dst: RigidBody, src: RigidBody) {
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

  patch: function (base: RigidBody, inp: MuReadStream) {
    BODY_ALLOC_COUNTER++;
    const result = RIGID_BODY_POOL.pop() || new RigidBody();

    // read in tracker
    const tracker = inp.readVarint();

    // update flags
    result.flags =
      base.flags ^ ((tracker >>> FLAG_TRACKER) & RIGID_BODY_FLAG_MASK);

    // patch all properties manually
    // patch时候read的顺序，必须严格按照diff时候写入的顺序
    if (tracker & (1 << ID_TRACKER)) {
      result.id = base.id + readShroeppel(inp);
    } else {
      result.id = base.id;
    }

    if (tracker & (1 << GROUP_TRACKER)) {
      result.group = base.group + readShroeppel(inp);
    } else {
      result.group = base.group;
    }

    if (tracker & (1 << MASS_TRACKER)) {
      result.mass =
        MASS_SCALE *
        (Math.round(base.mass * MASS_PRECISION) + readShroeppel(inp));
    } else {
      result.mass = base.mass;
    }

    if (tracker & (1 << FRICTION_TRACKER)) {
      result.friction =
        FRICTION_SCALE *
        (Math.round(base.friction * FRICTION_PRECISION) + readShroeppel(inp));
    } else {
      result.friction = base.friction;
    }

    if (tracker & (1 << RESTITUTION_TRACKER)) {
      result.restitution =
        RESTITUTION_SCALE *
        (Math.round(base.restitution * RESTITUTION_PRECISION) +
          readShroeppel(inp));
    } else {
      result.restitution = base.restitution;
    }

    if (tracker & (1 << BOUNDS_TRACKER)) {
      result.rx =
        BOUNDS_SCALE *
        (Math.round(base.rx * BOUNDS_PRECISION) + readShroeppel(inp));
    } else {
      result.rx = base.rx;
    }
    if (tracker & (2 << BOUNDS_TRACKER)) {
      result.ry =
        BOUNDS_SCALE *
        (Math.round(base.ry * BOUNDS_PRECISION) + readShroeppel(inp));
    } else {
      result.ry = base.ry;
    }
    if (tracker & (4 << BOUNDS_TRACKER)) {
      result.rz =
        BOUNDS_SCALE *
        (Math.round(base.rz * BOUNDS_PRECISION) + readShroeppel(inp));
    } else {
      result.rz = base.rz;
    }

    if (tracker & (1 << POSITION_TRACKER)) {
      result.px =
        POSITION_SCALE *
        (Math.round(base.px * POSITION_PRECISION) + readShroeppel(inp));
    } else {
      result.px = base.px;
    }
    if (tracker & (2 << POSITION_TRACKER)) {
      result.py =
        POSITION_SCALE *
        (Math.round(base.py * POSITION_PRECISION) + readShroeppel(inp));
    } else {
      result.py = base.py;
    }
    if (tracker & (4 << POSITION_TRACKER)) {
      result.pz =
        POSITION_SCALE *
        (Math.round(base.pz * POSITION_PRECISION) + readShroeppel(inp));
    } else {
      result.pz = base.pz;
    }

    if (tracker & (1 << VELOCITY_TRACKER)) {
      result.vx =
        VELOCITY_SCALE *
        (Math.round(base.vx * VELOCITY_PRECISION) + readShroeppel(inp));
    } else {
      result.vx = base.vx;
    }
    if (tracker & (2 << VELOCITY_TRACKER)) {
      result.vy =
        VELOCITY_SCALE *
        (Math.round(base.vy * VELOCITY_PRECISION) + readShroeppel(inp));
    } else {
      result.vy = base.vy;
    }
    if (tracker & (4 << VELOCITY_TRACKER)) {
      result.vz =
        VELOCITY_SCALE *
        (Math.round(base.vz * VELOCITY_PRECISION) + readShroeppel(inp));
    } else {
      result.vz = base.vz;
    }
    if (tracker & (1 << QUAT_TRACKER)) {
      result.qx =
        QUAT_SCALE *
        (Math.round(base.qx * QUAT_PRECISION) + readShroeppel(inp));
    } else {
      result.qx = base.qx;
    }
    if (tracker & (2 << QUAT_TRACKER)) {
      result.qy =
        QUAT_SCALE *
        (Math.round(base.qy * QUAT_PRECISION) + readShroeppel(inp));
    } else {
      result.qy = base.qy;
    }
    if (tracker & (4 << QUAT_TRACKER)) {
      result.qz =
        QUAT_SCALE *
        (Math.round(base.qz * QUAT_PRECISION) + readShroeppel(inp));
    } else {
      result.qz = base.qz;
    }
    if (tracker & (8 << QUAT_TRACKER)) {
      result.qw =
        QUAT_SCALE *
        (Math.round(base.qw * QUAT_PRECISION) + readShroeppel(inp));
    } else {
      result.qw = base.qw;
    }
    if (tracker & (1 << SIZE_TRACKER)) {
      result.hsx =
        SIZE_SCALE *
        (Math.round(base.hsx * SIZE_PRECISION) + readShroeppel(inp));
    } else {
      result.hsx = base.hsx;
    }
    if (tracker & (2 << SIZE_TRACKER)) {
      result.hsy =
        SIZE_SCALE *
        (Math.round(base.hsy * SIZE_PRECISION) + readShroeppel(inp));
    } else {
      result.hsy = base.hsy;
    }
    if (tracker & (4 << SIZE_TRACKER)) {
      result.hsz =
        SIZE_SCALE *
        (Math.round(base.hsz * SIZE_PRECISION) + readShroeppel(inp));
    } else {
      result.hsz = base.hsz;
    }
    if (tracker & (1 << ANGULAR_VELOCITY_TRACKER)) {
      result.ax =
        VELOCITY_SCALE *
        (Math.round(base.ax * VELOCITY_PRECISION) + readShroeppel(inp));
    } else {
      result.ax = base.ax;
    }
    if (tracker & (2 << ANGULAR_VELOCITY_TRACKER)) {
      result.ay =
        VELOCITY_SCALE *
        (Math.round(base.ay * VELOCITY_PRECISION) + readShroeppel(inp));
    } else {
      result.ay = base.ay;
    }
    if (tracker & (4 << ANGULAR_VELOCITY_TRACKER)) {
      result.az =
        VELOCITY_SCALE *
        (Math.round(base.az * VELOCITY_PRECISION) + readShroeppel(inp));
    } else {
      result.az = base.az;
    }

    return result;
  },

  diff: function (base: RigidBody, target: RigidBody, out: MuWriteStream) {
    // compute base values
    const dId = (target.id - base.id) | 0;
    const dGroup = (target.group - base.group) | 0;
    const dMass =
      (Math.round(target.mass * MASS_PRECISION) -
        Math.round(base.mass * MASS_PRECISION)) |
      0;
    const dFriction =
      (Math.round(target.friction * FRICTION_PRECISION) -
        Math.round(base.friction * FRICTION_PRECISION)) |
      0;
    const dRestitution =
      (Math.round(target.restitution * RESTITUTION_PRECISION) -
        Math.round(base.restitution * RESTITUTION_PRECISION)) |
      0;
    const dRx =
      (Math.round(target.rx * BOUNDS_PRECISION) -
        Math.round(base.rx * BOUNDS_PRECISION)) |
      0;
    const dRy =
      (Math.round(target.ry * BOUNDS_PRECISION) -
        Math.round(base.ry * BOUNDS_PRECISION)) |
      0;
    const dRz =
      (Math.round(target.rz * BOUNDS_PRECISION) -
        Math.round(base.rz * BOUNDS_PRECISION)) |
      0;
    const dPx =
      (Math.round(target.px * POSITION_PRECISION) -
        Math.round(base.px * POSITION_PRECISION)) |
      0;
    const dPy =
      (Math.round(target.py * POSITION_PRECISION) -
        Math.round(base.py * POSITION_PRECISION)) |
      0;
    const dPz =
      (Math.round(target.pz * POSITION_PRECISION) -
        Math.round(base.pz * POSITION_PRECISION)) |
      0;
    const dVx =
      (Math.round(target.vx * VELOCITY_PRECISION) -
        Math.round(base.vx * VELOCITY_PRECISION)) |
      0;
    const dVy =
      (Math.round(target.vy * VELOCITY_PRECISION) -
        Math.round(base.vy * VELOCITY_PRECISION)) |
      0;
    const dVz =
      (Math.round(target.vz * VELOCITY_PRECISION) -
        Math.round(base.vz * VELOCITY_PRECISION)) |
      0;
    const dQx =
      (Math.round(target.qx * QUAT_PRECISION) -
        Math.round(base.qx * QUAT_PRECISION)) |
      0;
    const dQy =
      (Math.round(target.qy * QUAT_PRECISION) -
        Math.round(base.qy * QUAT_PRECISION)) |
      0;
    const dQz =
      (Math.round(target.qz * QUAT_PRECISION) -
        Math.round(base.qz * QUAT_PRECISION)) |
      0;
    const dQw =
      (Math.round(target.qw * QUAT_PRECISION) -
        Math.round(base.qw * QUAT_PRECISION)) |
      0;
    const dHsx =
      (Math.round(target.hsx * SIZE_PRECISION) -
        Math.round(base.hsx * SIZE_PRECISION)) |
      0;
    const dHsy =
      (Math.round(target.hsy * SIZE_PRECISION) -
        Math.round(base.hsy * SIZE_PRECISION)) |
      0;
    const dHsz =
      (Math.round(target.hsz * SIZE_PRECISION) -
        Math.round(base.hsz * SIZE_PRECISION)) |
      0;
    const dAx =
      (Math.round(target.ax * VELOCITY_PRECISION) -
        Math.round(base.ax * VELOCITY_PRECISION)) |
      0;
    const dAy =
      (Math.round(target.ay * VELOCITY_PRECISION) -
        Math.round(base.ay * VELOCITY_PRECISION)) |
      0;
    const dAz =
      (Math.round(target.az * VELOCITY_PRECISION) -
        Math.round(base.az * VELOCITY_PRECISION)) |
      0;

    // flag delta
    const flagDelta = (base.flags ^ target.flags) & RIGID_BODY_FLAG_MASK;

    // compute bit mask
    const tracker =
      ((<any>!!dId) << ID_TRACKER) +
      ((<any>!!dGroup) << GROUP_TRACKER) +
      ((<any>!!dMass) << MASS_TRACKER) +
      ((<any>!!dFriction) << FRICTION_TRACKER) +
      ((<any>!!dRestitution) << RESTITUTION_TRACKER) +
      ((<any>!!dRx) << BOUNDS_TRACKER) +
      ((<any>!!dRy) << (BOUNDS_TRACKER + 1)) +
      ((<any>!!dRz) << (BOUNDS_TRACKER + 2)) +
      ((<any>!!dPx) << POSITION_TRACKER) +
      ((<any>!!dPy) << (POSITION_TRACKER + 1)) +
      ((<any>!!dPz) << (POSITION_TRACKER + 2)) +
      ((<any>!!dVx) << VELOCITY_TRACKER) +
      ((<any>!!dVy) << (VELOCITY_TRACKER + 1)) +
      ((<any>!!dVz) << (VELOCITY_TRACKER + 2)) +
      ((<any>!!dQx) << QUAT_TRACKER) +
      ((<any>!!dQy) << (QUAT_TRACKER + 1)) +
      ((<any>!!dQz) << (QUAT_TRACKER + 2)) +
      ((<any>!!dQw) << (QUAT_TRACKER + 3)) +
      ((<any>!!dHsx) << SIZE_TRACKER) +
      ((<any>!!dHsy) << (SIZE_TRACKER + 1)) +
      ((<any>!!dHsz) << (SIZE_TRACKER + 2)) +
      ((<any>!!dAx) << ANGULAR_VELOCITY_TRACKER) +
      ((<any>!!dAy) << (ANGULAR_VELOCITY_TRACKER + 1)) +
      ((<any>!!dAz) << (ANGULAR_VELOCITY_TRACKER + 2)) +
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

  toJSON: function (body: RigidBody) {
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

  fromJSON: function (_json: any) {
    const json = _json || {};
    const result = RIGID_BODY_POOL.pop() || new RigidBody();
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

export const RigidBodySetSchema = new MuSortedArray(
  RigidBodySchema,
  Infinity,
  compareId,
);
export type RigidBodySet = typeof RigidBodySetSchema.identity;

export enum CubeAxis {
  X_POS = 0,
  X_NEG = 1,
  Y_POS = 2,
  Y_NEG = 3,
  Z_POS = 4,
  Z_NEG = 5,
}

export const CUBE_AXIS = [
  vec3.fromValues(1, 0, 0),
  vec3.fromValues(-1, 0, 0),
  vec3.fromValues(0, 1, 0),
  vec3.fromValues(0, -1, 0),
  vec3.fromValues(0, 0, 1),
  vec3.fromValues(0, 0, -1),
];

export function encodeCubeAxis(axis: vec3) {
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

export const CubeAxisSchema: MuSchema<vec3> = {
  muType: 'cube-axis',
  muData: {
    type: 'cube-axis',
  },
  json: { type: 'cube-axis' },
  identity: vec3.fromValues(1, 0, 0),
  diff: function (base: vec3, target: vec3, stream: MuWriteStream) {
    const b = encodeCubeAxis(base);
    const t = encodeCubeAxis(target);
    if (b === t) {
      return false;
    }
    stream.grow(1);
    stream.writeUint8(t);
    return true;
  },
  patch: function (base: vec3, stream: MuReadStream) {
    const code = stream.readUint8();
    if (code < 0 || code >= 6) {
      vec3.set(base, 0, 0, 0);
    }
    return Vec3Schema.clone(CUBE_AXIS[code]);
  },
  alloc: () => Vec3Schema.alloc(),
  free: (x) => Vec3Schema.free(x),
  equal: (x: vec3, y: vec3) => encodeCubeAxis(x) === encodeCubeAxis(y),
  clone: (x) => Vec3Schema.clone(x),
  assign: (x, y) => vec3.copy(x, y),
  toJSON: (x) => encodeCubeAxis(x),
  fromJSON: (y) => {
    if (typeof y === 'number' && y >= 0 && y <= 5) {
      return Vec3Schema.clone(CUBE_AXIS[y | 0]);
    }
    return Vec3Schema.clone(CUBE_AXIS[0]);
  },
};

export const BodyContactSchema = new MuStruct({
  // 碰撞ID
  otherId: new MuVarint(),
  /**
   * 碰撞分离轴x轴方向
   */
  nx: new MuFloat32(),
  /**
   * 碰撞分离轴y轴方向
   */
  ny: new MuFloat32(),
  /**
   * 碰撞分离轴z轴方向
   */
  nz: new MuFloat32(),
  /**
   * x方向碰撞力的大小
   */
  fx: new MuFloat32(),
  /**
   * y方向碰撞力的大小
   */
  fy: new MuFloat32(),
  /**
   * z方向碰撞力的大小
   */
  fz: new MuFloat32(),
});

export type BodyContact = typeof BodyContactSchema.identity;

export function compareBodyContact(a: BodyContact, b: BodyContact) {
  return a.otherId - b.otherId;
}

export const BodyContactSetSchema = new MuSortedArray(
  BodyContactSchema,
  Infinity,
  compareBodyContact,
);

export const VoxelContactSchema = new MuStruct({
  /**
   * 地形坐标x
   */
  x: new MuVarint(0),
  /**
   * 地形坐标y
   */
  y: new MuVarint(0),
  /**
   * 地形坐标z
   */
  z: new MuVarint(0),
  /**
   * block: 地形ID
   * 在体素中代表的是色板中的颜色索引值，在地形中就指地形材质
   */
  b: new MuVarint(0),
  /**
   * 碰撞分离轴
   * 1: x正方向
   * -1: x反方向
   * 2: y正方向
   * -2: y反方向
   * 3: z正方向
   * -3: z反方向
   */
  axis: new MuInt8(),
  fx: new MuFloat32(),
  fy: new MuFloat32(),
  fz: new MuFloat32(),
});

export type VoxelContact = typeof VoxelContactSchema.identity;

export function compareVoxelContact(a: VoxelContact, b: VoxelContact) {
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

export const VoxelContactSetSchema = new MuSortedArray(
  VoxelContactSchema,
  Infinity,
  compareVoxelContact,
);

export const FluidContactSchema = new MuStruct({
  b: new MuVarint(),
  volumeFraction: new MuQuantizedFloat(1 / 256, 0),
});

export type FluidContact = typeof FluidContactSchema.identity;

export function compareFluidContact(a: FluidContact, b: FluidContact) {
  return a.b - b.b;
}

export const FluidContactSetSchema = new MuSortedArray(
  FluidContactSchema,
  Infinity,
  compareFluidContact,
);

// ignoring stuff for event reporting (for now...)
//
// need to figure out:
//  1.  how is each field used?
//  2.  what information do we need?
//  3.  does it make sense to split contact reporting into 2 phases:
//      a. one for normal event generation
//      b. one for tick/update phase
//  4.  how to map the result back to the old contact index?
export const ContactRecordSchema = new MuStruct({
  id: new MuVarint(),

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
  body: BodyContactSetSchema,

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
  voxel: VoxelContactSetSchema,

  // already not bad, but could be better
  // should just store a single flat array and could insert new fluids by insertion sort and linear scan
  //  used in the following places:
  //      a. debug and test
  //      b. scripts
  //      c. events
  //      d. player movement controller
  fluidVoxels: new MuArray(new MuVarint(), Infinity),
  fluidVolumeFraction: new MuArray(new MuFloat32(), Infinity),
});

// on the client for net tick fast forwarding we can probably simplify all this stuff since we don't need to recompute the whole contact index
// really can split contacts into three categories:
//
//      1. no contacts (used for predictive timesteps)
//      2. small reports (only generate events for players and body lock index)
//          small reports can be used in netTicks on the client
//      3. full reports (generate all events for scripts)
//
export type ContactRecord = typeof ContactRecordSchema.identity;

export const ContactIndexSchema = new MuSortedArray(
  ContactRecordSchema,
  Infinity,
  compareId,
);

export type ContactIndex = typeof ContactIndexSchema.identity;
