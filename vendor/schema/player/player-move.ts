import { vec3 } from 'gl-matrix';
import {
  RigidBody,
  ContactIndex,
  RigidBodySet,
  RigidBodyFlags,
} from '../physics/physics-schema';
import {
  PlayerSet,
  Player,
  playerFlyState,
  playerWalkState,
  playerJumpState,
  playerButtonState,
  PlayerFlyState,
  PlayerJumpState,
  PlayerButtonState,
  PlayerWalkState,
  playerStateBits,
  PlayerInput,
  PlayerInputSet,
  PlayerFlags,
  PlayerOccupancyFlags,
} from './player-schema';
import { zipId, getById, indexEqRange } from '@box/utils/id';
import { VoxelCollision } from '../voxel/voxel-collision-schema';
import { BodyRBushNode, testBodyRBush } from '../physics/body-rbush';
import { testCollideSolid } from '../voxel/voxel-collision';
import { BlockIndex } from '../voxel/block-schema';

export const PLAYER_WIDTH = 0.45;
export const PLAYER_HEIGHT = 1.1;
export const PLAYER_MASS = 1.75;
export const PLAYER_FRICTION = 0.1;
export const PLAYER_RESTITUTION = 0;

export const PLAYER_FLIGHT_TAP_TIME = 200;
export const PLAYER_RUN_TAP_TIME = 200;

const forwardAxis = vec3.create();
const rightAxis = vec3.create();
const upAxis = vec3.fromValues(0, 1, 0);

const ACCEL = vec3.create();

let INV_DAMPING = 1;
let GRAVITY_BOOST = 0;
let GRAVITY_FLOAT = 0;
let ACCEL_SCALE = 0.1;

// apply force to body
function applyForce(
  body: RigidBody,
  axis: vec3,
  maxSpeed: number,
  accel: number,
) {
  const { vx, vy, vz } = body;
  const ax = axis[0];
  const ay = axis[1];
  const az = axis[2];
  const v = ax * vx + ay * vy + az * vz;
  if (accel < 0) {
    vec3.scaleAndAdd(ACCEL, ACCEL, axis, accel + Math.max(0, -maxSpeed - v));
  } else {
    vec3.scaleAndAdd(ACCEL, ACCEL, axis, accel + Math.min(0, maxSpeed - v));
  }
}

// clears all forces along axis, using accel as an acceleration weight
function clearForce(body: RigidBody, axis: vec3, accel: number) {
  const { vx, vy, vz } = body;
  const ax = axis[0];
  const ay = axis[1];
  const az = axis[2];
  const v = ax * vx + ay * vy + az * vz;
  vec3.scaleAndAdd(ACCEL, ACCEL, axis, -accel * v);
}

function applyJump(velocity: vec3, power: number) {
  // is this really the right way to do this?  seems like it can cancel out potentially huge negative forces....
  velocity[1] = power;
}

export function calcPlayerLookDirection(v: vec3, angle: number) {
  const pitch = (2 * Math.PI * angle) / 256;
  v[0] = -Math.cos(pitch);
  v[1] = 0;
  v[2] = -Math.sin(pitch);
}

/**
 * 根据用户输入和api数据矫正，计算用户物理状态
 * 包括朝向，速度，物理模型状态
 * @param input
 * @param player
 * @param body
 * @returns
 */
