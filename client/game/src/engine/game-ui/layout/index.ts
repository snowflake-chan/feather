import { mat2d, vec2 } from 'gl-matrix';
import {
  AutoLayoutFillDirection,
  AutoLayoutHorizontalAlignType,
  AutoLayoutStartCorner,
  AutoLayoutVerticalAlignType,
  AutoResizeType,
} from '@box/schema/project/ui-rda/defs';
import type { GameUINode } from '../nodes/base';
import {
  calcByCoord2,
  getRotatePivot,
  isRenderable,
  isScrollBox,
  maxByAutoResize,
  sortByPriority,
} from '../util';
import type {
  GetContext,
  LayoutData,
  LayoutDataAutoLayout,
  RenderData,
} from '../nodes/interface';
import type { GameUIRenderable } from '../nodes/renderable';
import type { GetParentLayoutData } from '../interfaces';
import { DEFAULT_SCALE } from '../nodes/update-node';
import { GameUIScrollbar, GameUIScrollBox } from '../nodes/scroll-box';

const TEMP_VEC2_A = vec2.create();
const TEMP_VEC2_B = vec2.create();
const TEMP_VEC2_C = vec2.create();
/**
 * 临时变量，记录父元素首次计算的尺寸中间值 Sp'
 */
const SIZE_PARENT_2 = vec2.create();
/**
 * 临时变量，记录子元素首次计算的尺寸中间值 Sc'
 */
const SIZE_CHILD_1 = vec2.create();
/**
 * 临时变量，记录子元素计算最终值 Sc''
 * 用临时变量是因为，需要Max(absSize, Sc'');
 */
const SIZE_CHILD_2 = vec2.create();
/**
 * 用于计算 1 - anchor
 */
const IDENTITY_ANCHOR = vec2.fromValues(1, 1);

/**
 * 自动布局时，子元素计算的锚点视为中心点[0.5, 0.5]
 */
const AUTO_LAYOUT_ITEM_ANCHOR: vec2 = [0.5, 0.5];

/**
 * 在layout时，按需对每个节点的children进行排序（详见sortByPriority）。
 */
export type SortedChildrenDict = Record<string, GameUINode[] | undefined>;

export class GameUILayout {
  private getContext: GetContext;

  /**
   * 根渲染数据
   *
   * 仅在layout()时更新一次。
   */
  private rootRenderData: RenderData = {
    absSize: vec2.create(),
    layoutPosition: vec2.create(),
    /**
     * 根节点自身没有矩阵数据
     * 因此总是固定旋转轴心为[0, 0]，不需要根据size变化而变化
     */
    rotatePivot: [0, 0],
    matrixWorld: mat2d.create(),
  };

  /**
   * 缓存按照布局排序的子节点数组
   */
  private layoutOrderSorted: SortedChildrenDict = {};

  constructor(spec: { getContext: GetContext }) {
    const { getContext } = spec;

    this.getContext = getContext;
  }

  public layout(node: GameUINode) {
    const context = this.getContext();

    if (context) {
      vec2.set(
        this.rootRenderData.absSize,
        context.canvas.width,
        context.canvas.height,
      );

      vec2.scale(
        this.rootRenderData.absSize,
        this.rootRenderData.absSize,
        1 / devicePixelRatio,
      );
    }

    this.layoutOrderSorted = {};

    // parentLayout只需要获取一次，因为是从node开始计算，所以node.parent的数据不会变化。
    const parentLayout = this.getParentLayoutData(node);

    this.resize(node, parentLayout);

    // 由于node需要被更新，往上一层计算
    if (node.parent && node.parent.visible) {
      this.reflowRenderableChildren(node.parent);
    }

    this.reflow(node, parentLayout);

    this.layoutOrderSorted = {};

    return;
  }

  /**
   * 更新节点的尺寸，考虑自适应等因素的影响。
   * @param out 子节点排序后的字典
   * @param node 处理的节点
   * @param parentLayout 父节点的布局数据
   */
  private resize = (node: GameUINode, parentLayout: LayoutData) => {
    if (!node.visible) {
      return;
    }

    // 通过组件（可选属性）更新节点的属性
    this.updatePropsByComponents(node);

    if (isRenderable(node) && !node.customLayout) {
      this.initNodeAbsSize(node, parentLayout);
    }

    // 得到当前节点的渲染数据，传给子节点计算
    const layoutData = this.getLayoutData(node);

    // 递归更新子节点
    node.children.forEach((child) => {
      this.resize(child, layoutData);
    });

    /**
     * 非可渲染的元素不用计算自适应
     */
    if (!isRenderable(node)) {
      return;
    }

    /**
     * 非滚动框按正常流程计算自适应
     */
    if (!isScrollBox(node)) {
      // 根据自适应配置，更新节点的尺寸，以及更新直接子节点的尺寸
      if (node.autoResize !== AutoResizeType.NONE) {
        if (!layoutData.autoLayout) {
          this.expandNodeByChildren(node, node.children);

          node.onExpandByChildren();

          this.expandChildren(node, node, node.children);
        } else {
          const sorted = this.getLayoutSortedChildren(node);

          this.expandNodeByAutoLayoutChildren(node, sorted, layoutData);

          node.onExpandByChildren();

          this.expandAutoLayoutChildren(node, sorted, this.getLayoutData(node));
        }
      }

      return;
    }

    this.resizeScrollBox(node, layoutData);
  };

