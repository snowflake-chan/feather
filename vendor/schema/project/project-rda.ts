import {
  MuRDAStruct,
  MuRDARegister,
  MuRDAConstant,
  MuRDATypes,
  MuRDAMap,
  MuRDAList,
} from '@box/mudb/rda';
import {
  MuUTF8,
  MuStruct,
  MuUint16,
  MuArray,
  MuFloat32,
  MuFloat64,
  MuBoolean,
  MuASCII,
  MuVarint,
  MuSchema,
  MuQuantizedFloat,
  MuDate,
} from '@box/mudb/schema';
import { HashSchema } from '../content-server/index';
import { vec3, quat } from 'gl-matrix';
import {
  QuantizedVec3Schema,
  QuantizedVec4Schema,
} from '../utils/quantized-schema';
import { Vec3Schema, Vec4Schema } from '../utils/math-schema';
import { DB } from '../backend/database-type';
import { MuRDATree } from './murda-tree';
import { DEFAULT_SCREEN_ID } from './ui-rda/defs';
import { CommonAssets, GroupProjectRDA } from '../group-project/rda';

export * from '../group-project/rda';

export function sizeLimitedStringRDA(defaultValue: string, len: number) {
  return new MuRDARegister(new MuUTF8(defaultValue), (x) => {
    if (x.length < len) {
      return x;
    }
    return x.substr(0, len);
  });
}

export const AssetEntryRDA = new MuRDAStruct({
  ownerId: new MuRDAConstant(new MuVarint(0)),
  /**
   * 上传音频时，会将 contentId 设置为上传时间戳
   * 因此 contentId 也可以作为 createTime 使用
   */
  contentId: new MuRDAConstant(new MuFloat64(0)),
  bounds: new MuRDARegister(Vec3Schema),
  animated: new MuRDAConstant(new MuBoolean(false)),
  ...CommonAssets,
});

export const AssetsRDA = new MuRDAMap(new MuUTF8(), AssetEntryRDA);
export const DeleteAssetsRDA = new MuRDAList(
  new MuRDAStruct({
    key: new MuRDARegister(new MuUTF8()),
    value: AssetEntryRDA,
  }),
);

export type AssetEntry = typeof AssetEntryRDA.stateSchema.identity;
export type AssetEntries = typeof AssetsRDA.stateSchema.identity;

export const VoxelShape = new MuStruct({
  x: new MuUint16(128),
  y: new MuUint16(128),
  z: new MuUint16(128),
});

export type VoxelShape = typeof VoxelShape.identity;

export const VoxelRDA = new MuRDARegister(
  new MuStruct({
    shape: VoxelShape,
    chunks: new MuArray(HashSchema, Infinity),
  }),
);

export type VoxelInfo = MuRDATypes<typeof VoxelRDA>['state'];

export const XYSchema = new MuRDAStruct({
  x: new MuRDARegister(new MuFloat64(0)),
  y: new MuRDARegister(new MuFloat64(0)),
});

export const RGBSchema = new MuStruct({
  r: new MuFloat64(0),
  g: new MuFloat64(0),
  b: new MuFloat64(0),
});

export const RGBASchema = new MuStruct({
  r: new MuFloat64(0),
  g: new MuFloat64(0),
  b: new MuFloat64(0),
  a: new MuFloat64(1),
});

export const XYZSchema = new MuStruct({
  x: new MuFloat64(0),
  y: new MuFloat64(0),
  z: new MuFloat64(0),
});

export const DimsSchema = new MuStruct({
  w: new MuFloat64(0),
  h: new MuFloat64(0),
});

export type XYZType = typeof XYZSchema.identity;

export const AudioSampleRDA = new MuRDAStruct({
  sample: new MuRDARegister(new MuUTF8()),

  radius: new MuRDARegister(new MuFloat32(32)),

  pitch: new MuRDARegister(new MuFloat32(1)),
  pitchRange: new MuRDARegister(new MuFloat32(0)),

  gain: new MuRDARegister(new MuFloat32(1)),
  gainRange: new MuRDARegister(new MuFloat32(0)),
});

