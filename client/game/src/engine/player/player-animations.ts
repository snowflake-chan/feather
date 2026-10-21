import { GameClientState } from '../game-client-schema';
import {
  IKAnimationList,
  IKPaletteSchema,
  IKInputSchema,
  GroundEmote,
  IKStateSchema,
  IKPalette,
} from '@box/schema/animation/ik-schema';
import { MuReadStream } from '@box/mudb/stream';
import { getById, indexEqRange } from '@box/utils/id';
import {
  PlayerInput,
  playerWalkState,
  playerFlyState,
  playerJumpState,
  PlayerWalkState,
  PlayerJumpState,
  PlayerFlyState,
  PlayerButtonState,
  PlayerDisplayFlags,
  Player,
  PlayerDisplay,
} from '@box/schema/player/player-schema';
import { RigidBody, ContactRecord } from '@box/schema/physics/physics-schema';
import { vec3 } from 'gl-matrix';
import {
  initializeIKState,
  computeIKState,
  fastIKState,
} from '../animation/ik';
import {
  FootType,
  AnimationEvent,
  FootStepEventSchema,
  JumpEventSchema,
  DoubleJumpEventSchema,
  LandEventSchema,
  SwimStrokeEventSchema,
  CrouchEventSchema,
  EnterWaterEventSchema,
  LeaveWaterEventSchema,
  FlyEventSchema,
} from '@box/schema/events/animation-event-schema';
import { ENGINE_RES } from '../../resource/engine';
import { PLAYER_HEIGHT } from '@box/schema/player/player-move';
import { Frustum } from '@box/schema/utils/frustum-schema';
import { testFrustumBox } from '../utils/frustum';
import { resolvePlayerAnimationContact } from './player-animation-contact';

// load player animation palette
export async function initializePlayerAnimations(state: GameClientState) {
  const bytes = await state.content.retrieve(ENGINE_RES.anim);
  if (!bytes) {
    state.logger.error(
      `error loading player animation palette ${ENGINE_RES.anim}`,
    );
    return;
  }
  state.animationReady = true;
  const stream = new MuReadStream(bytes);
  const palette = IKPaletteSchema.patch(IKPaletteSchema.identity, stream);
  IKPaletteSchema.assign(state.animationPalette, palette);
  IKPaletteSchema.free(palette);
}

let ANIM_PALETTE: IKPalette = <any>null;
let PREV_ANIMATIONS: IKAnimationList = [];
let NEXT_ANIMATIONS: IKAnimationList = [];
let PREV_ANIM_PTR = 0;
let NEXT_ANIM_PTR = 0;
let ANIM_DT = 0;
let ANIM_EVENTS: AnimationEvent = <any>null;
const ANIM_INPUT = IKInputSchema.alloc();

const POS_HIT = vec3.create();
const NEG_HIT = vec3.create();

function dotHit(axis: number, fx: number, fy: number, fz: number) {
  switch (axis) {
    case 1:
    case -1:
      if (fx > 0) {
        POS_HIT[0] += fx;
      } else {
        NEG_HIT[0] -= fx;
      }
      break;
    case 2:
    case -2:
      if (fy > 0) {
        POS_HIT[1] += fy;
      } else {
        NEG_HIT[1] -= fy;
      }
      break;
    case 3:
    case -3:
      if (fz > 0) {
        POS_HIT[2] += fz;
      } else {
        NEG_HIT[2] -= fz;
      }
      break;
  }
}

