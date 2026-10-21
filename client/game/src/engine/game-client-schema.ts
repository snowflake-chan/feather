import {
  MuStruct,
  MuBoolean,
  MuSchema,
  MuUint8,
  MuFloat64,
  MuUint32,
  MuVarint,
  MuUTF8,
  MuArray,
  MuDictionary,
} from '@box/mudb/schema';
import {
  PhysicsParamsSchema,
  ContactIndexSchema,
  RigidBodySetSchema,
} from '@box/schema/physics/physics-schema';
import {
  PlayerSetSchema,
  PlayerInputSetSchema,
  PlayerIndexSchema,
} from '@box/schema/player/player-schema';
import { SettingsSchema } from './settings/settings-schema';
import { CameraSchema } from '@box/schema/camera/camera-schema';
import { GLPostSchema } from './gl/schema/gl-post-schema';
import { VoxelCollisionSchema } from '@box/schema/voxel/voxel-collision-schema';
import { GLShadowStateSchema } from './gl/schema/gl-shadow-schema';
import { LightStateSchema } from './voxel/light-schema';
import { GLStateSchema } from './gl/schema/gl-schema';
import { GLVoxelStateSchema } from './voxel/gl-voxel/gl-voxel-schema';
import { MeshCacheSchema } from './mesh/renderable-schema';
import { GLSkySchema } from './environment/gl-sky-schema';
import { GameLocalsSchema } from './game-local-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { ContentResolver } from '@box/content-server/content-fetch';
import { OverlayStateSchema } from './overlay/overlay-schema';
import { VoxelView } from '@box/utils/voxel';
import { GameDOMSchema } from './overlay/dom-schema';
import { ClientEventSchema } from '@box/schema/events/client-event-schema';
import {
  IKAnimationListSchema,
  IKPaletteSchema,
} from '@box/schema/animation/ik-schema';
import { ClientClockStateSchema } from './clock/clock-client-schema';
import { ClientVoxelStateSchema } from './voxel/voxel-client-schema';
import { InputStateSchema } from '@box/schema/input/input-schema';
import { GameReplicaSchema } from '@box/schema/replica/game-replica';
import { NetClientStateSchema } from './net/net-client-state';
import {
  ClientScriptSrcSchema,
  NetSecretSchema,
} from '@box/schema/net/net-schema';
import { EffectSchema } from './effect/effect-schema';
import {
  ClientModelListSchema,
  ClientModelStateSchema,
} from './mesh/client-model-schema';
import { UI3DStateSchema } from './ui3d/ui3d-schema';
import { Logger } from '@box/utils/logger';
import { PerfSchema } from './perf/perf-client-schema';
import {
  EnvironmentParamSchema,
  EnvironmentStateSchema,
} from '@box/schema/environment/environment-schema';
import { ChatBubbleListSchema } from './chat/chat-client-schema';
import {
  BlockIndexSchema,
  BlockInfoSchema,
} from '@box/schema/voxel/block-schema';
import { HashSchema } from '@box/schema/content-server/index';
import type { ClientConfig } from '../config/client';
import { ClientParticleStateSchema } from './particle/particle-client-state';
import { ClientSoundStateSchema } from './sound/client-sound-state';
import { InteractClientStateSchema } from './interact/interact-client-state';
import { ClientDialogStateSchema } from './dialog/dialog-client-state';
import { CollisionFilterSchema } from '@box/schema/physics/collision-filter';
import { LoadingController } from '@box/utils/loading/loading-controller';
import { HyperLinkSchema } from './href/href-client-state';
import {
  PhysicsZoneSetSchema,
  ZoneSelectorGroupSetSchema,
} from '@box/schema/zone/zone-schema';
import { PhysicsZoneIndex } from '@box/schema/physics/zone-index';
import { ChatSchema, GlobalNoticeSchema } from '@box/schema/chat/chat-schema';
import { KeyframeClientStateSchema } from './keyframes/keyframe-client-schema';
import { GUISchema } from './gui/gui-schema';
import { NavigatorSchema } from '@box/schema/navigator/navigator-schema';
import { GLOutlineStateSchema } from './gl/schema/gl-outline';
import { ClientScriptStateSchema } from './script/schema';
import { ResourcesSchema } from './resource/schema';
import { GPUStateSchema } from './gpu/schema/gpu-schema';
import { GPUSkySchema } from './gpu/schema/gpu-sky';
import { WorkerSchema } from './voxel/voxel-worker-schema';
import { GPUVoxelStateSchema } from './voxel/gpu-voxel/gpu-voxel-schema';
import { GPUOverlayStateSchema } from './overlay/gpu-overlay-schema';
import { GPUPostSchema } from './gpu/schema/gpu-post-schema';
import { GLParticleSchema } from './particle/gl-particle/gl-particle-schema';
import { GPUParticleSchema } from './particle/gpu-particle/gpu-particle-schema';
import { GPUShadowStateSchema } from './gpu/schema/gpu-shadow-schema';
import { GPUOutlineStateSchema } from './gpu/schema/gpu-outline';
import { RenderBoxSetSchema } from '@box/schema/render-box/schema';
import type { ResourceController } from './resource';

