import { BodyPartDataV1, BodyPartDataV1Schema } from './schema-v1';
import { BodyPartDataV2, BodyPartDataV2Schema } from './schema-v2';
import { BodyPartDataV3, BodyPartDataV3Schema } from './schema-v3';

export type BodyPartData = BodyPartDataV3;

export type BodyPartDataTypes =
  | BodyPartDataV1
  | BodyPartDataV2
  | BodyPartDataV3;

/**
 * 当前Voxa皮肤文件的版本
 */
export const VOXA_SKIN_VERSION = 3;

export const BODY_PART_SCHEMA = {
  1: BodyPartDataV1Schema,
  2: BodyPartDataV2Schema,
  3: BodyPartDataV3Schema,
};
