import { BodyPart } from '@box/schema/player/player-schema';
export { VOXA_SKIN_VERSION, BodyPartDataTypes, BodyPartData } from './def';
export { migrate as migrateSkin, bodyPartSchemaToBytes, bodyPartBytesToSchema, isLatest as isLatestSkin, } from './migrations';
export * as skinV1 from './schema-v1';
export * as skinV2 from './schema-v2';
export * as skinV3 from './schema-v3';
type PartName = keyof typeof BodyPart;
type Skin = {
    [K in PartName]: string;
};
export interface SkinMetaData extends Partial<Skin> {
    version: number;
}
export declare function getSkinMetaData(bytes: Uint8Array): SkinMetaData | undefined;