export enum AudioSampleEnum {
  Sample = 'track',
  Radius = 'radius',
  Pitch = 'pitch',
  PitchRange = 'pitchRange',
  Gain = 'gain',
  GainRange = 'gainRange',
}

export type AudioSample = (typeof AudioSampleRDA.stateSchema)['identity'];

export enum EnvironmentSkyType {
  NATURAL,
  COLORS,
}

export const SkyRDA = new MuRDAStruct({
  skyType: new MuRDARegister(
    <MuSchema<EnvironmentSkyType>>new MuVarint(EnvironmentSkyType.NATURAL),
  ),
  /**
   * 0-0.6, determines shaded color, camera exposure and voxel light map.
   * Voxel light map will turn off inner AO when set globalLight 0
   */
  globalLight: new MuRDARegister(new MuFloat64(0.3)),

  // natural sky parameters (only used if skyType = NATURAL)
  sunPhase: new MuRDARegister(new MuFloat64(4 / 24)),
  sunFrequency: new MuRDARegister(new MuFloat64(0)),
  /**
   * @deprecated
   * temporarily useless, may be useful in the future.
   */
  lunarPhase: new MuRDARegister(new MuFloat64(0)),

  // light parameters (only used if skyType = COLORS)
  sunDirection: new MuRDARegister(XYZSchema),
  sunColor: new MuRDARegister(RGBSchema),

  skyLeft: new MuRDARegister(RGBSchema),
  skyRight: new MuRDARegister(RGBSchema),
  skyTop: new MuRDARegister(RGBSchema),
  skyBottom: new MuRDARegister(RGBSchema),
  skyFront: new MuRDARegister(RGBSchema),
  skyBack: new MuRDARegister(RGBSchema),

  // gamma
  gamma: new MuRDARegister(new MuFloat32(1.3)),
});

// fog parameters (density, height offset, height fall off, max opacity)
export const FogRDA = new MuRDAStruct({
  fogColor: new MuRDAStruct({
    r: new MuRDARegister(new MuFloat64(1)),
    g: new MuRDARegister(new MuFloat64(1)),
    b: new MuRDARegister(new MuFloat64(1)),
  }),
  fogStartDistance: new MuRDARegister(new MuFloat64(0)), // start distance in voxel units
  fogHeightOffset: new MuRDARegister(new MuFloat64(-8)), // start voxel of fog height
  fogHeightFalloff: new MuRDARegister(new MuFloat64(0.8)), // 0-1 determines fall off rate of height fog, small numbers = more fog
  fogDensity: new MuRDARegister(new MuFloat64(0.0)), // 0-1, uniform fog field density, big numbers = more fog
  maxFog: new MuRDARegister(new MuFloat64(1)), // 0-1, maximum fog density.  big numbers = mode fog
});

export const SnowRDA = new MuRDAStruct({
  texture: new MuRDARegister(new MuUTF8()),
  density: new MuRDARegister(new MuFloat64(1)),
  size: new MuRDARegister(DimsSchema),
  fallSpeed: new MuRDARegister(new MuFloat64(1)),
  spinSpeed: new MuRDARegister(new MuFloat64(0)),
  color: new MuRDARegister(
    new MuStruct({
      r: new MuFloat64(1),
      g: new MuFloat64(1),
      b: new MuFloat64(1),
      a: new MuFloat64(1),
    }),
  ),
});

export const RainRDA = new MuRDAStruct({
  density: new MuRDARegister(new MuFloat64(0)),
  direction: new MuRDARegister(
    new MuStruct({
      x: new MuFloat64(0),
      y: new MuFloat64(1),
      z: new MuFloat64(0),
    }),
  ),
  speed: new MuRDARegister(new MuFloat64(1)),
  size: new MuRDARegister(
    new MuStruct({
      w: new MuFloat64(0.5),
      h: new MuFloat64(0.5),
    }),
  ),
  interference: new MuRDARegister(new MuFloat64(0.04)),
  color: new MuRDARegister(
    new MuStruct({
      r: new MuFloat64(1),
      g: new MuFloat64(1),
      b: new MuFloat64(1),
      a: new MuFloat64(1),
    }),
  ),
});

