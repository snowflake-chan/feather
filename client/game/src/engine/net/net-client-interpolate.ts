import {
  applyPlayerInputForces,
  updatePlayerPhysics,
} from '@box/schema/player/player-move';
import { VoxelCollision } from '@box/schema/voxel/voxel-collision-schema';
import {
  RigidBodySet,
  RigidBodySetSchema,
  RigidBodySchema,
  RigidBody,
  RigidBodyFlags,
  PhysicsParams,
  ContactIndex,
  PhysicsParamsSchema,
  ContactIndexSchema,
} from '@box/schema/physics/physics-schema';
import { compareId, getById } from '@box/utils/id';
import { NetErrorList, NetErrorAccumulatorSchema } from './net-client-state';
import {
  PlayerSet,
  PlayerInputSet,
  PlayerInput,
  PlayerInputSchema,
  PlayerSetSchema,
  PlayerInputSetSchema,
} from '@box/schema/player/player-schema';
import { getClientNetState } from './net-client-tick';
import { GameClientState } from '../game-client-schema';
import {
  solvePhysics,
  MAX_BODIES,
  rebuildBodyTree,
  extractContactIndex,
  clearBodyLocks,
  propagateLocks,
} from '@box/schema/physics/physics-solve';
import { BlockIndex } from '@box/schema/voxel/block-schema';
import {
  CollisionFilter,
  CollisionFilterSchema,
} from '@box/schema/physics/collision-filter';
import {
  PhysicsZone,
  PhysicsZoneSetSchema,
  ZoneSelectorGroup,
  ZoneSelectorGroupSetSchema,
} from '@box/schema/zone/zone-schema';
import { PhysicsZoneIndex } from '@box/schema/physics/zone-index';
import { tickClientPhysicsKeyframes } from '../keyframes/keyframe-client';

const ERROR_DECAY = 0.125;
const ERROR_FINAL_SCALE = 0.05;
const ERROR_CLIENT_SCALE = 1;

class RigidBodyTarget {
  public id = 0;
  public flags = 0;

  public mass = 0.1;
  public friction = 0.1;
  public restitution = 0.1;

  public group = 0;

  public rx = 0.1;
  public ry = 0.1;
  public rz = 0.1;

  // half size
  public hsx = 1;
  public hsy = 1;
  public hsz = 1;

  public px1 = 0.1;
  public py1 = 0.1;
  public pz1 = 0.1;

  public vx1 = 0.1;
  public vy1 = 0.1;
  public vz1 = 0.1;

  // quaternion
  public qx1 = 0;
  public qy1 = 0;
  public qz1 = 0;
  public qw1 = 1;

  public ax1 = 0.1;
  public ay1 = 0.1;
  public az1 = 0.1;
}

const TARGETS: RigidBodyTarget[] = [];
{
  for (let i = 0; i < MAX_BODIES; ++i) {
    TARGETS.push(new RigidBodyTarget());
  }
}

function computeNetTargets(s0: RigidBodySet, s1: RigidBodySet, tf: number) {
  let targetPtr = 0;
  let p0 = 0;
  let p1 = 0;
  while (p0 < s0.length && p1 < s1.length) {
    const b0 = s0[p0];
    const b1 = s1[p1];
    if (b0.id < b1.id) {
      p0++;
    } else if (b1.id < b0.id) {
      p1++;
    } else {
      const t = TARGETS[targetPtr++];
      t.id = b0.id;
      t.flags = b0.flags;
      t.mass = b0.mass;
      t.friction = b0.friction;
      t.restitution = b0.restitution;
      t.group = b0.group;
      t.rx = b0.rx;
      t.ry = b0.ry;
      t.rz = b0.rz;
      t.hsx = b0.hsx;
      t.hsy = b0.hsy;
      t.hsz = b0.hsz;

      const { px, py, pz, vx, vy, vz, qx, qy, qz, qw, ax, ay, az } = b0;

      const dpx = b1.px - px;
      const dpy = b1.py - py;
      const dpz = b1.pz - pz;

      const dvx = b1.vx - vx;
      const dvy = b1.vy - vy;
      const dvz = b1.vz - vz;

      t.px1 = px + tf * dpx;
      t.py1 = py + tf * dpy;
      t.pz1 = pz + tf * dpz;

      t.vx1 = vx + tf * dvx;
      t.vy1 = vy + tf * dvy;
      t.vz1 = vz + tf * dvz;

      const dqx = b1.qx - qx;
      const dqy = b1.qy - qy;
      const dqz = b1.qz - qz;
      const dqw = b1.qw - qw;

      const dax = b1.ax - ax;
      const day = b1.ay - ay;
      const daz = b1.az - az;

      t.qx1 = qx + tf * dqx;
      t.qy1 = qy + tf * dqy;
      t.qz1 = qz + tf * dqz;
      t.qw1 = qw + tf * dqw;

      t.ax1 = ax + tf * dax;
      t.ay1 = ay + tf * day;
      t.az1 = az + tf * daz;

      p0++;
      p1++;
    }
  }

  return targetPtr;
}