function applyPlayerInputForce(
  input: PlayerInput,
  player: Player,
  body: RigidBody,
) {
  const { state, angle } = input;

  let flyState = playerFlyState(state);
  const walkState = playerWalkState(state);
  let jumpState = playerJumpState(state);
  let buttonState = playerButtonState(state);

  // early out if animated
  // 动画不做力的计算
  if (body.flags & RigidBodyFlags.ANIMATED) {
    input.state = playerStateBits(
      PlayerFlyState.FLYING,
      PlayerWalkState.WALK,
      PlayerJumpState.FALL,
      buttonState & ~PlayerButtonState.CROUCH,
    );
    return;
  }

  // clear force accumulator
  vec3.set(ACCEL, 0, 0, 0);

  // apply frame correction for moving platforms
  const { platformX, platformY, platformZ } = player;
  body.vx -= platformX;
  body.vy -= platformY;
  body.vz -= platformZ;

  // allow flight overrides player flight control
  if (!(player.flags & PlayerFlags.ALLOW_FLIGHT)) {
    flyState = PlayerFlyState.NOT_FLYING;
  }

  // compute local frame
  calcPlayerLookDirection(forwardAxis, angle);

  // apply constraints based on movement
  // 根据攀爬撞墙方向重新调整人物朝向
  if (
    player.physGround &&
    jumpState === PlayerJumpState.GROUND &&
    buttonState & PlayerButtonState.CROUCH &&
    buttonState & PlayerButtonState.WALK
  ) {
    if (
      (forwardAxis[0] < 0 &&
        player.occupancy & PlayerOccupancyFlags.EDGE_X_NEG) ||
      (forwardAxis[0] > 0 && player.occupancy & PlayerOccupancyFlags.EDGE_X_POS)
    ) {
      forwardAxis[0] = 0;
    }
    if (
      (forwardAxis[2] < 0 &&
        player.occupancy & PlayerOccupancyFlags.EDGE_Z_NEG) ||
      (forwardAxis[2] > 0 && player.occupancy & PlayerOccupancyFlags.EDGE_Z_POS)
    ) {
      forwardAxis[2] = 0;
    }
    if (forwardAxis[0] === 0 && forwardAxis[2] === 0) {
      forwardAxis[0] = 1;
      buttonState &= ~PlayerButtonState.WALK;
    }
    vec3.normalize(forwardAxis, forwardAxis);
  }

  rightAxis[0] = -forwardAxis[2];
  rightAxis[1] = 0;
  rightAxis[2] = forwardAxis[0];

  // update rigid body flags
  // 根据人物输入状态调整物理模型状态
  if (player.flags & PlayerFlags.SPECTATOR) {
    body.flags =
      (body.flags & ~(RigidBodyFlags.GRAVITY | RigidBodyFlags.COLLIDES)) |
      RigidBodyFlags.PLAYER;
    flyState = PlayerFlyState.FLYING;
  } else if (flyState === PlayerFlyState.FLYING) {
    body.flags =
      (body.flags & ~RigidBodyFlags.GRAVITY) |
      RigidBodyFlags.COLLIDES |
      RigidBodyFlags.PLAYER;
  } else {
    body.flags =
      body.flags |
      RigidBodyFlags.COLLIDES |
      RigidBodyFlags.PLAYER |
      RigidBodyFlags.GRAVITY;
  }

  // convert user inputs to forces
  let speed = 0;
  let accel = 0;

  // jump parameters
  const allowJump = !!(player.flags & PlayerFlags.ALLOW_JUMP);
  const allowDoubleJump =
    allowJump && !!(player.flags & PlayerFlags.ALLOW_DOUBLE_JUMP);

  // compute movement speed based on player input
  switch (walkState) {
    case PlayerWalkState.CROUCH:
      if (flyState & PlayerFlyState.FLYING) {
        speed = player.walkSpeed;
        accel = player.walkAcceleration;
      } else {
        speed = player.crouchSpeed;
        accel = player.crouchAcceleration;
      }
      break;
    case PlayerWalkState.WALK:
      speed = player.walkSpeed;
      accel = player.walkAcceleration;
      break;
    case PlayerWalkState.RUN:
      speed = player.runSpeed;
      accel = player.runAcceleration;
      break;
  }

  if (flyState === PlayerFlyState.NOT_FLYING) {
    if (player.physFluid > 1 / 16) {
      jumpState = PlayerJumpState.SWIM;
      speed = player.swimSpeed;
      accel = player.swimAcceleration;
      if (buttonState & PlayerButtonState.JUMP) {
        if (allowJump && (player.physGround || player.physFluid < 0.5)) {
          body.vy = 0.5 * player.jumpPower;
        } else {
          applyForce(body, upAxis, speed, accel);
        }
      }
      if (buttonState & PlayerButtonState.CROUCH) {
        applyForce(body, upAxis, speed, -accel);
      }
    } else if (player.physGround) {
      jumpState = PlayerJumpState.GROUND;
      if (buttonState & PlayerButtonState.JUMP) {
        if (allowJump && walkState !== PlayerWalkState.CROUCH) {
          body.vy = player.jumpPower;
        } else {
          // TODO: Jump while crouching, could do a roll or something
        }
      }
    } else {
      switch (jumpState) {
        case PlayerJumpState.FALL:
          if (allowDoubleJump && buttonState & PlayerButtonState.JUMP) {
            body.vy = player.doubleJumpPower;
            jumpState = PlayerJumpState.DOUBLE_JUMP;
          }
          break;

        case PlayerJumpState.DOUBLE_JUMP:
          // double jump burned.  just fall
          break;

        default:
          jumpState = PlayerJumpState.JUMP;
          if (!(buttonState & PlayerButtonState.JUMP)) {
            jumpState = PlayerJumpState.FALL;
          }
          break;
      }
      // scale speed based on jump factor
      speed *= player.jumpSpeedFactor;
      accel *= player.jumpAccelerationFactor;
    }
  } else {
    // not physical mode
    jumpState = PlayerJumpState.JUMP;
    speed *= player.flySpeed;
    accel *= player.flyAcceleration;
    if (buttonState & PlayerButtonState.JUMP) {
      applyForce(body, upAxis, speed, accel);
    } else if (buttonState & PlayerButtonState.CROUCH) {
      applyForce(body, upAxis, speed, -accel);
    } else {
      clearForce(body, upAxis, accel);
    }
  }

  // 走路的时候加速，不走的时候会按照当前速度减速
  if (buttonState & PlayerButtonState.WALK) {
    applyForce(body, forwardAxis, speed, accel);
  } else {
    if (buttonState & PlayerButtonState.CROUCH) {
      clearForce(body, forwardAxis, 1);
    } else {
      clearForce(body, forwardAxis, accel);
    }
  }
  if (buttonState & PlayerButtonState.CROUCH) {
    clearForce(body, rightAxis, 1);
  } else {
    clearForce(body, rightAxis, accel);
  }

  input.state = playerStateBits(flyState, walkState, jumpState, buttonState);

  body.vx += ACCEL[0] * ACCEL_SCALE + INV_DAMPING * platformX;
  body.vy += ACCEL[1] * ACCEL_SCALE + INV_DAMPING * platformY;
  body.vz += ACCEL[2] * ACCEL_SCALE + INV_DAMPING * platformZ;
}

