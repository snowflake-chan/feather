import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { MuArray, MuStruct, MuVarint } from '@box/mudb/schema';
import { Vec3Schema } from '../util';

import { ModelNodesSchema } from './schema-v2';

export { ModelNodeSchema, ModelNode } from './schema-v2';

export { ModelNodesSchema, MeshTextureSchema, MeshDataSchema };

/**
 * V3版本的模型文件
 */
export const ModelDataV3Schema = new MuStruct({
  /**
   * 模型文件的版本号
   */
  version: new MuVarint(3),
  /**
   * 模型文件的物理碰撞框
   */
  bounds: Vec3Schema,
  /**
   * 模型文件的节点数据
   * 严格按照父节点 -> 子节点的顺序输出
   * 第一个元素为根节点，仅存在children字段
   */
  nodes: ModelNodesSchema,
  /**
   * 模型的贴图合集
   */
  texture: MeshTextureSchema,
  /**
   * 模型mesh数据
   */
  meshes: new MuArray(MeshDataSchema, Infinity),
});

export type ModelDataV3 = typeof ModelDataV3Schema.identity;
