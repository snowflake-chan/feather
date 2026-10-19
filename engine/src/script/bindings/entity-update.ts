import { ScriptEntityUpdate, compareNum } from './entity-synchronizer';
import { GameServerState } from '../../game-server-schema';
import { ScriptSynchronizer, ScriptSyncPatch } from './synchronizer';
import { MuSchema } from '@box/mudb/schema';
import { sortedArrayDelete } from '@box/utils/sorted-array-remove';
import { TaggedId, compareId, zipId } from '@box/utils/id';
import { NetModelSchema } from '@box/schema/mesh/model-schema';
import {
  RigidBodyBinding,
  ModelBinding,
  PlayerBinding,
  PlayerDisplayBinding,
  PlayerServerBinding,
  PlayerReplicaBinding,
  DamageBinding,
  ParticleBinding,
  InteractBinding,
  SoundBinding,
  PlayerSoundBinding,
  EntityNameBinding,
} from './entity-bindings';
import { vec3, quat } from 'gl-matrix';
import { DamageSchema } from '@box/schema/damage/damage-schema';
import { ServerParticleEntitySchema } from '../../particle/particle-server-state';
import {
  PlayerAttachmentStateSchema,
  BodyPart,
  PlayerAttachment,
  PlayerAttachmentSchema,
} from '@box/schema/player/player-schema';
import { InteractComponentSchema } from '@box/schema/interact/interact-protocol';
import { ServerEntitySoundEffectSchema } from '../../sound/server-sound-state';
import { CollisionFilterSchema } from '@box/schema/physics/collision-filter';
import {
  destroyEntityId,
  clearDestroyedEntity,
} from '../../entity/entity-controller';
import { EntityNameComponentSchema } from '@box/schema/entity-name/entity-name';

function createComponent<Synchronizer extends ScriptSynchronizer<any, any>>(
  synchronizer: Synchronizer,
  patch: ScriptSyncPatch,
) {
  const result = synchronizer.engineSchema.clone(
    synchronizer.engineSchema.identity,
  );
  synchronizer.synchronize(result, patch);
  result.id = patch.id;
  return result;
}

export function synchronizeComponent<
  Component extends TaggedId,
  Schema extends MuSchema<Component>,
>(
  synchronizer: ScriptSynchronizer<any, Schema>,
  component: Component[],
  patch: ScriptSyncPatch[],
  deleted: { [id: number]: boolean },
) {
  let cptr = 0;
  let pptr = 0;
  const numComponent = component.length;
  while (cptr < numComponent && pptr < patch.length) {
    const c = component[cptr];
    const p = patch[pptr];
    if (c.id < p.id) {
      cptr++;
    } else if (p.id < c.id) {
      if (!deleted[p.id]) {
        component.push(createComponent(synchronizer, p));
      }
      pptr++;
    } else {
      synchronizer.synchronize(c, p);
      cptr++;
      pptr++;
    }
  }
  while (pptr < patch.length) {
    const x = patch[pptr++];
    if (!deleted[x.id]) {
      component.push(createComponent(synchronizer, x));
    }
  }
  if (component.length !== numComponent) {
    component.sort(compareId);
  }
}

