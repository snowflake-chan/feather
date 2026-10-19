import { BuildSystem } from '../../type';
import { isUIElement, isUITextElement } from '@box/schema/project/ui-rda/util';
import { UITree } from '@box/schema/project/ui-rda/defs';

export const name = 'project';
export const fromVersion = '0.3.22';
export const toVersion = '0.3.23';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.23';
  project.prevHash = hash;

  const uiTree = await bs.retrieveJSON(project.uiTree);

  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value) {
      return;
    }

    const value = treeNode.value;

    if (isUIElement(value) && isUITextElement(value.data)) {
      value.data.data.autoWordWrap = false;
      value.data.data.textLineHeight = 1.2;
    }
  });

  project.uiTree = await bs.storeJSON(uiTree);

  return bs.storeJSON(project);
}
