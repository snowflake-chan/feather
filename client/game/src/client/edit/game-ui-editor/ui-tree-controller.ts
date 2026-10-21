import { vec2, vec3 } from 'gl-matrix';
import {
  UIElementRDA,
  type UIElement,
  type UIElementType,
  UINodeRDA,
  UITextRDA,
  UIBoxRDA,
  UIImageRDA,
  AutoResizeType,
  TextXAlignType,
  TextYAlignType,
  UITreeRDA,
  UITreeNode,
  UILayoutRDA,
  AutoLayoutStartCorner,
  AutoLayoutFillDirection,
  AutoLayoutHorizontalAlignType,
  AutoLayoutVerticalAlignType,
  UIAutoLayoutRDA,
  UIScrollBoxRDA,
  UIScrollDirection,
  UIScrollbarHorizontal,
  UIScrollbarVertical,
  UIScrollbarVisibility,
  UIInputRDA,
  UIScreenRDA,
  UICoord2Keys,
  ImageDisplayMode,
  UITextFontFamily,
} from '@box/schema/project/ui-rda/defs';
import { ROOT_ID, TreeNodeType } from '@box/schema/project/murda-tree';
import {
  isUIElement,
  isUIImageNode,
  isUIInputNode,
  isUIScreen,
  isUIScrollBoxNode,
  isUITextNode,
  pickAutoLayoutProp,
  pickLayoutProp,
} from '@box/schema/project/ui-rda/util';
import { DropType } from '@box/box-design';
import type { GetUITree } from './defs';
import { isChildren, sortTreeNodes } from 'src/views/edit/components/tree/util';
import type { ClientProjectTransaction } from 'src/client/edit/replica/transaction/client-project-transaction';
import { pickLayoutAction } from './util';
import { EditActionLabel } from '../replica/replica-client-schema';
import { GetDefaultScreenId } from './defs';

export type AddElementPosition = {
  targetId: string;
  type: 'before' | 'after';
};

type AddElementParams = {
  /**
   * UI元素id
   */
  id: string;
  /**
   * UI元素名字
   */
  name: string;
  /**
   * UI元素
   */
  element: UIElement;
  /**
   * 父节点
   */
  parentId: string;
};

export class UITreeController {
  constructor(
    private getUITree: GetUITree,
    private transaction: ClientProjectTransaction,
    private getDefaultScreenId: GetDefaultScreenId,
  ) {}

  /**
   * 以默认值创建节点
   */
  public allocDefaultElement(type: UIElementType) {
    const element: UIElement = UIElementRDA.stateSchema.alloc();

    element.type = type;

    switch (type) {
      case 'box':
        element.data = UIBoxRDA.stateSchema.clone(
          UIBoxRDA.stateSchema.identity,
        );
        break;
      case 'text':
        element.data = UITextRDA.stateSchema.clone(
          UITextRDA.stateSchema.identity,
        );
        break;
      case 'image':
        element.data = UIImageRDA.stateSchema.clone(
          UIImageRDA.stateSchema.identity,
        );
        break;
      case 'scrollBox':
        element.data = UIScrollBoxRDA.stateSchema.clone(
          UIScrollBoxRDA.stateSchema.identity,
        );
        break;
      case 'input':
        element.data = UIInputRDA.stateSchema.clone(
          UIInputRDA.stateSchema.identity,
        );
        break;
    }

    return element;
  }

  public genId(newIds?: string[]) {
    let shift = 0;
    const checkIds = Object.keys(this.getUITree());
    newIds && checkIds.push(...newIds);

    while (true) {
      shift = Math.max(30, shift + 7);
      const id = (Math.random() * (1 << shift)) >>> 0;
      const idStr = id.toString();
      if (!checkIds.includes(idStr)) {
        return idStr;
      }
    }
  }

