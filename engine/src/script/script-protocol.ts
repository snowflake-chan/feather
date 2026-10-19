import {
  MuUTF8,
  MuStruct,
  MuVarint,
  MuArray,
  MuUnion,
  MuVoid,
  MuSchema,
  MuSortedArray,
  MuUint32,
  MuBoolean,
  MuASCII,
  MuFloat64,
  MuFloat32,
  MuUint8,
  MuInt32,
} from '@box/mudb/schema';
import { ParsedErrorSchema } from '@box/schema/debugger-console/schema';
import { VoxelCollisionBoxListSchema } from '@box/schema/utils/rbush-schema';
import { VoxelWriteSchema } from '@box/schema/voxel/voxel-protocol';
import { ScriptEntityUpdateSchema } from './bindings/entity-synchronizer';
import { GameLogLevel } from '@box/schema/api/console';
import { ScriptWorldUpdateSchema } from './bindings/world-synchronizer';
import {
  ScriptStateSnapshotSchema,
  ScriptEventsSchema,
} from './script-state-schema';
import { LogMessageSchema } from '@box/utils/logger';
import { ScriptVoxelUpdateSchema } from './bindings/voxel-synchronizer';
import { compareId } from '@box/utils/id';
import { ScriptResourceSchema } from './bindings/resource';
import { ScriptSentEventSchema } from '@box/schema/events/script-events';
import { BlockInfoSchema } from '@box/schema/voxel/block-schema';
import { DialogConfigSchema } from '@box/schema/dialog/dialog-protocol';
import { PlaySoundPositionSchema } from '@box/schema/sound/sound-protocol';
import { MAX_BODIES } from '@box/schema/physics/physics-solve';
import { ZoneSetRDA } from '@box/schema/project/project-rda';
import { ScriptZoneUpdateSchema } from './bindings/zone-synchronizer';
import { WORLD_ANIM_BINDING } from '@box/schema/keyframes/bindings/world-animation';
import { ENTITY_ANIM_BINDING } from '@box/schema/keyframes/bindings/entity-animation';
import { PLAYER_ANIM_BINDING } from '@box/schema/keyframes/bindings/player-animation';

export const ScriptPerfCounterSchema = new MuStruct({
  // entities
  entitiesCreated: new MuVarint(),
  entitiesDestroyed: new MuVarint(),
  entitiesLive: new MuVarint(),

  // players
  playersCreated: new MuVarint(),
  playersDestroyed: new MuVarint(),
  playersLive: new MuVarint(),

  // zones
  zonesCreated: new MuVarint(),
  zonesDestroyed: new MuVarint(),
  zonesLive: new MuVarint(),

  // animations
  animationsCreated: new MuVarint(),
  animationsDestroyed: new MuVarint(),
  animationsLive: new MuVarint(),

  // listeners
  dispatchersCreated: new MuVarint(),
  dispatchersDestroyed: new MuVarint(),
  dispatcherEvents: new MuVarint(),
  dispatcherPromises: new MuVarint(),
  dispatcherHandlers: new MuVarint(),

  // scheduler
  pqAllocCount: new MuVarint(),
  pqFreeCount: new MuVarint(),
  pqScheduled: new MuVarint(),
  pqTimeouts: new MuVarint(),
});
export type ScriptPerfCounter = typeof ScriptPerfCounterSchema.identity;

export const ScriptVoxelResetSchema = new MuStruct({
  x: new MuVarint(),
  y: new MuVarint(),
  z: new MuVarint(),
  chunks: new MuArray(VoxelCollisionBoxListSchema, Infinity),
});
export type ScriptVoxelReset = typeof ScriptVoxelResetSchema.identity;

export const ScriptSeedInfoSchema = new MuStruct({
  id: new MuUint32(),
  seed: new MuASCII(),
  name: new MuUTF8(),
  tags: new MuSortedArray(new MuUTF8(), Infinity),
});
export type ScriptSeedInfo = typeof ScriptSeedInfoSchema.identity;

export const ScriptConfigSchema = new MuStruct({
  url: new MuASCII(),
  entityLimit: new MuFloat64(MAX_BODIES - 100),

  animationLimit: new MuFloat64(500),
  keyframeLimit: new MuFloat64(16),

  serverId: new MuUTF8(),
});
export type ScriptConfig = typeof ScriptConfigSchema.identity;

export const SciptCollisionFilterSpecSchema = new MuStruct({
  a: new MuUTF8(),
  b: new MuUTF8(),
});

export const ScriptCollisionSpecSchema = new MuArray(
  SciptCollisionFilterSpecSchema,
  Infinity,
);

