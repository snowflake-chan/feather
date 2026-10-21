import {
  MuStruct,
  MuVarint,
  MuDictionary,
  MuASCII,
  MuUTF8,
  MuArray,
  MuFloat32,
  MuUint16,
  MuSchema,
} from '@box/mudb/schema';
import {
  Uint16Vec3Schema,
  Uint8Vec3Schema,
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
   * 透明度，默认为1
   */
  alpha: new MuFloat32(1),
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
  /**
   * 本地欧拉角
   */
  euler: Vec3Schema,
  /**
   * 翻转
   */
  flip: Uint8Vec3Schema,
});

export const NodesSchema = new MuDictionary(NodeSchema, Infinity);

export const VoxelSchema = new MuStruct({
  id: new MuASCII(),
  /**
   * 体素点数组
   * 经过rle压缩。
   */
  encodedView: new MuArray(new MuVarint(), Infinity),
});

export const VoxelsSchema = new MuDictionary(VoxelSchema, Infinity);

export const PaletteItemSchema = new MuStruct({
  /**
   * 此id为索引值
   */
  id: new MuVarint(),

  /**
   * rgb取值范围为[0, 255]
   */
  rgb: Uint8Vec3Schema,

  /**
   * h取值范围为[0, 360]
   * s取值范围为[0, 100]
   * v取值范围为[0, 100]
   */
  hsv: Uint16Vec3Schema,
  material: new MuStruct({
    emissive: new MuFloat32(),
  }),
});

export const PaletteItemsSchema = new MuArray(PaletteItemSchema, Infinity);

export const PaletteGroupSchema = new MuStruct({
  id: new MuASCII(),
  name: new MuUTF8(),
  itemIds: new MuArray(new MuUint16(), Infinity),
});

export const PaletteGroupsSchema = new MuDictionary(
  PaletteGroupSchema,
  Infinity,
);
/**
 * 色板数据
 */
export const PaletteDataSchema = new MuStruct({
  items: PaletteItemsSchema,
  /**
   * 颜色分组的记录对象。
   */
  groups: PaletteGroupsSchema,
  /**
   * 颜色分组的顺序列表。
   */
  groupList: new MuArray(new MuASCII(), Infinity),
});

/**
 * V2版本Voxa工程文件
 */
export const ProjectDataV2Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(2),
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

export type ProjectDataV2 = typeof ProjectDataV2Schema.identity;
