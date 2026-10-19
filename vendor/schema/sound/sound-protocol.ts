import {
  MuArray,
  MuStruct,
  MuVarint,
  MuSortedArray,
  MuUnion,
  MuVoid,
  MuQuantizedFloat,
  MuASCII,
  MuFloat32,
} from '@box/mudb/schema';
import { QuantizedVec3Schema } from '../utils/quantized-schema';
import { compareId } from '@box/utils/id';

export const HashSchema = new MuASCII();
export const SoundSetSchema = new MuArray(HashSchema, Infinity);

export const PlaySoundPositionSchema = new MuUnion({
  global: new MuVoid(),
  player: new MuVarint(),
  entity: new MuVarint(),
  position: new QuantizedVec3Schema(1 / 16),
});
export type PlaySoundPosition = typeof PlaySoundPositionSchema.identity;

export const PlaySoundMessage = new MuStruct({
  soundId: new MuVarint(),
  sampleId: new MuVarint(),
  position: PlaySoundPositionSchema,
  radius: new MuQuantizedFloat(1 / 16, 0),
  pitch: new MuQuantizedFloat(1 / 256, 1),
  gain: new MuQuantizedFloat(1 / 256, 1),
});

export const SoundEffectSchema = new MuStruct({
  sampleId: new MuVarint(),
  radius: new MuQuantizedFloat(1 / 16, 32),
  gain: new MuQuantizedFloat(1 / 256, 1),
  gainRange: new MuQuantizedFloat(1 / 256, 0),
  pitch: new MuQuantizedFloat(1 / 256, 0),
  pitchRange: new MuQuantizedFloat(1 / 256, 0),
});
export type SoundEffect = typeof SoundEffectSchema.identity;

export const AmbientSoundEffectSchema = new MuStruct({
  ambient: SoundEffectSchema,
  breakVoxel: SoundEffectSchema,
  placeVoxel: SoundEffectSchema,
  playerJoin: SoundEffectSchema,
  playerLeave: SoundEffectSchema,
});

export const EntitySoundEffectSchema = new MuStruct({
  id: new MuVarint(),
  chat: SoundEffectSchema,
  hurt: SoundEffectSchema,
  die: SoundEffectSchema,
  interact: SoundEffectSchema,
});

export const EntitySoundEffectSetSchema = new MuSortedArray(
  EntitySoundEffectSchema,
  Infinity,
  compareId,
);

export const PlayerSoundEffectSchema = new MuStruct({
  id: new MuVarint(),

  spawn: SoundEffectSchema,
  jump: SoundEffectSchema,
  doubleJump: SoundEffectSchema,
  land: SoundEffectSchema,
  crouch: SoundEffectSchema,
  step: SoundEffectSchema,
  swim: SoundEffectSchema,
  action0: SoundEffectSchema,
  action1: SoundEffectSchema,
  enterWater: SoundEffectSchema,
  leaveWater: SoundEffectSchema,
  startFly: SoundEffectSchema,
  endFly: SoundEffectSchema,
});
export const PlayerSoundEffectSetSchema = new MuSortedArray(
  PlayerSoundEffectSchema,
  Infinity,
  compareId,
);

export const SoundReplicaSchema = new MuStruct({
  // Ambient sound effects
  ambientSound: AmbientSoundEffectSchema,

  // entity sounds
  entitySound: EntitySoundEffectSetSchema,

  // player sounds
  playerSound: PlayerSoundEffectSetSchema,
});

export const SoundProtocolSchema = {
  name: 'sound',
  client: {
    resetDictionary: SoundSetSchema,
    play: PlaySoundMessage,
    resume: new MuVarint(),
    pause: new MuVarint(),
    stop: new MuVarint(),
    setCurrentTime: new MuStruct({
      soundId: new MuVarint(),
      currentTime: new MuFloat32(),
    }),
    setCurrentTimeAndResume: new MuStruct({
      soundId: new MuVarint(),
      currentTime: new MuFloat32(),
    }),
  },
  server: {},
};
