import { ROOT_ID } from '@box/schema/project/murda-tree';
import { type UITree, type UITreeNode } from '@box/schema/project/ui-rda/defs';
import { isUIElement, isUIScreen } from '@box/schema/project/ui-rda/util';
import type { GameUINode } from './nodes/base';
import { GameUIImage, type GetImageData } from './nodes/image';
import type { GetContext } from './nodes/interface';
import { GameUIText, LoadTextFontFace } from './nodes/text';
import { GameUIBox } from './nodes/box';
import { GameUIScreen } from './nodes/screen';
import type { GameUIComponent } from './nodes/component';
import { updateByUITreeNode } from './nodes/update-node';
import { GameUIScrollBox } from './nodes/scroll-box';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import type { InputManager } from 'src/engine/game-ui/controls/input-manager';
import type { RichTextParser } from './nodes/rich-text-parser';

type Spec = {
  root: GameUIScreen;
  getContext: GetContext;
  getImageData: GetImageData;
  inputManager: InputManager;
  loadTextFontFace: LoadTextFontFace;
  richTextParser: RichTextParser;
};

const TEMP_MAP = new Map<string, GameUINode>();

/**
 * 运行时的节点管理类
 * 使用weakSet记录所有节点，
 */
export class GameUINodeLoader {
  protected readonly root: GameUIScreen;
  protected readonly getContext: GetContext;
  protected readonly getImageData: GetImageData;
  private readonly inputManager: InputManager;
  private readonly richTextParser: RichTextParser;
  /**
   * 用weakSet记录当前所有的节点和组件
   * 用于调试时检查节点是否被回收
   */
  public readonly objectSet?: WeakSet<GameUINode | GameUIComponent>;

  private loadTextFontFace: LoadTextFontFace;

  constructor(spec: Spec) {
    const {
      root,
      getContext,
      getImageData,
      inputManager,
      loadTextFontFace,
      richTextParser,
    } = spec;

    this.root = root;
    this.getContext = getContext;
    this.getImageData = getImageData;
    this.inputManager = inputManager;
    this.loadTextFontFace = loadTextFontFace;
    this.richTextParser = richTextParser;

    if (process.env.NODE_ENV === 'development') {
      this.objectSet = new WeakSet();
    }
  }

  /**
   * 从根节点开始把ui节点加载进舞台中
   * @param outNodeMap 增加记录本次加载中创建的节点，并且用于查找父节点
   * @param uiTree UI节点树的数据
   */
  public loadUITree(uiTree: UITree) {
    this.load(TEMP_MAP, uiTree, ROOT_ID, 0);
    TEMP_MAP.clear();
  }

  protected load(
    outNodeMap: Map<string, GameUINode>,
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

      let node = outNodeMap.get(id);

      if (node) {
        this.updateUINode(node, treeNode);
      } else {
        node = this.parseUINode(treeNode);
      }

      if (!node) {
        return;
      }

      outNodeMap.set(node.id, node);

      this.objectSet?.add(node);

      const parent =
        parentId === ROOT_ID ? this.root : outNodeMap.get(parentId);

      parent?.addChildAt(node, idx);
    }

    childrenIds.forEach((childId, idx) => {
      this.load(outNodeMap, uiTree, childId, idx);
    });
  }

  protected updateUINode(out: GameUINode, treeNode: UITreeNode) {
    updateByUITreeNode(out, treeNode);

    // 重置 api，避免带有上一次运行时留下的数据
    out.resetApi();
  }

  protected parseUINode(treeNode: UITreeNode): GameUINode | undefined {
    const { id, value } = treeNode;

    if (!value) {
      return;
    }

    let uiNode: GameUINode | undefined;

    if (isUIElement(value)) {
      switch (value.data.type) {
        case 'box':
          uiNode = new GameUIBox({ id });
          break;
        case 'text':
          uiNode = new GameUIText({
            id,
            getContext: this.getContext,
            loadTextFontFace: this.loadTextFontFace,
            richTextParser: this.richTextParser,
          });
          break;
        case 'image':
          uiNode = new GameUIImage({ id, getImageData: this.getImageData });
          break;
        case 'scrollBox':
          uiNode = new GameUIScrollBox({ id });
          break;
        case 'input':
          uiNode = new GameUIInput({
            id,
            getContext: this.getContext,
            loadTextFontFace: this.loadTextFontFace,
            richTextParser: this.richTextParser,
          });
          break;
      }
    } else if (isUIScreen(value)) {
      uiNode = new GameUIScreen({ id });
    }

    if (!uiNode) {
      return;
    }

    this.updateUINode(uiNode, treeNode);

    return uiNode;
  }
}
