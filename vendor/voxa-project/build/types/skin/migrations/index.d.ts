import { BodyPartData, BodyPartDataTypes } from '../def';
export declare function migrate(bytes: Uint8Array): BodyPartData | undefined;
export declare const isLatest: (data: BodyPartDataTypes) => data is BodyPartData;
export declare function bodyPartBytesToSchema(bytes: Uint8Array): {
    version: 3 | 1 | 2;
    schema: BodyPartDataTypes;
} | undefined;
export declare function bodyPartSchemaToBytes(value: BodyPartDataTypes): Uint8Array;
