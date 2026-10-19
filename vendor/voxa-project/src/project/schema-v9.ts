import {
  MuArray,
  MuOption,
  MuSchema,
  MuStruct,
  MuVarint,
} from '@box/mudb/schema';
import {
  VoxelsSchema,
  NodesSchema,
  PaletteDataSchema,
  ProjectAnimationSchema,
} from './schema-v8';
import { Vec3Schema, HitBoxMode } from '../util';

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
  VoxelsSchema,
  VoxelSchema,
} from './schema-v8';

/**
 * 物理碰撞框数据
 */
export const HitBoxDataSchema = new MuStruct({
  /**
   * 物理碰撞框坐标
   */
  position: Vec3Schema,
  /**
   * 物理碰撞框尺寸
   */
  size: Vec3Schema,
});

export const HitBoxSchema = new MuStruct({
  /**
   * 物理碰撞框模式
   */
  mode: <MuSchema<HitBoxMode>>new MuVarint(HitBoxMode.Default),
  /**
   * 自定义物理碰撞框数据
   */
  customBox: new MuOption(HitBoxDataSchema, undefined, true),
});

/**
 * V9版本Voxa工程文件
 */
export const ProjectDataV9Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(9),
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
  /**
   * 物理碰撞框数据
   */
  hitBox: HitBoxSchema,
});

export type ProjectDataV9 = typeof ProjectDataV9Schema.identity;
