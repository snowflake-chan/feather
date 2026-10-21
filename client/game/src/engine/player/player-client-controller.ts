import { GameClientState } from '../game-client-schema';
import { getById, zipId } from '@box/utils/id';
import { vec3, vec2 } from 'gl-matrix';
import { GameKeys } from '@box/schema/input/input-schema';
import {
  playerWalkState,
  PlayerWalkState,
  PlayerButtonState,
  playerFlyState,
  PlayerFlyState,
  playerJumpState,
  playerStateBits,
  PlayerFlags,
  PlayerJumpState,
  PlayerInputSetSchema,
  InputDirectionState,
} from '@box/schema/player/player-schema';
import {
  NetInputEventSchema,
  NetInputEventBits,
} from '@box/schema/net/net-schema';
import {
  raycast,
  VoxelRaycastHitResult,
} from '@box/schema/voxel/voxel-raycast';
import {
  raycastBoxes,
  BodyRaycastSchema,
} from '@box/schema/physics/raycast-bodies';
import { screenToRay } from '../camera/camera-controller';
import { PlayerInputEventSchema } from '@box/schema/events/player-event-schema';
import { CameraMode } from '@box/schema/camera/camera-schema';
import { isEqual } from 'src/engine/utils/array';
import { ClientKeyboardEventSchema } from '@box/schema/events/client-keyboard-event-schema';

const TURN_RATE = 0.0025;
const LOOK_RATE = 0.0025;

const FORWARD_AXIS = vec2.create();
const RIGHT_AXIS = vec2.create();
const PLAYER_AXIS = vec2.create();

const _voxelRaycast = new VoxelRaycastHitResult();

