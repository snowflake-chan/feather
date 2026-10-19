import { BuildSystem } from '../../type';
import {
  isUIElement,
  pickAutoLayoutProp,
} from '@box/schema/project/ui-rda/util';

export const name = 'project';
export const fromVersion = '0.3.21';
export const toVersion = '0.3.22';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.22';
  project.prevHash = hash;

  const uiTree = await bs.retrieveJSON(project.uiTree);

  // 添加“布局”属性
  Object.keys(uiTree).forEach((treeNodeId) => {
    const treeNode = uiTree[treeNodeId];

    if (!treeNode || !treeNode.value) {
      return;
    }

    const value = treeNode.value;

    /**
     * 新增“裁剪”属性
     */
    if (isUIElement(value)) {
      value.data.data.clipsDescendants = false;
    }

    const autoLayout = pickAutoLayoutProp(value);

    // 删除没用的oderType
    if (autoLayout) {
      delete autoLayout.data['orderType'];
    }
  });

  project.uiTree = await bs.storeJSON(uiTree);

  return bs.storeJSON(project);
}