  public addElement(params: AddElementParams, commit: boolean = true) {
    const { id, name, element, parentId } = params;

    const node = UINodeRDA.stateSchema.alloc();

    node.type = 'element';
    node.data = element;

    this.transaction.push((action) =>
      action.uiTree.add({
        id,
        name,
        parentId,
        type: TreeNodeType.node,
        childrenIds: [],
        value: node,
      }),
    );
    if (commit) {
      this.transaction.commit();
    }
  }

  /**
   * 在指定节点下创建元素节点
   * @param type 元素类型
   * @param parentId 父节点
   * @commit
   */
  public createElement(
    type: UIElementType,
    parentId: string,
    commit: boolean = true,
  ) {
    const element = this.allocDefaultElement(type);

    const id = this.genId();
    const name = this.genNewName(type);

    this.addElement(
      {
        id,
        name,
        element,
        parentId,
      },
      commit,
    );

    return id;
  }

  /**
   * 创建屏幕
   */
  public createScreen() {
    const screen = UINodeRDA.stateSchema.alloc();
    screen.type = 'screen';
    screen.data = UIScreenRDA.stateSchema.clone(
      UIScreenRDA.stateSchema.identity,
    );
    // 新创建的屏幕数据默enable默认为false
    screen.data.enable = false;

    const id = this.genId();
    const name = this.genNewName('screen');

    this.transaction.push((action) =>
      action.uiTree.add({
        id,
        name,
        parentId: ROOT_ID,
        type: TreeNodeType.node,
        childrenIds: [],
        value: screen,
      }),
    );

    this.transaction.commit();

    return id;
  }

  public renameNode(id: string, newName: string) {
    // TODO 命名检查
    this.transaction
      .push((action) => action.uiTree.rename([{ nodeId: id, newName }]))
      .commit();
  }

  public moveScreen(
    screenId: string,
    dropTarget: string,
    dropType: AddElementPosition['type'],
  ) {
    this.transaction
      .push((action) =>
        action.uiTree.move({
          moveIds: [screenId],
          insertParentId: ROOT_ID,
          insert: {
            id: dropTarget,
            type: dropType,
          },
        }),
      )
      .commit();
  }

  /**
   * 移动节点位置
   */
  public moveElement(id: string, position: AddElementPosition) {
    const parentId = this.getUITree()[position.targetId].parentId;

    this.transaction
      .push((action) =>
        action.uiTree.move({
          moveIds: [id],
          insertParentId: parentId,
          insert: {
            id: position.targetId,
            type: position.type,
          },
        }),
      )
      .commit();
  }

  /**
   * 移动节点层级
   * 要移动的节点存在以下情况时，不进行移动：
   * - 放置的节点是移动节点的子节点
   */
  public moveElements = (
    moveTargets: string[],
    dropTarget: string,
    dropType: DropType,
  ) => {
    const uiTree = this.getUITree();

    for (let i = 0; i < moveTargets.length; i++) {
      if (
        moveTargets[i] === dropTarget ||
        isChildren(uiTree, moveTargets[i], dropTarget)
      ) {
        return false;
      }
    }

    const insertParentId =
      dropType === 'box' ? dropTarget : uiTree[dropTarget].parentId;
    if (!insertParentId) {
      return false;
    }

    this.transaction
      .push((action) =>
        action.uiTree.move({
          moveIds: sortTreeNodes(uiTree, moveTargets),
          insertParentId,
          insert:
            dropType === 'box'
              ? undefined
              : {
                  id: dropTarget,
                  type: dropType === 'top' ? 'before' : 'after',
                },
        }),
      )
      .commit();

    return true;
  };