export const BakedShadowRDA = new MuRDARegister(
  new MuStruct({
    texture: HashSchema,
    data: HashSchema,
    chunkShift: new MuVarint(6),
  }),
);

export type BakedShadow = typeof BakedShadowRDA.stateSchema.identity;

export const EnvironmentRDA = new MuRDAStruct({
  fog: FogRDA,
  sky: SkyRDA,
  snow: SnowRDA,
  rain: RainRDA,
  drawDistance: new MuRDARegister(new MuFloat32(512)),
  bakedShadow: BakedShadowRDA,
});

export const DamageConfigRDA = new MuRDAStruct({
  // hp and damage configuration
  enabled: new MuRDARegister(new MuBoolean(false)),

  // health display
  showHealth: new MuRDARegister(new MuBoolean(true)),
  showDamage: new MuRDARegister(new MuBoolean(true)),

  // health levels
  hp: new MuRDARegister(new MuVarint(100)),
  maxHp: new MuRDARegister(new MuVarint(100)),
});

export const ParticleConfigRDA = new MuRDAStruct({
  // emit parameters
  rate: new MuRDARegister(new MuFloat64(0)),
  rateSpread: new MuRDARegister(new MuFloat64(0)),
  limit: new MuRDARegister(new MuVarint(0)),
  lifetime: new MuRDARegister(new MuFloat64(10)),
  lifetimeSpread: new MuRDARegister(new MuFloat64(0)),

  // color
  color0: new MuRDARegister(RGBSchema),
  color1: new MuRDARegister(RGBSchema),
  color2: new MuRDARegister(RGBSchema),
  color3: new MuRDARegister(RGBSchema),
  color4: new MuRDARegister(RGBSchema),

  // size
  size0: new MuRDARegister(new MuFloat32(1)),
  size1: new MuRDARegister(new MuFloat32(1)),
  size2: new MuRDARegister(new MuFloat32(1)),
  size3: new MuRDARegister(new MuFloat32(1)),
  size4: new MuRDARegister(new MuFloat32(1)),
  sizeSpread: new MuRDARegister(new MuFloat64(0)),

  // dynamics
  velocity: new MuRDARegister(XYZSchema),
  velocitySpread: new MuRDARegister(XYZSchema),
  acceleration: new MuRDARegister(XYZSchema),
  damping: new MuRDARegister(new MuFloat64(0)),
  noiseAmpl: new MuRDARegister(new MuFloat64(0)),
  noiseFreq: new MuRDARegister(new MuFloat64(0)),
});
export type ParticleConfig = (typeof ParticleConfigRDA.stateSchema)['identity'];

export const AmbientSoundRDA = new MuRDAStruct({
  ambient: AudioSampleRDA,

  // other sound effects
  breakVoxel: AudioSampleRDA,
  placeVoxel: AudioSampleRDA,
  playerJoin: AudioSampleRDA,
  playerLeave: AudioSampleRDA,
});

export type AmbientSound = (typeof AmbientSoundRDA.stateSchema)['identity'];

export enum AmbientSoundEnum {
  ambient = 'ambient',
  breakVoxel = 'breakVoxel',
  placeVoxel = 'placeVoxel',
  playerJoin = 'playerJoin',
  playerLeave = 'playerLeave',
}

export const EntitySoundRDA = new MuRDAStruct({
  chat: AudioSampleRDA,
  hurt: AudioSampleRDA,
  die: AudioSampleRDA,
  interact: AudioSampleRDA,
});

export enum EntitySoundEnum {
  chat = 'chat',
  hurt = 'hurt',
  die = 'die',
  interact = 'interact',
}

export type EntitySound = (typeof EntitySoundRDA.stateSchema)['identity'];

export const PlayerSoundRDA = new MuRDAStruct({
  spawn: AudioSampleRDA,
  jump: AudioSampleRDA,
  doubleJump: AudioSampleRDA,
  land: AudioSampleRDA,
  crouch: AudioSampleRDA,
  step: AudioSampleRDA,
  action0: AudioSampleRDA,
  action1: AudioSampleRDA,
  swim: AudioSampleRDA,
  enterWater: AudioSampleRDA,
  leaveWater: AudioSampleRDA,
  startFly: AudioSampleRDA,
  endFly: AudioSampleRDA,
  music: AudioSampleRDA,
});

