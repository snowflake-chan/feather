import {
  MuStruct,
  MuDictionary,
  MuUTF8,
  MuArray,
  MuVarint,
  MuASCII,
  MuSchema,
  MuFloat32,
  MuInt32,
  MuFloat64,
  MuBoolean,
  MuUint32,
} from '@box/mudb/schema';

import * as ERDA from './project-rda';
import { HashSchema } from '../content-server/index';
import { Vec3Schema } from '../utils/math-schema';
import { BlockInfoSchema } from '../voxel/block-schema';
import { SciptCollisionFilterSpecSchema } from '../script/script-protocol';
import { UITreeRDA } from './ui-rda/defs';
import { PlayerSkinHashSchema } from '../player/player-schema';

const pRDA = ERDA.ProjectRDA.stateSchema;
export const DisplayNameSchema = pRDA.muData.info.muData.displayName;
export const PrevHashSchema = pRDA.muData.prevHash;
export const PlayerSchema = pRDA.muData.player;
export const EnvironmentSchema = pRDA.muData.environment;
export const PhysicsSchema = pRDA.muData.physics;
export const VoxelSchema = pRDA.muData.voxels;
export const GamepadSchema = pRDA.muData.gamepad;

export const SeedSchema = ERDA.EntitySeedRDA.stateSchema;
export type Seed = typeof SeedSchema.identity;

export const SeedSetSchema = new MuDictionary(SeedSchema, Infinity);
export type SeedSet = typeof SeedSetSchema.identity;

export enum HashType {
  VOXEL_MODEL = 'voxelModel',
  IMAGE = 'image',
  GLTF_MODEL = 'gltfModel',
}

export function getMeshPath(meshName: string) {
  return `mesh/${meshName}.vb`;
}

export const MotionSchema = new MuStruct({
  id: new MuASCII(),
  name: new MuUTF8(),
  duration: new MuFloat32(),
});

export const MotionListSchema = new MuArray(MotionSchema, Infinity);

export const CustomBoundsSchema = new MuStruct({
  /**
   * 框的大小
   */
  size: Vec3Schema,
  /**
   * 自定义物理框与外观框锚点的偏移量
   * 目前外观框的锚点就是外观框的质心
   */
  offset: Vec3Schema,
});

export const MeshAssetSchema = new MuStruct({
  hash: HashSchema,
  /**
   * meshHash为hash值经过migrateVoxel后转出来的最新版本的hash值
   */
  meshHash: HashSchema,
  bounds: Vec3Schema,
  hashType: <MuSchema<HashType>>new MuUTF8(HashType.VOXEL_MODEL),
  /**
   * 动作列表
   */
  motionList: MotionListSchema,
  /**
   * 是否用自定义物理模型
   */
  useCustomBounds: new MuBoolean(false),
  /**
   * 自定义物理模型
   */
  customBounds: CustomBoundsSchema,
  /**
   * 外观框中心到锚点的距离
   */
  renderBoxOffset: Vec3Schema,
});
export type MeshAssetInfo = typeof MeshAssetSchema.identity;
export const MeshAssetSetSchema = new MuDictionary(MeshAssetSchema, Infinity);

export const ScriptAssetSchema = new MuStruct({
  hash: HashSchema,
  isClient: new MuBoolean(false),
});
export const ScriptAssetSetSchema = new MuDictionary(
  ScriptAssetSchema,
  Infinity,
);
export const ScriptIndexSchema = new MuArray(new MuUTF8(), Infinity);

// sound asset schema
export const SoundTableSchema = new MuStruct({
  hashes: new MuArray(HashSchema, Infinity, ['']),
  hashId: new MuDictionary(new MuVarint(), Infinity),
});

export const HotCollisionRules = new MuArray(
  SciptCollisionFilterSpecSchema,
  Infinity,
);
export const PictureAssetSchema = new MuStruct({
  metadataHash: HashSchema,
  hash: HashSchema,
  width: new MuInt32(),
  height: new MuInt32(),
});
export type PictureAsset = typeof PictureAssetSchema.identity;
export const PictureAssetSetSchema = new MuDictionary(
  PictureAssetSchema,
  Infinity,
);
export type PictureAssetSet = typeof PictureAssetSetSchema.identity;

