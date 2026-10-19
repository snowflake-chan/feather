import type { ProjectDataV3 } from '../schema-v3';
import type { ProjectDataV4 } from '../schema-v4';
import { ROOT_SKIN_ID } from './migrate-v2';

export const migrateV3 = (data: ProjectDataV3): ProjectDataV4 => {
  const { nodes, voxels, palette, animations } = data;

  const newNodes = migrateV3Nodes(nodes);

  return {
    nodes: newNodes,
    voxels,
    palette,
    animations,
    version: 4,
  };
};

/**
 * v3版本的nodes可能记录了错误的parentId，这里的迁移只修复这个错误关系，没有数据结构上的变更。
 */
function migrateV3Nodes(data: ProjectDataV3['nodes']): ProjectDataV4['nodes'] {
  /**
   * ROOT_SKIN的子节点的parentId可能是错的，遍历一遍进行修复
   */
  data[ROOT_SKIN_ID].childrenIds.forEach((childId) => {
    const child = data[childId];

    if (!child) {
      return;
    }

    child.parentId = ROOT_SKIN_ID;
  });

  return data;
}