export enum PlayerSoundEnum {
  spawn = 'spawn',
  jump = 'jump',
  doubleJump = 'doubleJump',
  land = 'land',
  crouch = 'crouch',
  step = 'step',
  action0 = 'action0',
  action1 = 'action1',
  swim = 'swim',
  enterWater = 'enterWater',
  leaveWater = 'leaveWater',
  startFly = 'startFly',
  endFly = 'endFly',
  music = 'music',
}

export type PlayerSound = (typeof PlayerSoundRDA.stateSchema)['identity'];

export const InitialPositionRDA = new MuStruct({
  x: new MuFloat64(64),
  y: new MuFloat64(140),
  z: new MuFloat64(64),
});

export const MovementBoundsRDA = new MuRDAStruct({
  lo: new MuRDAStruct({
    x: new MuRDARegister(new MuFloat64(-50)),
    y: new MuRDARegister(new MuFloat64(-50)),
    z: new MuRDARegister(new MuFloat64(-50)),
  }),
  hi: new MuRDAStruct({
    x: new MuRDARegister(new MuFloat64(178)),
    y: new MuRDARegister(new MuFloat64(178)),
    z: new MuRDARegister(new MuFloat64(178)),
  }),
});

export type MovementBounds = typeof MovementBoundsRDA.stateSchema.identity;

// All player configuration stuff goes in here
export const PlayerRDA = new MuRDAStruct({
  // Camera info
  cameraType: new MuRDARegister(new MuASCII('follow')),

  scale: new MuRDARegister(new MuFloat64(1)),

  // Color LUT
  colorLUT: new MuRDARegister(new MuUTF8()),

  // spawn pount info
  initialPosition: new MuRDARegister(InitialPositionRDA),
  initialYaw: new MuRDARegister(new MuFloat32(0)),
  movementBounds: MovementBoundsRDA,

  // movement parameters
  allowFlight: new MuRDARegister(new MuBoolean(false)),
  allowMove: new MuRDARegister(new MuBoolean(true)),
  allowAction0: new MuRDARegister(new MuBoolean(true)),
  allowAction1: new MuRDARegister(new MuBoolean(true)),
  allowJump: new MuRDARegister(new MuBoolean(true)),
  allowDoubleJump: new MuRDARegister(new MuBoolean(true)),
  allowCrouch: new MuRDARegister(new MuBoolean(true)),
  noClip: new MuRDARegister(new MuBoolean(false)),

  walkSpeed: new MuRDARegister(new MuFloat32(0.22)),
  walkAcceleration: new MuRDARegister(new MuFloat32(0.19)),
  runSpeed: new MuRDARegister(new MuFloat32(0.4)),
  runAcceleration: new MuRDARegister(new MuFloat32(0.35)),
  crouchSpeed: new MuRDARegister(new MuFloat32(0.1)),
  crouchAcceleration: new MuRDARegister(new MuFloat32(0.09)),

  swimSpeed: new MuRDARegister(new MuFloat32(0.4)),
  swimAcceleration: new MuRDARegister(new MuFloat32(0.1)),

  flySpeed: new MuRDARegister(new MuFloat32(2)),
  flyAcceleration: new MuRDARegister(new MuFloat32(2)),

  jumpSpeedFactor: new MuRDARegister(new MuFloat32(0.85)),
  jumpAccelerationFactor: new MuRDARegister(new MuFloat32(0.55)),
  jumpPower: new MuRDARegister(new MuFloat32(0.96)),
  doubleJumpPower: new MuRDARegister(new MuFloat32(0.9)),

  // body parameters
  mass: new MuRDARegister(new MuFloat64(1)),
  friction: new MuRDARegister(new MuFloat64(0)),
  restitution: new MuRDARegister(new MuFloat64(0)),

  // player material properties
  color: new MuRDARegister(
    new QuantizedVec3Schema(1 / 256, vec3.fromValues(1, 1, 1)),
  ),
  emissive: new MuRDARegister(new MuQuantizedFloat(1 / 256)),
  shininess: new MuRDARegister(new MuQuantizedFloat(1 / 256)),
  metalness: new MuRDARegister(new MuQuantizedFloat(1 / 256)),

  // display stuff
  invisible: new MuRDARegister(new MuBoolean(false)),
  showName: new MuRDARegister(new MuBoolean(true)),
  showIndicator: new MuRDARegister(new MuBoolean(false)),

  // player damage
  damage: DamageConfigRDA,

  // entity sounds
  sounds: EntitySoundRDA,
  playerSounds: PlayerSoundRDA,
});

