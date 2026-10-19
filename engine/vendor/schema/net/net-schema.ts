import {
  MuStruct,
  MuUint32,
  MuSortedArray,
  MuUint16,
  MuUint8,
  MuSchema,
  MuUTF8,
  MuArray,
  MuVoid,
  MuBoolean,
  MuVarint,
  MuRelativeVarint,
  MuQuantizedFloat,
  MuDictionary,
} from '@box/mudb/schema';
import {
  PhysicsParamsSchema,
  RigidBodySetSchema,
  PhysicsPositionSchema,
  CubeAxisSchema,
  PhysicsPositionComponentSchema,
} from '../physics/physics-schema';
import { PlayerSetSchema, PlayerInputSetSchema } from '../player/player-schema';
import { DeltaListSchema, DeltaSchema } from './delta-schema';
import { compareId } from '@box/utils/id';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { ScriptSentEventSchema } from '../events/script-events';
import { CollisionFilterSchema } from '../physics/collision-filter-schema';
import {
  PhysicsZoneSetSchema,
  ZoneSelectorGroupSetSchema,
} from '../zone/zone-schema';
import {
  PlayerSkinHashSchema,
  PlayerLoginState,
} from '../player/player-schema';
import { EnvironmentZoneSetSchema } from '../zone/zone-schema';
import { GameReplicaSchema } from '../replica/game-replica';
import { GamePrivateReplicaSchema } from '../replica/game-private-replica';
import { UserIdSchema } from '../permissions/permission-rda';
import { ClientKeyboardEventSchema } from '../events/client-keyboard-event-schema';

export const MAX_CLIENT_INPUT_ENTITIES = 32;
export const MAX_INPUT_EVENTS = 256;

export const PUBLIC_BUFFER_DIVISOR = 4;

export const NetStateSchema = new MuStruct({
  players: PlayerSetSchema,
  playerInputs: PlayerInputSetSchema,
  physics: PhysicsParamsSchema,
  bodies: RigidBodySetSchema,
  collisionFilter: CollisionFilterSchema,
  zones: PhysicsZoneSetSchema,
  zoneSelectors: ZoneSelectorGroupSetSchema,
});

export type NetState = typeof NetStateSchema.identity;

export const NetPositionCorrectionSchema = new MuStruct({
  id: new MuVarint(),

  px: PhysicsPositionComponentSchema,
  py: PhysicsPositionComponentSchema,
  pz: PhysicsPositionComponentSchema,

  vx: PhysicsPositionComponentSchema,
  vy: PhysicsPositionComponentSchema,
  vz: PhysicsPositionComponentSchema,
});

export type NetPositionData = typeof NetPositionCorrectionSchema.identity;

export const NetPositionCorrectionSetSchema = new MuSortedArray(
  NetPositionCorrectionSchema,
  Infinity,
  compareId,
);

export type NetPositionCorrectionSet =
  typeof NetPositionCorrectionSetSchema.identity;

// input from a client to the server
export enum NetInputEventBits {
  ACTION0 = 1 << 0,
  ACTION1 = 1 << 1,
  JUMP = 1 << 2,
  WALK = 1 << 3,
  CROUCH = 1 << 4,
  RUN = 1 << 5,
  DOUBLE_JUMP = 1 << 6,
  FLY = 1 << 7,
}

export const NetInputEventSchema = new MuStruct({
  // Time input occured
  tick: new MuQuantizedFloat(1 / 64),

  // position of player
  position: PhysicsPositionSchema,

  // ray cast info
  rayTime: new MuQuantizedFloat(1 / 256, -1),
  rayHitEntity: new MuVarint(0),
  rayHitVoxelX: new MuVarint(0),
  rayHitVoxelY: new MuVarint(0),
  rayHitVoxelZ: new MuVarint(0),
  rayHitNormal: CubeAxisSchema,
  rayOrigin: PhysicsPositionSchema,
  rayDirection: new QuantizedVec3Schema(1 / 1024),

  // state of all pressed buttons
  buttonState: <MuSchema<NetInputEventBits>>new MuUint8(0),
  prevButtonState: <MuSchema<NetInputEventBits>>new MuUint8(0),
});
export type NetInputEvent = typeof NetInputEventSchema.identity;

