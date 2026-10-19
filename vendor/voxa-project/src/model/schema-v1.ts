import { MuArray, MuDictionary, MuStruct, MuUint8 } from '@box/mudb/schema';
import { Vec3Schema } from '../util';

export const MeshSchema = new MuArray(new MuUint8(), Infinity);

export type Mesh = typeof MeshSchema.identity;

/**
 * V1版本模型文件
 */
export const ModelDataV1Schema = new MuStruct({
  /**
   * 模型文件的物理碰撞框
   */
  bounds: Vec3Schema,
  /**
   * 模型文件mesh数据
   */
  meshes: new MuDictionary(MeshSchema, Infinity),
});

export type ModelDataV1 = typeof ModelDataV1Schema.identity;
