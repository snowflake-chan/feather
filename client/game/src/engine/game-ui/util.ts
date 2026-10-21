import { mat2d, vec2 } from 'gl-matrix';
import { sort } from 'ramda';
import {
  AutoResizeType,
  PointerEventBehavior,
  UICoord2,
  UITextFontFamily,
  UITree,
} from '@box/schema/project/ui-rda/defs';
import { isUIElement } from '@box/schema/project/ui-rda/util';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import type { GameUINode } from './nodes/base';
import type { GameUIRenderable } from './nodes/renderable';
import {
  GameUINodeType,
  GameUIComponentType,
  UI_FONT_FACE_MAP,
} from './nodes/defs';
import type { GameUIComponent } from './nodes/component';
import type { GameUIScale } from './nodes/scale';
import type { GameUIScreen } from './nodes/screen';
import type { GameUIScrollBox, GameUIScrollbar } from './nodes/scroll-box';

export type HitArea = {
  size: vec2;
  matrixWorld: mat2d;
  rotatePivot: vec2;
};

const TEMP_VEC2 = vec2.create();
const TEMP_VEC2_2 = vec2.create();
const TEMP_MAT2D = mat2d.create();
const TEMP_MAT2D_2 = mat2d.create();

export function hitTest(position: vec2, hitArea: HitArea) {
  const { size, matrixWorld, rotatePivot } = hitArea;

  mat2d.invert(TEMP_MAT2D, matrixWorld);
  vec2.transformMat2d(TEMP_VEC2, position, TEMP_MAT2D);
  vec2.add(TEMP_VEC2, TEMP_VEC2, rotatePivot);

  return (
    TEMP_VEC2[0] >= 0 &&
    TEMP_VEC2[0] <= size[0] &&
    TEMP_VEC2[1] >= 0 &&
    TEMP_VEC2[1] <= size[1]
  );
}

export function getHitArea(node: GameUIRenderable): HitArea {
  if (node.hitArea) {
    return node.hitArea;
  }

  return {
    size: node.absSize,
    matrixWorld: node.matrixWorld,
    rotatePivot: node.rotatePivot,
  };
}

/**
 * 通过节点id判断是否是element节点
 * @param nodeId 节点id
 * @param uiTree 节点树
 */
export function isUIElementNodeId(nodeId: string, uiTree: UITree): boolean {
  const treeNode = uiTree[nodeId];

  if (!treeNode) {
    return false;
  }

  if (!treeNode.value) {
    return false;
  }

  return isUIElement(treeNode.value);
}

/**
 * 计算 a / b，如果任意向量分母为0，则返回0
 */
export function safeVec2Div(out: vec2, a: vec2, b: vec2): vec2 {
  const [ax, ay] = a;
  const [bx, by] = b;

  out[0] = bx !== 0 ? ax / bx : 0;
  out[1] = by !== 0 ? ay / by : 0;

  return out;
}

/**
 * 获取当前节点的面包屑路径
 * 就是父节点集合
 * 不含root
 * @param id 当前节点ID
 * @returns 面包屑路径
 */
export function getBreadcrumbs(node: GameUINode) {
  const breadcrumbs: string[] = [];

  let parent = node.parent;

  while (parent && parent.id !== ROOT_ID) {
    breadcrumbs.push(parent.id);
    parent = parent.parent;
  }

  return breadcrumbs;
}

const PRIORITY = {
  /**
   * 屏幕节点总是排在数组最后面
   */
  [GameUINodeType.Screen]: -1,
  /**
   * 渲染节点介于中间
   */
  [GameUINodeType.Renderable]: 0,
};

/**
 * 按照节点类型的优先级排序，优先级高的排在数组前面。
 * 如果同为渲染节点，则按照索引值排序。
 */
export function sortByPriority(
  /**
   * 子节点数组
   */
  children: GameUINode[],
  /**
   * 渲染节点的索引值。
   * @default zIndex
   */
  indexType: 'zIndex' | 'layoutOrder',
) {
  return sort<GameUINode>((a, b) => {
    if ((isRenderable(a) && isRenderable(b)) || (isScreen(a) && isScreen(b))) {
      return b[indexType] - a[indexType];
    }

    const priorityA = PRIORITY[a.nodeType];
    const priorityB = PRIORITY[b.nodeType];

    return priorityB - priorityA;
  }, children);
}

