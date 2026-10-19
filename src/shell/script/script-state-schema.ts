import { NetStateSchema } from '@box/schema/net/net-schema';
import { GamePrivateReplicaSchema } from '@box/schema/replica/game-private-replica';
import { ChatEventSchema } from '@box/schema/events/chat-event-schema';
import { PhysicsEventSchema } from '@box/schema/events/physics-event-schema';
import { MuSortedArray, MuUint32, MuStruct, MuVarint } from '@box/mudb/schema';
import { ServerPlayerListSchema } from '../player/player-server-schema';
import { ScriptNetInputSetSchema } from '@box/schema/events/net-events';
import { compareId } from '@box/utils/id';
import { RespawnEventSetSchema } from '@box/schema/events/damage-event-schema';
import { NetModelSetSchema } from '@box/schema/mesh/model-schema';
import { EnvironmentParamSchema } from '@box/schema/environment/environment-schema';
import { PlayerDisplaySetSchema } from '@box/schema/player/player-schema';
import { DamageSetSchema } from '@box/schema/damage/damage-schema';
import { ContactIndexSchema } from '@box/schema/physics/physics-schema';
import { ServerParticleSetSchema } from '../particle/particle-server-state';
import { InteractiveEventSetSchema } from '../interact/interact-server-state';
import { InteractComponentSetSchema } from '@box/schema/interact/interact-protocol';
import { DialogEventSetSchema } from '../dialog/dialog-server-schema';
import { ServerSoundStateSchema } from '../sound/server-sound-state';
import { RemoteChannelEventsSchema } from '@box/schema/events/remote-channel-event-schema';
import { ClientKeyboardEventsSchema } from '@box/schema/events/client-keyboard-event-schema';
import { EntityNameComponentSetSchema } from '@box/schema/entity-name/entity-name';

export const ScriptEventsSchema = new MuStruct({
  chatEvents: ChatEventSchema,
  physicsEvents: PhysicsEventSchema,
  inputEvents: ScriptNetInputSetSchema,
  respawnEvents: RespawnEventSetSchema,
  interactEvents: InteractiveEventSetSchema,
  dialogEvents: DialogEventSetSchema,
  remoteChannelEvents: RemoteChannelEventsSchema,
  keyboardEvents: ClientKeyboardEventsSchema,
});
export type ScriptEvents = typeof ScriptEventsSchema.identity;

export const ScriptStateSnapshotSchema = new MuStruct({
  tick: new MuUint32(),
  entities: new MuSortedArray(new MuUint32(), Infinity, (a, b) => a - b),
  entityCounter: new MuVarint(),
  net: NetStateSchema,
  environment: EnvironmentParamSchema,
  contact: ContactIndexSchema,
  models: NetModelSetSchema,
  players: PlayerDisplaySetSchema,
  particles: ServerParticleSetSchema,
  damage: DamageSetSchema,
  serverPlayers: ServerPlayerListSchema,
  playerReplicas: new MuSortedArray(
    GamePrivateReplicaSchema,
    Infinity,
    compareId,
  ),
  interact: InteractComponentSetSchema,
  sound: ServerSoundStateSchema,
  entityName: EntityNameComponentSetSchema,
});
export type ScriptStateSnapshot = typeof ScriptStateSnapshotSchema.identity;
