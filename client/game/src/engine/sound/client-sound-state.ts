import {
  MuStruct,
  MuBoolean,
  MuDictionary,
  MuArray,
  MuVarint,
  MuFloat32,
  MuFloat64,
  MuUTF8,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { HashSchema } from '@box/schema/content-server/index';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import type { GameAudio } from './game-audio';

export interface IGameAudio {
  sourceNode?: AudioBufferSourceNode;
  gainNode: GainNode;
  play(delay?: number): boolean;
  pause(): void;
  onEnded?: () => void;
  setOffset: (offset: number) => void;
  getOffset: () => number;
}

export const SoundNodeSchema = new MuStruct({
  id: new MuVarint(),
  /**
   * 新增客户端音频，hash可能会存储url
   */
  hash: new MuUTF8(''),

  buffer: new MuRefSchema<AudioBuffer>(),

  /**
   * 音频播控实例
   */
  gameAudio: new MuRefSchema<GameAudio>(),

  volume: new MuFloat32(1),

  playing: new MuBoolean(false),

  volumeModifier: new MuFloat32(1),
  pitchModifier: new MuFloat32(1),

  spatial: new MuBoolean(false),
  entity: new MuVarint(),
  position: Vec3Schema,
  radius: new MuFloat64(1),
});

export type SoundNode = typeof SoundNodeSchema.identity;

export const BackgroundSoundNodeSchema = new MuStruct({
  hash: HashSchema,
  buffer: new MuRefSchema<AudioBuffer>(),

  sourceNode: new MuRefSchema<AudioBufferSourceNode>(),
  gainNode: new MuRefSchema<GainNode>(),

  playing: new MuBoolean(false),

  volumeModifier: new MuFloat32(1),
  pitchModifier: new MuFloat32(1),

  // saved position for music
  prevHash: HashSchema,
  offset: new MuFloat64(0),
});
export type BackgroundSoundNode = typeof BackgroundSoundNodeSchema.identity;

/**
 * 没有通过typeof SoundResourceSchema.identity生成是因为promise需要指向SoundResource自己
 * 如果用typeof的方式的话，ts会报循环指向的错误
 */
export type SoundResource = {
  loading: boolean;
  hash: string;
  buffer: AudioBuffer | null;
  /**
   * 加载资源，解析成AudioBuffer的异步
   */
  promise: Promise<SoundResource> | null;
};

export const SoundResourceSchema = new MuStruct({
  loading: new MuBoolean(true),
  hash: HashSchema,
  buffer: new MuRefSchema<AudioBuffer>(),
  promise: new MuRefSchema<Promise<SoundResource>>(),
});

export const HashSetSchema = new MuArray(HashSchema, Infinity);

export const ClientSoundStateSchema = new MuStruct({
  // if supported
  supported: new MuBoolean(true),

  // if audio is ready and can be played
  ready: new MuBoolean(false),

  /**
   * 客户端首次加载完已配置的音频
   */
  firstLoaded: new MuBoolean(false),

  // sound table
  soundTable: HashSetSchema,

  // audio setting copy
  muted: new MuBoolean(false),

  // web audio nodes
  context: new MuRefSchema<AudioContext>(),

  // ambient sound filter
  ambientFilter: new MuRefSchema<BiquadFilterNode>(),

  // active nodes
  activeSoundEffects: new MuArray(SoundNodeSchema, Infinity),

  // 客户端脚本播放的音频
  activeClientNodes: new MuArray(SoundNodeSchema, Infinity),

  // audio cache
  sampleCache: new MuDictionary(SoundResourceSchema, Infinity),

  // id counter
  sfxId: new MuVarint(1),

  // ambient sound node
  backgroundSound: BackgroundSoundNodeSchema,

  // music node
  music: BackgroundSoundNodeSchema,
});

export type ClientSoundState = typeof ClientSoundStateSchema.identity;
