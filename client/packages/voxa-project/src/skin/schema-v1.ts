import {
  MuArray,
  MuVarint,
  MuStruct,
  MuUint8,
  MuSchema,
} from '@box/mudb/schema';
import { BodyPart } from '@box/schema/player/player-schema';
import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { ModelNodesSchema } from '../model/schema-v5';
import { Mat4Schema, Vec3Schema } from '../util';

/**
 * V1版本的皮肤部件文件
 */
export const BodyPartDataV1Schema = new MuStruct({
  /**
   * 皮肤部件文件的版本号
   */
  version: new MuVarint(1),
  /**
   * 皮肤部件id
   */
  partId: <MuSchema<BodyPart>>new MuUint8(0),
  /**
   * 绑骨的偏移量
   */
  bindMat: Mat4Schema,
  /**
   * 皮肤文件的最小外立方体形框
   */
  bounds: Vec3Schema,
  /**
   * 皮肤部件文件的节点数据
   * 严格按照父节点 -> 子节点的顺序输出
   * 第一个元素为根节点，仅存在children字段
   */
  nodes: ModelNodesSchema,
  /**
   * 部件文件的贴图合集
   */
  texture: MeshTextureSchema,
  /**
   * 部件模型mesh数据
   */
  meshes: new MuArray(MeshDataSchema, Infinity),
});

export type BodyPartDataV1 = typeof BodyPartDataV1Schema.identity;
