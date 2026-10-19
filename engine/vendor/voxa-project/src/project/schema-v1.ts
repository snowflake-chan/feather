import {
  MuArray,
  MuASCII,
  MuDictionary,
  MuFloat32,
  MuInt32,
  MuSchema,
  MuStruct,
  MuUint8,
  MuUTF8,
  MuVarint,
} from '@box/mudb/schema';
import {
  Uint16Vec3Schema,
  Vec3Schema,
  Vec4Schema,
  ProjectNodeType,
} from '../util';

export const NodeSchema = new MuStruct({
  id: new MuASCII(),
  /**
   * 类型
   */
  type: <MuSchema<ProjectNodeType>>new MuVarint(ProjectNodeType.Root),
  name: new MuUTF8(),
  voxelId: new MuASCII(),
  parentId: new MuASCII(),
  childrenIds: new MuArray(new MuASCII(), Infinity),
  /**
   * 轴心
   */
  pivot: Vec3Schema,
  /**
   * 本地坐标
   */
  position: Vec3Schema,
  /**
   * 本地的旋转
   */
  quaternion: Vec4Schema,
});

export const NodesSchema = new MuDictionary(NodeSchema, Infinity);

export const VoxelSchema = new MuStruct({
  id: new MuASCII(),
  /**
   * 体素点数组
   * 经过rle压缩。
   */
  encodedView: new MuArray(new MuVarint(), Infinity),
  /**
   * 本地色表，记录了体素对全局色表的索引。
   */
  localPalette: new MuArray(new MuInt32(), Infinity),
});

export const VoxelsSchema = new MuDictionary(VoxelSchema, Infinity);

export const RGBSchema = new MuStruct({
  r: new MuUint8(),
  g: new MuUint8(),
  b: new MuUint8(),
});

export const PaletteItemsSchema = new MuStruct({
  id: new MuASCII(),
  color: RGBSchema,
  hsv: Uint16Vec3Schema,
  material: new MuStruct({
    emissive: new MuFloat32(),
  }),
});

export const PaletteGroupSchema = new MuStruct({
  id: new MuASCII(),
  name: new MuUTF8(),
  colorIndices: new MuArray(new MuVarint(), Infinity),
});

/**
 * 色板数据
 */
export const PaletteDataSchema = new MuStruct({
  items: new MuArray(PaletteItemsSchema, Infinity),
  /**
   * 颜色分组的记录对象。
   */
  groups: new MuDictionary(PaletteGroupSchema, Infinity),
  /**
   * 颜色分组的顺序列表。
   */
  groupList: new MuArray(new MuASCII(), Infinity),
});

/**
 * V1版本Voxa工程文件
 */
export const ProjectDataV1Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(1),
  /**
   * 部件数据，与animator中的parts对应，有可能是组、部件、骨骼
   */
  nodes: NodesSchema,
  /**
   * 体素资源，被skinPartNode引用。
   */
  voxels: VoxelsSchema,
  /**
   * 全局的色表信息
   */
  palette: PaletteDataSchema,
});

export type ProjectDataV1 = typeof ProjectDataV1Schema.identity;
