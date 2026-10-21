import { MuStruct, MuBoolean } from '@box/mudb/schema';
import { EnvironmentParamSchema } from '../environment/environment-schema';
import { NetModelSetSchema } from '../mesh/model-schema';
import { PlayerDisplaySetSchema } from '../player/player-schema';
import { DamageSetSchema } from '../damage/damage-schema';
import { ParticleReplicaSchema } from '../particle/particle-schema';
import { InteractComponentSetSchema } from '../interact/interact-protocol';
import { EntityNameComponentSetSchema } from '../entity-name/entity-name';
import { SoundReplicaSchema } from '../sound/sound-protocol';
import { KeyframeReplicaSchema } from '../keyframes/keyframe-schema';
import { EntitySetSchema } from '../entity/entity-schema';

// -----------------------------------------------------------------
// Server to client replicated state
//  This data gets written by the server and is automatically pushed out to all clients
//  whenever something changes.
//
//  Clients use whatever the most recent version of the replica they received
// ----------------------------------------------------------------
export const GameReplicaSchema = new MuStruct({
  // running state
  running: new MuBoolean(false),

  // sync
  sync: new MuBoolean(false),

  // Environment state
  environment: EnvironmentParamSchema,

  // Model state
  models: NetModelSetSchema,

  // player display
  players: PlayerDisplaySetSchema,

  // particles
  particles: ParticleReplicaSchema,

  // damage component
  damage: DamageSetSchema,

  // interactive objects
  interactive: InteractComponentSetSchema,

  // entityName objects
  entityName: EntityNameComponentSetSchema,

  // sound
  sound: SoundReplicaSchema,

  // keyframes
  keyframes: KeyframeReplicaSchema,

  // entities
  entities: EntitySetSchema,
});

export type GameReplica = typeof GameReplicaSchema.identity;
