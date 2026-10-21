import { modelBytesToSchema } from './migrations';
import { ModelDataTypes } from './def';
import type { ModelDataV1 } from './schema-v1';
import type { ModelDataV2 } from './schema-v2';
import type { ModelDataV3 } from './schema-v3';

export {
  migrate as migrateModel,
  modelBytesToSchema,
  modelSchemaToBytes,
  isLatest as isLatestModel,
  getVersion as getModelVersion,
} from './migrations';
export { VOXA_MODEL_VERSION } from './def';
export * as modelV1 from './schema-v1';
export * as modelV2 from './schema-v2';
export * as modelV3 from './schema-v3';
export * as modelV4 from './schema-v4';
export * as modelV5 from './schema-v5';
export * as modelV6 from './schema-v6';
export * as modelV7 from './schema-v7';

/**
 * 定义并规范模型的meta data数据类型
 */
export interface ModelMetaData {
  /**
   * 版本号
   */
  version: number;
  /**
   * 物理碰撞框
   */
  bounds: [number, number, number];
  /**
   * 模型数据的hash值
   */
  dataHash: string;
  /**
   * 动作列表
   */
  motionList?: MotionMetaData[];
  /**
   * 是否使用自定义物理碰撞框
   */
  useCustomBounds?: boolean;
  /**
   * 自定义物理碰撞框数据
   */
  customBounds?: {
    /**
     * 框的大小
     */
    size: [number, number, number];
    /**
     * 自定义物理框与外观框锚点的偏移量
     * 目前外观框的锚点就是外观框的质心
     */
    offset: [number, number, number];
  };
  /**
   * 外观框中心与锚点的偏移量
   */
  renderBoxOffset?: [number, number, number];
}

export interface MotionMetaData {
  /**
   * 动作ID
   */
  id: string;
  /**
   * 动作名字
   */
  name: string;
  /**
   * 动作时长
   */
  duration: number;
}

export function getModelMetaData(
  hash: string,
  bytes: Uint8Array,
): ModelMetaData | undefined {
  const metaData = getMetaDataByBytes(bytes);
  if (metaData) {
    return metaData;
  }
  const data = modelBytesToSchema(bytes);
  if (!data || !hasBounds(data.schema)) {
    return;
  }
  let [x, y, z] = data.schema.bounds;

  // v1版本的bounds存储的是：体素结束坐标 - 体素开始坐标
  // 得到的bounds少了1，需要加回来
  if (data.version === 1) {
    x++;
    y++;
    z++;
  }

  return {
    version: data.version,
    bounds: [x, y, z],
    dataHash: hash,
  };
}

// 版本4之前model数据都有bounds字段
// 版本4之后bounds字段移到了metaData中存储
type ModelBeforeVersion4 = ModelDataV1 | ModelDataV2 | ModelDataV3;
function hasBounds(data: ModelDataTypes): data is ModelBeforeVersion4 {
  return !!(data as ModelBeforeVersion4).bounds;
}

function getMetaDataByBytes(bytes: Uint8Array): ModelMetaData | undefined {
  try {
    const json = JSON.parse(Buffer.from(bytes).toString());
    // json存储并且有version, bounds, dataHash字段
    // 证明存储的数据为metaData
    if (json.version && json.bounds && json.dataHash) {
      return json;
    }
  } catch (e) {}
}