export const EntitySeedRDA = new MuRDAStruct({
  // tags
  name: sizeLimitedStringRDA('', 32),
  tags: new MuRDAList(sizeLimitedStringRDA('', 32)),

  // edit lock state, default value = false
  editLock: new MuRDARegister(new MuBoolean(false)),

  // whether the entity is in the scene when baking shadows, default value = true
  staticShadow: new MuRDARegister(new MuBoolean(true)),

  // rigid body properties
  position: new MuRDARegister(new QuantizedVec3Schema(1 / 256)),
  collision: new MuRDARegister(new MuBoolean(false)),
  gravity: new MuRDARegister(new MuBoolean(false)),
  fixed: new MuRDARegister(new MuBoolean(false)),
  mass: new MuRDARegister(new MuFloat64(1)),
  friction: new MuRDARegister(new MuFloat64(1)),
  restitution: new MuRDARegister(new MuFloat64(0)),
  bounds: new MuRDARegister(Vec3Schema),

  // model properties
  meshId: new MuRDAConstant(new MuFloat64()),
  mesh: new MuRDARegister(new MuUTF8()),
  scale: new MuRDARegister(new QuantizedVec3Schema(1 / 256)),
  orientation: new MuRDARegister(
    <MuSchema<quat>>(<any>new QuantizedVec4Schema(1 / 256)),
  ),
  tint: new MuRDARegister(Vec4Schema),
  metalness: new MuRDARegister(new MuFloat64(0)),
  shininess: new MuRDARegister(new MuFloat64(0)),
  emissive: new MuRDARegister(new MuFloat64(0)),
  defaultMotionId: new MuRDARegister(new MuASCII()),

  // particles
  particle: ParticleConfigRDA,

  // damage
  damage: DamageConfigRDA,

  // sound
  sound: EntitySoundRDA,
});

export type EntitySeed = (typeof EntitySeedRDA.stateSchema)['identity'];

export const EntitiesTreeRDA = new MuRDATree(EntitySeedRDA);

export type TreeNode = (typeof EntitiesTreeRDA.nodeSchema)['identity'];
export type TreeNodes = (typeof EntitiesTreeRDA.stateSchema)['identity'];

export const CollisionRuleRDA = new MuRDAStruct({
  selectorA: new MuRDARegister(new MuUTF8('*')),
  selectorB: new MuRDARegister(new MuUTF8('*')),
});

export const CollisionFilterRDA = new MuRDAList(CollisionRuleRDA);

export const PhysicsRDA = new MuRDAStruct({
  gravity: new MuRDARegister(new MuFloat64(-0.1)),
  velocityDamping: new MuRDARegister(new MuFloat64(0.01)),
  useOBB: new MuRDARegister(new MuBoolean(false)),
});

export const ZoneRDA = new MuRDAStruct({
  bounds: new MuRDAStruct({
    lox: new MuRDARegister(new MuFloat64(0)),
    loy: new MuRDARegister(new MuFloat64(0)),
    loz: new MuRDARegister(new MuFloat64(0)),

    hix: new MuRDARegister(new MuFloat64(0)),
    hiy: new MuRDARegister(new MuFloat64(0)),
    hiz: new MuRDARegister(new MuFloat64(0)),
  }),

  // zone selector
  selector: new MuRDARegister(new MuUTF8('*')),

  // force field
  massScale: new MuRDARegister(new MuFloat64(0), (x) =>
    Math.min(Math.max(0, +x || 0), 1),
  ),
  force: new MuRDAStruct({
    x: new MuRDARegister(new MuFloat64(0)),
    y: new MuRDARegister(new MuFloat64(0)),
    z: new MuRDARegister(new MuFloat64(0)),
  }),

  // weather zone overrides
  overrideFog: new MuRDARegister(new MuBoolean(false)),
  fog: FogRDA,
  overrideSky: new MuRDARegister(new MuBoolean(false)),
  sky: SkyRDA,
  overrideSnow: new MuRDARegister(new MuBoolean(false)),
  snow: SnowRDA,
  overrideRain: new MuRDARegister(new MuBoolean(false)),
  rain: RainRDA,
});

