import { ProjectDataV6Schema, ProjectDataV6 } from '../schema-v6';
import type { ProjectDataV5 } from '../schema-v5';
import { Vec3Schema } from '../../util';

const IDENTITY_SCALE = Vec3Schema.fromJSON([1, 1, 1]);

export const migrateV5 = (data: ProjectDataV5): ProjectDataV6 => {
  const v6 = ProjectDataV6Schema.clone(ProjectDataV6Schema.identity);

  const { version, ...others } = data;

  Object.assign(v6, others);

  Object.keys(v6.nodes).forEach((id) => {
    const node = v6.nodes[id];

    node.scale = Vec3Schema.clone(IDENTITY_SCALE);
  });

  return v6;
};
