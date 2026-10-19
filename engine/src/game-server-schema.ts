import {
  MuStruct,
  MuUint32,
  MuSchema,
  MuUTF8,
  MuBoolean,
  MuUint8,
  MuDictionary,
  MuSortedArray,
  MuFloat64,
} from '@box/mudb/schema';
import {
  ContactIndexSchema,
  PhysicsParamsSchema,
  RigidBodySetSchema,
} from '@box/schema/physics/physics-schema';
import { EnvironmentStateSchema } from '@box/schema/environment/environment-schema';
import { ServerPlayerListSchema } from './player/player-server-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { VoxelView } from '@box/utils/voxel';
import { VoxelCollisionSchema } from '@box/schema/voxel/voxel-collision-schema';
import {
  ServerVoxelStateSchema,
  ServerVoxelConnectionSchema,
} from './voxel/voxel-server-schema';
import { HashSchema } from '@box/schema/content-server/index';
import { ContentPerf } from '@box/content-server/content-perf';
import { ServerEventSchema } from '@box/schema/events/server-event-schema';
import { MuSessionId } from '@box/mudb/socket/socket';
import { ServerClockStateSchema } from './clock/clock-server-schema';
import {
  PlayerSetSchema,
  PlayerInputSetSchema,
  PlayerLoginState,
} from '@box/schema/player/player-schema';
import {
  NetServerStateSchema,
  NetServerConnectionSchema,
} from './net/net-server-state';
import { GameReplicaSchema } from '@box/schema/replica/game-replica';
import { GameSessionDataSchema } from '@box/schema/session/schema';
import { SeedStateSchema } from './seed/seed-schema';
import { HotProjectSchema } from '@box/schema/project/hot-schema';
import { Logger } from '@box/utils/logger';
import { compareId } from '@box/utils/id';
import {
  GameServerScriptStateSchema,
  ScriptSrcSchema,
} from './script/script-schema';
import { EntityStateSchema } from '@box/schema/entity/entity-schema';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import { ServerSettingsSchema } from './settings/server-settings-schema';
import {
  BlockInfoSchema,
  BlockIndexSchema,
} from '@box/schema/voxel/block-schema';
import { ServerParticleStateSchema } from './particle/particle-server-state';
import { ServerModelStateSchema } from './mesh/server-model-schema';
import { ServerSoundStateSchema } from './sound/server-sound-state';
import { InteractServerStateSchema } from './interact/interact-server-state';
import { DialogConnectionSchema } from './dialog/dialog-server-schema';
import { StorageSchema } from './storage/storage-schema';
import { CollisionFilterSchema } from '@box/schema/physics/collision-filter';
import { ServerPerfSchema } from './perf/perf-server-schema';
import { ServerEnvironmentZoneSetSchema } from './zone/zone-server-state';
import {
  PhysicsZoneSetSchema,
  ZoneSelectorGroupSetSchema,
} from '@box/schema/zone/zone-schema';
import { KeyframeServerStateSchema } from './keyframes/keyframe-server-schema';
import { GamePrivateReplicaSetSchema } from '@box/schema/replica/game-private-replica';
import { ChatStateSchema } from './chat/chat-state';

export enum GameConnectionState {
  PENDING,
  CONNECTED,
  CLOSED,
}

export const GameConnectionSchema = new MuStruct({
  // client session id
  sessionId: <MuSchema<MuSessionId>>new MuUTF8(),

  // entity id (non-zero if entity initialized)
  id: new MuUint32(0),

  // login state
  loginState: <MuSchema<PlayerLoginState>>new MuUint8(PlayerLoginState.UNKNOWN),

  // connection state
  state: <MuSchema<GameConnectionState>>(
    new MuUint8(GameConnectionState.PENDING)
  ),

  // session data
  sessionData: GameSessionDataSchema,

  // network data
  net: NetServerConnectionSchema,

  // voxel data
  voxel: ServerVoxelConnectionSchema,

  // dialog state
  dialog: DialogConnectionSchema,

  // timestamp of player joined game
  joinTime: new MuFloat64(0),

  // counted this player for this game, for backend statistics
  playCounted: new MuBoolean(false),
});

export type GameConnection = typeof GameConnectionSchema.identity;

export const GameServerStateSchema = new MuStruct({
  // flag, set to true when server is ready
  ready: new MuBoolean(false),

  // if true, then a synchronize event just fired
  sync: new MuBoolean(false),

  // the running state during the previous tick
  prevRunning: new MuBoolean(false),

  // server settings
  settings: ServerSettingsSchema,

  // system clock
  clock: ServerClockStateSchema,

  // global replicated state
  replica: GameReplicaSchema,

  // replay buffer
  net: NetServerStateSchema,

  // content server
  content: <MuSchema<ContentPerf>>new MuRefSchema<ContentPerf>(),
  ossContent: <MuSchema<ContentPerf>>new MuRefSchema<ContentPerf>(),

  // logger
  logger: <MuSchema<Logger>>new MuRefSchema<Logger>(),

  // entities
  entity: EntityStateSchema,

  // seeds
  seed: SeedStateSchema,

  // client connections
  connections: new MuDictionary(new MuRefSchema<GameConnection>(), Infinity),
  connectionSet: new MuSortedArray(GameConnectionSchema, Infinity, compareId),
  secrets: GamePrivateReplicaSetSchema,

  // environment
  environmentSky: EnvironmentStateSchema,
  environmentZones: ServerEnvironmentZoneSetSchema,

  // physics
  physics: PhysicsParamsSchema,
  bodies: RigidBodySetSchema,
  contact: ContactIndexSchema,

  // collision filter (physics)
  filterChanged: new MuBoolean(false),
  filter: CollisionFilterSchema,

  // physics zones
  physicsZonesChanged: new MuBoolean(false),
  zoneSelectors: ZoneSelectorGroupSetSchema,
  physicsZones: PhysicsZoneSetSchema,

  // models
  modelInfo: ServerModelStateSchema,

  // sound
  sound: ServerSoundStateSchema,

  // particles
  particles: ServerParticleStateSchema,

  // player state
  players: PlayerSetSchema,
  playerInputs: PlayerInputSetSchema,
  serverPlayers: ServerPlayerListSchema,

  // project stuff
  project: HotProjectSchema,

  // voxel
  blockInfoHash: HashSchema,
  blockInfo: BlockInfoSchema,
  blockIndex: BlockIndexSchema,
  voxels: <MuSchema<VoxelView>>new MuRefSchema<VoxelView>(),
  paddedVoxels: <MuSchema<VoxelView>>new MuRefSchema<VoxelView>(),
  collision: VoxelCollisionSchema,
  voxelState: ServerVoxelStateSchema,

  // interact
  interactive: InteractServerStateSchema,

  // keyframe animations
  keyframes: KeyframeServerStateSchema,

  // events
  events: ServerEventSchema,

  // storage events
  storage: StorageSchema,

  // script stuff
  script: GameServerScriptStateSchema,
  scriptSrc: ScriptSrcSchema,

  // banned users
  bannedIP: new MuDictionary(new MuBoolean(false), Infinity),
  banned: new MuDictionary(new MuBoolean(false), Infinity),

  // perf stats
  perf: ServerPerfSchema,
  // chat
  chat: ChatStateSchema,
});

export type GameServerState = typeof GameServerStateSchema.identity;