export const ScriptInitSchema = new MuStruct({
  // project name
  projectName: new MuUTF8(),
  // group id
  groupId: new MuUTF8(),

  // quotas
  config: ScriptConfigSchema,

  // resources
  resources: ScriptResourceSchema,

  // voxels
  blocks: BlockInfoSchema,
  voxels: ScriptVoxelResetSchema,

  // scripts
  scriptIndex: new MuUTF8(),

  // game state
  state: ScriptStateSnapshotSchema,
  seed: new MuSortedArray(ScriptSeedInfoSchema, Infinity, compareId),

  // initial rules for collision filters
  collisionFilter: ScriptCollisionSpecSchema,

  // script feature flags
  featureFlags: new MuStruct({
    enableTriggerAPI: new MuBoolean(false),
  }),

  // zones
  zones: ZoneSetRDA.stateSchema,
});

export const ScriptVoxelPreTickSchema = new MuUnion(
  {
    reset: ScriptVoxelResetSchema,
    writes: new MuArray(VoxelWriteSchema, Infinity),
    none: new MuVoid(),
  },
  'none',
);

export const ScriptTickSchema = new MuStruct({
  state: ScriptStateSnapshotSchema,
  events: ScriptEventsSchema,
  voxelUpdate: ScriptVoxelPreTickSchema,
});
export type ScriptTickEvent = typeof ScriptTickSchema.identity;

export const ScriptKeyframePostTickSchema = new MuStruct({
  world: WORLD_ANIM_BINDING.syncSchema,
  entity: ENTITY_ANIM_BINDING.syncSchema,
  player: PLAYER_ANIM_BINDING.syncSchema,
});
export type ScriptKeyframePostTick =
  typeof ScriptKeyframePostTickSchema.identity;

export const ScriptPostTickSchema = new MuStruct({
  events: ScriptSentEventSchema,

  entityUpdates: ScriptEntityUpdateSchema,
  zoneUpdates: ScriptZoneUpdateSchema,
  worldUpdates: ScriptWorldUpdateSchema,
  voxelUpdates: ScriptVoxelUpdateSchema,
  animations: ScriptKeyframePostTickSchema,

  perf: ScriptPerfCounterSchema,
});

export type ScriptPostTick = typeof ScriptPostTickSchema.identity;

export const ScriptProtocol = {
  name: 'script-protocol',
  client: {
    start: ScriptInitSchema,
    poll: new MuVoid(),
    /**
     * Eval user script from repl console
     */
    invokeEval: new MuStruct({
      handle: new MuUint32(),
      expr: new MuUTF8(),
    }),
    syncResources: ScriptResourceSchema,
  },
  server: {
    log: new MuArray(
      new MuStruct({
        level: <MuSchema<GameLogLevel>>new MuVarint(GameLogLevel.INFO),
        message: new MuUTF8(),
      }),
      Infinity,
    ),
    clearLog: new MuVoid(),
    systemLogSink: LogMessageSchema,
    chatLog: new MuArray(
      new MuStruct({
        senderId: new MuUint32(0),
        receiverId: new MuUint32(0),
        message: new MuUTF8(),
        duration: new MuInt32(0),
        hideFloat: new MuBoolean(false),
      }),
      Infinity,
    ),
    dialog: new MuStruct({
      playerId: new MuVarint(),
      promiseId: new MuVarint(),
      config: DialogConfigSchema,
    }),
    cancelAllDialogs: new MuVarint(),
    cancelDialog: new MuStruct({
      playerId: new MuVarint(),
      promiseId: new MuVarint(),
    }),
    /**
     * 将错误信息发送给用户控制台
     */
    exception: ParsedErrorSchema,
    postTick: ScriptPostTickSchema,
    replyEval: new MuStruct({
      handle: new MuUint32(),
      success: new MuBoolean(true),
      expr: new MuUTF8(),
    }),
    pump: new MuVoid(),
    sound: new MuStruct({
      soundId: new MuVarint(),
      sample: new MuUTF8(),
      position: PlaySoundPositionSchema,
      pitch: new MuFloat32(),
      gain: new MuFloat32(),
      radius: new MuFloat32(),
    }),
    resumeSound: new MuVarint(),
    pauseSound: new MuVarint(),
    stopSound: new MuVarint(),
    setSoundCurrentTime: new MuStruct({
      soundId: new MuVarint(),
      currentTime: new MuFloat32(),
    }),
    setSoundCurrentTimeAndResume: new MuStruct({
      soundId: new MuVarint(),
      currentTime: new MuFloat32(),
    }),
    kick: new MuVarint(),
    setCameraPitch: new MuStruct({
      playerId: new MuVarint(),
      value: new MuUint8(),
    }),
    setCameraYaw: new MuStruct({
      playerId: new MuVarint(),
      value: new MuUint8(),
    }),
  },
};
