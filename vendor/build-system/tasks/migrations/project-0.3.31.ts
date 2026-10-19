import { isUIElement } from '@box/schema/project/ui-rda/util';
import { BuildSystem } from '../../type';
import { UITree } from '@box/schema/project/ui-rda/defs';

export const name = 'project';
export const fromVersion = '0.3.30';
export const toVersion = '0.3.31';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.31';
  project.prevHash = hash;

  const uiTree: UITree = await bs.retrieveJSON(project.uiTree);

  // UI元素新增“旋转”
  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value || !isUIElement(treeNode.value)) {
      return;
    }

    treeNode.value.data.data.rotation = 0;
  });

  project.uiTree = await bs.storeJSON(uiTree);

  return bs.storeJSON(project);
}
