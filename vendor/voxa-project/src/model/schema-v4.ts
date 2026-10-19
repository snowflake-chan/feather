import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { MuArray, MuStruct, MuVarint } from '@box/mudb/schema';

import { ModelNodesSchema } from './schema-v2';

export { ModelNodeSchema, ModelNode } from './schema-v2';

export { ModelNodesSchema, MeshTextureSchema, MeshDataSchema };

/**
 * V4版本的模型文件
 * V4版本之后，提取模型文件数据通过mudb生成bytes存储
 * 其余（version，bounds）直接生成json存储
 */
export const ModelDataV4Schema = new MuStruct({
  /**
   * 模型文件的版本号
   * 文件内自存，用于写入bytes中
   */
  version: new MuVarint(4),
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

export type ModelDataV4 = typeof ModelDataV4Schema.identity;
