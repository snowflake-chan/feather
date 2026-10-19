import { MuStruct, MuVarint, MuArray } from '@box/mudb/schema';
import {
  VoxelsSchema,
  VoxelSchema,
  PaletteDataSchema,
  PaletteItemsSchema,
  PaletteItemSchema,
  PaletteGroupsSchema,
  PaletteGroupSchema,
  NodesSchema,
  NodeSchema,
  ProjectAnimationSchema,
  ProjectInterpolationType,
  ProjectChannelSchema,
} from './schema-v3';

export {
  VoxelsSchema,
  VoxelSchema,
  PaletteDataSchema,
  PaletteItemsSchema,
  PaletteItemSchema,
  PaletteGroupsSchema,
  PaletteGroupSchema,
  NodeSchema,
  NodesSchema,
  ProjectAnimationSchema,
  ProjectInterpolationType,
  ProjectChannelSchema,
};

/**
 * V4版本Voxa工程文件
 */
export const ProjectDataV4Schema = new MuStruct({
  /***
   * 作品版本。
   */
  version: new MuVarint(4),
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

export type ProjectDataV4 = typeof ProjectDataV4Schema.identity;
