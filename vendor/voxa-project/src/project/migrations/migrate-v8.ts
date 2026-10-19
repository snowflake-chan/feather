import type { ProjectDataV8 } from '../schema-v8';
import { ProjectDataV9, ProjectDataV9Schema } from 'project/schema-v9';

export const migrateV8 = (data: ProjectDataV8): ProjectDataV9 => {
  const v9 = ProjectDataV9Schema.clone(ProjectDataV9Schema.identity);

  const { version, ...others } = data;

  Object.assign(v9, others);

  return v9;
};