export const ZoneSetRDA = new MuRDAList(ZoneRDA);

export type ZoneSet = typeof ZoneSetRDA.stateSchema.identity;

export const JoystickTextureRDA = new MuRDAStruct({
  background: new MuRDARegister(new MuUTF8()),
  controller: new MuRDARegister(new MuUTF8()),
});

export const GamepadFlyTextureRDA = new MuRDAStruct({
  button: new MuRDARegister(new MuUTF8()),
  flyingController: new MuRDARegister(new MuUTF8()),
  flyingBackground: new MuRDARegister(new MuUTF8()),
});

export const GamepadButtonsTextureRDA = new MuRDAStruct({
  jump: new MuRDARegister(new MuUTF8()),
  crouch: new MuRDARegister(new MuUTF8()),
  actionA: new MuRDARegister(new MuUTF8()),
  actionB: new MuRDARegister(new MuUTF8()),
});

export const GamepadRDA = new MuRDAStruct({
  joystick: JoystickTextureRDA,
  fly: GamepadFlyTextureRDA,
  buttons: GamepadButtonsTextureRDA,
});

export type GamepadType = typeof GamepadRDA.stateSchema.identity;

export const ProjectMetaRDA = new MuRDAStruct({
  // Project display and preview imageinfo
  displayName: sizeLimitedStringRDA(
    'Blank Map',
    DB.Limitations.contentNameBytes,
  ),
  description: sizeLimitedStringRDA('', DB.Limitations.contentDescriptionBytes),
  previewImage: new MuRDARegister(new MuASCII('')),
  bannerImages: new MuRDAList(new MuRDARegister(new MuASCII(''))),
  notice: sizeLimitedStringRDA('', DB.Limitations.contentUpdateNoticeBytes),
  // is user never change displayName
  isNeverChangeDisplayName: new MuRDARegister(new MuBoolean(true)),
});

// feature flags
export const ProjectFeatureRDA = new MuRDAStruct({
  enableTriggerAPI: new MuRDAConstant(new MuBoolean(false)),
});

export const ProjectRDA = new MuRDAStruct({
  // Project meta data
  type: new MuRDAConstant(new MuUTF8('project')),
  version: new MuRDAConstant(new MuUTF8('0.3.31')),
  prevHash: new MuRDARegister(HashSchema),
  timestamp: new MuRDARegister(new MuDate(new Date(0))),
  storageMode: new MuRDARegister(new MuUTF8('sqlite')),

  // feature flags
  features: ProjectFeatureRDA,

  // project meta data, image, name, etc.
  info: ProjectMetaRDA,

  // Game engine data structures and configuration
  voxels: VoxelRDA,
  environment: EnvironmentRDA,
  ambientSound: AmbientSoundRDA,
  physics: PhysicsRDA,
  collisionFilter: CollisionFilterRDA,
  player: PlayerRDA,
  entitiesTree: EntitiesTreeRDA,
  scriptIndex: new MuRDARegister(new MuUTF8('index.js')),
  zones: ZoneSetRDA,
  gamepad: GamepadRDA,

  // Asset system
  assets: AssetsRDA,
  deleteAssets: DeleteAssetsRDA,

  // committer ID
  committerId: new MuRDARegister(new MuVarint(0)),

  // GameUI
  defaultScreenId: new MuRDARegister(new MuUTF8(DEFAULT_SCREEN_ID)),

  // Group Project
  ...GroupProjectRDA,
});

export type ProjectInfo = MuRDATypes<typeof ProjectRDA>['state'];