export const NetClientInputSchema = new MuStruct({
  // input variables
  inputState: new MuUint16(0),
  inputAngle: new MuUint8(0),
  inputPitch: new MuUint8(0),
  inputCameraAngle: new MuUint8(0),

  // player body inputs
  bodies: new MuSortedArray(NetPositionCorrectionSchema, Infinity, compareId),
});

export type NetClientInput = typeof NetClientInputSchema.identity;

export const TimestampedClientInputSchema = new MuStruct({
  tick: new MuRelativeVarint(0),
  input: NetClientInputSchema,
  pauseCounter: new MuRelativeVarint(0),
  events: new MuArray(NetInputEventSchema, Infinity),
});

export type TimestampedClientInput =
  typeof TimestampedClientInputSchema.identity;

// network state
// Input tagged by entity id
export const TaggedNetClientInputSchema = new MuStruct({
  id: new MuVarint(0),
  input: NetClientInputSchema,
});

export type TaggedNetClientInput = typeof TaggedNetClientInputSchema.identity;

// complete network input
export const NetInputSchema = new MuStruct({
  // client inputs
  clients: new MuSortedArray(TaggedNetClientInputSchema, Infinity),

  // server corrections
  playerDelta: DeltaListSchema(PlayerSetSchema),
  bodyDelta: DeltaListSchema(RigidBodySetSchema),
  physicsDelta: DeltaSchema(PhysicsParamsSchema),

  // if set, update collision filter schema
  filterChanged: new MuBoolean(false),
  filter: CollisionFilterSchema,

  // zone updates
  zoneChanged: new MuBoolean(false),
  zones: PhysicsZoneSetSchema,
  zoneSelectors: ZoneSelectorGroupSetSchema,
});

export type NetInput = typeof NetInputSchema.identity;

export enum NetMessageType {
  PUBLIC = 0,
  SECRET = 1,

  // bit mask stuff
  SHIFT = 1,
  MASK = (1 << SHIFT) - 1,
}

export const ClientScriptSrcSchema = new MuDictionary(new MuUTF8(), Infinity);

export const NetProtocolSchema = {
  name: 'game-net',
  client: {
    scriptEvents: ScriptSentEventSchema,
    exceedUserLimit: new MuVarint(0),
    kickSessionReason: new MuUint8(0),
    syncClientScriptModules: ClientScriptSrcSchema,
  },
  server: {
    join: new MuVoid(),
    synchronize: new MuVoid(),
    acknowledge: new MuUint32(),
    unpause: new MuUint32(),
    pause: new MuVoid(),
    input: TimestampedClientInputSchema,
    sendKeyBoardEvent: ClientKeyboardEventSchema,
  },
};

// client specific info
export const NetSecretSchema = new MuStruct({
  id: new MuVarint(0),

  userId: UserIdSchema,
  userName: new MuUTF8(),
  userAvatar: new MuUTF8(),
  avatarSkin: PlayerSkinHashSchema,

  loginState: <MuSchema<PlayerLoginState>>new MuUint8(PlayerLoginState.UNKNOWN),

  onlineInfo: new MuStruct({
    onlineCount: new MuVarint(),
    offlineCount: new MuVarint(),
  }),

  // pause counters
  netPaused: new MuBoolean(true),

  // player environment zones
  environmentZones: EnvironmentZoneSetSchema,

  // replicated state
  replica: GamePrivateReplicaSchema,
});

// public, global replica info
export const NetPublicSchema = new MuStruct({
  // Current simulation tick
  tick: new MuRelativeVarint(0),

  // Frameskip
  frameSkip: new MuRelativeVarint(0),

  // Player state
  state: NetStateSchema,

  // Replicated state
  replica: GameReplicaSchema,
});
export type NetPublic = typeof NetPublicSchema.identity;

export function compareNetPublic(x: NetPublic, y: NetPublic) {
  return x.tick - y.tick;
}

export const NetPublicSetSchema = new MuSortedArray(
  NetPublicSchema,
  Infinity,
  compareNetPublic,
);
