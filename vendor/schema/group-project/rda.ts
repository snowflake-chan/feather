import {
  MuRDAStruct,
  MuRDARegister,
  MuRDAConstant,
  MuRDAMap,
} from '@box/mudb/rda';
import {
  MuUTF8,
  MuArray,
  MuFloat64,
  MuBoolean,
  MuASCII,
  MuVarint,
  MuSchema,
} from '@box/mudb/schema';
import { HashSchema } from '../content-server/index';
import { UITreeRDA } from '../project/ui-rda/defs';

export enum AssetType {
  JS_SCRIPT = 1,
  VOXEL_MODEL = 2,
  COLOR_LUT = 3,
  PARTICLE_TEXTURE = 4,
  IMAGE = 5,
  AUDIO = 6,
  CLIENT_JS_SCRIPT = 7,
  /**
   * 新增图片类型资源
   * PICTURE会被存储至OSS中。
   * IMAGE存储至IPFS中。
   */
  PICTURE = 8,
  /**
   * 新增GLTF类型资源
   */
  GLTF_MODEL = 9,
}

export const AssetTypeSchema = <MuSchema<AssetType>>(
  new MuVarint(AssetType.VOXEL_MODEL)
);

export const CommonAssets = {
  type: new MuRDAConstant(AssetTypeSchema),

  /**
   * type为VOXEL_MODEL时
   * voxa导出的作品这里存的是modelFileHash，数据是modelMetaData
   * 旧版.vb作品这里存的是.vb格式的hash，为工程文件
   */
  hash: new MuRDARegister(HashSchema),
  size: new MuRDARegister(new MuVarint(0)),
  previewImage: new MuRDARegister(new MuASCII()),
};

export const GroupAssetEntryRDA = new MuRDAStruct({
  id: new MuRDARegister(new MuASCII()),
  updateAt: new MuRDARegister(new MuFloat64()),
  ...CommonAssets,
});

export const GroupAssetsRDA = new MuRDAMap(new MuUTF8(), GroupAssetEntryRDA);

export type GroupAssetEntry = typeof GroupAssetEntryRDA.stateSchema.identity;
export type GroupAssetEntries = typeof GroupAssetsRDA.stateSchema.identity;

/**
 * 地图组数据的RDA，用于定义地图数据结构
 * 该数据会合并到ProjectRDA中
 */
export const GroupProjectRDA = {
  uiTree: UITreeRDA,
  audioAssets: GroupAssetsRDA,
  pictureAssets: GroupAssetsRDA,
};

const {
  storeSchema: GroupProjectStoreSchema,
  stateSchema: GroupProjectStateSchema,
} = new MuRDAStruct(GroupProjectRDA);

export { GroupProjectStoreSchema, GroupProjectStateSchema };

export type GroupProjectStore = typeof GroupProjectStoreSchema.identity;
export type GroupProjectState = typeof GroupProjectStateSchema.identity;

type GroupProjectKeys = keyof GroupProjectState;

export type GroupProjectMetaData = {
  /**
   * GroupProject数据版本号
   * 只在数据需要做本地migration（引擎数据升级）时，才需要升级这个版本
   * 后端的migration只是在处理数据合并，不会影响该版本号
   */
  version: string;
  hashes: Record<GroupProjectKeys, string>;
};
