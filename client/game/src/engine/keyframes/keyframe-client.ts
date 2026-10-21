import { GameClientState } from '../game-client-schema';
import { ENTITY_ANIM_BINDING } from '@box/schema/keyframes/bindings/entity-animation';
import { PLAYER_ANIM_BINDING } from '@box/schema/keyframes/bindings/player-animation';
import { WORLD_ANIM_BINDING } from '@box/schema/keyframes/bindings/world-animation';
import { ParticleEntity } from '@box/schema/particle/particle-schema';
import { getById } from '@box/utils/id';

export function setClientKeyframeDirty(state: GameClientState) {
  const keyframes = state.keyframes;
  keyframes.entityIndex.dirty =
    keyframes.playerIndex.dirty =
    keyframes.worldIndex.dirty =
      true;
}

export function tickClientPhysicsKeyframes(
  state: GameClientState,
  tick: number,
  deltaTick: number,
) {
  const { entityIndex, worldIndex } = state.keyframes;
  ENTITY_ANIM_BINDING.tick(
    state.replica.keyframes.entity,
    tick,
    deltaTick,
    entityIndex,
  );
  ENTITY_ANIM_BINDING.interpolate.physics(entityIndex, state.bodies);
  WORLD_ANIM_BINDING.tick(
    state.replica.keyframes.world,
    tick,
    deltaTick,
    worldIndex,
  );
  WORLD_ANIM_BINDING.interpolate.physics(worldIndex, state.physics);
}

function buildGroupIndex(
  groupIndex: number[],
  trackerIndex: number[],
  particleMatIds: number[],
  emitters: ParticleEntity[],
) {
  while (groupIndex.length < trackerIndex.length) {
    groupIndex.push(0);
  }
  for (let i = 0; i < particleMatIds.length; ++i) {
    const id = particleMatIds[i];
    const emitterId = trackerIndex[id];
    const emitter = getById(emitters, emitterId);
    if (emitter) {
      groupIndex[id] = emitter.particleId;
    } else {
      groupIndex[id] = 0;
    }
  }
}

export function tickClientKeyframes(state: GameClientState) {
  // update indexes for all animations
  const { entityIndex, playerIndex, worldIndex } = state.keyframes;
  const tick = state.clock.tick;
  const deltaTick = state.clock.deltaTick;

  // interpolate entities
  ENTITY_ANIM_BINDING.tick(
    state.replica.keyframes.entity,
    tick,
    deltaTick,
    entityIndex,
  );
  ENTITY_ANIM_BINDING.interpolate.mesh(entityIndex, state.replica.models);
  ENTITY_ANIM_BINDING.interpolate.particles(
    entityIndex,
    state.replica.particles.emitters,
  );
  ENTITY_ANIM_BINDING.interpolate.interact(
    entityIndex,
    state.replica.interactive,
  );

  // for particle material need to switch out entityIndex id list with group ids for particles
  if (entityIndex.components.particle_mat.id.length > 0) {
    buildGroupIndex(
      state.keyframes.groupIndex,
      entityIndex.tracker.targetId,
      entityIndex.components.particle_mat.id,
      state.replica.particles.emitters,
    );
    const tmp = entityIndex.tracker.targetId;
    entityIndex.tracker.targetId = state.keyframes.groupIndex;
    ENTITY_ANIM_BINDING.interpolate.particle_mat(
      entityIndex,
      state.replica.particles.prototypes,
    );
    entityIndex.tracker.targetId = tmp;
  }

  // interpolate players
  PLAYER_ANIM_BINDING.tick(
    state.replica.keyframes.player,
    tick,
    deltaTick,
    playerIndex,
  );
  PLAYER_ANIM_BINDING.interpolate.skin(playerIndex, state.replica.players);
  PLAYER_ANIM_BINDING.interpolate.replica(playerIndex, [state.secret.replica]);

  // interpolate world animations
  WORLD_ANIM_BINDING.tick(
    state.replica.keyframes.world,
    tick,
    deltaTick,
    worldIndex,
  );
  WORLD_ANIM_BINDING.interpolate.environment(
    worldIndex,
    state.replica.environment,
  );
}
