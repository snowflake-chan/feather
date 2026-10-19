import {
  MuDictionary,
  MuVarint,
  MuStruct,
  MuArray,
  MuUTF8,
} from '@box/mudb/schema';
import {
  NetSkinTableSchema,
  NetMeshTableSchema,
  NetSkinPartTableSchema,
} from '@box/schema/mesh/model-schema';
import { HashSchema } from '@box/content-server';
import { MotionListSchema } from '@box/schema/project/hot-schema';
import { Vec3Schema } from '@box/schema/utils/math-schema';

export const ServerMeshInfoSchema = new MuStruct({
  hash: HashSchema,
  motionList: MotionListSchema,
  /**
   * 物理刚体与模型锚点的偏移量
   */
  rigidBodyOffset: Vec3Schema,
  /**
   * 外观框与模型锚点的偏移量
   */
  renderBoxOffset: Vec3Schema,
});

export const ServerModelStateSchema = new MuStruct({
  /**
   * 用于同步数据到客户端，更新物理模型
   */
  clientMeshTable: NetMeshTableSchema,
  /**
   * 记录clientMeshTable的id，元素是名字(含路径前缀)，index作为ID，可以直接在clientMeshTable中查找
   * 在script-host中直接赋值给ScriptResourceSchema
   */
  meshTableFiles: new MuArray(new MuUTF8(), Infinity, ['']),
  /**
   * 以hash为key，记录motionList
   */
  meshHashIndex: new MuDictionary(ServerMeshInfoSchema, Infinity),

  /**
   * 用户同步数据到客户端
   */
  clientSkinTable: NetSkinTableSchema,
  /**
   * 记录clientSkinTable的id，元素是名字，index作为ID，可以直接在clientSkinTable中查找
   * 在script-host中直接赋值给ScriptResourceSchema
   */
  skinTableFiles: new MuArray(new MuUTF8(), Infinity, ['']),
  /**
   * 默认皮肤ID。用于同步到script以及server运行时同步player地图皮肤数据
   */
  defaultSkinId: new MuVarint(0),

  skinPartTable: NetSkinPartTableSchema,
  invSkinPartIndex: new MuDictionary(new MuVarint(), Infinity),
  skinPartCounter: new MuVarint(1),
});