  /**
   * 获取节点的布局数据
   *
   * 如果节点不存在，或者节点不是渲染节点，返回根渲染数据。
   */
  public getLayoutData(node?: GameUINode): LayoutData {
    let renderData: RenderData;
    let autoLayout: LayoutDataAutoLayout | undefined;

    if (!node) {
      renderData = this.rootRenderData;
    } else {
      let autoResize = AutoResizeType.NONE;

      if (isRenderable(node)) {
        renderData = {
          layoutPosition: node.layoutPosition,
          absSize: node.absSize,
          rotatePivot: node.rotatePivot,
          matrixWorld: node.matrixWorld,
        };
        autoResize = node.autoResize;
      } else {
        renderData = this.rootRenderData;
      }

      const {
        components: { uiAutoLayout },
      } = node;

      if (uiAutoLayout) {
        autoLayout = {
          containerSize: isScrollBox(node)
            ? node.scrollCanvas.absSize
            : renderData.absSize,
          fillDirection: uiAutoLayout.fillDirection,
          startCorner: uiAutoLayout.startCorner,
          absCellPadding: calcByCoord2(
            [0, 0],
            uiAutoLayout.cellPadding,
            renderData.absSize,
          ),
          horizontalAlign: uiAutoLayout.horizontalAlignment,
          verticalAlign: uiAutoLayout.verticalAlignment,
        };

        if (uiAutoLayout.columnWidthEnabled || uiAutoLayout.lineHeightEnabled) {
          const absCellSize = calcByCoord2(
            [0, 0],
            uiAutoLayout.cellSize,
            renderData.absSize,
          );

          if (uiAutoLayout.columnWidthEnabled) {
            autoLayout.absColumnWidth = absCellSize[0];
          }
          if (uiAutoLayout.lineHeightEnabled) {
            autoLayout.absLineHeight = absCellSize[1];
          }
        }

        if (uiAutoLayout.maxCellsEnabled) {
          autoLayout.maxCells = uiAutoLayout.maxCells;
        } else {
          // 滚动框是以内容画布作为容器，所以要看内容画布的自适应
          let maxCellsAutoResize = isScrollBox(node)
            ? node.scrollCanvasAutoResize
            : autoResize;

          // 如果自适应的轴和自动布局的轴同向，则maxCells为Infinity
          const options: AutoResizeType[] =
            uiAutoLayout.fillDirection === AutoLayoutFillDirection.Horizontal
              ? [AutoResizeType.X, AutoResizeType.XY]
              : [AutoResizeType.Y, AutoResizeType.XY];

          if (options.includes(maxCellsAutoResize)) {
            autoLayout.maxCells = Infinity;
          }
        }
      }
    }

    const layoutPivot = vec2.add(
      [0, 0],
      renderData.layoutPosition,
      renderData.rotatePivot,
    );

    return {
      layoutPosition: renderData.layoutPosition,
      absSize: renderData.absSize,
      absScaleValue: node ? node.absScaleValue : DEFAULT_SCALE.scale,
      autoLayout,
      rotatePivot: renderData.rotatePivot,
      matrixWorld: renderData.matrixWorld,
      layoutPivot,
    };
  }

  /**
   * 获取父节点的布局数据
   *
   * 如果父节点不存在，或者父节点不是渲染节点，返回根渲染数据
   */
  public getParentLayoutData: GetParentLayoutData = (node) => {
    if (node instanceof GameUIScrollbar) {
      return this.getLayoutData(node.scrollBox);
    }

    return this.getLayoutData(node.parent);
  };

  private updatePropsByComponents(node: GameUINode) {
    const nodeScale = node.components.uiScale
      ? node.components.uiScale.scale
      : DEFAULT_SCALE.scale;

    if (isRenderable(node)) {
      const parentScale = node.parent
        ? node.parent.absScaleValue
        : DEFAULT_SCALE.scale;

      node.absScaleValue = parentScale * nodeScale;
    } else {
      node.absScaleValue = nodeScale;
    }
  }

