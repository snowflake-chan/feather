import { DropTarget } from './defs';
import { TreeNodeData } from './tree-node';

/**
 * 根据层偏移量查找真正的drop目标
 * @param dropTarget 原本的drop目标
 * @param treeNodeDataMap 节点数据
 * @returns 真正的drop目标节点数据
 */
export const getRealDropData = (
  dropTarget: DropTarget,
  treeNodeDataMap: Map<string, TreeNodeData>,
) => {
  let realData = treeNodeDataMap.get(dropTarget.dropId);
  for (let i = 0; i > dropTarget.levelOffset; i--) {
    if (!realData) {
      return;
    }

    const parentId = treeNodeDataMap.get(realData.id)?.parentId;
    if (!parentId) {
      break;
    }
    realData = treeNodeDataMap.get(parentId);
  }

  return realData;
};

/**
 * 获取当前treeNode的面包屑路径
 * @param treeNodeDataMap 数据来源
 * @param id 当前元素ID
 * @returns 面包屑路径
 */
export const getBreadcrumbs = (
  treeNodeDataMap: Map<string, TreeNodeData>,
  id: string,
) => {
  const breadcrumbs: string[] = [];
  let parentId = treeNodeDataMap.get(id)?.parentId;
  while (parentId) {
    breadcrumbs.push(parentId);
    parentId = treeNodeDataMap.get(parentId)?.parentId;
  }

  return breadcrumbs;
};
