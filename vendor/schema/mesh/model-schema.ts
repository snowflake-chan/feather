import { HashType, SkinAssetContent } from '../project/hot-schema';
import {
  MuStruct,
  MuSortedArray,
  MuUTF8,
  MuUint8,
  MuVarint,
  MuBoolean,
  MuArray,
  MuQuantizedFloat,
  MuSchema,
  MuASCII,
  MuFloat64,
  MuInt32,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';
export const HashSchema = new MuASCII();

export const MotionPlaybackSchema = new MuStruct({
  motionId: new MuASCII(),
  /**
   * -1 means Infinity
   */
  cycleCount: new MuInt32(1),
});

export const MotionsPlaybackSchema = new MuArray(
  MotionPlaybackSchema,
  Infinity,
);

export const PlaybackSchema = new MuStruct({
  motions: MotionsPlaybackSchema,
  startTick: new MuFloat64(),
  /**
   * -1 means Infinity
   */
  cycleCount: new MuInt32(1),
});

export const NetModelMotionSchema = new MuStruct({
  /**
   * 默认动作id
   */
  defaultMotionId: new MuASCII(),
  /**
   * 是否暂停
   */
  paused: new MuBoolean(false),
  /**
   * 暂停时的帧数
   */
  pausedTick: new MuFloat64(),
  /**
   * 默认动作开始的帧数
   */
  startTick: new MuFloat64(),
  /**
   * 动作链数据
   */
  playback: PlaybackSchema,
});

export type NetModelMotion = typeof NetModelMotionSchema.identity;

export const NetModelSchemaContent = {
  // entity id
  id: new MuVarint(),

  // mesh id reference
  meshId: new MuVarint(),

  // mesh
  invisible: new MuBoolean(false),

  // tint
  red: new MuUint8(255),
  green: new MuUint8(255),
  blue: new MuUint8(255),
  alpha: new MuUint8(255),
  emissive: new MuQuantizedFloat(1 / 256, 0),
  shininess: new MuQuantizedFloat(1 / 256, 0),
  metalness: new MuQuantizedFloat(1 / 256, 0),

  // transformation
  scaleX: new MuQuantizedFloat(1 / 256, 1),
  scaleY: new MuQuantizedFloat(1 / 256, 1),
  scaleZ: new MuQuantizedFloat(1 / 256, 1),

  offsetX: new MuQuantizedFloat(1 / 256, 0),
  offsetY: new MuQuantizedFloat(1 / 256, 0),
  offsetZ: new MuQuantizedFloat(1 / 256, 0),

  // motion
  motion: NetModelMotionSchema,

  // shadow
  staticShadow: new MuBoolean(false),

  name: new MuUTF8(''),
};
export const NetModelSchema = new MuStruct(NetModelSchemaContent);

export type NetModel = typeof NetModelSchema.identity;

export const NetMeshTableEntrySchema = new MuStruct({
  /**
   * 这里的hash是meshHash，真正渲染模型用的hash值
   */
  hash: HashSchema,
  hashType: <MuSchema<HashType>>new MuUTF8('voxelModel'),

  meshBX: new MuQuantizedFloat(1, 64),
  meshBY: new MuQuantizedFloat(1, 64),
  meshBZ: new MuQuantizedFloat(1, 64),

  bodyBX: new MuQuantizedFloat(1, 64),
  bodyBY: new MuQuantizedFloat(1, 64),
  bodyBZ: new MuQuantizedFloat(1, 64),

  bodyOffsetX: new MuQuantizedFloat(1, 64),
  bodyOffsetY: new MuQuantizedFloat(1, 64),
  bodyOffsetZ: new MuQuantizedFloat(1, 64),

  // 外观框中心相对锚点的偏移
  renderBoxOffsetX: new MuQuantizedFloat(1, 64),
  renderBoxOffsetY: new MuQuantizedFloat(1, 64),
  renderBoxOffsetZ: new MuQuantizedFloat(1, 64),
});
export type NetMeshTableEntry = typeof NetMeshTableEntrySchema.identity;

export const NetMeshTableSchema = new MuArray(
  NetMeshTableEntrySchema,
  Infinity,
  [NetMeshTableEntrySchema.identity],
);
export type NetMeshTable = typeof NetMeshTableSchema.identity;

export const NetSkinPartSchema = new MuStruct({
  id: new MuVarint(),
  hash: HashSchema,
});
export type NetSkinPart = typeof NetSkinPartSchema.identity;
export const NetSkinPartTableSchema = new MuSortedArray(
  NetSkinPartSchema,
  Infinity,
  compareId,
);

export const NetModelSetSchema = new MuSortedArray(
  NetModelSchema,
  Infinity,
  compareId,
);
export type NetModelSet = typeof NetModelSetSchema.identity;

export const NetSkinSchema = new MuStruct(SkinAssetContent);
export type NetSkin = typeof NetSkinSchema.identity;
// NetSkinTableSchema中的元素索引值即为id，第0位代表空，默认初始值有一个元素
export const NetSkinTableSchema = new MuArray(NetSkinSchema, Infinity, [
  NetSkinSchema.identity,
]);
export type NetSkinTable = typeof NetSkinTableSchema.identity;

export const ModelProtocol = {
  name: 'models',
  client: {
    appendMeshHashes: NetMeshTableSchema,
    appendSkinHashes: NetSkinTableSchema,
    appendSkinPartHashes: NetSkinPartTableSchema,
  },
  server: {},
};

/**
 * 转换一层，为了记录一些中间数据，比如bounds
 */
export type GLTFMetaData = {
  /**
   * GLB文件本体
   */
  hash: string;
  bounds: [number, number, number];
};