function handlePlayerAnimation(
  playerDisplay: PlayerDisplay,
  input: PlayerInput,
  body: RigidBody,
  contact: ContactRecord,
  player: Player,
  priority: number,
) {
  // Skip invisble players
  if (playerDisplay.flags & PlayerDisplayFlags.INVISIBLE) {
    return;
  }

  const { state, angle } = input;
  const walkState = playerWalkState(state);
  const flyState = playerFlyState(state);
  const jumpState = playerJumpState(state);

  // copy basic input state
  ANIM_INPUT.ground = jumpState === PlayerJumpState.GROUND;
  ANIM_INPUT.crouch = walkState === PlayerWalkState.CROUCH;
  ANIM_INPUT.water = jumpState === PlayerJumpState.SWIM;
  ANIM_INPUT.fly = flyState === PlayerFlyState.FLYING;
  ANIM_INPUT.jumpState = jumpState;
  ANIM_INPUT.inputState = state & PlayerButtonState.WALK;
  ANIM_INPUT.scale = playerDisplay.scale;

  // player animation state
  ANIM_INPUT.dead = !!(playerDisplay.flags & PlayerDisplayFlags.DEAD);

  // copy input axis
  const theta = (angle / 256) * 2 * Math.PI;
  const inputAxis = ANIM_INPUT.inputAxis;
  inputAxis[0] = -Math.cos(theta);
  inputAxis[1] = 0;
  inputAxis[2] = -Math.sin(theta);

  // hit vector stuff needs to be updated
  vec3.set(ANIM_INPUT.hitVector, 0, 0, 0);

  const { px, py, pz, rx, ry, rz } = body;

  const hi = ANIM_INPUT.hitBound.hi;
  hi[0] = px + rx;
  hi[1] = py + ry;
  hi[2] = pz + rz;
  const lo = ANIM_INPUT.hitBound.lo;
  lo[0] = px - rx;
  lo[1] = py - ry;
  lo[2] = pz - rz;

  vec3.set(POS_HIT, 0, 0, 0);
  vec3.set(NEG_HIT, 0, 0, 0);
  for (let i = 0; i < contact.body.length; ++i) {
    const c = contact.body[i];
    const xnf = c.fx * c.nx;
    if (c.nx > 0) {
      POS_HIT[0] += xnf;
    } else {
      NEG_HIT[0] += xnf;
    }
    const ynf = c.fy * c.ny;
    if (c.ny > 0) {
      POS_HIT[1] += ynf;
    } else {
      NEG_HIT[1] += ynf;
    }
    const znf = c.fz * c.nz;
    if (c.nz > 0) {
      POS_HIT[2] += znf;
    } else {
      NEG_HIT[2] += znf;
    }
  }
  for (let i = 0; i < contact.voxel.length; ++i) {
    const c = contact.voxel[i];
    dotHit(c.axis, c.fx, c.fy, c.fz);
  }

  const m = Math.max(POS_HIT[0], POS_HIT[2], NEG_HIT[0], NEG_HIT[2]);
  for (let d = 0; d < 3; ++d) {
    if (POS_HIT[d] === m) {
      ANIM_INPUT.hitVector[d] = m / body.mass;
    } else if (NEG_HIT[d] === m) {
      ANIM_INPUT.hitVector[d] = -m / body.mass;
    }
  }

  // copy rigid body body state
  body.copyBounds(ANIM_INPUT.bounds);
  body.copyPosition(ANIM_INPUT.position);
  body.copyVelocity(ANIM_INPUT.velocity);

  // apply frame correction for moving platform
  vec3.set(
    ANIM_INPUT.platformVelocity,
    player.platformX,
    player.platformY,
    player.platformZ,
  );

  // walk animation ptr
  while (
    PREV_ANIM_PTR < PREV_ANIMATIONS.length &&
    PREV_ANIMATIONS[PREV_ANIM_PTR].id < playerDisplay.id
  ) {
    PREV_ANIM_PTR++;
  }

  if (NEXT_ANIMATIONS.length <= NEXT_ANIM_PTR) {
    NEXT_ANIMATIONS.push(IKStateSchema.alloc());
  }
  const nextAnimation = NEXT_ANIMATIONS[NEXT_ANIM_PTR++];

  if (
    PREV_ANIM_PTR >= PREV_ANIMATIONS.length ||
    PREV_ANIMATIONS[PREV_ANIM_PTR].id !== playerDisplay.id
  ) {
    initializeIKState(
      nextAnimation,
      playerDisplay.id,
      ANIM_INPUT,
      ANIM_PALETTE,
    );
  } else {
    const prevAnimation = PREV_ANIMATIONS[PREV_ANIM_PTR++];

    prevAnimation.priorityAccumulator += priority;
    if (prevAnimation.priorityAccumulator < 1) {
      fastIKState(
        nextAnimation,
        prevAnimation,
        ANIM_INPUT,
        ANIM_PALETTE,
        ANIM_DT,
      );
    } else {
      computeIKState(
        nextAnimation,
        prevAnimation,
        ANIM_INPUT,
        ANIM_PALETTE,
        ANIM_DT,
      );
      nextAnimation.priorityAccumulator = 0.125 * Math.random();

      // update events
      let foot: FootType | undefined;
      if (
        nextAnimation.pose.leftPlant < 0.5 &&
        prevAnimation.pose.leftPlant > 0.5
      ) {
        foot = FootType.LEFT;
      } else if (
        nextAnimation.pose.rightPlant < 0.5 &&
        prevAnimation.pose.rightPlant > 0.5
      ) {
        foot = FootType.RIGHT;
      }
      if (foot !== undefined) {
        const ev = FootStepEventSchema.alloc();
        ev.id = playerDisplay.id;
        ev.foot = foot;
        if (foot === FootType.LEFT) {
          vec3.copy(ev.position, nextAnimation.pose.leftFootPosition);
        } else {
          vec3.copy(ev.position, nextAnimation.pose.rightFootPosition);
        }
        ANIM_EVENTS.footStep.push(ev);
      }

      // swim event
      if ((input.state & PlayerJumpState.MASK) === PlayerJumpState.SWIM) {
        if (nextAnimation.swimming && !prevAnimation.swimming) {
          const ev = EnterWaterEventSchema.alloc();
          ev.id = playerDisplay.id;
          vec3.copy(ev.position, nextAnimation.pose.hipPosition);
          ANIM_EVENTS.enterWater.push(ev);
        }
        if (
          nextAnimation.swimPhase < prevAnimation.swimPhase &&
          vec3.sqrLen(nextAnimation.velocity) > 0.01
        ) {
          const ev = SwimStrokeEventSchema.alloc();
          ev.id = playerDisplay.id;
          vec3.copy(ev.position, nextAnimation.pose.hipPosition);
          ANIM_EVENTS.swim.push(ev);
        }
      } else if (prevAnimation.swimming && !nextAnimation.swimming) {
        const ev = LeaveWaterEventSchema.alloc();
        ev.id = playerDisplay.id;
        vec3.copy(ev.position, nextAnimation.pose.hipPosition);
        ANIM_EVENTS.leaveWater.push(ev);
      }

      // jump events
      if (
        (input.state & PlayerJumpState.MASK) === PlayerJumpState.JUMP &&
        prevAnimation.ground > 0.5 &&
        nextAnimation.ground <= 0.5
      ) {
        const ev = JumpEventSchema.alloc();
        ev.scale = body.ry / PLAYER_HEIGHT;
        ev.id = playerDisplay.id;
        vec3.lerp(
          ev.position,
          nextAnimation.pose.leftFootPosition,
          nextAnimation.pose.rightFootPosition,
          0.5,
        );
        ANIM_EVENTS.jump.push(ev);
      } else if (
        (input.state & PlayerJumpState.MASK) === PlayerJumpState.DOUBLE_JUMP &&
        prevAnimation.rollPhase < 0.85 &&
        nextAnimation.rollPhase >= 0.85
      ) {
        const ev = DoubleJumpEventSchema.alloc();
        ev.scale = body.ry / PLAYER_HEIGHT;
        ev.id = playerDisplay.id;
        vec3.copy(ev.position, nextAnimation.pose.hipPosition);
        ANIM_EVENTS.doubleJump.push(ev);
      } else if (
        (input.state & PlayerJumpState.MASK) === PlayerJumpState.GROUND &&
        prevAnimation.landPhase < 0.01 &&
        nextAnimation.landPhase >= 0.01
      ) {
        const ev = LandEventSchema.alloc();
        ev.id = playerDisplay.id;
        vec3.lerp(
          ev.position,
          nextAnimation.pose.leftFootPosition,
          nextAnimation.pose.rightFootPosition,
          0.5,
        );
        ANIM_EVENTS.land.push(ev);
      }

      // crouch events
      if (
        (input.state & PlayerJumpState.MASK) === PlayerJumpState.GROUND &&
        (input.state & PlayerWalkState.MASK) === PlayerWalkState.CROUCH &&
        nextAnimation.crouch &&
        !prevAnimation.crouch
      ) {
        const ev = CrouchEventSchema.alloc();
        ev.id = playerDisplay.id;
        vec3.copy(ev.position, nextAnimation.pose.hipPosition);
        ANIM_EVENTS.crouch.push(ev);
      }

      // fly events
      if (nextAnimation.flying && !prevAnimation.flying) {
        const ev = FlyEventSchema.alloc();
        ev.id = playerDisplay.id;
        vec3.copy(ev.position, nextAnimation.pose.hipPosition);
        ANIM_EVENTS.startFly.push(ev);
      } else if (prevAnimation.flying && !nextAnimation.flying) {
        const ev = FlyEventSchema.alloc();
        ev.id = playerDisplay.id;
        vec3.copy(ev.position, nextAnimation.pose.hipPosition);
        ANIM_EVENTS.stopFly.push(ev);
      }
    }
  }
}

