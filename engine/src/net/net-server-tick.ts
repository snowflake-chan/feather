import {
  PhysicsZoneSetSchema,
  ZoneSelectorGroupSetSchema,
} from '@box/schema/zone/zone-schema';
import {
  NetStateSchema,
  NetInputSchema,
  NetState,
} from '@box/schema/net/net-schema';
import {
  PlayerSetSchema,
  PlayerSchema,
  PlayerInputSetSchema,
} from '@box/schema/player/player-schema';
import {
  PhysicsParamsSchema,
  RigidBodySetSchema,
  RigidBodySchema,
  ContactIndexSchema,
  ContactIndex,
} from '@box/schema/physics/physics-schema';
import { VoxelCollision } from '@box/schema/voxel/voxel-collision-schema';
import { BlockIndex } from '@box/schema/voxel/block-schema';

import {
  NetServerState,
  NetServerStateSchema,
  SERVER_MAX_NET_BUFFER,
} from './net-server-state';
import { netTick } from '@box/schema/net/net-tick';
import { deltaList, deltaItem } from '@box/schema/net/delta';
import { GameServerState } from '../game-server-schema';
import { generateContactEvents } from '@box/schema/physics/contact-events';
import { clearBodyLocks } from '@box/schema/physics/physics-solve';
import { CollisionFilterSchema } from '@box/schema/physics/collision-filter';
import { EntitySetSchema } from '@box/schema/entity/entity-schema';

// -----------------------------------------------------------------------------
//  called once per tick.  copies state from netState into the server state
// -----------------------------------------------------------------------------
export function synchronizeServerNetState(
  state: GameServerState,
  net: NetState,
) {
  // generate physics events
  generateContactEvents(
    state.clock.tick,
    state.events.physics,
    state.contact,
    state.net.lastContact,
  );

  // synchronize net state
  PlayerSetSchema.assign(state.players, net.players);
  PlayerInputSetSchema.assign(state.playerInputs, net.playerInputs);
  PhysicsParamsSchema.assign(state.physics, net.physics);
  RigidBodySetSchema.assign(state.bodies, net.bodies);
  ContactIndexSchema.assign(state.contact, state.net.lastContact);

  state.replica.entities = EntitySetSchema.clone(state.entity.entities);

  // clear all locks on all rigid bodies
  clearBodyLocks(state.bodies);
}

export function updateServerNetInput(state: GameServerState, tick: number) {
  const net = getServerNetState(state, tick - 1);
  const input = getServerNetInput(state, tick - 1);

  if (!net || !input) {
    state.logger.error(
      `WARNING!!!! Server net state corrupted at ${tick}.  This should never happen.  Current net state :::\n${JSON.stringify(
        state.net,
        null,
        '\t',
      )}`,
    );
    return;
  }

  // clear body locks on both net bodies and server bodies
  clearBodyLocks(net.bodies);
  clearBodyLocks(state.bodies);

  // write diff list to input
  deltaList(PlayerSchema, input.playerDelta, net.players, state.players);
  deltaList(RigidBodySchema, input.bodyDelta, net.bodies, state.bodies);
  deltaItem(
    PhysicsParamsSchema,
    input.physicsDelta,
    net.physics,
    state.physics,
  );

  // update collision filters
  if (state.filterChanged) {
    CollisionFilterSchema.assign(input.filter, state.filter);
    input.filterChanged = true;
    state.filterChanged = false;
  } else {
    input.filterChanged = false;
  }

  // update physics zones
  if (state.physicsZonesChanged) {
    PhysicsZoneSetSchema.assign(input.zones, state.physicsZones);
    ZoneSelectorGroupSetSchema.assign(input.zoneSelectors, state.zoneSelectors);
    input.zoneChanged = true;
    state.physicsZonesChanged = false;
  } else {
    input.zoneChanged = false;
  }

  // copy physics params
  PhysicsParamsSchema.assign(net.physics, state.physics);

  // update last input tick
  state.net.lastInputTick = Math.min(state.net.lastInputTick, tick);
}

// resets the server state to target tick
export function clearServerNetState(state: NetServerState, tick: number) {
  NetServerStateSchema.assign(state, NetServerStateSchema.identity);
  state.states.push(NetStateSchema.clone(NetStateSchema.identity));
  state.inputs.push(NetInputSchema.clone(NetInputSchema.identity));
  state.oldestTick = state.lastInputTick = tick;
}

function allocInputs(state: NetServerState, tick: number) {
  const index = tick - state.oldestTick;
  for (let i = state.inputs.length; i <= index; ++i) {
    state.inputs.push(NetInputSchema.clone(NetInputSchema.identity));
  }
}

// ticks server state to target tick
function tickServerState(
  state: NetServerState,
  tick: number,
  blockIndex: BlockIndex,
  collision: VoxelCollision,
  contact: ContactIndex,
) {
  allocInputs(state, tick);

  const { oldestTick, states, inputs } = state;

  // allocate extra slots
  const count = tick - oldestTick;
  while (states.length <= count) {
    states.push(NetStateSchema.clone(NetStateSchema.identity));
  }

  for (
    let i = Math.max(0, state.lastInputTick - state.oldestTick);
    i < count;
    ++i
  ) {
    // tick previous state into next state
    const prevState = states[i];
    const nextState = states[i + 1];
    const input = inputs[i];
    NetStateSchema.assign(nextState, prevState);
    netTick(
      nextState,
      input,
      blockIndex,
      collision,
      contact,
      state.zoneIndex,
      true,
      i === count - 1,
    );
  }

  state.lastInputTick = Math.max(state.lastInputTick, tick);
}

// drop any state before tick
export function forgetServerNetState(
  serverState: GameServerState,
  tick: number,
) {
  const state = serverState.net;
  if (tick <= state.oldestTick) {
    return;
  }

  const { states, inputs, oldestTick } = state;

  // compute prefix to delete
  const index = Math.min(tick - oldestTick, states.length);

  // release head of array
  for (let i = 0; i < index; ++i) {
    NetStateSchema.free(states[i]);
    NetInputSchema.free(inputs[i]);
  }

  // shift arrays back
  let ptr = 0;
  for (let i = index; i < states.length; ++i) {
    states[ptr++] = states[i];
  }
  states.length = ptr;

  ptr = 0;
  for (let i = index; i < inputs.length; ++i) {
    inputs[ptr++] = inputs[i];
  }
  inputs.length = ptr;

  state.oldestTick = tick;
}

// retrieves a reference for input transition from tick to tick+1
export function getServerNetInput(serverState: GameServerState, tick: number) {
  const state = serverState.net;
  if (
    tick < state.oldestTick ||
    tick > state.oldestTick + SERVER_MAX_NET_BUFFER
  ) {
    return null;
  }
  allocInputs(state, tick);
  return state.inputs[tick - state.oldestTick];
}

export function getServerNetState(state: GameServerState, tick: number) {
  const netState = state.net;
  if (
    tick < netState.oldestTick ||
    tick > netState.oldestTick + SERVER_MAX_NET_BUFFER
  ) {
    return null;
  }
  tickServerState(
    netState,
    tick,
    state.blockIndex,
    state.collision,
    state.net.lastContact,
  );
  return netState.states[tick - netState.oldestTick];
}
