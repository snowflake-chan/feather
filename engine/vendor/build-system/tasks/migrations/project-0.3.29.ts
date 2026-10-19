import { BuildSystem } from '../../type';
import { isUITextNode } from '@box/schema/project/ui-rda/util';

export const name = 'project';
export const fromVersion = '0.3.28';
export const toVersion = '0.3.29';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.29';
  project.prevHash = hash;

  const uiTree = await bs.retrieveJSON(project.uiTree);

  // UI文本新增“是否开启富文本”
  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value) {
      return;
    }

    if (isUITextNode(treeNode.value)) {
      treeNode.value.data.data;

      return;
    }
  });

  project.uiTree = await bs.storeJSON(uiTree);

  return bs.storeJSON(project);
}
