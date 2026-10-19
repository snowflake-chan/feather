import {
  MuStruct,
  MuVarint,
  MuDictionary,
  MuASCII,
  MuUTF8,
  MuArray,
  MuFloat32,
  MuSchema,
  MuOption,
} from '@box/mudb/schema';
import {
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
} from './schema-v4';

export {
  VoxelsSchema,
  VoxelSchema,
  PaletteDataSchema,
  PaletteItemsSchema,
  PaletteItemSchema,
  PaletteGroupsSchema,
  PaletteGroupSchema,
  ProjectInterpolationType,
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
});

export const NodesSchema = new MuDictionary(NodeSchema, Infinity);

/**
 * 关键帧偏移数据
 */
export const KeyframeOffsetSchema = new MuStruct({
  translation: new MuOption(Vec3Schema),
  rotation: new MuOption(Vec4Schema),
  alpha: new MuOption(new MuFloat32(1)),
});

/**
 * 关键帧数据结构
 */
export const KeyframeSchema = new MuStruct({
  /**
   * 用字符串的方式存储，避免小数精度导致差异
   */
  time: new MuASCII(),
  /**
   * 补帧方式，意义和计算方式见voxa-project
   */
  interpolation: <MuSchema<ProjectInterpolationType>>(
    new MuASCII(ProjectInterpolationType.Linear)
  ),
  /**
   * 关键帧偏移数据
   */
  offset: KeyframeOffsetSchema,
});

export const KeyframeListSchema = new MuArray(KeyframeSchema, Infinity);

export const MotionNodeSchema = new MuStruct({
  nodeId: new MuASCII(),
  keyframeList: KeyframeListSchema,
});

/**
 * key是骨骼节点的id
 */
export const MotionNodesSchema = new MuDictionary(MotionNodeSchema, Infinity);

export const ProjectAnimationSchema = new MuStruct({
  /**
   * 动作的id
   */
  id: new MuASCII(),
  /**
   * 动画的名字
   */
  name: new MuUTF8(),
  /**
   * 动画的节点数据
   */
  nodes: MotionNodesSchema,
});

/**
 * V5版本Voxa工程文件
 */
export const ProjectDataV5Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(5),
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

export type ProjectDataV5 = typeof ProjectDataV5Schema.identity;