function preTarget(target: RigidBodyTarget) {
  const result = RigidBodySchema.alloc();
  result.id = target.id;
  result.flags =
    (target.flags & ~RigidBodyFlags.LOCKED) | RigidBodyFlags.REMOTE;
  result.mass = target.mass;
  result.friction = target.friction;
  result.restitution = target.restitution;
  result.group = target.group;
  result.rx = target.rx;
  result.ry = target.ry;
  result.rz = target.rz;
  result.hsx = target.hsx;
  result.hsy = target.hsy;
  result.hsz = target.hsz;
  result.px = target.px1;
  result.py = target.py1;
  result.pz = target.pz1;
  result.vx = 0;
  result.vy = 0;
  result.vz = 0;
  result.qx = target.qx1;
  result.qy = target.qy1;
  result.qz = target.qz1;
  result.qw = target.qw1;
  result.ax = 0;
  result.ay = 0;
  result.az = 0;
  return result;
}

function hypot3(a: number, b: number, c: number) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2));
}

function applyServerPositionCorrection(
  initial: RigidBodySet,
  targetCount: number,
  predicted: RigidBodySet,
  error: NetErrorList,
  dt: number,
  errorWeight: number,
) {
  // first pass: apply initial corrections, update and delete bad entities
  const LN = initial.length;
  let lhead = 0;
  let lptr = 0;
  let tptr = 0;

  while (lptr < LN && tptr < targetCount) {
    const err = error[lptr];
    /**
     * 当前客户端数据
     */
    const l0 = initial[lptr];
    /**
     * 预测的下一帧客户端数据
     */
    const l1 = predicted[lptr];
    /**
     * 根据预测的server下一帧数据做的当前客户端的插值计算
     */
    const target = TARGETS[tptr];
    if (l0.id < target.id) {
      RigidBodySchema.free(l0);
      NetErrorAccumulatorSchema.free(err);
      lptr++;
    } else if (target.id < l0.id) {
      initial.push(preTarget(target));
      const e = NetErrorAccumulatorSchema.alloc();
      e.id = target.id;
      e.error = 0;
      error.push(e);
      tptr++;
    } else {
      // check if body is player controlled
      const clientLock = !!(l0.flags & RigidBodyFlags.LOCKED);
      const serverLock = !!(target.flags & RigidBodyFlags.LOCKED);

      // copy constant state to client
      l0.flags =
        (target.flags & ~RigidBodyFlags.LOCKED) |
        (l0.flags &
          (RigidBodyFlags.LOCKED |
            RigidBodyFlags.REMOTE |
            RigidBodyFlags.ANIMATED));
      // 完全由server控制的数据以server的插值结果为准矫正
      l0.mass = target.mass;
      l0.friction = target.friction;
      l0.restitution = target.restitution;
      l0.group = target.group;
      l0.rx = target.rx;
      l0.ry = target.ry;
      l0.rz = target.rz;
      l0.hsx = target.hsx;
      l0.hsy = target.hsy;
      l0.hsz = target.hsz;

      // 动画状态以客户端数据为准矫正
      if (l0.flags & RigidBodyFlags.ANIMATED) {
        err.error = 0;
        target.vx1 = target.vy1 = target.vz1 = 0;
        target.px1 = l1.px;
        target.py1 = l1.py;
        target.pz1 = l1.pz;
        target.ax1 = target.ay1 = target.az1 = 0;
        target.qx1 = l1.qx;
        target.qy1 = l1.qy;
        target.qz1 = l1.qz;
        target.qw1 = l1.qw;
      } else {
        // update position error and quat error
        err.error =
          Math.exp(
            -dt * errorWeight * (clientLock ? ERROR_CLIENT_SCALE : ERROR_DECAY),
          ) *
            err.error +
          dt *
            (ERROR_FINAL_SCALE *
              hypot3(
                l1.px - target.px1,
                l1.py - target.py1,
                l1.pz - target.pz1,
              )) +
          dt *
            ERROR_FINAL_SCALE *
            Math.hypot(
              l1.qx - target.qx1,
              l1.qy - target.qy1,
              l1.qz - target.qz1,
              l1.qw - target.qw1,
            );
        if (serverLock || err.error > 1) {
          // server position override.  teleport object, follow fixed trajectory
          l0.flags |= RigidBodyFlags.REMOTE;
          l0.px = target.px1;
          l0.py = target.py1;
          l0.pz = target.pz1;
          l0.vx = l0.vy = l0.vz = 0;
          l0.qx = target.qx1;
          l0.qy = target.qy1;
          l0.qz = target.qz1;
          l0.qw = target.qw1;
          l0.ax = l0.ay = l0.az = 0;
          l0.friction = 0;
          l0.restitution = 1;
          err.error = 0;
        } else if (!clientLock || serverLock) {
          // soft client correction, use penalty force
          l0.vx += target.px1 - l1.px;
          l0.vy += target.py1 - l1.py;
          l0.vz += target.pz1 - l1.pz;

          l0.qx = target.qx1;
          l0.qy = target.qy1;
          l0.qz = target.qz1;
          l0.qw = target.qw1;
        }
      }

      // increment pointers
      error[lhead] = err;
      initial[lhead++] = l0;
      lptr++;
      tptr++;
    }
  }

  // release any spare objects
  while (lptr < LN) {
    RigidBodySchema.free(initial[lptr]);
    NetErrorAccumulatorSchema.free(error[lptr]);
    lptr++;
  }

  // if no new bodies created, just truncate list
  if (initial.length <= LN) {
    initial.length = lhead;
    error.length = lhead;
  } else {
    // otherwise we need to push new objects into tail and continue
    while (lptr < initial.length) {
      error[lhead] = error[lptr];
      initial[lhead] = initial[lptr];
      lhead++;
      lptr++;
    }
    initial.length = lhead;
    error.length = lhead;
    initial.sort(compareId);
    error.sort(compareId);
  }

  // copy all new objects
  // safe to do this after previous step since all new objects are guaranteed sorted
  while (tptr < targetCount) {
    const err = NetErrorAccumulatorSchema.alloc();
    const target = TARGETS[tptr++];
    err.id = target.id;
    err.error = 0;
    error.push(err);
    initial.push(preTarget(target));
  }
}