  /**
   * 初始化节点的绝对尺寸
   * 此时得到的尺寸，不一定是节点的最终尺寸。
   * 最终尺寸可能会因为自适应、缩放等因素产生变化。
   */
  private initNodeAbsSize(node: GameUIRenderable, parentLayout: LayoutData) {
    /**
     * 根据父元素数据，计算自身的基础数据
     * 如果列宽和行高都有，则不需要计算自己的配置项
     */
    if (
      parentLayout.autoLayout &&
      parentLayout.autoLayout.absColumnWidth !== undefined &&
      parentLayout.autoLayout.absLineHeight !== undefined
    ) {
      vec2.set(
        node.absSize,
        parentLayout.autoLayout.absColumnWidth,
        parentLayout.autoLayout.absLineHeight,
      );
    } else {
      calcByCoord2(node.absSize, node.transform.size, parentLayout.absSize);

      if (parentLayout?.autoLayout?.absColumnWidth !== undefined) {
        node.absSize[0] = parentLayout.autoLayout.absColumnWidth;
      }
      if (parentLayout?.autoLayout?.absLineHeight !== undefined) {
        node.absSize[1] = parentLayout.autoLayout.absLineHeight;
      }
    }
  }

  /**
   * 自适应且未开启自动布局时，计算当前节点被子节点撑大后的尺寸
   * @param out 会被撑大的节点
   * @param children 子节点数组
   */
  private expandNodeByChildren(out: GameUIRenderable, children: GameUINode[]) {
    children.forEach((child) => {
      if (!child.visible || !isRenderable(child)) {
        return;
      }

      // 计算可能溢出的值，因此用1 - anchor
      vec2.sub(TEMP_VEC2_A, IDENTITY_ANCHOR, child.anchor);

      // (1 - anchor) * Sc'
      vec2.mul(SIZE_CHILD_1, child.absSize, TEMP_VEC2_A);

      // (1 - anchor) * Sc' + Pca
      vec2.add(SIZE_CHILD_1, SIZE_CHILD_1, child.transform.position.offset);

      vec2.add(TEMP_VEC2_A, child.absSize, child.transform.position.offset);

      maxByAutoResize(
        SIZE_CHILD_1,
        SIZE_CHILD_1,
        TEMP_VEC2_A,
        child.autoResize,
      );

      // 按照自适应配置，取最大值
      maxByAutoResize(out.absSize, out.absSize, SIZE_CHILD_1, out.autoResize);
    });
  }

  /**
   * 自适应且未开启自动布局时，计算子节点被当前节点放大后的尺寸
   * @param out 会被二次撑大的节点
   * @param node 子元素尺寸位移参照的节点
   * @param children 子元素数组
   */
  private expandChildren(
    out: GameUIRenderable,
    node: GameUIRenderable,
    children: GameUINode[],
  ) {
    // 复制一份当前的Sp'，后续保留最大的Sp''
    vec2.copy(SIZE_PARENT_2, out.absSize);

    children.forEach((child) => {
      if (!child.visible || !isRenderable(child)) {
        return;
      }

      /*
       * 子元素需要按照Sp'来计算Sc''
       */
      vec2.mul(SIZE_CHILD_2, child.transform.size.ratio, node.absSize);

      vec2.add(SIZE_CHILD_2, SIZE_CHILD_2, child.transform.size.offset);

      // 由于子元素可能是自适应的元素，所以不能比他原本的计算小
      vec2.max(child.absSize, child.absSize, SIZE_CHILD_2);

      // 要更新position
      vec2.mul(TEMP_VEC2_A, child.absSize, child.anchor);
      vec2.mul(TEMP_VEC2_B, child.transform.position.ratio, node.absSize);

      vec2.add(child.position, TEMP_VEC2_B, child.transform.position.offset);
      vec2.sub(child.position, child.position, TEMP_VEC2_A);

      // (1 - a) * Sc''
      vec2.sub(TEMP_VEC2_A, IDENTITY_ANCHOR, child.anchor);
      vec2.mul(TEMP_VEC2_A, TEMP_VEC2_A, child.absSize);

      // Pcr * Sp'
      vec2.mul(TEMP_VEC2_B, child.transform.position.ratio, node.absSize);

      // (1 - anchor) * Sc'' + Pcr * Sp'
      vec2.add(TEMP_VEC2_A, TEMP_VEC2_A, TEMP_VEC2_B);

      // (1 - anchor) * Sc'' + Pcr * Sp' + Pca
      vec2.add(TEMP_VEC2_A, TEMP_VEC2_A, child.transform.position.offset);

      maxByAutoResize(
        SIZE_PARENT_2,
        SIZE_PARENT_2,
        TEMP_VEC2_A,
        node.autoResize,
      );
    });

    vec2.copy(out.absSize, SIZE_PARENT_2);
  }

