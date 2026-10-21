import { type UITree } from '@box/schema/project/ui-rda/defs';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import { GameUINode } from '../../../../engine/game-ui/nodes/base';
import { GameUINodeLoader } from 'src/engine/game-ui/node-loader';
import { isRenderable } from 'src/engine/game-ui/util';
import type { GetRenderableNode } from '../defs';

const TEMP_SET = new Set<string>();

export class GameUINodeManager extends GameUINodeLoader {
  private readonly nodes = new Map<string, GameUINode>();

  /**
   * 从根节点开始把ui节点加载进舞台中，并记录在内部的map中
   * @param uiTree
   */
  public loadUITree(uiTree: UITree) {
    // 记录当前id数组，最后判断哪些未被使用
    for (const [id] of this.nodes) {
      TEMP_SET.add(id);
    }

    this.loadNode(TEMP_SET, uiTree, ROOT_ID, 0);

    TEMP_SET.forEach((id) => {
      this.removeNode(id);
    });

    TEMP_SET.clear();
  }

  private loadNode(
    idsToRemove: Set<string>,
    uiTree: UITree,
    id: string,
    idx: number,
  ) {
    const treeNode = uiTree[id];

    const { parentId, childrenIds } = treeNode;

    if (id !== ROOT_ID) {
      if (!treeNode.value) {
        return;
      }

      let node = this.nodes.get(id);

      if (node) {
        this.updateUINode(node, treeNode);
      } else {
        node = this.parseUINode(treeNode);
      }

      if (!node) {
        return;
      }

      this.nodes.set(node.id, node);

      idsToRemove.delete(node.id);

      this.objectSet?.add(node);

      const parent =
        parentId === ROOT_ID ? this.root : this.nodes.get(parentId);

      parent?.addChildAt(node, idx);
    }

    childrenIds.forEach((childId, idx) => {
      this.loadNode(idsToRemove, uiTree, childId, idx);
    });
  }

  /**
   * 删除节点以及其子节点
   * @param nodeId
   */
  public removeNode(nodeId: string) {
    const node = this.nodes.get(nodeId);

    if (!node) {
      return;
    }

    node.parent?.remove(node);

    node.children.forEach(({ id }) => this.removeNode(id));

    this.nodes.delete(nodeId);
  }

  /**
   * 清除所有节点
   */
  public clear() {
    this.root.children.forEach(({ id }) => {
      this.removeNode(id);
    });
  }

  /**
   * 根据id查找节点
   * 如果id等于ROOT_ID，返回根节点。否则查询节点。
   */
  public getNode = (nodeId: string) => {
    if (nodeId === ROOT_ID) {
      return this.root;
    }

    return this.nodes.get(nodeId);
  };

  /**
   * 根据id查找可渲染的节点
   */
  public getRenderableNode: GetRenderableNode = (nodeId) => {
    const node = this.nodes.get(nodeId);

    if (!node) {
      return;
    }

    return isRenderable(node) ? node : undefined;
  };

  public getAllNodes = () => {
    return this.nodes.values();
  };
}