function applyVelocityCorrection(local: RigidBodySet) {
  for (let i = 0; i < local.length; ++i) {
    const l = local[i];
    const t = TARGETS[i];

    // check if body is player controlled
    const clientLock = !!(l.flags & RigidBodyFlags.LOCKED);
    const serverLock = !!(t.flags & RigidBodyFlags.LOCKED);

    // clear correction flags
    if (serverLock || l.flags & RigidBodyFlags.REMOTE) {
      l.px = t.px1;
      l.py = t.py1;
      l.pz = t.pz1;

      l.vx = t.vx1;
      l.vy = t.vy1;
      l.vz = t.vz1;

      l.qx = t.qx1;
      l.qy = t.qy1;
      l.qz = t.qz1;
      l.qw = t.qw1;

      l.ax = t.ax1;
      l.ay = t.ay1;
      l.az = t.az1;
      l.flags &= ~RigidBodyFlags.REMOTE;
    } else if (!clientLock || serverLock) {
      l.vx = t.vx1;
      l.vy = t.vy1;
      l.vz = t.vz1;

      l.ax = t.ax1;
      l.ay = t.ay1;
      l.az = t.az1;
    }
  }
}

// This function is called every tick on the client
// It computes a predicted network state and the current network state, then applies the changes from the predicted state
// into the current state
export function interpolateClientNetState(
  localId: number,
  physics: PhysicsParams,
  filter: CollisionFilter,
  zoneSelectors: ZoneSelectorGroup[],
  zones: PhysicsZone[],
  bodies: RigidBodySet,
  error: NetErrorList,
  players: PlayerSet,
  playerInputs: PlayerInputSet,
  contact: ContactIndex,
  blockIndex: BlockIndex,
  collision: VoxelCollision,
  zoneIndex: PhysicsZoneIndex,
  state: GameClientState,
  startTick: number,
  endTick: number,
) {
  const dt = endTick - startTick;
  if (dt < 1e-8) {
    return;
  }

  const ti0 = Math.floor(endTick);
  const ti1 = ti0 + 1;

  // Compute initial boundary state by interpolation
  const s0 = getClientNetState(state, ti0);
  let targetCount = 0;
  if (s0) {
    const s1 = getClientNetState(state, ti1);
    if (s1) {
      targetCount = computeNetTargets(s0.bodies, s1.bodies, endTick - ti0);
    }
  }

  // save local player input
  let prevInput: PlayerInput | null = null;
  const localInput = getById(playerInputs, localId);
  if (localInput) {
    prevInput = PlayerInputSchema.clone(localInput);
    prevInput.id = localId;
  }

  // save local physics state
  const localPlayer = getById(players, localId);
  let prevPhysGround = false;
  let prevPhysFluid = 0;
  if (localPlayer) {
    prevPhysFluid = localPlayer.physFluid;
    prevPhysGround = localPlayer.physGround;
  }

  // Set contant information using boundary conditions
  if (s0) {
    PhysicsParamsSchema.assign(physics, s0.physics);
    PlayerSetSchema.assign(players, s0.players);
    PlayerInputSetSchema.assign(playerInputs, s0.playerInputs);
    CollisionFilterSchema.assign(filter, s0.collisionFilter);
    ZoneSelectorGroupSetSchema.assign(zoneSelectors, s0.zoneSelectors);
    PhysicsZoneSetSchema.assign(zones, s0.zones);
    zoneIndex.rebuild(zones, zoneSelectors);
  }

  // restore local input
  if (prevInput) {
    const nextInput = getById(playerInputs, localId);
    if (nextInput) {
      PlayerInputSchema.assign(nextInput, prevInput);
    }
    PlayerInputSchema.free(prevInput);
  }

  // restore local physics state
  const player = getById(players, localId);
  if (localPlayer && player) {
    player.physFluid = prevPhysFluid;
    player.physGround = prevPhysGround;
  }

  // initialize lock set for local body
  clearBodyLocks(bodies);
  if (!state.net.netSkip) {
    const localBody = getById(bodies, localId);
    if (localBody) {
      localBody.flags |= RigidBodyFlags.LOCKED;
    }
  }

  // tick client physics animations
  tickClientPhysicsKeyframes(
    state,
    endTick,
    Math.max(dt, endTick - state.net.mostRecentTick),
  );

  // compute player forces and contact events
  applyPlayerInputForces(
    bodies,
    players,
    playerInputs,
    dt,
    physics.velocityDamping,
    physics.gravity,
  );

  // apply pre-solve correction forces from interpolated states
  if (targetCount) {
    const predicted = RigidBodySetSchema.clone(bodies);
    solvePhysics(
      physics,
      predicted,
      dt,
      blockIndex,
      collision,
      filter,
      zoneIndex,
    );

    const auth0 = state.net.authoritative[ti0 - state.net.oldestTick];
    const auth1 = state.net.authoritative[ti1 - state.net.oldestTick];

    applyServerPositionCorrection(
      bodies,
      targetCount,
      predicted,
      error,
      dt,
      1 - ((auth1 ? 0.5 : 0) + (auth0 ? 0.25 : 0)),
    );
    RigidBodySetSchema.free(predicted);
  }

  // integrate rigid bodies, solve constraints for all client predicted bodies, update contact events
  solvePhysics(physics, bodies, dt, blockIndex, collision, filter, zoneIndex);

  // get the contact index for only the players
  extractContactIndex(physics, players, contact);

  // update player flags
  const bodyBush = rebuildBodyTree(bodies);
  updatePlayerPhysics(
    blockIndex,
    players,
    playerInputs,
    contact,
    bodies,
    collision,
    bodyBush,
  );

  // apply post-tick corrections
  if (targetCount) {
    applyVelocityCorrection(bodies);
  }

  // expand lock set based on bodies touched by local player
  propagateLocks(physics, false);
}