  /**
   * 自适应且开启自动布局时，计算当前节点被子节点撑大后的尺寸
   * @param out 被撑大的节点
   * @param layoutData 节点的布局数据
   */
  private expandNodeByAutoLayoutChildren(
    out: GameUIRenderable,
    sorted: GameUINode[],
    layoutData: LayoutData,
  ) {
    const min: vec2 = [Infinity, Infinity];
    const max: vec2 = [-Infinity, -Infinity];

    this.autoLayoutNodes(sorted, layoutData, (child) => {
      // 在自动布局中，child.position是相对于中心点定位（相当于anchor为[0.5,0.5]）的
      vec2.scale(TEMP_VEC2_C, child.absSize, 0.5);
      vec2.sub(TEMP_VEC2_C, child.position, TEMP_VEC2_C);

      vec2.min(min, min, TEMP_VEC2_C);

      vec2.add(TEMP_VEC2_C, TEMP_VEC2_C, child.absSize);
      vec2.max(max, max, TEMP_VEC2_C);
    });

    vec2.sub(TEMP_VEC2_C, max, min);

    maxByAutoResize(out.absSize, out.absSize, TEMP_VEC2_C, out.autoResize);
  }

  /**
   * 自适应且开启自动布局时，计算子节点被当前节点放大后的尺寸
   * @param out 会被放大的子节点
   * @param node 当前节点
   */
  private expandAutoLayoutChildren(
    node: GameUIRenderable,
    sorted: GameUINode[],
    layoutData: LayoutData,
  ) {
    const min: vec2 = [Infinity, Infinity];
    const max: vec2 = [-Infinity, -Infinity];

    this.autoLayoutNodes(sorted, layoutData, (child) => {
      // 在自动布局中，child.position是相对于中心点定位（相当于anchor为[0.5,0.5]）的
      vec2.scale(TEMP_VEC2_C, child.absSize, 0.5);
      vec2.sub(TEMP_VEC2_C, child.position, TEMP_VEC2_C);

      vec2.min(min, min, TEMP_VEC2_C);

      vec2.add(TEMP_VEC2_C, TEMP_VEC2_C, child.absSize);
      vec2.max(max, max, TEMP_VEC2_C);
    });

    vec2.sub(TEMP_VEC2_C, max, min);

    maxByAutoResize(node.absSize, node.absSize, TEMP_VEC2_C, node.autoResize);
  }