// apply all player input forces
export function applyPlayerInputForces(
  bodies: RigidBodySet,
  players: PlayerSet,
  inputs: PlayerInputSet,
  dt: number,
  velocityDamping: number,
  gravity: number,
) {
  if (isNaN(velocityDamping) || velocityDamping < 1e-6) {
    ACCEL_SCALE = dt;
    INV_DAMPING = 1;
  } else {
    const s = Math.exp(-dt * velocityDamping);
    ACCEL_SCALE = (1 - s) / velocityDamping;
    INV_DAMPING = 1 / s;
  }
  if (isNaN(gravity) || gravity > -1e-6) {
    GRAVITY_BOOST = 0;
    GRAVITY_FLOAT = 0;
  } else {
    GRAVITY_BOOST = 1 / dt;
    GRAVITY_FLOAT = -gravity;
  }
  zipId(applyPlayerInputForce, inputs, players, bodies);
}

function testCollide(
  voxelCollision: VoxelCollision,
  bodyCollision: BodyRBushNode,
  id: number,
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
) {
  return (
    testCollideSolid(voxelCollision, minX, minY, minZ, maxX, maxY, maxZ) ||
    testBodyRBush(bodyCollision, minX, minY, minZ, maxX, maxY, maxZ, id)
  );
}

function computeEdgeStepFlags(
  voxelCollision: VoxelCollision,
  bodyCollision: BodyRBushNode,
  id: number,
  stepHeight: number,
  sx: number,
  sy: number,
  sz: number,
  rx: number,
  rz: number,
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
) {
  if (
    !testCollide(
      voxelCollision,
      bodyCollision,
      id,
      lox + sx + rx,
      loy - 0.5,
      loz + sz + rz,
      hix - sx + rx,
      loy,
      hiz - sz + rz,
    )
  ) {
    return PlayerOccupancyFlags.EDGE_BIT;
    // } else if (
    //     !testCollide(voxelCollision, bodyCollision, id,
    //         lox + 2 * rx, loy + stepHeight, loz + 2 * rz,
    //         hix + 2 * rx, hiy + stepHeight, hiz + 2 * rz) &&
    //     testCollide(voxelCollision, bodyCollision, id,
    //         lox + sx + 2 * rx, loy + sy,         loz + sz + 2 * rz,
    //         hix - sx + 2 * rx, loy + stepHeight, hiz - sz + 2 * rz)) {
    //     return PlayerOccupancyFlags.STEP_BIT;
  }
  return 0;
}