  private copyNode = (id: string, newIds: string[], parentId?: string) => {
    const uiTree = this.getUITree();

    const node = uiTree[id];

    if (!node) {
      return;
    }

    const newNode = UITreeRDA.nodeSchema.clone(node);
    newNode.id = this.genId(newIds);
    newIds.push(newNode.id);

    if (parentId) {
      newNode.parentId = parentId;
    }

    const nodesInfo: {
      newNode: UITreeNode;
      newChildrenNodes: UITreeNode[];
    } = {
      newNode,
      newChildrenNodes: [],
    };

    if (!node.childrenIds.length) {
      return nodesInfo;
    }

    newNode.childrenIds.length = 0;
    node.childrenIds.forEach((childId) => {
      const childNodesInfo = this.copyNode(childId, newIds, newNode.id);
      if (!childNodesInfo) {
        return;
      }

      nodesInfo.newNode.childrenIds.push(childNodesInfo.newNode.id);
      nodesInfo.newChildrenNodes.push(childNodesInfo.newNode);
      nodesInfo.newChildrenNodes.push(...childNodesInfo.newChildrenNodes);
    });

    return nodesInfo;
  };

  public copyNodes = (nodeIds: string[]) => {
    const copyNodes: {
      sourceNodeId: string;
      newNode: UITreeNode;
      newChildrenNodes: UITreeNode[];
    }[] = [];

    const newIds: string[] = [];
    const newSelectedIds: string[] = [];

    nodeIds.forEach((nodeId) => {
      const newInfo = this.copyNode(nodeId, newIds);
      if (!newInfo) {
        return;
      }

      copyNodes.push({
        sourceNodeId: nodeId,
        newNode: newInfo.newNode,
        newChildrenNodes: newInfo.newChildrenNodes,
      });

      newSelectedIds.push(newInfo.newNode.id);
    });

    this.transaction.push((action) => action.uiTree.copy(copyNodes));
    this.transaction.commit();
    return newSelectedIds;
  };

  public removeNodes = (ids: string[]) => {
    this.transaction.push((action) => action.uiTree.remove(ids)).commit();

    return;
  };

  public removeScreen = (id: string) => {
    const screens = this.getUITree()[ROOT_ID].childrenIds;
    this.transaction.push((action) => action.uiTree.remove([id]));
    // 删除当前默认屏幕，则设置第一个屏幕为默认屏幕
    if (id === this.getDefaultScreenId()) {
      let firstScreen = screens[0];
      // 删除的默认屏幕正好是第一个屏幕，则设置第二个屏幕为默认屏幕
      if (firstScreen === id) {
        firstScreen = screens[1];
      }
      if (firstScreen) {
        this.transaction.push((action) => action.defaultScreenId(firstScreen));
        // 默认屏幕enable为true
        this.transaction.push((action) =>
          action.uiTree.update(firstScreen).update().screen.enable(true),
        );
        // 非默认屏幕enable为false
        this.transaction.push((action) =>
          action.uiTree.update(id).update().screen.enable(false),
        );
      }
    }
    this.transaction.commit();

    return;
  };

  private genNewName(prefix: string) {
    const uiTree = this.getUITree();

    for (let i = 1; true; i++) {
      const newName = `${prefix}-${i}`;
      let exist = false;
      for (const j in uiTree) {
        const treeNode = uiTree[j];
        if (treeNode.name === newName) {
          exist = true;
        }
        if (exist) {
          break;
        }
      }
      if (!exist) {
        return newName;
      }
    }
  }

