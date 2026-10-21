import { vec2 } from 'gl-matrix';
import { sort } from 'ramda';
import { UICoord2RDA } from '@box/schema/project/ui-rda/defs';
import { isUIElement } from '@box/schema/project/ui-rda/util';
import { store } from 'src/redux/edit';
import {
  getBreadcrumbs,
  isRenderable,
  isScrollBox,
  parseWorldLayout,
  safeVec2Div,
} from 'src/engine/game-ui/util';
import type { SerializedVec2 } from 'src/engine/interfaces';
import type {
  GetRenderableNode,
  GetUITree,
  ISelectBox,
  UpdateUITree,
} from './defs';
import type { ClientProjectTransaction } from 'src/client/edit/replica/transaction/client-project-transaction';
import type { GameUILayout } from 'src/engine/game-ui/layout';
import type { GameUINode } from 'src/engine/game-ui/nodes/base';
import { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';

const { ratio: RatioRDA, offset: OffsetRDA } = UICoord2RDA.rdas;
const { stateSchema: RatioStateSchema } = RatioRDA;
const { stateSchema: OffsetStateSchema } = OffsetRDA;

type Spec = {
  projectTransaction: ClientProjectTransaction;
  getRenderableNode: GetRenderableNode;
  updateUITree: UpdateUITree;
  getUITree: GetUITree;
  layout: GameUILayout;
  root: GameUINode;
  getSelectBox: () => ISelectBox;
};

type StartSpec = {
  mouse: vec2;
  /**
   * 计算拖拽过程中节点位移时，各轴方向对鼠标偏移量的修正
   */
  offsetRatio: vec2;
  /**
   * 计算拖拽过程中节点尺寸时，各轴方向对鼠标偏移量的修正
   */
  sizeRatio: vec2;
  /**
   * 当前拖拽修改的类型。
   * 如果是position，只会修改位置数据。
   */
  type: 'position' | 'size';
};

type DragSpec = {
  mouse: vec2;
};

const TEMP_VEC2 = vec2.create();
/**
 * 临时变量，计算drag时，选中框的新的尺寸
 */
const BOX_SIZE = vec2.create();
/**
 * 临时变量，计算drag时，选中框的新的绝对坐标
 */
const BOX_LAYOUT_POS = vec2.create();
/**
 * 临时变量，计算drag时，节点的锚点坐标
 */
const TEMP_ANCHOR = vec2.create();

const IDENTITY_VEC2 = vec2.create();

/**
 * 临时节点，用于代入计算坐标变换
 */
const TEMP_RENDERABLE = new GameUIRenderable({ id: 'transformTemp' });

export class TransformManager {
  private offsetRatio = vec2.create();
  private sizeRatio = vec2.create();

  private startMouse = vec2.create();

  private startLayoutPos = vec2.create();
  private startSize = vec2.create();

  private projectTransaction: ClientProjectTransaction;

  private getRenderableNode: GetRenderableNode;

  private getUITree: GetUITree;

  private updateUITree: UpdateUITree;

  private getSelectBox: () => ISelectBox;

  private layout: GameUILayout;

  private root: GameUINode;

  private changingType: StartSpec['type'] = 'position';

  /**
   * 开始时，节点的数据
   */
  private nodeData = new Map<
    string,
    {
      /**
       * 初始尺寸 / 选中框尺寸
       */
      sizeRatio: SerializedVec2;
      /**
       * 元素相对选中框中的偏移 / 选中框尺寸
       */
      offsetRatio: SerializedVec2;
      rotation: number;
    }
  >();

  constructor(spec: Spec) {
    const {
      projectTransaction,
      getRenderableNode: getNode,
      updateUITree,
      getUITree,
      layout,
      root,
      getSelectBox: getSelectBox,
    } = spec;

    this.projectTransaction = projectTransaction;
    this.getRenderableNode = getNode;
    this.updateUITree = updateUITree;
    this.getUITree = getUITree;
    this.layout = layout;
    this.root = root;
    this.getSelectBox = getSelectBox;
  }

  public start(spec: StartSpec) {
    const { selectedIds } = store.getState().gameUI;

    if (selectedIds.length === 0) {
      return;
    }

    const selectBox = this.getSelectBox();

    selectBox.shouldUpdateAbsData = false;

    const { mouse, offsetRatio, sizeRatio, type } = spec;

    vec2.copy(this.startMouse, mouse);

    vec2.copy(this.startLayoutPos, selectBox.layoutPosition);
    vec2.copy(this.startSize, selectBox.absSize);

    vec2.copy(this.sizeRatio, sizeRatio);
    vec2.copy(this.offsetRatio, offsetRatio);
    this.changingType = type;

    // 按节点树顺序层级调整顺序，确保父节点更新优先于子节点
    const list = sort((a, b) => {
      const nodeA = this.getRenderableNode(a);
      const nodeB = this.getRenderableNode(b);

      if (!nodeA || !nodeB) {
        return 0;
      }

      const breadcrumbsA = getBreadcrumbs(nodeA);
      const breadcrumbsB = getBreadcrumbs(nodeB);

      if (breadcrumbsA.length === breadcrumbsB.length) {
        return nodeA.zIndex - nodeB.zIndex;
      }

      return breadcrumbsA.length - breadcrumbsB.length;
    }, selectedIds);

    list.forEach((id) => {
      const node = this.getRenderableNode(id);

      if (!node || !isRenderable(node) || !node.visible) {
        return;
      }

      const nodeSizeRatio: SerializedVec2 = [0, 0];
      const nodeOffsetRatio: SerializedVec2 = [0, 0];

      // 特殊处理，如果是单个元素，算作占满整个选中框
      if (list.length === 1) {
        vec2.set(nodeSizeRatio, 1, 1);
      } else {
        safeVec2Div(nodeSizeRatio, node.absSize, this.startSize);
      }

      /**
       * 由于计算的是布局坐标系的比例，这里不能直接用layoutPosition计算，
       * 需要先把节点转换成“选中框的子节点”，再来计算
       */
      parseWorldLayout(TEMP_RENDERABLE, node, selectBox);
      // 这里计算的是布局坐标的差别，也就是左上角坐标
      vec2.sub(
        nodeOffsetRatio,
        TEMP_RENDERABLE.layoutPosition,
        this.startLayoutPos,
      );

      // 如果父元素时滚动条，还需要减去滚动的影响
      if (node.parent && isScrollBox(node.parent)) {
        vec2.add(nodeOffsetRatio, nodeOffsetRatio, node.parent.scrollPosition);
      }

      safeVec2Div(nodeOffsetRatio, nodeOffsetRatio, this.startSize);

      this.nodeData.set(id, {
        sizeRatio: nodeSizeRatio,
        offsetRatio: nodeOffsetRatio,
        rotation: TEMP_RENDERABLE.rotation,
      });
    });
  }

  public drag(spec: DragSpec) {
    if (this.nodeData.size === 0) {
      return;
    }

    const { mouse } = spec;

    const selectBox = this.getSelectBox();

    // 计算鼠标偏移量
    vec2.sub(TEMP_VEC2, mouse, this.startMouse);

    // 计算新的尺寸
    vec2.mul(BOX_SIZE, TEMP_VEC2, this.sizeRatio);
    vec2.add(BOX_SIZE, this.startSize, BOX_SIZE);

    // 最小把选中框缩小到0
    for (let i = 0; i < BOX_SIZE.length; i++) {
      if (BOX_SIZE[i] <= 0) {
        TEMP_VEC2[i] = this.startSize[i];

        BOX_SIZE[i] = 0;
      }
    }

    vec2.copy(selectBox.absSize, BOX_SIZE);

    vec2.mul(BOX_LAYOUT_POS, TEMP_VEC2, this.offsetRatio);
    // 偏移量直接应用于选中框，因为选中框的父节点总是根节点
    vec2.add(selectBox.layoutPosition, this.startLayoutPos, BOX_LAYOUT_POS);

    // 更新matrixWorld，用于后续计算
    this.layout.updateAbsData(
      selectBox,
      this.layout.getParentLayoutData(selectBox),
    );

    const uiTree = this.getUITree();

    this.nodeData.forEach(({ sizeRatio, offsetRatio, rotation }, id) => {
      const node = this.getRenderableNode(id);
      const treeNode = uiTree[id];

      if (
        !node ||
        !node.parent ||
        !treeNode ||
        !treeNode.value ||
        !isUIElement(treeNode.value)
      ) {
        return;
      }

      const { type } = treeNode.value.data;

      // 由于每个节点最后会重新执行
      const selectBoxLayout = this.layout.getLayoutData(selectBox);

      TEMP_RENDERABLE.rotation = rotation;

      // 分别计算size和position
      vec2.mul(TEMP_RENDERABLE.absSize, selectBoxLayout.absSize, sizeRatio);

      vec2.mul(
        TEMP_RENDERABLE.layoutPosition,
        selectBoxLayout.absSize,
        offsetRatio,
      );
      vec2.add(
        TEMP_RENDERABLE.layoutPosition,
        TEMP_RENDERABLE.layoutPosition,
        selectBox.layoutPosition,
      );

      this.layout.updateAbsData(TEMP_RENDERABLE, selectBoxLayout);

      const parentLayout = this.layout.getParentLayoutData(node);

      parseWorldLayout(TEMP_RENDERABLE, TEMP_RENDERABLE, node.parent);

      // 还要考虑锚点对配置项的影响
      vec2.mul(TEMP_ANCHOR, node.absSize, node.anchor);
      vec2.add(
        TEMP_RENDERABLE.layoutPosition,
        TEMP_RENDERABLE.layoutPosition,
        TEMP_ANCHOR,
      );

      if (this.changingType === 'size') {
        if (!vec2.exactEquals(node.transform.size.ratio, IDENTITY_VEC2)) {
          // 减去offset部分，剩余的用于计算ratio
          vec2.sub(
            TEMP_VEC2,
            TEMP_RENDERABLE.absSize,
            node.transform.size.offset,
          );

          safeVec2Div(TEMP_VEC2, TEMP_VEC2, parentLayout.absSize);

          // 这里是为了精度约束
          const newSizeRatio = RatioStateSchema.clone(TEMP_VEC2);

          this.projectTransaction.push((action) =>
            action.uiTree
              .update(id)
              .update()
              .element.update()
              [type].size.ratio(newSizeRatio),
          );

          vec2.copy(node.transform.size.ratio, newSizeRatio);
        } else {
          const newSizeOffset = OffsetStateSchema.clone(
            TEMP_RENDERABLE.absSize,
          );

          this.projectTransaction.push((action) =>
            action.uiTree
              .update(id)
              .update()
              .element.update()
              [type].size.offset(newSizeOffset),
          );

          vec2.copy(node.transform.size.offset, newSizeOffset);
        }
      }

      vec2.sub(
        TEMP_VEC2,
        TEMP_RENDERABLE.layoutPosition,
        parentLayout.layoutPosition,
      );

      if (!vec2.exactEquals(node.transform.position.ratio, IDENTITY_VEC2)) {
        // 减去原有的偏移部分，得到 sizeRatio * parentSize
        vec2.sub(TEMP_VEC2, TEMP_VEC2, node.transform.position.offset);

        safeVec2Div(TEMP_VEC2, TEMP_VEC2, parentLayout.absSize);

        const newPosRatio = RatioStateSchema.clone(TEMP_VEC2);

        this.projectTransaction.push((action) =>
          action.uiTree
            .update(id)
            .update()
            .element.update()
            [type].position.ratio(newPosRatio),
        );

        vec2.copy(node.transform.position.ratio, newPosRatio);
      } else {
        const newPosOffset = OffsetStateSchema.clone(TEMP_VEC2);

        this.projectTransaction.push((action) =>
          action.uiTree
            .update(id)
            .update()
            .element.update()
            [type].position.offset(newPosOffset),
        );

        vec2.copy(node.transform.position.offset, newPosOffset);
      }

      // 重新布局，更新自身以及子节点的位移尺寸数据，子孙节点需要最新的数据
      // 因为自适应、自动布局的效果不可预测，只能从根节点开始重新计算
      this.layout.layout(this.root);
    });
  }

  public end() {
    if (this.nodeData.size === 0) {
      return;
    }

    this.getSelectBox().shouldUpdateAbsData = true;

    this.nodeData.clear();

    this.projectTransaction.commit();
    this.updateUITree();
  }
}