/**
 * 根据自适应配置，计算尺寸的最小值
 * @param out 存放结果的值
 * @param val 原有的尺寸
 * @param min 尺寸的最小值
 * @param autoResize 自适应配置类型
 * @return 返回out
 */
export function maxByAutoResize(
  out: vec2,
  val: vec2,
  min: vec2,
  autoResize: AutoResizeType,
) {
  if (autoResize === AutoResizeType.NONE) {
    vec2.copy(out, val);
  } else {
    if (autoResize === AutoResizeType.X || autoResize === AutoResizeType.XY) {
      out[0] = Math.max(val[0], min[0]);
    } else {
      out[0] = val[0];
    }

    if (autoResize === AutoResizeType.Y || autoResize === AutoResizeType.XY) {
      out[1] = Math.max(val[1], min[1]);
    } else {
      out[1] = val[1];
    }
  }

  return out;
}

/**
 * 深度优先遍历节点
 * @param entryNode 入口节点
 * @param onNode 检测到节点时的处理，返回值表示是否集训遍历
 */
export function everyNode(
  entryNode: GameUINode,
  onNode: (node: GameUINode) => boolean,
) {
  entryNode.children.every((node) => {
    if (!onNode(node)) {
      return false;
    }

    return node.children.every((child) => everyNode(child, onNode));
  });
}

/**
 * 判断是否阻挡穿透
 */
export function isBlockPassThrough(behavior: PointerEventBehavior) {
  return [
    PointerEventBehavior.BLOCK_PASS_THROUGH,
    PointerEventBehavior.DISABLE_AND_BLOCK_PASS_THROUGH,
  ].includes(behavior);
}

/**
 * 判断是否不响应事件
 */
export function isPointerEventDisabled(behavior: PointerEventBehavior) {
  return [
    PointerEventBehavior.DISABLE,
    PointerEventBehavior.DISABLE_AND_BLOCK_PASS_THROUGH,
  ].includes(behavior);
}

export function isRenderable(node: GameUINode): node is GameUIRenderable {
  return node.nodeType === GameUINodeType.Renderable;
}

export function isScreen(node: GameUINode): node is GameUIScreen {
  return node.nodeType === GameUINodeType.Screen;
}

export function isComponent(component: any): component is GameUIComponent {
  return component.componentType !== undefined;
}

export function isComponentScale(node: GameUIComponent): node is GameUIScale {
  return node.componentType === GameUIComponentType.Scale;
}

export function isScrollBox(value: GameUINode): value is GameUIScrollBox {
  return isRenderable(value) && (value as GameUIScrollBox).isScrollBox;
}

export function isScrollbar(value: GameUINode): value is GameUIScrollbar {
  return isRenderable(value) && (value as GameUIScrollbar).isScrollbar;
}

/**
 * 校验scale数值
 */
export function validateScaleValue(scale: any): boolean {
  return typeof scale === 'number' && scale >= 0;
}

/**
 * 校验pointerEventBehavior合法性
 */
export function validatePointerEventBehavior(behavior: any): boolean {
  return [
    PointerEventBehavior.BLOCK_PASS_THROUGH,
    PointerEventBehavior.DISABLE,
    PointerEventBehavior.DISABLE_AND_BLOCK_PASS_THROUGH,
    PointerEventBehavior.ENABLE,
  ].includes(behavior);
}

/**
 * 根据UICoord2配置，和参照的尺寸，计算vec2结果
 * @param out 输出的结果
 * @param coord2 UICoord2配置项
 * @param size 参照的尺寸，一般是父元素的绝对尺寸
 * @param offsetScale 对绝对值的缩放。默认为1。
 */
export function calcByCoord2(
  out: vec2,
  coord2: UICoord2,
  size: vec2,
  offsetScale: number = 1,
): vec2 {
  vec2.mul(TEMP_VEC2, coord2.ratio, size);

  vec2.scale(out, coord2.offset, offsetScale);

  return vec2.add(out, out, TEMP_VEC2);
}

/**
 * 获取节点的按zIndex排序子节点数组（包含内置节点，比如滚动框会有滚动条）
 */