  public setElementsPosition = (
    nodeIds: string[],
    axis: 'x' | 'y',
    type: UICoord2Keys,
    val: number,
  ) => {
    const uiTree = this.getUITree();
    const idx = axis === 'x' ? 0 : 1;

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      const position: vec2 = [
        element.data.data.position[type][0],
        element.data.data.position[type][1],
      ];
      position[idx] = val;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].position[type](position),
      );
    });

    this.transaction.commit();
  };

  public setElementsSize = (
    nodeIds: string[],
    axis: 'x' | 'y',
    type: UICoord2Keys,
    val: number,
  ) => {
    const uiTree = this.getUITree();
    const idx = axis === 'x' ? 0 : 1;

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      const size: vec2 = [
        element.data.data.size[type][0],
        element.data.data.size[type][1],
      ];
      size[idx] = val;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].size[type](size),
      );
    });

    this.transaction.commit();
  };

  public setElementsAnchor = (
    nodeIds: string[],
    axis: 'x' | 'y',
    value: number,
  ) => {
    const uiTree = this.getUITree();

    const idx = axis === 'x' ? 0 : 1;

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      const anchor: vec2 = [
        element.data.data.anchor[0],
        element.data.data.anchor[1],
      ];

      anchor[idx] = value;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].anchor(anchor),
      );
    });

    this.transaction.commit();
  };

  public setElementsZIndex = (nodeIds: string[], zIndex: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].zIndex(zIndex),
      );
    });

    this.transaction.commit();
  };

  public setScreenZIndex = (screenIds: string[], zIndex: number) => {
    const uiTree = this.getUITree();

    screenIds.forEach((screenId) => {
      const screen = uiTree[screenId];

      if (!screen || !screen.value || !isUIScreen(screen.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree.update(screenId).update().screen.zIndex(zIndex),
      );
    });

    this.transaction.commit();
  };

  public setElementsAutoResize = (
    nodeIds: string[],
    autoResize: AutoResizeType,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].autoResize(autoResize),
      );
    });

    this.transaction.commit();
  };

  public setElementsVisible = (nodeIds: string[], visible: boolean) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].visible(visible),
      );
    });

    this.transaction.commit();
  };

  public setElementsBgColor = (
    nodeIds: string[],
    bgColor: vec3,
    shouldCommit: boolean = true,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].backgroundColor(bgColor),
      );
    });

    shouldCommit && this.transaction.commit();
  };

  public setElementsBgOpacity = (nodeIds: string[], bgOpacity: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      const element = node.value;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].backgroundOpacity(bgOpacity),
      );
    });

    this.transaction.commit();
  };

  public setElementsTextColor = (
    nodeIds: string[],
    textColor: vec3,
    shouldCommit: boolean = true,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .text.textColor(textColor),
      );
    });

    shouldCommit && this.transaction.commit();
  };

  public setElementsInputColor = (
    nodeIds: string[],
    textColor: vec3,
    shouldCommit: boolean = true,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.textColor(textColor),
      );
    });

    shouldCommit && this.transaction.commit();
  };

  public setElementsInputPlaceholderColor = (
    nodeIds: string[],
    textColor: vec3,
    shouldCommit: boolean = true,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.placeholderColor(textColor),
      );
    });

    shouldCommit && this.transaction.commit();
  };

  public setElementsTextOpacity = (nodeIds: string[], textOpacity: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .text.textOpacity(textOpacity),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputPlaceholderOpacity = (
    nodeIds: string[],
    textOpacity: number,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.placeholderOpacity(textOpacity),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputOpacity = (nodeIds: string[], textOpacity: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.textOpacity(textOpacity),
      );
    });

    this.transaction.commit();
  };

  public setElementsTextContent = (nodeIds: string[], textContent: string) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .text.textContent(textContent),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputContent = (nodeIds: string[], textContent: string) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.textContent(textContent),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputPlaceholder = (
    nodeIds: string[],
    placeholder: string,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.placeholder(placeholder),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputAlignment = (
    nodeIds: string[],
    spec:
      | {
          axis: 'x';
          alignment: TextXAlignType;
        }
      | {
          axis: 'y';
          alignment: TextYAlignType;
        },
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      if (spec.axis === 'x') {
        this.transaction.push((action) =>
          action.uiTree
            .update(nodeId)
            .update()
            .element.update()
            .input.textXAlignment(spec.alignment),
        );
      } else {
        this.transaction.push((action) =>
          action.uiTree
            .update(nodeId)
            .update()
            .element.update()
            .input.textYAlignment(spec.alignment),
        );
      }
    });

    this.transaction.commit();
  };

  public setElementsTextAlignment = (
    nodeIds: string[],
    spec:
      | {
          axis: 'x';
          alignment: TextXAlignType;
        }
      | {
          axis: 'y';
          alignment: TextYAlignType;
        },
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      if (spec.axis === 'x') {
        this.transaction.push((action) =>
          action.uiTree
            .update(nodeId)
            .update()
            .element.update()
            .text.textXAlignment(spec.alignment),
        );
      } else {
        this.transaction.push((action) =>
          action.uiTree
            .update(nodeId)
            .update()
            .element.update()
            .text.textYAlignment(spec.alignment),
        );
      }
    });

    this.transaction.commit();
  };

  public setElementsTextFontSize = (nodeIds: string[], fontSize: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .text.textFontSize(fontSize),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputFontSize = (nodeIds: string[], fontSize: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.textFontSize(fontSize),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputAutoWordWrapChange = (
    nodeIds: string[],
    autoWordWrap: boolean,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.autoWordWrap(autoWordWrap),
      );
    });

    this.transaction.commit();
  };

  public setElementsTextAutoWordWrapChange = (
    nodeIds: string[],
    autoWordWrap: boolean,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .text.autoWordWrap(autoWordWrap),
      );
    });

    this.transaction.commit();
  };

  public setElementsInputLineHeight = (
    nodeIds: string[],
    lineHeight: number,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .input.textLineHeight(lineHeight),
      );
    });

    this.transaction.commit();
  };

  public setElementsTextLineHeight = (
    nodeIds: string[],
    lineHeight: number,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .text.textLineHeight(lineHeight),
      );
    });

    this.transaction.commit();
  };

  public setElementsImage = (nodeIds: string[], image: string) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .image.image(image),
      );
    });

    this.transaction.commit();
  };

  public setElementsOpacity = (nodeIds: string[], opacity: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIElement(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .image.imageOpacity(opacity),
      );
    });

    this.transaction.commit();
  };
  public setElementsDisplayMode = (
    nodeIds: string[],
    displayMode: ImageDisplayMode,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIImageNode(node.value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .image.imageDisplayMode(displayMode),
      );
    });

    this.transaction.commit();
  };

  /**
   * 关闭自动布局，或者开启自动布局并设置默认配置
   * 开启时，如果节点已经开启，则不会再开启。
   * 关闭时，如果节点已经关闭，则不会再关闭。
   */
  public toggleNodesLayout = (nodeIds: string[], enabled: boolean) => {
    const uiTree = this.getUITree();

    const type = enabled ? 'autoLayout' : 'none';

    const clone = enabled
      ? () => {
          const layout = UILayoutRDA.stateSchema.alloc();

          layout.type = 'autoLayout';
          layout.data = UIAutoLayoutRDA.stateSchema.clone(
            UIAutoLayoutRDA.stateSchema.identity,
          );

          return layout;
        }
      : () => UILayoutRDA.stateSchema.clone(UILayoutRDA.stateSchema.identity);

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      const nodeLayout = pickLayoutProp(value);

      // 如果状态与要设置的相同，就不重新设置
      if (nodeLayout?.type === type) {
        return;
      }

      // 屏幕的填充数量限制是false
      const cloneLayout = clone();

      if (isUIScreen(value)) {
        const data = cloneLayout.data;
        if (cloneLayout.type === 'autoLayout' && data) {
          data.maxCellsEnabled = false;
        }
      }
      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action).set(cloneLayout),
      );
    });

    this.transaction.commit();
  };

  public toggleNodesLayoutCellSize = (
    nodeIds: string[],
    prop: 'lineHeightEnabled' | 'columnWidthEnabled',
    enabled: boolean,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout[prop](enabled),
      );
    });

    this.transaction.commit();
  };

  public setNodesCellSize = (
    nodeIds: string[],
    type: UICoord2Keys,
    axis: 'x' | 'y',
    val: number,
  ) => {
    const uiTree = this.getUITree();

    const axisIdx = axis === 'x' ? 0 : 1;

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      const origin = pickAutoLayoutProp(value)?.data.cellSize[type];

      if (!origin) {
        return;
      }

      const newVal = vec2.copy([0, 0], origin);

      newVal[axisIdx] = val;

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.cellSize[type](newVal),
      );
    });

    this.transaction.commit();
  };

  public setNodesStartCorner = (
    nodeIds: string[],
    val: AutoLayoutStartCorner,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.startCorner(val),
      );
    });

    this.transaction.commit();
  };

  public setNodesFillDirection = (
    nodeIds: string[],
    val: AutoLayoutFillDirection,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.fillDirection(val),
      );
    });

    this.transaction.commit();
  };

  public toggleNodesMaxCells = (nodeIds: string[], val: boolean) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.maxCellsEnabled(val),
      );
    });

    this.transaction.commit();
  };

  public setNodesMaxCells = (nodeIds: string[], val: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.maxCells(val),
      );
    });

    this.transaction.commit();
  };

  public setNodesCellPadding = (
    nodeIds: string[],
    type: UICoord2Keys,
    axis: 'x' | 'y',
    val: number,
  ) => {
    const uiTree = this.getUITree();

    const axisIdx = axis === 'x' ? 0 : 1;

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      const origin = pickAutoLayoutProp(value)?.data.cellPadding[type];

      if (!origin) {
        return;
      }

      const newVal = vec2.copy([0, 0], origin);

      newVal[axisIdx] = val;

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.cellPadding[type](newVal),
      );
    });

    this.transaction.commit();
  };

  public setNodesLayoutOrder = (nodeIds: string[], val: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIElement(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].layoutOrder(val),
      );
    });

    this.transaction.commit();
  };

  public setNodesAlignments = (
    nodeIds: string[],
    horizontal: AutoLayoutHorizontalAlignType,
    vertical: AutoLayoutVerticalAlignType,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value) {
        return;
      }

      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.horizontalAlignment(horizontal),
      );
      this.transaction.push((action) =>
        pickLayoutAction(node.id, value, action)
          .update()
          .autoLayout.verticalAlignment(vertical),
      );
    });

    this.transaction.commit();
  };

  public setElementsClipsDescendants = (
    nodeIds: string[],
    clipsDescendants: boolean,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIElement(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].clipsDescendants(clipsDescendants),
      );
    });

    this.transaction.commit();
  };

  public setScrollBoxesDirection = (
    nodeIds: string[],
    direction: UIScrollDirection,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIElement(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollDirection(direction),
      );
    });

    this.transaction.commit();
  };

  /**
   * 通过属性面板设置某个滚动轴的滚动值
   */
  public setScrollAxisPosition = (
    nodeIds: string[],
    axis: 'x' | 'y',
    val: number,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      const newPosition = vec2.copy([0, 0], value.data.data.scrollPosition);

      const idx = axis === 'x' ? 0 : 1;

      newPosition[idx] = val;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollPosition(newPosition),
      );
    });

    this.transaction.commit();
  };

  /**
   * 舞台上拖拽\滚动修改滚动值
   * @param nodeIds 元素Id数组
   * @param position 新的滚动位置
   * @param commit 是否作为组提交
   * @param allowUndo 是否允许撤销重做
   */
  public setScrollPositions = (
    nodeIds: string[],
    position: vec2,
    commit = true,
    allowUndo = true,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      const newPosition = vec2.copy([0, 0], position);

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollPosition(newPosition),
      );
    });

    commit && this.transaction.commit(EditActionLabel.PROJECT, allowUndo);
  };

  public setScrollCanvasAutoResize = (
    nodeIds: string[],
    autoResize: AutoResizeType,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollCanvasAutoResize(autoResize),
      );
    });

    this.transaction.commit();
  };

  public setScrollCanvasSize = (
    nodeIds: string[],
    axis: 'x' | 'y',
    type: UICoord2Keys,
    val: number,
  ) => {
    const uiTree = this.getUITree();
    const idx = axis === 'x' ? 0 : 1;

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];

      if (!node || !node.value || !isUIScrollBoxNode(node.value)) {
        return;
      }

      const element = node.value;

      const size: vec2 = [
        element.data.data.scrollCanvasSize[type][0],
        element.data.data.scrollCanvasSize[type][1],
      ];
      size[idx] = val;

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [element.data.type].scrollCanvasSize[type](size),
      );
    });

    this.transaction.commit();
  };

  public setScrollDirections = (
    nodeIds: string[],
    direction: UIScrollDirection,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollDirection(direction),
      );
    });

    this.transaction.commit();
  };

  /**
   * 设置垂直滚动条在水平方向的位置
   */
  public setScrollbarHorizontal = (
    nodeIds: string[],
    horizontal: UIScrollbarHorizontal,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollbarHorizontal(horizontal),
      );
    });

    this.transaction.commit();
  };

  /**
   * 设置竖屏滚动条在垂直方向的位置
   */
  public setScrollbarVertical = (
    nodeIds: string[],
    vertical: UIScrollbarVertical,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollbarVertical(vertical),
      );
    });

    this.transaction.commit();
  };

  public setScrollbarVisibility = (
    nodeIds: string[],
    visibility: UIScrollbarVisibility,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollbarVisibility(visibility),
      );
    });

    this.transaction.commit();
  };

  public setScrollbarThickness = (nodeIds: string[], thickness: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollbarThickness(thickness),
      );
    });

    this.transaction.commit();
  };

  public setScrollbarColor = (
    nodeIds: string[],
    color: vec3,
    commit: boolean = true,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      const newColor = vec3.copy([0, 0, 0], color);

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollbarColor(newColor),
      );
    });

    commit && this.transaction.commit();
  };

  public setScrollbarOpacity = (nodeIds: string[], opacity: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIScrollBoxNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          .scrollBox.scrollbarOpacity(opacity),
      );
    });

    this.transaction.commit();
  };

  public setTextStrokeColor = (
    nodeIds: string[],
    color: vec3,
    commit: boolean,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || (!isUITextNode(value) && !isUIInputNode(value))) {
        return;
      }
      const newColor = vec3.copy([0, 0, 0], color);

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].textStrokeColor(newColor),
      );
    });

    commit && this.transaction.commit();
  };

  public setTextStrokeOpacity = (nodeIds: string[], opacity: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || (!isUITextNode(value) && !isUIInputNode(value))) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].textStrokeOpacity(opacity),
      );
    });

    this.transaction.commit();
  };

  public setTextStrokeThickness = (nodeIds: string[], thickness: number) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || (!isUITextNode(value) && !isUIInputNode(value))) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].textStrokeThickness(thickness),
      );
    });

    this.transaction.commit();
  };

  public setTextFontFamily = (
    nodeIds: string[],
    fontFamily: UITextFontFamily,
  ) => {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || (!isUITextNode(value) && !isUIInputNode(value))) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].textFontFamily(fontFamily),
      );
    });

    this.transaction.commit();
  };

  public setTextRichText(nodeIds: string[], richText: boolean) {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUITextNode(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].richText(richText),
      );
    });

    this.transaction.commit();
  }

  public setElementsRotation(nodeIds: string[], rotation: number) {
    const uiTree = this.getUITree();

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      const value = node.value;

      if (!node || !value || !isUIElement(value)) {
        return;
      }

      this.transaction.push((action) =>
        action.uiTree
          .update(nodeId)
          .update()
          .element.update()
          [value.data.type].rotation(rotation),
      );
    });

    this.transaction.commit();
  }
}
