import {
  MuStruct,
  MuVarint,
  MuArray,
  MuASCII,
  MuDictionary,
  MuSchema,
} from '@box/mudb/schema';
import {
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
  NodeSchema,
  NodesSchema,
} from './schema-v7';

import { VoxelDimension } from '../util';

export {
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
  NodeSchema,
  NodesSchema,
};

export const VoxelSchema = new MuStruct({
  id: new MuASCII(),
  /**
   * 体素渲染的维度
   * 默认xyz三个维度都渲染，即3D
   */
  dimension: <MuSchema<VoxelDimension>>new MuVarint(VoxelDimension.XYZ),
  /**
   * 体素点数组
   * 经过rle压缩。
   */
  encodedView: new MuArray(new MuVarint(), Infinity),
});

export const VoxelsSchema = new MuDictionary(VoxelSchema, Infinity);

/**
 * V8版本Voxa工程文件
 */
export const ProjectDataV8Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(8),
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

export type ProjectDataV8 = typeof ProjectDataV8Schema.identity;