export function getSortedChildNodes(node: GameUINode): GameUINode[] {
  const sorted = sortByPriority(node.children, 'zIndex');

  if (isScrollBox(node)) {
    sorted.unshift(node.scrollbarY, node.scrollbarX);
  }

  return sorted;
}

export function getTextFont(
  fontSize: number,
  textFontFamily: UITextFontFamily,
): string {
  const fontFace = UI_FONT_FACE_MAP[textFontFamily];

  return `${fontSize}px ${fontFace.fontFamily}`;
}

/**
 * 限制旋转角度在[-179, 180]之间
 */
export function normalizeRotation(degrees: number): number {
  const mod = ((degrees % 360) + 360) % 360;

  return mod > 180 ? mod - 360 : mod;
}

/**
 * 角度转弧度
 */
export const DEGREES_TO_RAD = Math.PI / 180;

export function getRotatePivot(out: vec2, size: vec2) {
  return vec2.scale(out, size, 0.5);
}

/**
 * 把目标（target）的绝对旋转位移信息，转换成输出（out）的布局旋转位移信息
 *
 * 这个方法不会修改节点的transform配置（感觉没有必要？），而是为了处理不同坐标系的变换（绝对坐标变换为布局坐标）
 *
 * 使用场景：
 * - 选中框单选节点时，根据节点的数据，换算成选中框自身的数据。
 * - 悬浮框
 */
export function parseWorldLayout(
  out: Pick<
    GameUIRenderable,
    | 'rotation'
    | 'absSize'
    | 'layoutPosition'
    | 'rotatePivot'
    | 'parent'
    | 'anchor'
  >,
  target: Pick<GameUIRenderable, 'matrixWorld' | 'absSize' | 'layoutPosition'>,
  parent: GameUINode | undefined = out.parent,
) {
  vec2.copy(out.absSize, target.absSize);

  // 由于当前只能以“几何中心”为旋转轴心，这里直接计算
  getRotatePivot(out.rotatePivot, out.absSize);

  const renderableParent = parent && isRenderable(parent) ? parent : undefined;

  const parentLayoutPivot: vec2 = TEMP_VEC2_2;
  const parentInvMatrixWorld: mat2d = TEMP_MAT2D;

  if (!renderableParent) {
    mat2d.identity(parentInvMatrixWorld);

    vec2.zero(parentLayoutPivot);
  } else {
    mat2d.invert(parentInvMatrixWorld, renderableParent.matrixWorld);

    vec2.add(
      parentLayoutPivot,
      renderableParent.layoutPosition,
      renderableParent.rotatePivot,
    );
  }

  const childMatrix = TEMP_MAT2D_2;
  // 计算节点在parent下的本地矩阵
  mat2d.mul(childMatrix, parentInvMatrixWorld, target.matrixWorld);

  // 更新旋转值
  out.rotation = rotationFromMat2d(childMatrix);

  // 开始计算layoutPosition
  // 先计算节点轴心相对于父元素轴心的偏移量
  translateFormMat2d(out.layoutPosition, childMatrix);
  // 计算子元素layoutPosition + pivot
  vec2.add(out.layoutPosition, out.layoutPosition, parentLayoutPivot);
  // 计算子元素layoutPosition
  vec2.sub(out.layoutPosition, out.layoutPosition, out.rotatePivot);
}

export function rotationFromMat2d(matrix: mat2d) {
  return Math.atan2(matrix[1], matrix[0]);
}

function translateFormMat2d(out: vec2, matrix: mat2d) {
  return vec2.set(out, matrix[4], matrix[5]);
}

/**s
 * 计算节点左上角在 未旋转 时的坐标
 */
export function positionReverseRotation(
  out: vec2,
  matrixWorld: mat2d,
  rotatePivot: vec2,
) {
  vec2.transformMat2d(TEMP_VEC2, [0, 0], matrixWorld);

  return vec2.sub(out, TEMP_VEC2, rotatePivot);
}

const PI2 = Math.PI * 2;
/**
 * 判定节点在绝对坐标系中是否有旋转
 */
export function hasAbsRotation(node: GameUIRenderable): boolean {
  const rotation = rotationFromMat2d(node.matrixWorld);

  return rotation % PI2 !== 0;
}