export function updatePlayerPhysics(
  blockIndex: BlockIndex,
  players: PlayerSet,
  playerInputs: PlayerInput[],
  contacts: ContactIndex,
  bodies: RigidBodySet,
  voxelCollision: VoxelCollision,
  bodyCollision: BodyRBushNode,
) {
  let bodyPtr = 0;
  const bodyEnd = bodies.length - 1;
  for (let i = 0; i < players.length; ++i) {
    const player = players[i];
    player.platformX = player.platformY = player.platformZ = 0;
    player.physFluid = 0;
    player.physGround = false;

    const record = getById(contacts, player.id);
    if (!record) {
      continue;
    }

    // unpack record
    const { voxel, body, fluidVolumeFraction } = record;

    // check if player is in a fluid
    let volumeFraction = 0;
    for (let j = 0; j < fluidVolumeFraction.length; ++j) {
      volumeFraction += fluidVolumeFraction[j];
    }
    player.physFluid = volumeFraction;

    // handle ground contact with terrain
    player.physGround = false;
    player.platformX = 0;
    player.platformZ = 0;
    let maxLambda = 0;
    for (let j = 0; j < voxel.length; ++j) {
      if (voxel[j].axis === 2) {
        player.physGround = true;
        const l = Math.abs(voxel[j].fy);
        maxLambda += l;

        const block = voxel[j].b;
        const blockCode = block & 0xfff;

        const du = l * blockIndex.velocity[3 * blockCode];
        const dv = l * blockIndex.velocity[3 * blockCode + 2];
        let vz = du;
        let vx = dv;
        switch (block >>> 14) {
          case 0:
            break;
          case 1:
            vz = dv;
            vx = -du;
            break;
          case 2:
            vz = -du;
            vx = -dv;
            break;
          case 3:
            vz = -dv;
            vx = du;
            break;
        }

        player.platformX += vx;
        player.platformZ += vz;
      }
    }
    if (maxLambda > 0) {
      player.platformX /= maxLambda;
      player.platformZ /= maxLambda;
    }

    // handle contact with moving bodies
    for (let j = 0; j < body.length; ++j) {
      const bContact = body[j];
      if (!!bContact.ny && bContact.fy > maxLambda) {
        player.physGround = true;
        maxLambda = bContact.fy;
        const other = getById(bodies, bContact.otherId);
        if (other) {
          player.platformX = other.vx;
          player.platformY = other.vy;
          player.platformZ = other.vz;
        }
      }
    }

    let occupancyFlags = 0;
    if (player.physGround) {
      // compute special movement options for each player
      const id = player.id;
      const input = playerInputs[i];
      // if player is crouching check for walk off ledge
      if ((input.state & PlayerWalkState.MASK) === PlayerWalkState.CROUCH) {
        const b = indexEqRange(bodies, id, bodyPtr, bodyEnd);
        if (b >= 0) {
          const playerBody = bodies[b];
          bodyPtr = b;

          const stepHeight = player.stepHeight;
          const { px, py, pz, rx, ry, rz } = playerBody;

          const lox = px - rx;
          const loy = py - ry;
          const loz = pz - rz;
          const hix = px + rx;
          const hiy = py + ry;
          const hiz = pz + rz;

          const sx = 0.25 * rx;
          const sy = Math.min(0.25 * ry, stepHeight);
          const sz = 0.25 * rz;

          occupancyFlags =
            (computeEdgeStepFlags(
              voxelCollision,
              bodyCollision,
              id,
              stepHeight,
              sx,
              sy,
              sz,
              -rx,
              0,
              lox,
              loy,
              loz,
              hix,
              hiy,
              hiz,
            ) <<
              PlayerOccupancyFlags.X_NEG_SHIFT) |
            (computeEdgeStepFlags(
              voxelCollision,
              bodyCollision,
              id,
              stepHeight,
              sx,
              sy,
              sz,
              rx,
              0,
              lox,
              loy,
              loz,
              hix,
              hiy,
              hiz,
            ) <<
              PlayerOccupancyFlags.X_POS_SHIFT) |
            (computeEdgeStepFlags(
              voxelCollision,
              bodyCollision,
              id,
              stepHeight,
              sx,
              sy,
              sz,
              0,
              -rz,
              lox,
              loy,
              loz,
              hix,
              hiy,
              hiz,
            ) <<
              PlayerOccupancyFlags.Z_NEG_SHIFT) |
            (computeEdgeStepFlags(
              voxelCollision,
              bodyCollision,
              id,
              stepHeight,
              sx,
              sy,
              sz,
              0,
              rz,
              lox,
              loy,
              loz,
              hix,
              hiy,
              hiz,
            ) <<
              PlayerOccupancyFlags.Z_POS_SHIFT);
        }
      }
    }
    player.occupancy = occupancyFlags;
  }
}
