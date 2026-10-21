import type { ProjectRDA } from '@box/schema/project/project-rda';
import type { UINode } from '@box/schema/project/ui-rda/defs';
import { isUIElement, isUIScreen } from '@box/schema/project/ui-rda/util';
import { UITree } from '@box/schema/project/ui-rda/defs';

/**
 * 辅助生成layout相关的action
 */
export function pickLayoutAction(
  nodeId: string,
  nodeValue: UINode,
  action: ReturnType<typeof ProjectRDA.action>,
) {
  if (isUIElement(nodeValue)) {
    return action.uiTree.update(nodeId).update().element.update()[
      nodeValue.data.type
    ].layout;
  } else {
    return action.uiTree.update(nodeId).update().screen.layout;
  }
}

/**
 * node 是否在screen下
 * @param nodeId
 * @param screenNodeId
 * @param tree
 */
export function isNodeInScreen(
  nodeId: string,
  screenNodeId: string,
  tree: UITree,
) {
  if (!tree[nodeId]) {
    return false;
  }
  let parentId = tree[nodeId].parentId;
  while (parentId) {
    if (parentId === screenNodeId) {
      return true;
    }
    parentId = tree[parentId].parentId;
  }
  return false;
}

export function getScreenNode(tree: UITree, nodeId: string) {
  let node = tree[nodeId];
  if (!node) {
    return null;
  }
  let parentId = tree[nodeId].parentId;
  let parent = tree[parentId];
  while (parent) {
    if (parent.value && isUIScreen(parent.value)) {
      return parent;
    }
    parent = tree[parent.parentId];
  }
  return null;
}
