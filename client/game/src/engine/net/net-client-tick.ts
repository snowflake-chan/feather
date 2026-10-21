import {
  NetClientState,
  CLIENT_MAX_NET_BUFFER,
  NetErrorAccumulatorSchema,
} from './net-client-state';
import {
  NetStateSchema,
  NetInputSchema,
  NetState,
  NetClientInput,
  NetClientInputSchema,
  NetPositionCorrectionSchema,
} from '@box/schema/net/net-schema';
import { netTick, mergeNetInput } from '@box/schema/net/net-tick';
import { GameClientState } from '../game-client-schema';
import { getById } from '@box/utils/id';
import {
  PlayerSetSchema,
  PlayerInputSetSchema,
  PlayerInputSet,
} from '@box/schema/player/player-schema';
import {
  PhysicsParamsSchema,
  RigidBodySet,
  RigidBodySetSchema,
  RigidBodyFlags,
} from '@box/schema/physics/physics-schema';
import { VoxelCollision } from '@box/schema/voxel/voxel-collision-schema';
import { BlockIndex } from '@box/schema/voxel/block-schema';
import { clearBodyLocks } from '@box/schema/physics/physics-solve';
import { CollisionFilterSchema } from '@box/schema/physics/collision-filter';
import {
  PhysicsZoneSetSchema,
  ZoneSelectorGroupSetSchema,
} from '@box/schema/zone/zone-schema';

export function computeNetClientInput(
  state: GameClientState,
  inputs: PlayerInputSet,
  bodies: RigidBodySet,
) {
  // compute input backet
  const input = NetClientInputSchema.clone(NetClientInputSchema.identity);

  // get player id
  const localInput = getById(inputs, state.secret.id);
  if (localInput) {
    input.inputState = localInput.state;
    input.inputAngle = localInput.angle;
    input.inputPitch = localInput.pitch;
    input.inputCameraAngle = localInput.cameraAngle;
  }

  // copy replica bodies
  input.bodies.length = 0;
  for (let i = 0; i < bodies.length; ++i) {
    const b = bodies[i];
    if (b.flags & RigidBodyFlags.LOCKED) {
      input.bodies.push(NetPositionCorrectionSchema.clone(b));
    }
  }

  return input;
}

export function setPredictedStateFromNetState(
  state: GameClientState,
  net: NetState,
) {
  PlayerSetSchema.assign(state.players, net.players);
  const localInput = getById(state.playerInputs, state.secret.id);
  if (localInput) {
    const inputState = localInput.state;
    const inputAngle = localInput.angle;
    const inputPitch = localInput.pitch;
    const inputCameraAngle = localInput.cameraAngle;
    PlayerInputSetSchema.assign(state.playerInputs, net.playerInputs);
    const nextInput = getById(state.playerInputs, state.secret.id);
    if (nextInput) {
      nextInput.state = inputState;
      nextInput.angle = inputAngle;
      nextInput.pitch = inputPitch;
      nextInput.cameraAngle = inputCameraAngle;
    }
  } else {
    PlayerInputSetSchema.assign(state.playerInputs, net.playerInputs);
  }
  PhysicsParamsSchema.assign(state.physics, net.physics);
  RigidBodySetSchema.assign(state.bodies, net.bodies);
  CollisionFilterSchema.assign(state.filter, net.collisionFilter);
  ZoneSelectorGroupSetSchema.assign(state.zoneSelectors, net.zoneSelectors);
  PhysicsZoneSetSchema.assign(state.physicsZones, net.zones);

  // reset error state
  const err = state.net.errors;
  while (err.length < net.bodies.length) {
    err.push(NetErrorAccumulatorSchema.alloc());
  }
  while (net.bodies.length < err.length) {
    const x = err.pop();
    if (x) {
      NetErrorAccumulatorSchema.free(x);
    }
  }
  for (let i = 0; i < net.bodies.length; ++i) {
    const x = err[i];
    x.id = net.bodies[i].id;
    x.error = 0;
  }
}

function allocToTick(net: NetClientState, tick: number) {
  const { authoritative, dirty, states, inputs, oldestTick } = net;
  const index = tick - oldestTick;
  while (authoritative.length <= index) {
    authoritative.push(false);
  }
  while (dirty.length <= index) {
    dirty.push(true);
  }
  while (inputs.length <= index) {
    inputs.push(NetInputSchema.clone(NetInputSchema.identity));
  }
  while (states.length <= index) {
    states.push(NetStateSchema.clone(NetStateSchema.identity));
  }
}