  /**
   * 按照自动布局数据，对子节点进行位置排列。
   * @param out 记录自动布局所形成的包围盒
   * @param layoutData 容器的布局数据
   */
  private autoLayoutNodes(
    sorted: GameUINode[],
    layoutData: LayoutData,
    onAutoLayoutNode: (node: GameUIRenderable) => void,
  ) {
    const { autoLayout } = layoutData;

    if (!autoLayout) {
      return;
    }

    const boundingBox: vec2 = [0, 0];
    const min: vec2 = [Infinity, Infinity];
    const max: vec2 = [-Infinity, -Infinity];

    const {
      containerSize,
      maxCells,
      startCorner,
      fillDirection,
      absColumnWidth,
      absLineHeight,
      absCellPadding,
    } = autoLayout;

    // 区分主轴、交叉轴的索引
    const [mainAxisIdx, crossAxisIdx] =
      fillDirection === AutoLayoutFillDirection.Horizontal ? [0, 1] : [1, 0];

    const { startPos, offsetSign } = this.calcAutoLayoutStartData(
      {
        startPos: [0, 0],
        offsetSign: [0, 0],
      },
      startCorner,
      containerSize,
    );

    let mainAxisCurrent = startPos[mainAxisIdx];
    let crossAxisCurrent = startPos[crossAxisIdx];
    let crossAxisCount = 0;

    const absCellSize = [absColumnWidth, absLineHeight];
    const mainAxisSize = absCellSize[mainAxisIdx];
    const crossAxisSize = absCellSize[crossAxisIdx];

    const getMainAxisCellSize =
      mainAxisSize === undefined
        ? (child: GameUIRenderable) => child.absSize[mainAxisIdx]
        : () => mainAxisSize;

    // 判断是否换行/列
    const toAppendMainAxis =
      maxCells !== undefined
        ? () =>
            mainAxes[crossAxisCount] &&
            mainAxes[crossAxisCount].items.length >= maxCells
        : () => false;

    // 判断排列子元素之后是否超出容器
    const isOverflow =
      maxCells !== undefined
        ? () => false
        : (child: GameUIRenderable) => {
            // 如果主轴数量为空，无论如何都不算超出容器
            if (
              !mainAxes[crossAxisCount] ||
              mainAxes[crossAxisCount].items.length === 0
            ) {
              return false;
            }

            const pos =
              mainAxisCurrent +
              offsetSign[mainAxisIdx] * getMainAxisCellSize(child);

            return offsetSign[mainAxisIdx] > 0
              ? pos > containerSize[mainAxisIdx]
              : pos < 0;
          };

    // 换行/列时的一些计算处理
    const appendMainAxis = () => {
      updateCurMainAxisData();

      const crossAxisSize = mainAxes[crossAxisCount]?.crossAxisSize || 0;

      mainAxisCurrent = startPos[mainAxisIdx];

      crossAxisCount++;

      crossAxisCurrent +=
        offsetSign[crossAxisIdx] *
        (crossAxisSize + absCellPadding[crossAxisIdx]);
    };

    const mainAxes: {
      items: GameUIRenderable[];
      crossAxisPos: number;
      crossAxisSize: number;
      mainAxisMin: number;
      mainAxisMax: number;
    }[] = [];

    // 根据当前这一主轴的相关数据, 更新min、max，后续用于计算boundingBox
    const updateCurMainAxisData = () => {
      const list = mainAxes[crossAxisCount];

      if (!list) {
        return;
      }

      const posSize =
        list.crossAxisPos + offsetSign[crossAxisIdx] * list.crossAxisSize;

      // 根据当前主轴尺寸数据，更新boundingBox的min、max
      TEMP_VEC2_A[mainAxisIdx] = list.mainAxisMin;
      TEMP_VEC2_A[crossAxisIdx] = Math.min(list.crossAxisPos, posSize);

      vec2.min(min, min, TEMP_VEC2_A);

      TEMP_VEC2_A[mainAxisIdx] = list.mainAxisMax;
      TEMP_VEC2_A[crossAxisIdx] = Math.max(list.crossAxisPos, posSize);

      vec2.max(max, max, TEMP_VEC2_A);
    };

    // 从后往前遍历，优先级高的后排入
    for (let idx = sorted.length - 1; idx >= 0; idx--) {
      const child = sorted[idx];

      if (child.visible && isRenderable(child)) {
        /**
         * 遇到以下其中一种情况需要换行
         * - 如果没有指定maxCells，则超出容器时，需要换行
         * - 指定了maxCells时，到达数量限制时，需要换行
         */
        if (isOverflow(child) || toAppendMainAxis()) {
          appendMainAxis();
        }

        let list = mainAxes[crossAxisCount];

        if (!list) {
          list = {
            items: [],
            crossAxisPos: crossAxisCurrent,
            crossAxisSize: crossAxisSize !== undefined ? crossAxisSize : 0,
            mainAxisMin: Infinity,
            mainAxisMax: -Infinity,
          };

          mainAxes[crossAxisCount] = list;
        }

        list.items.push(child);

        // 如果没有指定交叉轴的尺寸，需要取最大的子元素
        if (crossAxisSize === undefined) {
          list.crossAxisSize = Math.max(
            list.crossAxisSize,
            child.absSize[crossAxisIdx],
          );
        }

        const mainAxisCellSize = getMainAxisCellSize(child);

        if (offsetSign[mainAxisIdx] > 0) {
          list.mainAxisMin = Math.min(list.mainAxisMin, mainAxisCurrent);
        } else {
          list.mainAxisMax = Math.max(list.mainAxisMax, mainAxisCurrent);
        }

        mainAxisCurrent += offsetSign[mainAxisIdx] * mainAxisCellSize;

        if (offsetSign[mainAxisIdx] > 0) {
          list.mainAxisMax = Math.max(list.mainAxisMax, mainAxisCurrent);
        } else {
          list.mainAxisMin = Math.min(list.mainAxisMin, mainAxisCurrent);
        }

        // 算出下一个子元素开始可以摆的位置
        mainAxisCurrent +=
          offsetSign[mainAxisIdx] * absCellPadding[mainAxisIdx];
      }

      // 如果是最后一个，也要更新这一行的数据
      if (idx === 0) {
        updateCurMainAxisData();
      }
    }

    // 如果为空，不需要计算
    if (mainAxes.length === 0) {
      return;
    }

    vec2.sub(boundingBox, max, min);

    const alignOffset = this.getAutoLayoutAlignOffset(
      [0, 0],
      boundingBox,
      containerSize,
      autoLayout.horizontalAlign,
      autoLayout.verticalAlign,
      autoLayout.startCorner,
    );

    const start =
      startPos[mainAxisIdx] +
      offsetSign[mainAxisIdx] * alignOffset[mainAxisIdx];
    crossAxisCurrent =
      startPos[crossAxisIdx] +
      offsetSign[crossAxisIdx] * alignOffset[crossAxisIdx];
    mainAxisCurrent = start;

    // 得到了偏移量，更新每一条主轴的元素相对位置（position）
    mainAxes.forEach(({ items, crossAxisSize }) => {
      const crossPos =
        crossAxisCurrent + (offsetSign[crossAxisIdx] * crossAxisSize) / 2;

      items.forEach((item) => {
        const mainAxisCellSize = getMainAxisCellSize(item);

        item.position[mainAxisIdx] =
          mainAxisCurrent + (offsetSign[mainAxisIdx] * mainAxisCellSize) / 2;

        item.position[crossAxisIdx] = crossPos;

        onAutoLayoutNode(item);

        mainAxisCurrent +=
          offsetSign[mainAxisIdx] *
          (mainAxisCellSize + absCellPadding[mainAxisIdx]);
      });

      mainAxisCurrent = start;
      crossAxisCurrent +=
        offsetSign[crossAxisIdx] *
        (crossAxisSize + absCellPadding[crossAxisIdx]);
    });

    return;
  }