export const SkinAssetContent = {
  hash: HashSchema,
  parts: PlayerSkinHashSchema,
};
export const SkinAssetSchema = new MuStruct(SkinAssetContent);
export type SkinAsset = typeof SkinAssetSchema.identity;
export const SkinAssetSetSchema = new MuDictionary(SkinAssetSchema, Infinity);
export type SkinAssetSet = typeof SkinAssetSetSchema.identity;

export const HotProjectSchema = new MuStruct({
  version: new MuASCII('0.0.27'),

  name: new MuUTF8(),

  // block info
  blockInfoHash: HashSchema,
  blockInfo: BlockInfoSchema,

  // Copied
  environment: EnvironmentSchema,
  physics: PhysicsSchema,
  player: PlayerSchema,
  voxels: VoxelSchema,
  seeds: SeedSetSchema,
  assets: ERDA.AssetsRDA.stateSchema,
  /**
   * 音频资源字典，复制ProjectRDA的audioAssets
   */
  audioAssets: ERDA.GroupAssetsRDA.stateSchema,
  sound: ERDA.AmbientSoundRDA.stateSchema,
  features: ERDA.ProjectFeatureRDA.stateSchema,
  zones: ERDA.ZoneSetRDA.stateSchema,
  gamepad: ERDA.GamepadRDA.stateSchema,

  // collision rules
  collisionRules: HotCollisionRules,

  // sound assets
  soundAssets: SoundTableSchema,

  // Mesh assets
  meshAssets: MeshAssetSetSchema,

  // script assets
  modules: ScriptAssetSetSchema,
  scriptIndex: new MuUTF8(),

  uiTree: UITreeRDA.stateSchema,
  defaultScreenId: new MuUTF8(),
  pictureAssets: PictureAssetSetSchema,

  // skin assets
  skinAssets: SkinAssetSetSchema,
  defaultSkinName: new MuUTF8(),
});

export type HotProject = typeof HotProjectSchema.identity;

/**
 * 以皮肤name为key的字典
 */
export const SkinNameSetsSchema = new MuDictionary(
  new MuStruct({
    hash: HashSchema,
  }),
  Infinity,
);

export const MeshPathSchema = new MuStruct({
  modelId: new MuFloat64(),
  hash: HashSchema,
  modelPreviewHash: HashSchema,
  animated: new MuBoolean(),
  updatedAt: new MuASCII(),
});
export type MeshPath = typeof MeshPathSchema.identity;
/**
 * 以模型调用路径path为key的字段
 * 模型调用路径，即用模型名字name固定拼接的字符串
 * `mesh/${名字}.vb`
 */
export const MeshPathSetsSchema = new MuDictionary(MeshPathSchema, Infinity);

export const ScriptAssetsSchema = new MuStruct({
  hash: HashSchema,
  name: new MuUTF8(''),
  isClient: new MuBoolean(false),
  isShare: new MuBoolean(false),
  order: new MuInt32(0),
  lockedMapTitle: new MuUTF8(''),
  lockedMapId: new MuUint32(),
  id: new MuUTF8(''),
});

export const ScriptAssetSetsSchema = new MuDictionary(
  ScriptAssetsSchema,
  Infinity,
);

export type ExtraScriptAssets = typeof ScriptAssetSetsSchema.identity;

export const ExtraProjectInfoSchema = new MuStruct({
  meshAssets: MeshPathSetsSchema,
  skinAssets: SkinNameSetsSchema,
  defaultSkinName: new MuUTF8(),
  // 共享脚本 + 本地脚本，因为是后端排序，所以需要保存全量
  // fileid: file
  scriptAssets: ScriptAssetSetsSchema,
});

export type ExtraProjectInfo = typeof ExtraProjectInfoSchema.identity;
