import { MuSchema } from '@box/mudb/schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import {
  ModelData,
  ModelDataTypes,
  MODEL_SCHEMA,
  VOXA_MODEL_VERSION,
} from '../def';
import { migrateV1 } from './migrate-v1';
import { migrateV2 } from './migrate-v2';
import { migrateV3 } from './migrate-v3';
import { migrateV4 } from './migrate-v4';
import { migrateV5 } from './migrate-v5';
import { migrateV6 } from './migrate-v6';

export async function migrate(
  bytes: Uint8Array,
): Promise<ModelData | undefined> {
  const data = modelBytesToSchema(bytes);

  if (!data) {
    return;
  }

  const { version, schema } = data;

  if (version > VOXA_MODEL_VERSION) {
    console.error(
      `version: ${version} is higher than current version: ${VOXA_MODEL_VERSION}`,
    );
    return;
  }

  let modelData = schema;

  const migrations: Record<
    number,
    (data: ModelDataTypes) => Promise<ModelDataTypes>
  > = {
    1: migrateV1,
    2: migrateV2,
    3: migrateV3,
    4: migrateV4,
    5: migrateV5,
    6: migrateV6,
  };

  while (getVersion(modelData) < VOXA_MODEL_VERSION) {
    modelData = await migrations[getVersion(modelData)](modelData);
  }

  if (!isLatest(modelData)) {
    console.error(`Failed to migrate model to latest version`);
    return;
  }

  return modelData;
}

export const getVersion = (data: ModelDataTypes) => {
  return (data as ModelData).version || 1;
};

export const isLatest = (data: ModelDataTypes): data is ModelData => {
  return getVersion(data) === VOXA_MODEL_VERSION;
};

type ModelSchemaMap = typeof MODEL_SCHEMA;

export function modelBytesToSchema(bytes: Uint8Array) {
  try {
    // 第一版本的bytes存储的是json
    // 如果json.meshes有值直接通过fromJSON生成schema
    const json = JSON.parse(Buffer.from(bytes).toString());
    if (json.meshes) {
      return {
        version: 1,
        schema: MODEL_SCHEMA[1].fromJSON(json),
      };
    }
  } catch (e) {}

  // 第一位存储的是版本号
  const stream = new MuReadStream(bytes);
  const version = stream.readVarint();
  if (!isValidModelVersion(version)) {
    console.error(`version: ${version} is invalid`);
    return;
  }

  const schema: MuSchema<ModelDataTypes> = MODEL_SCHEMA[version];
  return {
    version,
    schema: schema.patch(schema.identity, stream),
  };
}

function isValidModelVersion(version: number): version is keyof ModelSchemaMap {
  return version > 0 && version <= VOXA_MODEL_VERSION;
}

export function modelSchemaToBytes(value: ModelDataTypes) {
  const ws = new MuWriteStream(0);
  // 没有version字段的 ModelDataV1
  // 代表的是版本1
  const num: keyof ModelSchemaMap = value['version'] || 1;
  // 首位写入版本号
  ws.grow(5);
  ws.writeVarint(num);
  const schema: MuSchema<ModelDataTypes> = MODEL_SCHEMA[num];
  schema.diff(schema.identity, value, ws);
  const bytes = ws.bytes();
  ws.destroy();
  return bytes;
}