  /**
   * 根据布局起点和容器尺寸，计算自动布局的起始数据
   * @param out 自动布局起始数据
   * @param startCorner 布局起点
   * @param absSize 容器的尺寸
   */
  private calcAutoLayoutStartData(
    out: {
      /**
       * 自动布局起始位置
       */
      startPos: vec2;
      /**
       * 自动布局时，水平和垂直方向的偏移量的系数（±1），表示往哪个正向还是反向偏移
       */
      offsetSign: vec2;
    },
    startCorner: AutoLayoutStartCorner,
    absSize: vec2,
  ) {
    switch (startCorner) {
      case AutoLayoutStartCorner.TopLeft:
        vec2.zero(out.startPos);
        vec2.set(out.offsetSign, 1, 1);
        break;
      case AutoLayoutStartCorner.TopRight:
        vec2.set(out.startPos, absSize[0], 0);
        vec2.set(out.offsetSign, -1, 1);
        break;
      case AutoLayoutStartCorner.BottomLeft:
        vec2.set(out.startPos, 0, absSize[1]);
        vec2.set(out.offsetSign, 1, -1);
        break;
      case AutoLayoutStartCorner.BottomRight:
        vec2.copy(out.startPos, absSize);
        vec2.set(out.offsetSign, -1, -1);
        break;
    }

    return out;
  }

  /**
   * 从指定节点开始递归更新节点的位置
   * @param node 指定节点
   * @param parentLayout 父节点布局数据
   */
  private reflow(node: GameUINode, parentLayout: LayoutData) {
    if (!node.visible) {
      return;
    }

    this.reflowRenderableChildren(node);

    // 应用uiScale
    if (isRenderable(node)) {
      if (!node.customLayout) {
        this.applyScale(node, parentLayout);

        /**
         * 滚动框的滚动偏移不受缩放影响，因此在计算完缩放后再计算。
         * 子节点反向查询父节点的滚动偏移。
         */
        if (node.parent && isScrollBox(node.parent)) {
          vec2.sub(
            node.layoutPosition,
            node.layoutPosition,
            node.parent.scrollPosition,
          );
        }

        /**
         * 如果自身是滚动元素，更新内容画布的位置
         */
        if (isScrollBox(node)) {
          vec2.sub(
            node.scrollCanvas.layoutPosition,
            node.layoutPosition,
            node.scrollPosition,
          );
        }
      }

      /**
       * 即将通过布局坐标更新绝对坐标，允许自定义修改布局坐标
       */
      node.onBeforeAbsDataUpdate();

      /**
       * 各节点更新完布局坐标，统一由layout模块来更新绝对坐标数据
       */
      this.updateAbsData(node, parentLayout);

      node.onAfterReflow();
    }

    const layoutData = this.getLayoutData(node);

    node.children.forEach((child) => {
      this.reflow(child, layoutData);
    });

    if (isScrollBox(node)) {
      this.reflow(node.scrollbarX, layoutData);
      this.reflow(node.scrollbarY, layoutData);
    }
  }

