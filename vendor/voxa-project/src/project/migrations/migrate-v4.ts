import { ProjectDataV5, ProjectDataV5Schema } from '../schema-v5';
import type { ProjectDataV4 } from '../schema-v4';

export const migrateV4 = (data: ProjectDataV4): ProjectDataV5 => {
  const v5 = ProjectDataV5Schema.clone(ProjectDataV5Schema.identity);

  const { nodes, voxels, palette } = data;

  v5.nodes = migrateV4Nodes(nodes);
  v5.voxels = voxels;
  v5.palette = palette;

  // v5的动画数据结构与v4不兼容，v4也没有实际存储动画数据，因此用空数组即可
  v5.animations = [];

  return v5;
};

/**
 * v5版本作品node数据新增字段skinId，boneId
 * @param data
 * @returns
 */
function migrateV4Nodes(data: ProjectDataV4['nodes']): ProjectDataV5['nodes'] {
  return Object.values(data).reduce<ProjectDataV5['nodes']>((prev, curr) => {
    prev[curr.id] = {
      ...curr,
      skinId: '',
      boneId: '',
    };
    return prev;
  }, {});
}