export function applyScriptEntityUpdates(
  updates: ScriptEntityUpdate,
  state: GameServerState,
) {
  // Apply all new entity creation operations
  const entities = state.entity.entities;
  const createdEntities = updates.createdEntities;

  if (createdEntities.length > 0) {
    const needsSort =
      entities.length > 0 && entities[entities.length - 1] < createdEntities[0];

    for (let i = 0; i < createdEntities.length; ++i) {
      entities.push(createdEntities[i]);
    }

    // sort after appending new entities
    if (needsSort) {
      entities.sort(compareNum);
    }

    state.entity.counter = Math.max(
      state.entity.counter,
      entities[entities.length - 1] >> 1,
    );
  }

  // synchronize entity deletes
  for (let i = 0; i < updates.deletedEntities.length; ++i) {
    destroyEntityId(state, updates.deletedEntities[i]);
  }

  // track all deleted entity ids
  const deletedEntities = state.entity.deletedEntities;

  // Synchronize rigid body
  synchronizeComponent(
    RigidBodyBinding,
    state.bodies,
    updates.bodies,
    deletedEntities,
  );

  // Synchronize damage
  sortedArrayDelete(DamageSchema, state.replica.damage, updates.deletedDamage);
  synchronizeComponent(
    DamageBinding,
    state.replica.damage,
    updates.damage,
    deletedEntities,
  );

  // Synchronize models
  sortedArrayDelete(
    NetModelSchema,
    state.replica.models,
    updates.deletedModels,
  );
  synchronizeComponent(
    ModelBinding,
    state.replica.models,
    updates.models,
    deletedEntities,
  );

  // Synchronize particles
  sortedArrayDelete(
    ServerParticleEntitySchema,
    state.particles.entities,
    updates.deletedParticles,
  );
  synchronizeComponent(
    ParticleBinding,
    state.particles.entities,
    updates.particles,
    deletedEntities,
  );

  // Synchronize player components
  synchronizeComponent(
    PlayerBinding,
    state.players,
    updates.players,
    deletedEntities,
  );
  synchronizeComponent(
    PlayerDisplayBinding,
    state.replica.players,
    updates.playerDisplay,
    deletedEntities,
  );
  synchronizeComponent(
    PlayerServerBinding,
    state.serverPlayers,
    updates.serverPlayer,
    deletedEntities,
  );
  synchronizeComponent(
    PlayerReplicaBinding,
    state.secrets,
    updates.playerReplicas,
    deletedEntities,
  );

  // synchronize interactive components
  sortedArrayDelete(
    InteractComponentSchema,
    state.replica.interactive,
    updates.deletedInteractive,
  );
  synchronizeComponent(
    InteractBinding,
    state.replica.interactive,
    updates.interactive,
    deletedEntities,
  );
  sortedArrayDelete(
    EntityNameComponentSchema,
    state.replica.entityName,
    updates.deletedEntityName,
  );
  synchronizeComponent(
    EntityNameBinding,
    state.replica.entityName,
    updates.entityName,
    deletedEntities,
  );

  // synchronize sound components
  sortedArrayDelete(
    ServerEntitySoundEffectSchema,
    state.sound.entity,
    updates.deletedSound,
  );
  synchronizeComponent(
    SoundBinding,
    state.sound.entity,
    updates.sound,
    deletedEntities,
  );
  synchronizeComponent(
    PlayerSoundBinding,
    state.sound.player,
    updates.playerSound,
    deletedEntities,
  );

  // set dirty flags on entity sound
  state.sound.entityDirty =
    state.sound.entityDirty ||
    updates.sound.length > 0 ||
    updates.deletedSound.length > 0 ||
    updates.deletedEntities.length > 0;
  state.sound.playerDirty =
    state.sound.playerDirty ||
    updates.playerSound.length > 0 ||
    updates.deletedEntities.length > 0;

  // synchronize wearables
  zipId(
    ({ wearables }, player) => {
      if (player.id in state.entity.deletedEntities) {
        return;
      }

      // clear previous wearable state
      PlayerAttachmentStateSchema.assign(
        player.attachments,
        PlayerAttachmentStateSchema.identity,
      );

      // update wearables
      for (let i = 0; i < wearables.length; ++i) {
        const wearable = wearables[i];
        const bodyPart = BodyPart[wearable.part];
        const slot: PlayerAttachment[] = player.attachments[bodyPart];
        if (!slot) {
          continue;
        }

        const attachment = PlayerAttachmentSchema.alloc();
        attachment.meshId = wearable.meshId;
        attachment.red = wearable.red;
        attachment.blue = wearable.blue;
        attachment.green = wearable.green;
        attachment.emissive = wearable.emissive;
        attachment.metalness = wearable.metalness;
        attachment.shininess = wearable.shininess;
        vec3.copy(attachment.offset, wearable.offset);
        vec3.copy(attachment.scale, wearable.scale);
        quat.copy(attachment.orientation, wearable.orientation);
        slot.push(attachment);
      }
    },
    updates.wearableUpdates,
    state.replica.players,
  );

  // clear deletedEntities
  clearDestroyedEntity(state);

  if (updates.needsCollisionFilterUpdate) {
    state.filterChanged = true;
    state.filter = CollisionFilterSchema.assign(
      state.filter,
      updates.collisionFilter,
    );
  }
}
