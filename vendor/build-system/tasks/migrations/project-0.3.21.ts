import { BuildSystem } from '../../type';
import type { UILayoutType, UITree } from '@box/schema/project/ui-rda/defs';
import { isUIElement, isUIScreen } from '@box/schema/project/ui-rda/util';

export const name = 'project';
export const fromVersion = '0.3.20';
export const toVersion = '0.3.21';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.21';
  project.prevHash = hash;

  const uiTree = await bs.retrieveJSON(project.uiTree);

  // 添加“布局”属性
  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value) {
      return;
    }

    const noneLayout: UILayoutType = {
      type: 'none',
      data: undefined,
    };

    if (isUIElement(treeNode.value)) {
      treeNode.value.data.data.layoutOrder = 1;
      treeNode.value.data.data.layout = noneLayout;
    } else if (isUIScreen(treeNode.value)) {
      treeNode.value.data.layout = noneLayout;
    }
  });

  project.uiTree = await bs.storeJSON(uiTree);

  return bs.storeJSON(project);
}
