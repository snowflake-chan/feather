import {
  MuStruct,
  MuVarint,
  MuDictionary,
  MuASCII,
  MuUTF8,
  MuArray,
  MuFloat32,
  MuSchema,
} from '@box/mudb/schema';
import {
  Mat3Schema,
  Uint8Vec3Schema,
  Vec3Schema,
  Vec4Schema,
  ProjectNodeType,
} from '../util';
import {
  VoxelsSchema,
  VoxelSchema,
  PaletteDataSchema,
  PaletteItemsSchema,
  PaletteItemSchema,
  PaletteGroupsSchema,
  PaletteGroupSchema,
  ProjectInterpolationType,
  KeyframeOffsetSchema,
  KeyframeSchema,
  KeyframeListSchema,
  MotionNodeSchema,
  MotionNodesSchema,
  ProjectAnimationSchema,
} from './schema-v6';

export {
  VoxelsSchema,
  VoxelSchema,
  PaletteDataSchema,
  PaletteItemsSchema,
  PaletteItemSchema,
  PaletteGroupsSchema,
  PaletteGroupSchema,
  ProjectInterpolationType,
  KeyframeOffsetSchema,
  KeyframeSchema,
  KeyframeListSchema,
  MotionNodeSchema,
  MotionNodesSchema,
  ProjectAnimationSchema,
};

export const NodeSchema = new MuStruct({
  id: new MuASCII(),
  /**
   * 类型
   */
  type: <MuSchema<ProjectNodeType>>new MuVarint(ProjectNodeType.Root),
  name: new MuUTF8(),
  /**
   * 部件对应的体素ID
   */
  voxelId: new MuASCII(),
  parentId: new MuASCII(),
  childrenIds: new MuArray(new MuASCII(), Infinity),
  /**
   * 骨骼绑定的部件/部件组id
   */
  skinId: new MuASCII(),
  /**
   * 部件/部件组绑定的骨骼id
   */
  boneId: new MuASCII(),
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
  /**
   * 缩放
   */
  scale: Vec3Schema,
  /**
   * 世界轴(父级)缩放矩阵数据
   */
  parentScaleMat3: Mat3Schema,
});

export const NodesSchema = new MuDictionary(NodeSchema, Infinity);

/**
 * V7版本Voxa工程文件
 */
export const ProjectDataV7Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(7),
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
  /**
   * 工程动画
   */
  animations: new MuArray(ProjectAnimationSchema, Infinity),
});

export type ProjectDataV7 = typeof ProjectDataV7Schema.identity;
