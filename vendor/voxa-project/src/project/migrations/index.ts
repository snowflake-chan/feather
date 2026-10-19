import { MuSchema } from '@box/mudb/schema';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';

import {
  ProjectDataTypes,
  ProjectData,
  VOXA_PROJECT_VERSION,
  PROJECT_SCHEMA,
} from '../def';
import { migrateV1 } from './migrate-v1';
import { migrateV2 } from './migrate-v2';
import { migrateV3 } from './migrate-v3';
import { migrateV4 } from './migrate-v4';
import { migrateV5 } from './migrate-v5';
import { migrateV6 } from './migrate-v6';
import { migrateV7 } from './migrate-v7';
import { migrateV8 } from './migrate-v8';
import { migrateV9 } from './migrate-v9';

export function migrate(bytes: Uint8Array): ProjectData | undefined {
  const data = projectBytesToSchema(bytes);

  if (!data) {
    return;
  }

  const { version, schema } = data;

  if (version > VOXA_PROJECT_VERSION) {
    console.error(
      `version: ${version} is higher than current version: ${VOXA_PROJECT_VERSION}`,
    );
    return;
  }

  let projectData = schema;

  const migrations: Record<number, Function> = {
    1: migrateV1,
    2: migrateV2,
    3: migrateV3,
    4: migrateV4,
    5: migrateV5,
    6: migrateV6,
    7: migrateV7,
    8: migrateV8,
    9: migrateV9,
  };

  while (projectData.version < VOXA_PROJECT_VERSION) {
    try {
      projectData = migrations[projectData.version](projectData);
    } catch (err) {
      console.error('Migration error', err);

      return;
    }
  }

  if (!isLatest(projectData)) {
    console.error(`Failed to migrate project to latest version`);
    return;
  }

  return projectData;
}

function isLatest(data: ProjectDataTypes): data is ProjectData {
  return data.version === VOXA_PROJECT_VERSION;
}

type ProjectSchemaMap = typeof PROJECT_SCHEMA;

export function projectBytesToSchema(bytes: Uint8Array) {
  try {
    // 第一版本的bytes存储的是json
    // 如果json.version有值直接通过fromJSON生成schema
    const json = JSON.parse(Buffer.from(bytes).toString());
    if (json.version) {
      return {
        version: 1,
        schema: PROJECT_SCHEMA[1].fromJSON(json),
      };
    }
  } catch (e) {}

  // 第一位存储的是版本号
  const stream = new MuReadStream(bytes);
  const version = stream.readVarint();
  if (!isValidProjectVersion(version)) {
    console.error(`version: ${version} is invalid`);
    return;
  }

  const schema: MuSchema<ProjectDataTypes> = PROJECT_SCHEMA[version];
  return {
    version,
    schema: schema.patch(schema.identity, stream),
  };
}

function isValidProjectVersion(
  version: number,
): version is keyof ProjectSchemaMap {
  return version > 0 && version <= VOXA_PROJECT_VERSION;
}

export function projectSchemaToBytes(value: ProjectDataTypes) {
  const ws = new MuWriteStream(0);
  const version = value.version;
  // 首位写入版本号
  ws.grow(5);
  ws.writeVarint(version);

  const schema: MuSchema<ProjectDataTypes> = PROJECT_SCHEMA[version];
  schema.diff(schema.identity, value, ws);
  const bytes = ws.bytes();
  ws.destroy();
  return bytes;
}
