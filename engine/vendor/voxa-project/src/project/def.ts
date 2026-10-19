import { ProjectDataV1, ProjectDataV1Schema } from './schema-v1';
import { ProjectDataV2, ProjectDataV2Schema } from './schema-v2';
import { ProjectDataV3, ProjectDataV3Schema } from './schema-v3';
import { ProjectDataV4, ProjectDataV4Schema } from './schema-v4';
import { ProjectDataV5, ProjectDataV5Schema } from './schema-v5';
import { ProjectDataV6, ProjectDataV6Schema } from './schema-v6';
import { ProjectDataV7, ProjectDataV7Schema } from './schema-v7';
import { ProjectDataV8, ProjectDataV8Schema } from './schema-v8';
import { ProjectDataV9, ProjectDataV9Schema } from './schema-v9';
import { ProjectDataV10, ProjectDataV10Schema } from './schema-v10';

export type ProjectDataTypes =
  | ProjectDataV1
  | ProjectDataV2
  | ProjectDataV3
  | ProjectDataV4
  | ProjectDataV5
  | ProjectDataV6
  | ProjectDataV7
  | ProjectDataV8
  | ProjectDataV9
  | ProjectDataV10;

export type ProjectData = ProjectDataV10;

export const VOXA_PROJECT_VERSION = 10;

export const PROJECT_SCHEMA = {
  1: ProjectDataV1Schema,
  2: ProjectDataV2Schema,
  3: ProjectDataV3Schema,
  4: ProjectDataV4Schema,
  5: ProjectDataV5Schema,
  6: ProjectDataV6Schema,
  7: ProjectDataV7Schema,
  8: ProjectDataV8Schema,
  9: ProjectDataV9Schema,
  10: ProjectDataV10Schema,
};
