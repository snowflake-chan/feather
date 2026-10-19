import { GameServerState } from '../game-server-schema';
import { ScriptKeyframePostTick } from '../script/script-protocol';
import { ENTITY_ANIM_BINDING } from '@box/schema/keyframes/bindings/entity-animation';
import { applySyncPacket } from '@box/schema/keyframes/keyframe-binding';
import { PLAYER_ANIM_BINDING } from '@box/schema/keyframes/bindings/player-animation';
import { WORLD_ANIM_BINDING } from '@box/schema/keyframes/bindings/world-animation';
import { GameReplica } from '@box/schema/replica/game-replica';
import { KeyframeReplicaSchema } from '@box/schema/keyframes/keyframe-schema';

export function clearKeyframeReplica(
  state: GameServerState,
  dst: GameReplica,
  tick: number,
) {
  const { entityIndex, playerIndex, worldIndex } = state.keyframes;
  ENTITY_ANIM_BINDING.tick(
    state.replica.keyframes.entity,
    tick,
    1,
    entityIndex,
  );
  PLAYER_ANIM_BINDING.tick(
    state.replica.keyframes.player,
    tick,
    1,
    playerIndex,
  );
  WORLD_ANIM_BINDING.tick(state.replica.keyframes.world, tick, 1, worldIndex);

  ENTITY_ANIM_BINDING.clear.mesh(entityIndex, dst.models);
  ENTITY_ANIM_BINDING.clear.interact(entityIndex, dst.interactive);
  ENTITY_ANIM_BINDING.clear.particles(entityIndex, dst.particles.emitters);

  PLAYER_ANIM_BINDING.clear.skin(playerIndex, dst.players);

  WORLD_ANIM_BINDING.clear.environment(worldIndex, dst.environment);
}

export function postTickServerKeyframes(
  state: GameServerState,
  packet: ScriptKeyframePostTick,
) {
  const { entityIndex, playerIndex, worldIndex } = state.keyframes;
  const { entity, player, world } = state.replica.keyframes;

  entityIndex.dirty =
    applySyncPacket(ENTITY_ANIM_BINDING, entity, packet.entity) ||
    entityIndex.dirty;
  playerIndex.dirty =
    applySyncPacket(PLAYER_ANIM_BINDING, player, packet.player) ||
    playerIndex.dirty;
  worldIndex.dirty =
    applySyncPacket(WORLD_ANIM_BINDING, world, packet.world) ||
    worldIndex.dirty;
}

export function tickServerKeyframes(state: GameServerState) {
  // update indexes for all animations
  const tick = state.clock.tick;
  const { entityIndex, playerIndex, worldIndex } = state.keyframes;

  // interpolate entities
  ENTITY_ANIM_BINDING.tick(
    state.replica.keyframes.entity,
    tick,
    1,
    entityIndex,
  );
  ENTITY_ANIM_BINDING.interpolate.interact(
    entityIndex,
    state.replica.interactive,
  );
  ENTITY_ANIM_BINDING.interpolate.physics(entityIndex, state.bodies);
  ENTITY_ANIM_BINDING.interpolate.particles(
    entityIndex,
    state.particles.entities,
  );
  ENTITY_ANIM_BINDING.interpolate.particle_mat(
    entityIndex,
    state.particles.entities,
  );
  ENTITY_ANIM_BINDING.interpolate.mesh(entityIndex, state.replica.models);

  // interpolate players
  PLAYER_ANIM_BINDING.tick(
    state.replica.keyframes.player,
    tick,
    1,
    playerIndex,
  );
  PLAYER_ANIM_BINDING.interpolate.skin(playerIndex, state.replica.players);
  PLAYER_ANIM_BINDING.interpolate.replica(playerIndex, state.secrets);

  // interpolate world animations
  WORLD_ANIM_BINDING.tick(state.replica.keyframes.world, tick, 1, worldIndex);
  WORLD_ANIM_BINDING.interpolate.environment(
    worldIndex,
    state.replica.environment,
  );
  WORLD_ANIM_BINDING.interpolate.physics(worldIndex, state.physics);
}

export function clearServerKeyframes(state: GameServerState) {
  const { entityIndex, playerIndex, worldIndex } = state.keyframes;
  entityIndex.dirty = playerIndex.dirty = worldIndex.dirty = true;
  KeyframeReplicaSchema.assign(
    state.replica.keyframes,
    KeyframeReplicaSchema.identity,
  );
}
