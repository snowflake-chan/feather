import { GameServerState } from '../game-server-schema';
import { sortedArrayDelete } from '../utils/sorted-array-remove';
import {
  PlayerSchema,
  PlayerDisplaySchema,
  PlayerInputSchema,
} from '@box/schema/player/player-schema';
import { ServerPlayerSchema } from '../player/player-server-schema';
import {
  RigidBodySchema,
  ContactRecordSchema,
} from '@box/schema/physics/physics-schema';
import { NetModelSchema } from '@box/schema/mesh/model-schema';
import { DamageSchema } from '@box/schema/damage/damage-schema';
import { SeedLinkSchema } from '../seed/seed-schema';
import { getById } from '@box/utils/id';
import { ServerParticleEntitySchema } from '../particle/particle-server-state';
import {
  EntitySoundEffectSchema,
  PlayerSoundEffectSchema,
} from '@box/schema/sound/sound-protocol';
import {
  ServerEntitySoundEffectSchema,
  ServerPlayerSoundEffectSchema,
} from '../sound/server-sound-state';
import { InteractComponentSchema } from '@box/schema/interact/interact-protocol';
import { GamePrivateReplicaSchema } from '@box/schema/replica/game-private-replica';
import { DeletedEntitiesSchema } from '@box/schema/entity/entity-schema';
import { EntityNameComponentSchema } from '@box/schema/entity-name/entity-name';

export function createEntityId(state: GameServerState) {
  const id = ++state.entity.counter << 1;
  state.entity.entities.push(id);
  return id;
}

export function destroyEntityId(state: GameServerState, id: number) {
  if (id) {
    state.entity.pendingDelete.push(id);
    state.entity.deletedEntities[id] = true;
  }
}

export function clearDestroyedEntity(state: GameServerState) {
  // free and reset entity delete entities
  DeletedEntitiesSchema.free(state.entity.deletedEntities);
  state.entity.deletedEntities = DeletedEntitiesSchema.alloc();
}

function removeDeadEntities(array: number[], ids: number[]) {
  if (ids.length === 0) {
    return;
  }
  let head = 0;
  let aptr = 0;
  let iptr = 0;
  while (aptr < array.length && iptr < ids.length) {
    const a = array[aptr];
    const id = ids[iptr];
    if (a < id) {
      array[head++] = a;
      aptr++;
    } else if (id < a) {
      iptr++;
    } else {
      aptr++;
      iptr++;
    }
  }
  while (aptr < array.length) {
    array[head++] = array[aptr++];
  }
  array.length = head;
  return array;
}

function compareNumber(a: number, b: number) {
  return a - b;
}

export function finalizeDestroyedEntities(state: GameServerState) {
  const pendingDelete = state.entity.pendingDelete;

  if (pendingDelete.length > 0) {
    pendingDelete.sort(compareNumber);
    removeDeadEntities(state.entity.entities, pendingDelete);

    sortedArrayDelete(PlayerSchema, state.players, pendingDelete);
    sortedArrayDelete(ServerPlayerSchema, state.serverPlayers, pendingDelete);
    sortedArrayDelete(
      PlayerDisplaySchema,
      state.replica.players,
      pendingDelete,
    );
    sortedArrayDelete(PlayerInputSchema, state.playerInputs, pendingDelete);
    sortedArrayDelete(RigidBodySchema, state.bodies, pendingDelete);
    sortedArrayDelete(NetModelSchema, state.replica.models, pendingDelete);
    sortedArrayDelete(ContactRecordSchema, state.contact, pendingDelete);
    sortedArrayDelete(
      ServerParticleEntitySchema,
      state.particles.entities,
      pendingDelete,
    );
    sortedArrayDelete(DamageSchema, state.replica.damage, pendingDelete);
    sortedArrayDelete(
      ServerEntitySoundEffectSchema,
      state.sound.entity,
      pendingDelete,
    );
    sortedArrayDelete(
      ServerPlayerSoundEffectSchema,
      state.sound.player,
      pendingDelete,
    );
    sortedArrayDelete(
      EntitySoundEffectSchema,
      state.replica.sound.entitySound,
      pendingDelete,
    );
    sortedArrayDelete(
      PlayerSoundEffectSchema,
      state.replica.sound.playerSound,
      pendingDelete,
    );
    sortedArrayDelete(
      InteractComponentSchema,
      state.replica.interactive,
      pendingDelete,
    );
    sortedArrayDelete(
      EntityNameComponentSchema,
      state.replica.entityName,
      pendingDelete,
    );
    sortedArrayDelete(GamePrivateReplicaSchema, state.secrets, pendingDelete);

    // remove seed links
    for (let i = 0; i < pendingDelete.length; ++i) {
      const link = getById(state.seed.entityToSeed, pendingDelete[i]);
      if (link) {
        delete state.seed.seedToEntity[link.seedId];
      }
    }
    sortedArrayDelete(SeedLinkSchema, state.seed.entityToSeed, pendingDelete);

    pendingDelete.length = 0;
  }
}
