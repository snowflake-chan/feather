import { BodyPart } from '@box/schema/player/player-schema';

export { VOXA_SKIN_VERSION, BodyPartDataTypes, BodyPartData } from './def';
export {
  migrate as migrateSkin,
  bodyPartSchemaToBytes,
  bodyPartBytesToSchema,
  isLatest as isLatestSkin,
} from './migrations';
export * as skinV1 from './schema-v1';
export * as skinV2 from './schema-v2';
export * as skinV3 from './schema-v3';

type PartName = keyof typeof BodyPart;
type Skin = {
  [K in PartName]: string;
};

/**
 * 定义并规范皮肤的meta data数据类型
 */
export interface SkinMetaData extends Partial<Skin> {
  /**
   * 版本号
   */
  version: number;
}

export function getSkinMetaData(bytes: Uint8Array): SkinMetaData | undefined {
  try {
    return JSON.parse(Buffer.from(bytes).toString());
  } catch (e) {}
}
