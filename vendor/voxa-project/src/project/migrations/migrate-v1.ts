import type { ProjectDataV1 } from '../schema-v1';
import { ProjectDataV2 } from '../schema-v2';
import { Uint8Vec3Schema, Vec3Schema, ProjectNodeType } from '../../util';

const ROOT_ID = 'ROOT';
const SKIN_PART_NAME = 'Object';
const EMPTY_PALETTE_ITEM = -1;

export const migrateV1 = (data: ProjectDataV1): ProjectDataV2 => {
  const { voxels, nodes } = data;

  const newNodes = migrateV1Nodes(nodes);

  const newPalette = migrateV1Palette(data);

  const newVoxels = migrateV1Voxels(voxels);

  return {
    nodes: newNodes,
    voxels: newVoxels,
    palette: newPalette,
    version: 2,
  };
};

function migrateV1Nodes(data: ProjectDataV1['nodes']): ProjectDataV2['nodes'] {
  return Object.values(data).reduce<ProjectDataV2['nodes']>((prev, curr) => {
    prev[curr.id] = {
      ...curr,
      // 旧版v1只有单个部件，自动重命名为默认名字Object，根节点名字不动
      name: curr.id === ROOT_ID ? curr.name : SKIN_PART_NAME,
      alpha: 1,
      // 旧版v1只有单个部件，角度都还未进行旋转，欧拉角都为0
      euler: Vec3Schema.clone(Vec3Schema.identity),
      flip: Uint8Vec3Schema.clone(Uint8Vec3Schema.identity),
    };
    return prev;
  }, {});
}

function migrateV1Palette(data: ProjectDataV1): ProjectDataV2['palette'] {
  const { palette, nodes, voxels } = data;
  const { groups, items, groupList } = palette;

  // 由于旧版v1线上只能编辑单个部件，这里也只取首个部件进行处理。
  const rootNode = nodes[ROOT_ID];
  const childId = rootNode.childrenIds ? rootNode.childrenIds[0] : undefined;

  if (!childId) {
    throw new Error('Cannot find first node id.');
  }

  const node = nodes[childId];

  if (
    node.type !== ProjectNodeType.SkinPart ||
    !node.voxelId ||
    !voxels[node.voxelId]
  ) {
    throw new Error('No valid voxels');
  }

  const voxel = voxels[node.voxelId];

  const { localPalette } = voxel;

  /**
   * 由于旧版的数据没有保留首位作为占位，需要填一个。
   */
  const newItems: ProjectDataV2['palette']['items'] = [];

  /**
   * 记录下id对应的新索引。
   */
  const originalIdLookup: Record<string, number> = {};

  /**
   * 由于voxelView记录的是localPalette上的索引，所以需要根据该索引的顺序来还原全局色表。
   */
  localPalette.forEach((prevId, idx) => {
    if (prevId === EMPTY_PALETTE_ITEM) {
      return;
    }

    const { id, color, ...others } = items[prevId];

    const { r, g, b } = color;

    const newId = idx + 1;
    const rgb = Uint8Vec3Schema.alloc();
    rgb[0] = r;
    rgb[1] = g;
    rgb[2] = b;

    newItems.push({
      id: newId,
      rgb,
      ...others,
    });

    originalIdLookup[id] = newId;
  });

  const newGroups = Object.values(groups).reduce((prev, curr) => {
    const newItemIds: number[] = [];

    curr.colorIndices.forEach((idx) => {
      const { id } = items[idx];

      if (originalIdLookup[id] !== undefined) {
        newItemIds.push(originalIdLookup[id]);
      }
    });

    prev[curr.id] = {
      id: curr.id,
      name: curr.name,
      itemIds: newItemIds,
    };
    return prev;
  }, {});

  return {
    items: newItems,
    groups: newGroups,
    groupList,
  };
}

function migrateV1Voxels(
  voxels: ProjectDataV1['voxels'],
): ProjectDataV2['voxels'] {
  return Object.values(voxels).reduce<ProjectDataV2['voxels']>((prev, cur) => {
    const { id, encodedView } = cur;

    prev[id] = {
      id,
      encodedView,
    };

    return prev;
  }, {});
}
