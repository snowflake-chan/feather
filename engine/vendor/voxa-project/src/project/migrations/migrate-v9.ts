import type { ProjectDataV9 } from '../schema-v9';
import { ProjectDataV10, ProjectDataV10Schema } from '../schema-v10';

export const migrateV9 = (data: ProjectDataV9): ProjectDataV10 => {
  const v10 = ProjectDataV10Schema.clone(ProjectDataV10Schema.identity);

  const { version, ...others } = data;

  Object.assign(v10, others);

  return v10;
};