// Current state of application client
export enum GameClientAppState {
  CONNECTING,
  PRECONNECTED,
  CONNECTED,
  DISCONNECT,
}

// TODO duplicated
export enum CloseType {
  Normal,
  Webgl,
  Server,
  Network,
  Max,
  NoAuth,
  NeedLogin,
  LinkExpired,
  TimeRestriction,
}

export const GameClientStateSchema = new MuStruct({
  // application state
  loadEvents: <MuSchema<LoadingController>>new MuRefSchema<LoadingController>(),
  loadFinished: new MuBoolean(false),
  ready: new MuBoolean(false),
  firstFrame: new MuBoolean(true),
  idle: new MuBoolean(false),
  appState: <MuSchema<GameClientAppState>>(
    new MuUint8(GameClientAppState.CONNECTING)
  ),
  headless: new MuBoolean(true),
  frameCount: new MuUint32(0),
  enginePreconnectTimeStamp: new MuFloat64(),
  engineStartTimestamp: new MuFloat64(),

  prevRunning: new MuBoolean(false),
  prevSync: new MuBoolean(false),

  // hide UI admin的状态栏
  hideUI: new MuBoolean(false),

  // client config
  config: <MuSchema<ClientConfig>>new MuRefSchema<ClientConfig>(),

  // replicated data
  replica: GameReplicaSchema, // global replicated data
  local: GameLocalsSchema, // client specific replicated data
  secret: NetSecretSchema,

  // network replay buffer
  net: NetClientStateSchema,

  // user input structures
  input: InputStateSchema,

  // content service
  content: <MuSchema<ContentResolver>>new MuRefSchema<ContentResolver>(),

  // logging
  logger: <MuSchema<Logger>>new MuRefSchema<Logger>(),

  // Profiling
  enableProfiling: new MuBoolean(false),
  perf: PerfSchema,

  // Game settings
  settings: SettingsSchema,

  // DOM elements
  dom: GameDOMSchema,
  overlays: OverlayStateSchema,
  chatBubble: ChatBubbleListSchema,
  lastFrameClock: new MuFloat64(1e32),

  // GUI state
  gui: GUISchema,

  // WebGL state
  gl: GLStateSchema,
  sky: GLSkySchema,
  postProcess: GLPostSchema,
  shadow: GLShadowStateSchema,
  voxelMesh: GLVoxelStateSchema,
  outline: GLOutlineStateSchema,
  glParticles: GLParticleSchema,

  // WebGPU state
  gpu: GPUStateSchema,
  gpuSky: GPUSkySchema,
  gpuVoxelMesh: GPUVoxelStateSchema,
  gpuPostProcess: GPUPostSchema,
  gpuShadow: GPUShadowStateSchema,
  gpuParticles: GPUParticleSchema,
  gpuOutline: GPUOutlineStateSchema,

  gpuOverlays: GPUOverlayStateSchema,

  // WebGL and WebGPU state
  modelCache: MeshCacheSchema,
  voxelWorker: WorkerSchema,
  light: LightStateSchema,

  // sound
  sound: ClientSoundStateSchema,

  // particles
  particles: ClientParticleStateSchema,

  // client side computed model state
  modelInfo: ClientModelStateSchema,
  opaqueModels: ClientModelListSchema,
  transparentModels: ClientModelListSchema,

  // draw state
  ui3D: UI3DStateSchema,

  // clock stuff
  clock: ClientClockStateSchema,

  // camera state
  camera: CameraSchema,

  // chat
  chat: ChatSchema,

  // environment state
  environmentParams: EnvironmentParamSchema,
  environment: EnvironmentStateSchema,

  // physics state
  physics: PhysicsParamsSchema,
  bodies: RigidBodySetSchema,
  contact: ContactIndexSchema,
  filter: CollisionFilterSchema,
  physicsZones: PhysicsZoneSetSchema,
  zoneSelectors: ZoneSelectorGroupSetSchema,
  zoneIndex: <MuSchema<PhysicsZoneIndex>>new MuRefSchema<PhysicsZoneIndex>(),

  // player state
  prevPlayerInputs: PlayerInputSetSchema,
  playerInputs: PlayerInputSetSchema,
  players: PlayerSetSchema,
  playerIndex: PlayerIndexSchema,

  /**
   * 外观框数据
   * 与物理数据bodies一一对应，每个实体/角色都有一个外观框
   * 用于外观渲染定位，比如实体信息位置，气泡对话位置，模型旋转锚点等
   */
  renderBoxes: RenderBoxSetSchema,

  // dialog state
  dialog: ClientDialogStateSchema,

  // animation state
  animationReady: new MuBoolean(false),
  animationPalette: IKPaletteSchema,
  animations: IKAnimationListSchema,

  // voxel state
  blockInfoHash: HashSchema,
  blockInfo: BlockInfoSchema,
  blockIndex: BlockIndexSchema,
  voxel: <MuSchema<VoxelView>>new MuRefSchema<VoxelView>(),
  paddedVoxels: <MuSchema<VoxelView>>new MuRefSchema<VoxelView>(),
  collision: VoxelCollisionSchema,
  voxelState: ClientVoxelStateSchema,

  // interactive objects
  interact: InteractClientStateSchema,

  // nearby entity name
  nearbyEntityName: new MuArray(new MuVarint(), Infinity, []),

  // keyframes
  keyframes: KeyframeClientStateSchema,

  // special effects
  effects: EffectSchema,

  // events
  events: ClientEventSchema,

  exceedUserLimit: new MuVarint(0),

  // hyperLink
  hyperLink: HyperLinkSchema,

  // server error
  serverError: <MuSchema<CloseType>>new MuUint8(CloseType.Normal),

  // global notice
  globalNotice: GlobalNoticeSchema,

  joinAsCollaborator: new MuBoolean(true),
  inviteLinkGroup: new MuUTF8(''),
  navigator: NavigatorSchema,

  hidePlayers: new MuBoolean(false),

  // client scripts
  // client script state
  clientScript: ClientScriptStateSchema,
  // 客户端脚本
  clientModules: ClientScriptSrcSchema,

  // 资源缓存，比如图片
  resources: ResourcesSchema,
  resourceController: <MuSchema<ResourceController>>(
    new MuRefSchema<ResourceController>()
  ),

  /* --------------------------------- 渲染相关 --------------------------------- */

  /**
   * 是否进行3d渲染。
   * 屏幕内仅渲染 2D 元素时需要。
   * @readonly
   */
  rendering3d: new MuBoolean(true),

  /* -------------------------------------------------------------------------- */
});

export type GameClientState = typeof GameClientStateSchema.identity;
