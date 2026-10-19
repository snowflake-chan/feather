import type { ProjectDataV7 } from '../schema-v7';
import { ProjectDataV8, ProjectDataV8Schema } from 'project/schema-v8';
import { VoxelDimension } from '../../util';

export const migrateV7 = (data: ProjectDataV7): ProjectDataV8 => {
  const v8 = ProjectDataV8Schema.clone(ProjectDataV8Schema.identity);

  const { version, ...others } = data;

  Object.assign(v8, others);

  Object.keys(v8.voxels).forEach((id) => {
    const voxel = v8.voxels[id];
    voxel.dimension = VoxelDimension.XYZ;
  });

  return v8;
};
