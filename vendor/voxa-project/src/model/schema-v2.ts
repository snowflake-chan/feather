import {
  MuArray,
  MuFloat32,
  MuInt32,
  MuStruct,
  MuVarint,
} from '@box/mudb/schema';
import { MeshSchema } from './schema-v1';
import { Vec3Schema, Vec4Schema } from '../util';

export { MeshSchema };

/**
 * 模型节点
 */
export const ModelNodeSchema = new MuStruct({
  /**
   * 节点对应的模型索引值
   */
  mesh: new MuInt32(-1),
  /**
   * 节点的旋转量
   * 相对于父节点的值
   */
  rotation: Vec4Schema,
  /**
   * 节点的位移量
   * 相对于父节点的值
   */
  translation: Vec3Schema,
  /**
   * 节点的子节点们的索引值
   */
  children: new MuArray(new MuVarint(), Infinity),

  /**
   * 透明度，默认为1
   */
  alpha: new MuFloat32(1),
});

export type ModelNode = typeof ModelNodeSchema.identity;

export const ModelNodesSchema = new MuArray(ModelNodeSchema, Infinity);

/**
 * V2版本的模型文件
 */
export const ModelDataV2Schema = new MuStruct({
  /**
   * 模型文件的版本号
   */
  version: new MuVarint(2),
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
   * 模型文件mesh数据
   */
  meshes: new MuArray(MeshSchema, Infinity),
});

export type ModelDataV2 = typeof ModelDataV2Schema.identity;
