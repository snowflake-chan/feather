import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import {
  MuArray,
  MuASCII,
  MuSchema,
  MuStruct,
  MuUTF8,
  MuVarint,
} from '@box/mudb/schema';

import { ChannelNodePath, SamplerSchema } from '../util';

import { ModelNodesSchema } from './schema-v4';

export { ModelNodeSchema, ModelNode } from './schema-v4';

export { ModelNodesSchema, MeshTextureSchema, MeshDataSchema };

export const ChannelSchema = new MuStruct({
  /**
   * 对应samplers的索引值
   */
  sampler: new MuVarint(),
  /**
   * 节点目标
   */
  target: new MuStruct({
    /**
     * 对应节点的索引值
     */
    node: new MuVarint(),
    /**
     * 对应节点变化的属性值
     */
    path: <MuSchema<ChannelNodePath>>new MuASCII(),
  }),
});

export const AnimationSchema = new MuStruct({
  /**
   * 动画ID
   */
  id: new MuASCII(),
  /**
   * 动画的名字，可输入中英文以及某些特殊符号
   */
  name: new MuUTF8(),
  channels: new MuArray(ChannelSchema, Infinity),
  samplers: new MuArray(SamplerSchema, Infinity),
});

/**
 * V5版本的模型文件
 */
export const ModelDataV5Schema = new MuStruct({
  /**
   * 模型文件的版本号
   */
  version: new MuVarint(5),
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
  /**
   * 模型动画数据
   */
  animations: new MuArray(AnimationSchema, Infinity),
});

export type ModelDataV5 = typeof ModelDataV5Schema.identity;