function predictClientNetState(
  net: NetClientState,
  tick: number,
  blockIndex: BlockIndex,
  collision: VoxelCollision,
) {
  allocToTick(net, tick);
  const { dirty, states, inputs, oldestTick, authoritative } = net;

  const index = tick - oldestTick;

  // if state is not stale, then we are good
  if (!dirty[index]) {
    return true;
  }

  // otherwise scan back from index to find first not-stale state
  let startIndex = index - 1;
  while (startIndex > 0 && dirty[startIndex]) {
    startIndex -= 1;
  }

  for (let i = startIndex; i < index; ++i) {
    // update next state
    if (!authoritative[i + 1]) {
      if (net.frameNetTicks <= 0) {
        return false;
      }
      net.frameNetTicks -= 1;

      const prevState = states[i];
      const nextState = states[i + 1];
      const input = inputs[i];

      NetStateSchema.assign(nextState, prevState);
      states[i + 1] = netTick(
        nextState,
        input,
        blockIndex,
        collision,
        net.lastContactIndex,
        net.zoneIndex,
        false,
        false,
      );
      clearBodyLocks(nextState.bodies);
    }

    // clear dirty flag
    dirty[i + 1] = false;
  }

  return true;
}

function shiftLeft<T>(array: T[], count: number) {
  let ptr = 0;
  for (let i = count; i < array.length; ++i) {
    array[ptr++] = array[i];
  }
  array.length = ptr;
}

export function forgetClientNetStates(state: GameClientState) {
  const net = state.net;
  const { dirty, authoritative, states, inputs, oldestTick } = net;

  // compute index for head pointer in authoritative buffer
  let index =
    Math.min(
      authoritative.length - 1,
      Math.floor(state.clock.tick) - oldestTick,
    ) | 0;
  if (index < 0) {
    return;
  }
  while (index > 0 && !authoritative[index]) {
    index -= 1;
  }

  if (index > 0) {
    // release resources
    for (let i = 0; i < index; ++i) {
      NetStateSchema.free(states[i]);
      NetInputSchema.free(inputs[i]);
    }

    // shift arrays back
    shiftLeft(dirty, index);
    shiftLeft(authoritative, index);
    shiftLeft(states, index);
    shiftLeft(inputs, index);

    // update counters
    net.oldestTick += index;
  }
}

function markDirtyState(net: NetClientState, tick: number) {
  const { oldestTick, dirty, authoritative } = net;
  const index = Math.max(0, tick - oldestTick + 1);
  for (let i = index; i < dirty.length && !authoritative[i]; ++i) {
    dirty[i] = true;
  }
}

export function setAuthoritativeClientNetState(
  net: NetClientState,
  tick: number,
  state: NetState,
  clearState: boolean,
) {
  if (tick > net.oldestTick + CLIENT_MAX_NET_BUFFER || clearState) {
    // zap network state to position
    net.oldestTick = tick;
    net.authoritative.length = 1;
    net.authoritative[0] = true;

    net.dirty.length = 1;
    net.dirty[0] = false;

    while (net.states.length > 0) {
      const s = net.states.pop();
      if (s) {
        NetStateSchema.free(s);
      }
    }
    while (net.inputs.length > 0) {
      const x = net.inputs.pop();
      if (x) {
        NetInputSchema.free(x);
      }
    }

    net.states.push(NetStateSchema.clone(state));
    net.inputs.push(NetInputSchema.clone(NetInputSchema.identity));

    return true;
  } else if (tick < net.oldestTick) {
    return false;
  } else {
    // allocate space
    allocToTick(net, tick);
    markDirtyState(net, tick);

    const { authoritative, dirty, states, oldestTick } = net;
    const index = tick - oldestTick;

    // update flags
    authoritative[index] = true;
    dirty[index] = false;

    // copy state
    NetStateSchema.assign(states[index], state);

    return true;
  }
}

export function setClientNetInput(
  net: NetClientState,
  tick: number,
  id: number,
  input: NetClientInput,
) {
  if (tick <= net.oldestTick || tick > net.oldestTick + CLIENT_MAX_NET_BUFFER) {
    return;
  }
  allocToTick(net, tick);
  markDirtyState(net, tick);

  // FIXME
  // This is probably the reason for net-replay problems.
  //  If the server clock is ahead of the client clock, then these inputs into the server state will
  //  be effectively ignored.
  //  There's not an easy way to fix this that I can think of right now.
  //  Some ideas:
  //      * Modify this thing to somehow update the net replay buffer in place (seems complicated)
  //      * Modify the clock to try to keep the client ahead of server (unstable, doesn't seem possible)
  //      * Modify net interpolate to make the correction forces lower (will also require making the server more robust to delayed inputs)
  //
  mergeNetInput(net.inputs[tick - 1 - net.oldestTick], id, input, true);
}

export function getClientNetState(state: GameClientState, tick: number) {
  const net = state.net;
  if (tick < net.oldestTick || tick > net.oldestTick + CLIENT_MAX_NET_BUFFER) {
    return null;
  }
  if (predictClientNetState(net, tick, state.blockIndex, state.collision)) {
    return net.states[tick - net.oldestTick];
  }
  return null;
}

export function getLastAuthoritativeClientNetStateIndex(
  net: NetClientState,
  tick: number,
) {
  const { authoritative, oldestTick } = net;
  let index = Math.floor(tick - oldestTick);
  if (index < 0 || index >= net.states.length) {
    index = authoritative.length - 1;
  }
  while (index >= 0) {
    if (authoritative[index]) {
      return index;
    }
    index -= 1;
  }
  return -1;
}