  /**
   * 重排节点的子节点
   */
  private reflowRenderableChildren(node: GameUINode) {
    const layoutData = this.getLayoutData(node);

    if (layoutData.autoLayout) {
      const sorted = this.getLayoutSortedChildren(node);

      this.autoLayoutNodes(sorted, layoutData, (child) => {
        if (!child.customLayout) {
          vec2.add(TEMP_VEC2_A, child.position, layoutData.layoutPosition);

          vec2.mul(
            child.layoutPosition,
            child.absSize,
            AUTO_LAYOUT_ITEM_ANCHOR,
          );
          vec2.sub(child.layoutPosition, TEMP_VEC2_A, child.layoutPosition);
        }
      });
    } else {
      node.children.forEach((child) => {
        if (!child.visible || !isRenderable(child)) {
          return;
        }

        if (!child.customLayout) {
          calcByCoord2(
            child.position,
            child.transform.position,
            layoutData.absSize,
          );

          vec2.add(
            child.layoutPosition,
            child.position,
            layoutData.layoutPosition,
          );

          // 计算anchor
          vec2.mul(TEMP_VEC2_A, child.absSize, child.anchor);

          vec2.sub(child.layoutPosition, child.layoutPosition, TEMP_VEC2_A);
        }
      });
    }
  }

  /**
   * 节点应用缩放（GameUIScale）
   */
  private applyScale(node: GameUIRenderable, parentLayout: LayoutData) {
    let anchor: vec2;

    /**
     * 屏幕节点（screen）可能对子元素的位移缩放产生影响
     * - 如果父元素未开启布局，元素正常按照配置项计算。
     *   - 由于屏幕节点不是渲染元素，自身不会被缩放，其子元素的ratio部分不会变化，仅offset部分会变化。
     * - 否则元素配置失效，position、absSize全部视为offset值。
     */
    if (!parentLayout.autoLayout) {
      anchor = node.anchor;

      /**
       * 基于配置项和当前父元素的实际尺寸，重新计算结果A
       * - 这里计算出来的结果，百分比不受scale影响（calcByCoord2中处理）
       */
      calcByCoord2(
        TEMP_VEC2_A,
        node.transform.size,
        parentLayout.absSize,
        node.absScaleValue,
      );

      /**
       * - 如果没开启自适应，直接使用A来作为最终结果即可
       * - 如果开启了自适应，需要保留自适应效果
       *   - 保留配置项和自适应值中，更大的那个值（理论上，配置项计算结果 <= 自适应计算结果）
       */
      if (node.autoResize === AutoResizeType.NONE) {
        vec2.copy(node.absSize, TEMP_VEC2_A);
      } else {
        // 自适应结果也需要受缩放影响
        vec2.scale(TEMP_VEC2_B, node.absSize, node.absScaleValue);

        maxByAutoResize(
          node.absSize,
          TEMP_VEC2_A,
          TEMP_VEC2_B,
          node.autoResize,
        );
      }

      calcByCoord2(
        node.position,
        node.transform.position,
        parentLayout.absSize,
        parentLayout.absScaleValue,
      );
    } else {
      vec2.scale(node.absSize, node.absSize, node.absScaleValue);
      vec2.scale(node.position, node.position, parentLayout.absScaleValue);
    }

    anchor = parentLayout.autoLayout ? AUTO_LAYOUT_ITEM_ANCHOR : node.anchor;

    vec2.add(node.layoutPosition, parentLayout.layoutPosition, node.position);

    vec2.mul(TEMP_VEC2_A, node.absSize, anchor);
    vec2.sub(node.layoutPosition, node.layoutPosition, TEMP_VEC2_A);

    if (isScrollBox(node)) {
      vec2.scale(
        node.scrollCanvas.absSize,
        node.scrollCanvas.absSize,
        node.absScaleValue,
      );
    }
  }

  /**
   * 根据自动布局的配置和数据，计算“对齐“所需的位移偏移量
   * @param out 位移偏移量
   * @param boundingBox 子元素布局后形成的包围盒尺寸
   * @param absSize 容器的尺寸
   * @param horizontalAlign 水平方向对齐
   * @param verticalAlign 垂直方向对齐
   * @param startCorner 自动布局起始位置
   */
  private getAutoLayoutAlignOffset(
    out: vec2,
    boundingBox: vec2,
    absSize: vec2,
    horizontalAlign: AutoLayoutHorizontalAlignType,
    verticalAlign: AutoLayoutVerticalAlignType,
    startCorner: AutoLayoutStartCorner,
  ) {
    vec2.sub(out, absSize, boundingBox);

    switch (horizontalAlign) {
      case AutoLayoutHorizontalAlignType.Left:
        if (
          [
            AutoLayoutStartCorner.TopLeft,
            AutoLayoutStartCorner.BottomLeft,
          ].includes(startCorner)
        ) {
          out[0] = 0;
        }
        break;
      case AutoLayoutHorizontalAlignType.Center:
        out[0] *= 0.5;
        break;
      case AutoLayoutHorizontalAlignType.Right:
        if (
          [
            AutoLayoutStartCorner.TopRight,
            AutoLayoutStartCorner.BottomRight,
          ].includes(startCorner)
        ) {
          out[0] = 0;
        }
        break;
    }

    switch (verticalAlign) {
      case AutoLayoutVerticalAlignType.Top:
        if (
          [
            AutoLayoutStartCorner.TopLeft,
            AutoLayoutStartCorner.TopRight,
          ].includes(startCorner)
        ) {
          out[1] = 0;
        }
        break;
      case AutoLayoutVerticalAlignType.Center:
        out[1] *= 0.5;
        break;
      case AutoLayoutVerticalAlignType.Bottom:
        if (
          [
            AutoLayoutStartCorner.BottomLeft,
            AutoLayoutStartCorner.BottomRight,
          ].includes(startCorner)
        ) {
          out[1] = 0;
        }
        break;
    }

    return out;
  }

