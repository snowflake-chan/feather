import { MuArray, MuOption, MuStruct, MuVarint } from '@box/mudb/schema';
import {
  HitBoxSchema,
  NodesSchema,
  PaletteDataSchema,
  ProjectAnimationSchema,
  VoxelsSchema,
} from './schema-v9';
import { Vec3Schema } from '../util';

export const ModelPivotSchema = Vec3Schema;

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
  HitBoxSchema,
  HitBoxDataSchema,
} from './schema-v9';

/**
 * V9版本Voxa工程文件
 */
export const ProjectDataV10Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(10),
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
  /**
   * 模型中心点
   */
  modelPivot: new MuOption(ModelPivotSchema, undefined, true),
});

export type ProjectDataV10 = typeof ProjectDataV10Schema.identity;