export function updatePlayerInput(state: GameClientState) {
  const local = state.local;

  // 键盘事件
  if (!isEqual(local.prevKeyDown, state.input.keyboardState)) {
    const event = ClientKeyboardEventSchema.clone(
      ClientKeyboardEventSchema.identity,
    );
    event.tick = state.clock.tick;
    event.keyDownState = state.input.keyboardState;
    event.prevKeyDownState = local.prevKeyDown;
    state.net.keyboardEvents.push(event);
  }
  local.prevKeyDown = [...state.input.keyboardState];

  // update axis coordinates
  const dlook = state.events.lookAxisMovement;

  const turnRate =
    state.clock.deltaClock *
    TURN_RATE *
    (state.input.keyState[GameKeys.CROUCH] ? 0.5 : 1);
  const dpitch =
    dlook[0] +
    (state.input.keyState[GameKeys.TURN_LEFT] ? -turnRate : 0) +
    (state.input.keyState[GameKeys.TURN_RIGHT] ? turnRate : 0);
  local.pitch += dpitch;

  const lookRate = state.clock.deltaClock * LOOK_RATE;
  local.yaw = Math.max(
    -0.5 * Math.PI + 0.001,
    Math.min(
      0.5 * Math.PI - 0.001,
      local.yaw +
        dlook[1] +
        (state.input.keyState[GameKeys.LOOK_UP] ? -lookRate : 0) +
        (state.input.keyState[GameKeys.LOOK_DOWN] ? lookRate : 0),
    ),
  );

  // update player input buttons
  const input = getById(state.playerInputs, state.secret.id);
  const player = getById(state.players, state.secret.id);
  if (player && player.freezedForwardAngle) {
    local.pitch = ((player.freezedForwardAngle - 1) * Math.PI * 2) / 65520;
  }
  // update player axis
  const pitch = local.pitch;
  if (input && player) {
    const keys = state.input.keyState;
    const joystick = state.input.joystick;
    const joystickEnabled = state.input.joystickEnabled;
    const taps = state.events.keyTap;
    const allowMove = !!(player.flags & PlayerFlags.ALLOW_MOVE);
    const allowCrouch = !!(player.flags & PlayerFlags.ALLOW_CROUCH);

    // compute input axis direction
    if (state.secret.replica.camera.mode === CameraMode.FIXED) {
      const mat = state.camera.view;
      const w = 100 * (Math.pow(mat[2], 2) + Math.pow(mat[10], 2));
      FORWARD_AXIS[0] = w * mat[2] - mat[6];
      FORWARD_AXIS[1] = w * mat[10] + mat[4];
      vec2.normalize(FORWARD_AXIS, FORWARD_AXIS);
    } else {
      FORWARD_AXIS[0] = Math.cos(pitch);
      FORWARD_AXIS[1] = Math.sin(pitch);
    }
    RIGHT_AXIS[0] = -FORWARD_AXIS[1];
    RIGHT_AXIS[1] = FORWARD_AXIS[0];
    PLAYER_AXIS[0] = PLAYER_AXIS[1] = 0;

    if (player.inputDirectionState & InputDirectionState.SWAP_DIRECTION) {
      let t: number;
      t = FORWARD_AXIS[0];
      FORWARD_AXIS[0] = RIGHT_AXIS[0];
      RIGHT_AXIS[0] = t;
      t = FORWARD_AXIS[1];
      FORWARD_AXIS[1] = RIGHT_AXIS[1];
      RIGHT_AXIS[1] = t;
    }
    if (player.inputDirectionState & InputDirectionState.DISABLE_HORIZONTAL) {
      RIGHT_AXIS[0] = RIGHT_AXIS[1] = 0;
    } else if (
      player.inputDirectionState & InputDirectionState.REVERSE_HORIZONTAL
    ) {
      RIGHT_AXIS[0] = -RIGHT_AXIS[0];
      RIGHT_AXIS[1] = -RIGHT_AXIS[1];
    }
    if (player.inputDirectionState & InputDirectionState.DISABLE_VERTICAL) {
      FORWARD_AXIS[0] = FORWARD_AXIS[1] = 0;
    } else if (
      player.inputDirectionState & InputDirectionState.REVERSE_VERTICAL
    ) {
      FORWARD_AXIS[0] = -FORWARD_AXIS[0];
      FORWARD_AXIS[1] = -FORWARD_AXIS[1];
    }

    let moveActive = false;
    const joystickDist = Math.sqrt(
      joystick[0] * joystick[0] + joystick[1] * joystick[1],
    );
    if (allowMove) {
      if (joystickDist > 0.1 && joystickEnabled) {
        vec2.add(
          PLAYER_AXIS,
          vec2.scale(FORWARD_AXIS, FORWARD_AXIS, -joystick[1] / joystickDist),
          vec2.scale(RIGHT_AXIS, RIGHT_AXIS, joystick[0] / joystickDist),
        );
      }
      if (keys[GameKeys.LEFT]) {
        vec2.sub(PLAYER_AXIS, PLAYER_AXIS, RIGHT_AXIS);
      }
      if (keys[GameKeys.RIGHT]) {
        vec2.add(PLAYER_AXIS, PLAYER_AXIS, RIGHT_AXIS);
      }
      if (keys[GameKeys.UP]) {
        vec2.add(PLAYER_AXIS, PLAYER_AXIS, FORWARD_AXIS);
      }
      if (keys[GameKeys.DOWN]) {
        vec2.sub(PLAYER_AXIS, PLAYER_AXIS, FORWARD_AXIS);
      }
      moveActive = vec2.length(PLAYER_AXIS) > 0.01;
    }

    // compute player angle
    if (PLAYER_AXIS[0] || PLAYER_AXIS[1]) {
      input.angle =
        Math.round(
          (256 * Math.atan2(PLAYER_AXIS[1], PLAYER_AXIS[0])) / (2 * Math.PI),
        ) % 256;
    } else if (dpitch) {
      input.angle = Math.round((256 * pitch) / (2 * Math.PI)) % 256;
    }
    if (input.angle < 0) {
      input.angle += 256;
    }
    input.pitch = Math.round((255 * (local.yaw + Math.PI / 2)) / Math.PI);
    input.cameraAngle = Math.round((256 * pitch) / (2 * Math.PI)) % 256;

    // fly state
    let flyState = playerFlyState(input.state);
    if (player.flags & PlayerFlags.ALLOW_FLIGHT && taps[GameKeys.JUMP]) {
      if (flyState === PlayerFlyState.FLYING) {
        flyState = PlayerFlyState.NOT_FLYING;
      } else {
        flyState = PlayerFlyState.FLYING;
      }
    }

    // compute button state
    const buttonState =
      (allowMove
        ? (moveActive ? PlayerButtonState.WALK : 0) |
          (keys[GameKeys.JUMP] ? PlayerButtonState.JUMP : 0) |
          (keys[GameKeys.CROUCH] ? PlayerButtonState.CROUCH : 0)
        : 0) |
      (keys[GameKeys.ACTION_0] ? PlayerButtonState.ACTION_0 : 0) |
      (keys[GameKeys.ACTION_1] ? PlayerButtonState.ACTION_1 : 0);

    // walking speed
    let walkState = playerWalkState(input.state);
    if (allowMove) {
      if (joystickEnabled) {
        // mobile mode
        if (keys[GameKeys.CROUCH] && allowCrouch) {
          walkState = PlayerWalkState.CROUCH;
        } else {
          if (joystickDist && joystickDist < 15) {
            walkState = PlayerWalkState.CROUCH;
          } else if (joystickDist > 40) {
            walkState = PlayerWalkState.RUN;
          } else {
            walkState = PlayerWalkState.WALK;
          }
        }
      } else {
        // pc mode
        if (keys[GameKeys.CROUCH] && allowCrouch) {
          walkState = PlayerWalkState.CROUCH;
        } else {
          if (moveActive) {
            if (
              taps[GameKeys.LEFT] ||
              taps[GameKeys.RIGHT] ||
              taps[GameKeys.UP] ||
              taps[GameKeys.DOWN]
            ) {
              walkState = PlayerWalkState.RUN;
            } else if (walkState === PlayerWalkState.CROUCH) {
              walkState = PlayerWalkState.WALK;
            }
          } else {
            walkState = PlayerWalkState.WALK;
          }
        }
      }
    }

    // get jump state
    const jumpState = playerJumpState(input.state);

    // update state bits
    input.state = playerStateBits(flyState, walkState, jumpState, buttonState);

    // calculate next button state
    let nextButtonState =
      (buttonState & PlayerButtonState.JUMP ? NetInputEventBits.JUMP : 0) +
      (buttonState & PlayerButtonState.WALK ? NetInputEventBits.WALK : 0) +
      (buttonState & PlayerButtonState.CROUCH ? NetInputEventBits.CROUCH : 0) +
      (buttonState & PlayerButtonState.ACTION_0
        ? NetInputEventBits.ACTION0
        : 0) +
      (buttonState & PlayerButtonState.ACTION_1
        ? NetInputEventBits.ACTION1
        : 0) +
      (walkState & PlayerWalkState.RUN ? NetInputEventBits.RUN : 0) +
      (jumpState & PlayerJumpState.DOUBLE_JUMP
        ? NetInputEventBits.DOUBLE_JUMP
        : 0) +
      (flyState & PlayerFlyState.FLYING ? NetInputEventBits.FLY : 0);

    // disable action buttons if constraint applied
    if ((player.flags & PlayerFlags.ALLOW_ACTION_0) === 0) {
      nextButtonState &= ~NetInputEventBits.ACTION0;
    }
    if ((player.flags & PlayerFlags.ALLOW_ACTION_1) === 0) {
      nextButtonState &= ~NetInputEventBits.ACTION1;
    }

    if (nextButtonState & NetInputEventBits.ACTION0) {
      local.buttonPressed[0] = 1;
    }
    if (nextButtonState & NetInputEventBits.ACTION1) {
      local.buttonPressed[1] = 1;
    }

    // handle event dispatch
    if (nextButtonState !== local.prevButtonState) {
      const event = NetInputEventSchema.clone(NetInputEventSchema.identity);
      event.tick = state.clock.tick;
      event.buttonState = nextButtonState;
      event.prevButtonState = local.prevButtonState;

      const body = getById(state.bodies, state.secret.id);
      if (body) {
        body.copyPosition(event.position);
      } else {
        vec3.copy(event.position, state.camera.eye);
      }

      // update ray info
      vec3.copy(event.rayOrigin, state.camera.eye);
      // FIXME: use tap location on mobile here
      screenToRay(state.camera, 0, 0, event.rayDirection);

      const bodyRaycast = BodyRaycastSchema.alloc();
      raycastBoxes(
        bodyRaycast,
        state.bodies,
        event.rayOrigin[0],
        event.rayOrigin[1],
        event.rayOrigin[2],
        event.rayDirection[0],
        event.rayDirection[1],
        event.rayDirection[2],
        player.id,
      );
      if (
        raycast(
          _voxelRaycast,
          state.blockIndex,
          state.voxel,
          event.rayOrigin,
          event.rayDirection,
          bodyRaycast.hitTime,
          false,
        )
      ) {
        event.rayTime = _voxelRaycast.hitDistance;
        vec3.copy(event.rayHitNormal, _voxelRaycast.hitNormal);
        event.rayHitVoxelX = _voxelRaycast.hitVoxel[0];
        event.rayHitVoxelY = _voxelRaycast.hitVoxel[1];
        event.rayHitVoxelZ = _voxelRaycast.hitVoxel[2];
      } else if (bodyRaycast.hit) {
        event.rayTime = bodyRaycast.hitTime;
        vec3.copy(event.rayHitNormal, bodyRaycast.hitNormal);
        event.rayHitEntity = bodyRaycast.hitId;
      }
      BodyRaycastSchema.free(bodyRaycast);
      state.net.inputEventBuffer.push(event);
      // state.quickjs.inputEvents.push(event);
    }
    local.prevButtonState = nextButtonState;
  }

  for (let i = 0; i < 2; ++i) {
    local.buttonPressed[i] = Math.max(
      0,
      local.buttonPressed[i] - state.clock.deltaTick,
    );
  }
}

