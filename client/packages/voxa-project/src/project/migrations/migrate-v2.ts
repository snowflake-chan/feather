import { ProjectDataV2 } from '../schema-v2';
import { ProjectDataV3, NodeSchema } from '../schema-v3';
import { ProjectNodeType } from '../../util';

const ROOT_ID = 'ROOT';
const ROOT_BONE_ID = 'ROOT_BONE';
export const ROOT_SKIN_ID = 'ROOT_SKIN';

export const ROOT_NAME = 'Root';

export const migrateV2 = (data: ProjectDataV2): ProjectDataV3 => {
  const { nodes, voxels, palette } = data;

  const newNodes = migrateV2Nodes(nodes);

  return {
    nodes: newNodes,
    voxels: voxels,
    palette: palette,
    animations: [],
    version: 3,
  };
};

function migrateV2Nodes(data: ProjectDataV2['nodes']): ProjectDataV3['nodes'] {
  const newData = Object.values(data).reduce<ProjectDataV3['nodes']>(
    (prev, curr) => {
      // v2版作品root节点id可能为空，改为正确的ROOT_ID
      const id = curr.type === ProjectNodeType.Root ? ROOT_ID : curr.id;
      prev[id] = {
        ...curr,
        id: id,
      };
      return prev;
    },
    {},
  );

  const root = newData[ROOT_ID];

  // 新增皮肤根节点，插入到根节点和其子节点之间
  const rootSkin = NodeSchema.clone(NodeSchema.identity);
  rootSkin.id = ROOT_SKIN_ID;
  rootSkin.name = ROOT_NAME;
  rootSkin.type = ProjectNodeType.Group;
  rootSkin.parentId = ROOT_ID;
  rootSkin.childrenIds = [...root.childrenIds];
  newData[rootSkin.id] = rootSkin;

  // 新增骨骼根节点，插入到根节点下第一个位置
  const rootBone = NodeSchema.clone(NodeSchema.identity);
  rootBone.id = ROOT_BONE_ID;
  rootBone.name = ROOT_NAME;
  rootBone.type = ProjectNodeType.Bone;
  rootBone.parentId = ROOT_ID;
  rootBone.childrenIds = [];
  newData[rootBone.id] = rootBone;

  root.childrenIds = [rootBone.id, rootSkin.id];

  return newData;
}
