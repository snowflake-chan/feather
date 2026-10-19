import { ModelDataV1, ModelDataV1Schema } from './schema-v1';
import { ModelDataV2, ModelDataV2Schema } from './schema-v2';
import { ModelDataV3, ModelDataV3Schema } from './schema-v3';
import { ModelDataV4, ModelDataV4Schema } from './schema-v4';
import { ModelDataV5, ModelDataV5Schema } from './schema-v5';
import { ModelDataV6, ModelDataV6Schema } from './schema-v6';
import { ModelDataV7, ModelDataV7Schema } from './schema-v7';

export type ModelData = ModelDataV7;

export type ModelDataTypes =
  | ModelDataV1
  | ModelDataV2
  | ModelDataV3
  | ModelDataV4
  | ModelDataV5
  | ModelDataV6
  | ModelDataV7;
/**
 * 当前Voxa模型文件的版本
 */
export const VOXA_MODEL_VERSION = 7;

export const MODEL_SCHEMA = {
  1: ModelDataV1Schema,
  2: ModelDataV2Schema,
  3: ModelDataV3Schema,
  4: ModelDataV4Schema,
  5: ModelDataV5Schema,
  6: ModelDataV6Schema,
  7: ModelDataV7Schema,
};