export function tickPlayerInputEvents(state: GameClientState) {
  zipId(
    (input, prev, body) => {
      const curState = input.state & PlayerButtonState.MASK;
      const prevState = prev.state & PlayerButtonState.MASK;
      if (prevState === curState) {
        return;
      }

      if (
        curState & PlayerButtonState.ACTION_0 &&
        !(prevState & PlayerButtonState.ACTION_0)
      ) {
        const ev = PlayerInputEventSchema.alloc();
        ev.id = body.id;
        ev.button = PlayerButtonState.ACTION_0;
        ev.press = true;
        body.copyPosition(ev.position);
        state.events.playerInput.push(ev);
      }

      if (
        curState & PlayerButtonState.ACTION_1 &&
        !(prevState & PlayerButtonState.ACTION_1)
      ) {
        const ev = PlayerInputEventSchema.alloc();
        ev.id = body.id;
        ev.button = PlayerButtonState.ACTION_1;
        ev.press = true;
        body.copyPosition(ev.position);
        state.events.playerInput.push(ev);
      }

      // TODO trap more button press events
    },
    state.playerInputs,
    state.prevPlayerInputs,
    state.bodies,
  );

  // cycle prev input state
  PlayerInputSetSchema.assign(state.prevPlayerInputs, state.playerInputs);
}

export function tickPlayerIndex(state: GameClientState) {
  const index = (state.playerIndex = {});
  const players = state.players;
  for (let i = 0; i < players.length; ++i) {
    index[players[i].id] = i;
  }
}
