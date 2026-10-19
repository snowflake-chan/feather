export { migrate as migrateModel, modelBytesToSchema, modelSchemaToBytes, isLatest as isLatestModel, getVersion as getModelVersion, } from './migrations';
export { VOXA_MODEL_VERSION } from './def';
export * as modelV1 from './schema-v1';
export * as modelV2 from './schema-v2';
export * as modelV3 from './schema-v3';
export * as modelV4 from './schema-v4';
export * as modelV5 from './schema-v5';
export * as modelV6 from './schema-v6';
export * as modelV7 from './schema-v7';
export interface ModelMetaData {
    version: number;
    bounds: [number, number, number];
    dataHash: string;
    motionList?: MotionMetaData[];
    useCustomBounds?: boolean;
    customBounds?: {
        size: [number, number, number];
        offset: [number, number, number];
    };
    renderBoxOffset?: [number, number, number];
}
export interface MotionMetaData {
    id: string;
    name: string;
    duration: number;
}
export declare function getModelMetaData(hash: string, bytes: Uint8Array): ModelMetaData | undefined;
