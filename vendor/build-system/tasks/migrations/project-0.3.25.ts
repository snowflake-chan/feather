import { BuildSystem } from '../../type';
import { DEFAULT_SCREEN_ID } from '@box/schema/project/ui-rda/defs';
import { isUIScreen } from '@box/schema/project/ui-rda/util';

export const name = 'project';
export const fromVersion = '0.3.24';
export const toVersion = '0.3.25';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.25';
  project.prevHash = hash;

  // 屏幕增加zIndex
  const uiTree = await bs.retrieveJSON(project.uiTree);

  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value) {
      return;
    }

    const value = treeNode.value;

    if (isUIScreen(value)) {
      value.data.zIndex = 1;
    }
  });

  project.uiTree = await bs.storeJSON(uiTree);

  // defaultScreenId
  project.defaultScreenId = DEFAULT_SCREEN_ID;

  return bs.storeJSON(project);
}
