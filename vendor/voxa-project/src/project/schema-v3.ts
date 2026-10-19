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
  Uint8Vec3Schema,
  Vec3Schema,
  Vec4Schema,
  ChannelNodePath,
  ProjectInterpolationType,
  OutputSchema,
  SamplerSchema,
  TimeAccessorSchema,
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
} from './schema-v2';

export {
  VoxelsSchema,
  VoxelSchema,
  PaletteDataSchema,
  PaletteItemsSchema,
  PaletteItemSchema,
  PaletteGroupsSchema,
  PaletteGroupSchema,
  ChannelNodePath,
  ProjectInterpolationType,
  OutputSchema,
  SamplerSchema,
  TimeAccessorSchema,
};

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

/**
 * 工程定义的Channel
 */
export const ProjectChannelSchema = new MuStruct({
  /**
   * 目标id
   */
  target: new MuStruct({
    /**
     * 对应的节点id
     */
    nodeId: new MuASCII(),
    /**
     * 变化的属性
     */
    path: <MuSchema<ChannelNodePath>>new MuASCII(),
  }),

  /**
   * 采样
   */
  sampler: SamplerSchema,
});

/**
 * 工程定义的动画
 */
export const ProjectAnimationSchema = new MuStruct({
  /**
   * 动画的名字
   */
  name: new MuUTF8(),

  /**
   * 动画涉及的节点变化数据
   */
  channels: new MuArray(ProjectChannelSchema, Infinity),
});

/**
 * V3版本Voxa工程文件
 */
export const ProjectDataV3Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(3),
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

export type ProjectDataV3 = typeof ProjectDataV3Schema.identity;
