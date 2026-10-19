import { ProjectDataV7Schema, ProjectDataV7 } from '../schema-v7';
import type { ProjectDataV6 } from '../schema-v6';
import { Mat3Schema } from '../../util';

const IDENTITY_SCALE_MAT3 = Mat3Schema.fromJSON([1, 0, 0, 0, 1, 0, 0, 0, 1]);

export const migrateV6 = (data: ProjectDataV6): ProjectDataV7 => {
  const v7 = ProjectDataV7Schema.clone(ProjectDataV7Schema.identity);

  const { version, ...others } = data;

  Object.assign(v7, others);

  Object.keys(v7.nodes).forEach((id) => {
    const node = v7.nodes[id];
    node.parentScaleMat3 = Mat3Schema.clone(IDENTITY_SCALE_MAT3);
  });

  return v7;
};
