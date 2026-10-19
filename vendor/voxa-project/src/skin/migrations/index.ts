import { MuSchema } from '@box/mudb/schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import {
  VOXA_SKIN_VERSION,
  BodyPartData,
  BodyPartDataTypes,
  BODY_PART_SCHEMA,
} from '../def';
import { migrateV1 } from './migrate-v1';
import { migrateV2 } from './migrate-v2';

export function migrate(bytes: Uint8Array): BodyPartData | undefined {
  const data = bodyPartBytesToSchema(bytes);

  if (!data) {
    return;
  }

  const { version, schema } = data;

  if (version > VOXA_SKIN_VERSION) {
    console.error(
      `version: ${version} is higher than current version: ${VOXA_SKIN_VERSION}`,
    );
    return;
  }

  let bodyData = schema;

  const migrations: Record<
    number,
    (data: BodyPartDataTypes) => BodyPartDataTypes
  > = {
    1: migrateV1,
    2: migrateV2,
  };

  while (bodyData.version < VOXA_SKIN_VERSION) {
    bodyData = migrations[bodyData.version](bodyData);
  }

  if (!isLatest(bodyData)) {
    console.error(`Failed to migrate model to latest version`);
    return;
  }

  return bodyData;
}

export const isLatest = (data: BodyPartDataTypes): data is BodyPartData => {
  return data.version === VOXA_SKIN_VERSION;
};

type BodyPartSchemaMap = typeof BODY_PART_SCHEMA;

export function bodyPartBytesToSchema(bytes: Uint8Array) {
  // 第一位存储的是版本号
  const stream = new MuReadStream(bytes);
  const version = stream.readVarint();
  if (!isValidBodyVersion(version)) {
    console.error(`version: ${version} is invalid`);
    return;
  }

  const schema: MuSchema<BodyPartDataTypes> = BODY_PART_SCHEMA[version];
  return {
    version,
    schema: schema.patch(schema.identity, stream),
  };
}

function isValidBodyVersion(
  version: number,
): version is keyof BodyPartSchemaMap {
  return version > 0 && version <= VOXA_SKIN_VERSION;
}

export function bodyPartSchemaToBytes(value: BodyPartDataTypes) {
  const ws = new MuWriteStream(0);
  const version = value.version;
  // 首位写入版本号
  ws.grow(5);
  ws.writeVarint(version);

  const schema: MuSchema<BodyPartDataTypes> = BODY_PART_SCHEMA[version];
  schema.diff(schema.identity, value, ws);
  const bytes = ws.bytes();
  ws.destroy();
  return bytes;
}
