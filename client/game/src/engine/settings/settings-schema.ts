import {
  MuStruct,
  MuFloat32,
  MuBoolean,
  MuUint16,
  MuSchema,
  MuDictionary,
  MuUint32,
  MuASCII,
  MuFloat64,
  MuVarint,
  MuArray,
  MuInt8,
} from '@box/mudb/schema';
import { GameKeys } from '@box/schema/input/input-schema';

export const KeyBindingSchema = new MuDictionary(
  <MuSchema<GameKeys>>new MuUint16(),
  Infinity,
  {
    // wasd and arrows
    37: GameKeys.TURN_LEFT,
    65: GameKeys.LEFT,
    81: GameKeys.LEFT, // for AZERTY allow q = left

    38: GameKeys.UP,
    87: GameKeys.UP,
    90: GameKeys.UP, // for AZERTY allow Z = up

    39: GameKeys.TURN_RIGHT,
    68: GameKeys.RIGHT,

    40: GameKeys.DOWN,
    83: GameKeys.DOWN,

    // left shift and C for crouch
    16: GameKeys.CROUCH,
    67: GameKeys.CROUCH,

    // spacebar
    32: GameKeys.JUMP,

    // interact with an object
    69: GameKeys.INTERACT, // E
    84: GameKeys.CHAT, // T

    49: GameKeys.NUM_1,
    50: GameKeys.NUM_2,
    51: GameKeys.NUM_3,
    52: GameKeys.NUM_4,
    53: GameKeys.NUM_5,
    54: GameKeys.NUM_6,
    55: GameKeys.NUM_7,
    56: GameKeys.NUM_8,
    57: GameKeys.NUM_9,
    70: GameKeys.INVENTORY, // F: open inventory
    27: GameKeys.ESC,
    9: GameKeys.TAB,
    88: GameKeys.X,

    // [, ]
    219: GameKeys.PREV_ENTITY,
    221: GameKeys.NEXT_ENTITY,

    // use page up/page down for look up and look down
    33: GameKeys.LOOK_UP,
    34: GameKeys.LOOK_DOWN,

    91: GameKeys.META,
    17: GameKeys.LEFT_CTRL,
  },
);

export const AntiAddictSchema = new MuStruct({
  contentId: new MuVarint(),
  totalPlayTime: new MuVarint(),
  limitTimeStartAt: new MuVarint(),
  startRecordTime: new MuVarint(),
});

export type AntiAddict = typeof AntiAddictSchema.identity;

export const TeenagerAntiAddictSchema = new MuArray(AntiAddictSchema, Infinity);

export const GuestAntiAddictSchema = new MuStruct({
  isExceedTrialTime: new MuBoolean(false),
  exceedTrialTimeFrom: new MuVarint(),
  playGames: new MuArray(AntiAddictSchema, Infinity),
});

export const SettingsSchema = new MuStruct({
  version: new MuVarint(6),

  language: new MuASCII(''),

  graphicQuality: new MuInt8(1),

  // audio preferences
  masterMute: new MuBoolean(false),
  masterVolume: new MuFloat32(1),
  musicMute: new MuBoolean(false),
  musicVolume: new MuFloat32(1),
  effectsMute: new MuBoolean(false),
  effectsVolume: new MuFloat32(1),
  uiMute: new MuBoolean(false),
  uiVolume: new MuFloat32(1),

  // performance
  resolutionScale: new MuFloat32(0.5),
  lodBias: new MuFloat32(32),

  // shadows
  shadowResolution: new MuUint32(0),
  shadowFilter: new MuBoolean(true),

  // debug panels
  statsPanel: new MuBoolean(false),
  statsRenderDebug: new MuBoolean(false),

  // special effects
  parallaxMap: new MuBoolean(false),
  parallaxDistance: new MuFloat64(64),
  postprocess: new MuBoolean(false),
  bloom: new MuBoolean(false),
  reflections: new MuBoolean(false),
  fxaa: new MuBoolean(false),
  ambientOcclusion: new MuBoolean(false),
  depthOfField: new MuFloat32(0),
  volumetricScattering: new MuBoolean(false),
  hdSky: new MuBoolean(false),

  // player animation quality: how many players on screen before we start throttling animation updates
  animationQuality: new MuFloat64(4),

  // particle size stuff
  maxParticles: new MuVarint(65536),
  maxParticleGroups: new MuVarint(512),

  // input
  cameraSensitivity: new MuFloat32(1),
  keyBindings: KeyBindingSchema,

  // safe shaders
  safeShaders: new MuBoolean(false),

  // low quality textures
  lowQualityTextures: new MuBoolean(false),

  // enable device vibration
  enableVibration: new MuBoolean(true),

  // tutorial flag
  tutorialComplete: new MuBoolean(false),

  // maximum concurrent sound effects
  maxSoundEffects: new MuVarint(16),

  // maximum number of net ticks per frame
  frameNetTicks: new MuFloat64(2),

  // TODO:之后不会使用，settings-controller里还有相关逻辑，待删除
  // anti-addict
  teenagerAntiAddict: TeenagerAntiAddictSchema,
  guestAntiAddict: GuestAntiAddictSchema,

});

export type Settings = typeof SettingsSchema.identity;