function computeUpdatePriority(
  body: RigidBody,
  eye: vec3,
  frustum: Frustum,
  numPlayers: number,
  animationQuality: number,
) {
  const playerWeight =
    animationQuality / Math.max(numPlayers, animationQuality);
  const distanceWeight = Math.min(
    1,
    16 /
      (1 +
        Math.sqrt(
          Math.pow(body.px - eye[0], 2) +
            Math.pow(body.py - eye[1], 2) +
            Math.pow(body.pz - eye[2], 2),
        )),
  );
  const visibilityWeight = testFrustumBox(
    frustum,
    body.px - body.rx,
    body.py - body.ry,
    body.pz - body.rz,
    body.px + body.rx,
    body.py + body.ry,
    body.pz + body.rz,
  )
    ? 1
    : 0.125;
  return Math.max(1 / 16, playerWeight * distanceWeight * visibilityWeight);
}

export function tickPlayerAnimations(state: GameClientState) {
  if (!state.animationReady) {
    return;
  }

  const {
    replica,
    playerInputs,
    animations,
    bodies,
    contact,
    animationPalette,
    clock: { deltaTick },
    events: {
      damage: { hurt },
      emote,
    },
  } = state;

  // update hurt effects
  for (let i = 0; i < hurt.length; ++i) {
    const h = hurt[i];
    const m = h.damage;
    if (m > 0) {
      const anim = getById(animations, h.id);
      const stats = getById(replica.damage, h.id);
      if (anim && stats) {
        const twitch = anim.damageTwitch;
        const v = m / stats.maxHp;
        twitch[0] = 0.125 * (v + 1) * (Math.random() - 0.5);
        twitch[1] = 0.25 * (v + 1);
        twitch[2] = 0.125 * (Math.random() - 0.5);
        anim.hurtFlash = 1;
      }
    }
  }

  // update ground emote
  for (let i = 0; i < emote.length; i++) {
    const e = emote[i];
    const anim = getById(animations, e.id);
    if (anim) {
      anim.groundEmote = e.emote;
    }
  }

  // copy global input state
  NEXT_ANIMATIONS = PREV_ANIMATIONS;
  PREV_ANIMATIONS = state.animations;
  PREV_ANIM_PTR = 0;
  NEXT_ANIM_PTR = 0;
  ANIM_PALETTE = animationPalette;
  ANIM_DT = deltaTick;
  ANIM_EVENTS = state.events.animation;
  ANIM_INPUT.rig = animationPalette.skeleton;

  // do a join across all input systems
  const playerReplicas = replica.players;
  const playerStates = state.players;
  let replicaPtr = 0;
  let bodyPtr = 0;
  let contactPtr = 0;
  for (
    let i = 0;
    i < playerStates.length &&
    i < playerInputs.length &&
    replicaPtr < playerReplicas.length &&
    bodyPtr < bodies.length;
    ++i
  ) {
    const playerState = playerStates[i];
    const playerInput = playerInputs[i];
    const id = playerState.id;
    if (id !== playerInput.id) continue;

    if (playerReplicas[replicaPtr].id !== id) {
      const index = indexEqRange(
        playerReplicas,
        id,
        replicaPtr,
        playerReplicas.length - 1,
      );
      if (index < 0) continue;
      replicaPtr = index;
    }
    const playerReplica = playerReplicas[replicaPtr++];

    if (bodies[bodyPtr].id !== id) {
      const index = indexEqRange(bodies, id, bodyPtr, bodies.length - 1);
      if (index < 0) continue;
      bodyPtr = index;
    }
    const playerBody = bodies[bodyPtr++];

    // Contact replication is allowed to lag behind the player snapshot. It
    // affects hit reactions, but must never decide whether the avatar exists.
    while (contactPtr < contact.length && contact[contactPtr].id < id) {
      contactPtr++;
    }
    const playerContact =
      contactPtr < contact.length && contact[contactPtr].id === id
        ? contact[contactPtr++]
        : resolvePlayerAnimationContact(contact[contactPtr], id);

    // run the animation subroutine
    let p = 1;
    if (id !== state.secret.id) {
      p = computeUpdatePriority(
        playerBody,
        state.camera.eye,
        state.camera.frustum,
        playerReplicas.length,
        state.settings.animationQuality,
      );
    }
    handlePlayerAnimation(
      playerReplica,
      playerInput,
      playerBody,
      playerContact,
      playerState,
      p,
    );
  }

  // clear old animations from next buffer
  for (let i = NEXT_ANIMATIONS.length - 1; i >= NEXT_ANIM_PTR; --i) {
    IKStateSchema.free(NEXT_ANIMATIONS[i]);
  }
  NEXT_ANIMATIONS.length = NEXT_ANIM_PTR;

  // update animations
  state.animations = NEXT_ANIMATIONS;
}