  /**
   * 根据节点的布局排序配置，获取其子节点数组
   * 如果节点未开启自动布局，返回children数组
   */
  private getLayoutSortedChildren(node: GameUINode): GameUINode[] {
    if (!node.components.uiAutoLayout) {
      return node.children;
    }

    let sorted = this.layoutOrderSorted[node.id];

    if (!sorted) {
      sorted = sortByPriority(node.children, 'layoutOrder');

      this.layoutOrderSorted[node.id] = sorted;
    }

    return sorted;
  }

  /**
   * 滚动框有两个自适应需要考虑，一个是内容画布的自适应，另一个是自身的自适应
   *
   * - 内容画布的自适应 = 滚动框的尺寸数据计算行列尺寸、行列间距 + 内容画布容器作为换行限制
   * - 滚动框的自适应 = 子元素在画布排列后，再来做自适应计算
   *
   * 要先算完内容画布自适应、再算滚动框的自适应。
   *
   * 内容画布和滚动框的自适应受相同的子元素影响
   */
  private resizeScrollBox(node: GameUIScrollBox, layoutData: LayoutData) {
    /**
     * 特殊处理滚动框
     *
     * 内容画布按需同步父元素的配置，并更新基础数据
     */
    calcByCoord2(
      node.scrollCanvas.absSize,
      node.scrollCanvasSize,
      node.absSize,
    );

    node.scrollCanvas.autoResize = node.scrollCanvasAutoResize;

    if (node.scrollCanvasAutoResize !== AutoResizeType.NONE) {
      if (!layoutData.autoLayout) {
        this.expandNodeByChildren(node.scrollCanvas, node.children);

        this.expandChildren(node.scrollCanvas, node, node.children);
      } else {
        const sorted = this.getLayoutSortedChildren(node);

        this.expandNodeByAutoLayoutChildren(
          node.scrollCanvas,
          sorted,
          layoutData,
        );

        this.expandAutoLayoutChildren(node.scrollCanvas, sorted, layoutData);
      }
    }

    if (node.autoResize !== AutoResizeType.NONE) {
      if (!layoutData.autoLayout) {
        this.expandNodeByChildren(node, node.children);

        node.onExpandByChildren();

        this.expandChildren(node, node, node.children);
      } else {
        const sorted = this.getLayoutSortedChildren(node);

        this.expandNodeByAutoLayoutChildren(node, sorted, layoutData);

        node.onExpandByChildren();

        this.expandAutoLayoutChildren(node, sorted, layoutData);
      }
    }
  }

  /**
   * 通过节点的布局坐标，更新节点的绝对坐标
   */
  public updateAbsData(node: GameUIRenderable, parentLayout: LayoutData) {
    // 更新旋转的轴心
    getRotatePivot(node.rotatePivot, node.absSize);

    // 接下更新绝对坐标（按照轴心进行坐标计算）的相关矩阵数据
    // 计算布局的轴心坐标
    const layoutPivot = vec2.add(
      TEMP_VEC2_A,
      node.layoutPosition,
      node.rotatePivot,
    );
    // 计算相对于父节点的偏移量
    vec2.sub(layoutPivot, layoutPivot, parentLayout.layoutPivot);
    // 更新本地矩阵
    mat2d.fromTranslation(node.matrix, layoutPivot);
    mat2d.rotate(node.matrix, node.matrix, node.rotation);
    // 更新世界矩阵
    mat2d.mul(node.matrixWorld, parentLayout.matrixWorld, node.matrix);

    // 更新绝对坐标
    vec2.transformMat2d(
      node.absPosition,
      [-node.rotatePivot[0], -node.rotatePivot[1]],
      node.matrixWorld,
    );
  }
}
