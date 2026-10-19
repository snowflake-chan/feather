import { MuRDARegister, MuRDAStruct } from '@box/mudb/rda';
import {
  MuBoolean,
  MuQuantizedFloat,
  MuSchema,
  MuUTF8,
  MuUint8,
  MuVarint,
  MuVoid,
} from '@box/mudb/schema';

import { MuRDAUnion } from '../murda-union';
import { MuRDATree, ROOT_ID, ROOT_NAME, TreeNodeType } from '../murda-tree';
import {
  QuantizedVec2Schema,
  QuantizedVec3Schema,
} from '../../utils/quantized-schema';
import { vec2 } from 'gl-matrix';

/**
 * 在QuantizedVec2Schema的计算中，会通过precision做运算
 * - invPrecision = 1 / precision
 * - 赋值时的计算 v = (Math.round(newValue * invPrecision) >> 0) * precision
 *   - >> 0运算把值转为Int32的数值，范围在[-2147483648, 2147483647]
 *   - 如果invPrecision是2的n次幂，可以看做左移运算。相当于留下n位二进制记录小数。
 *   - 比如precision为1 / 256，invPrecision为256，即2的8次幂，左移8位，用8位二进制记录小数部分。
 *   - 8位二进制足够保证2位数的准确。
 *
 * - 在gameUI中，用户可输入值受限制
 *   - ratio类型的数值限制为3位小数。可以取1 / 1024，这样等于2的10次幂，用10位二进制足够保证三位数的准确。
 *   - offset类型的数值限制为1位小数。可以取1 / 256，8位二进制足够保证2位数的准确。
 */
const RATIO_PRECISION = 1 / 1024;

const OFFSET_PRECISION = 1 / 256;

const UIOpacityRDA = new MuRDARegister(
  new MuQuantizedFloat(RATIO_PRECISION, 1),
);

const UILineHeightRDA = new MuRDARegister(
  new MuQuantizedFloat(OFFSET_PRECISION, 1.2),
);

/**
 * 颜色RGB
 * 取值范围：[[0, 0, 0], [255, 255, 255]]
 */
const UIRgbRDA = new MuRDARegister(new QuantizedVec3Schema(1, [255, 255, 255]));

export const UICoord2RDA = new MuRDAStruct({
  /**
   * 偏移，单位是像素
   */
  offset: new MuRDARegister(new QuantizedVec2Schema(OFFSET_PRECISION)),
  /**
   * 比例，基于父节点对应轴的大小，按比例表示
   * 取值范围：[0, 1]
   */
  ratio: new MuRDARegister(new QuantizedVec2Schema(RATIO_PRECISION)),
});

/**
 * 创建UICoord2RDA结构、精度一致的RDA，参数为默认值
 * @param identities offset和ratio默认值
 */
function createUICoord2RDA(identities: {
  offset: vec2;
  ratio: vec2;
}): typeof UICoord2RDA {
  return new MuRDAStruct({
    offset: new MuRDARegister(
      new QuantizedVec2Schema(OFFSET_PRECISION, identities.offset),
    ),
    ratio: new MuRDARegister(
      new QuantizedVec2Schema(RATIO_PRECISION, identities.ratio),
    ),
  });
}

export type UICoord2 = typeof UICoord2RDA.stateSchema.identity;

export type UICoord2Keys = keyof UICoord2;

export enum AutoResizeType {
  /**
   * 不缩放
   */
  NONE,
  /**
   * 仅X轴缩放
   */
  X,
  /**
   * 仅Y轴缩放
   */
  Y,
  /**
   * XY轴都缩放
   */
  XY,
}

export const UIAutoResizeRDA = new MuRDARegister<MuSchema<AutoResizeType>>(
  new MuUint8(AutoResizeType.NONE),
);

/**
 * 文本水平对齐类型
 */
export enum TextXAlignType {
  Center,
  Left,
  Right,
}

/**
 * 文本纵向对齐类型
 */
export enum TextYAlignType {
  Center,
  Top,
  Bottom,
}

/**
 * 自动布局的起点角落
 */
export enum AutoLayoutStartCorner {
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}

/**
 * 自动布局的方向
 */
export enum AutoLayoutFillDirection {
  Horizontal,
  Vertical,
}

/**
 * 自动布局水平对齐类型
 */
export enum AutoLayoutHorizontalAlignType {
  Center = 0,
  Left = 1,
  Right = 2,
}

/**
 * 自动布局纵向对齐类型
 */
export enum AutoLayoutVerticalAlignType {
  Center = 0,
  Top = 1,
  Bottom = 2,
}

export const UIAutoLayoutRDA = new MuRDAStruct({
  /**
   * 网格尺寸，生效规则如下：
   * - 根据lineHeightEnabled确定行高是否生效，
   * - 根据columnWidthEnabled确定列宽是否生效。
   */
  cellSize: createUICoord2RDA({
    offset: [50, 50],
    ratio: [0, 0],
  }),
  /**
   * 是否启用行高限制
   */
  lineHeightEnabled: new MuRDARegister(new MuBoolean(true)),
  /**
   * 是否启用列宽限制
   */
  columnWidthEnabled: new MuRDARegister(new MuBoolean(true)),
  /**
   * 填充的起始角落
   */
  startCorner: new MuRDARegister<MuSchema<AutoLayoutStartCorner>>(
    new MuUint8(AutoLayoutStartCorner.TopLeft),
  ),
  /**
   * 填充的方向
   */
  fillDirection: new MuRDARegister<MuSchema<AutoLayoutFillDirection>>(
    new MuUint8(AutoLayoutFillDirection.Horizontal),
  ),
  /**
   * 填充方向数量限制
   */
  maxCells: new MuRDARegister(new MuVarint(3)),
  /**
   * 填充方向数量限制是否启用
   */
  maxCellsEnabled: new MuRDARegister(new MuBoolean(true)),
  /**
   * 行列的间距
   */
  cellPadding: createUICoord2RDA({
    offset: [5, 5],
    ratio: [0, 0],
  }),
  /**
   * 水平方向对齐方式
   */
  horizontalAlignment: new MuRDARegister<
    MuSchema<AutoLayoutHorizontalAlignType>
  >(new MuUint8(AutoLayoutHorizontalAlignType.Left)),
  /**
   * 垂直方向对齐方式
   */
  verticalAlignment: new MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>(
    new MuUint8(AutoLayoutVerticalAlignType.Top),
  ),
});
export type UIAutoLayoutType = typeof UIAutoLayoutRDA.stateSchema.identity;

const UILayoutSpec = {
  none: new MuRDARegister(new MuVoid()),
  autoLayout: UIAutoLayoutRDA,
};

export type UILayoutSpecType = typeof UILayoutSpec;

export const UILayoutRDA = new MuRDAUnion(UILayoutSpec, 'none');

export type UILayoutType = typeof UILayoutRDA.stateSchema.identity;

export const UIScreenRDA = new MuRDAStruct({
  /**
   * 是否显示
   * @default true
   */
  enable: new MuRDARegister(new MuBoolean(true)),
  layout: UILayoutRDA,
  /**
   * 元素层级
   */
  zIndex: new MuRDARegister(new MuVarint(1)),
});

/**
 * UI屏
 * UI元素只能渲染在UI屏中
 */
export type UIScreen = typeof UIScreenRDA.stateSchema.identity;

/**
 * 旋转
 */
const ROTATION_SCHEMA = new MuRDARegister(
  new MuQuantizedFloat(RATIO_PRECISION, 0),
);

export const UIBoxRDA = new MuRDAStruct({
  /**
   * UI锚点
   * @default [0, 0] 即元素的左上角。
   * 取值范围：[0, 1]
   */
  anchor: new MuRDARegister(new QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
  /**
   * 位置
   */
  position: createUICoord2RDA({ offset: [0, 0], ratio: [0, 0] }),
  /**
   * 尺寸
   */
  size: createUICoord2RDA({ offset: [400, 300], ratio: [0, 0] }),
  /**
   * 自动缩放类型
   */
  autoResize: UIAutoResizeRDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbRDA,
  /**
   * 背景填充不透明度
   * 取值范围：[0, 1]
   */
  backgroundOpacity: new MuRDARegister(
    new MuQuantizedFloat(RATIO_PRECISION, 1),
  ),
  /**
   * 元素层级
   */
  zIndex: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局排序，仅在父元素开启有效布局配置时生效
   */
  layoutOrder: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局
   */
  layout: UILayoutRDA,
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(false)),
  /**
   * 旋转
   */
  rotation: ROTATION_SCHEMA,
});

export type UIBox = typeof UIBoxRDA.stateSchema.identity;

export enum UITextFontFamily {
  /**
   * 默认字体
   * Rubik
   */
  Default,
  /**
   * 粗圆体
   * 目前是GenSen-Rounded-Bold字体
   */
  BoldRound,
  /**
   * Code New Roman Bold
   */
  CodeNewRomanBold,
  /**
   * EN-Serif
   */
  ENSerif,
}

const TEXT_STROKE_SPEC = {
  /**
   * 描边颜色
   */
  textStrokeColor: UIRgbRDA,
  /**
   * 描边不透明度
   */
  textStrokeOpacity: UIOpacityRDA,
  /**
   * 描边粗细
   */
  textStrokeThickness: new MuRDARegister(
    new MuQuantizedFloat(RATIO_PRECISION, 0),
  ),
  /**
   * 字体
   */
  textFontFamily: new MuRDARegister<MuSchema<UITextFontFamily>>(
    new MuUint8(UITextFontFamily.Default),
  ),
};

export const UIInputRDA = new MuRDAStruct({
  /**
   * UI锚点
   * @default [0, 0] 即元素的左上角。
   * 取值范围：[0, 1]
   */
  anchor: new MuRDARegister(new QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
  /**
   * 位置
   */
  position: createUICoord2RDA({ offset: [0, 0], ratio: [0, 0] }),
  /**
   * 尺寸
   */
  size: createUICoord2RDA({ offset: [200, 50], ratio: [0, 0] }),
  /**
   * 自动缩放类型
   */
  autoResize: UIAutoResizeRDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbRDA,
  /**
   * 背景填充不透明度
   * 取值范围：[0, 1]
   */
  backgroundOpacity: new MuRDARegister(
    new MuQuantizedFloat(RATIO_PRECISION, 1),
  ),
  /**
   * 元素层级
   */
  zIndex: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局排序，仅在父元素开启有效布局配置时生效
   */
  layoutOrder: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局
   */
  layout: UILayoutRDA,
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(false)),
  textContent: new MuRDARegister(new MuUTF8('')),
  textFontSize: new MuRDARegister(new MuUint8(14)),
  textColor: new MuRDARegister(new QuantizedVec3Schema(1, [0, 0, 0])),
  textOpacity: UIOpacityRDA,
  textXAlignment: new MuRDARegister<MuSchema<TextXAlignType>>(
    new MuUint8(TextXAlignType.Center),
  ),
  textYAlignment: new MuRDARegister<MuSchema<TextYAlignType>>(
    new MuUint8(TextYAlignType.Center),
  ),
  /**
   * 行高
   */
  textLineHeight: UILineHeightRDA,
  /**
   * 自动换行
   */
  autoWordWrap: new MuRDARegister(new MuBoolean(false)),
  /**
   * placeholder
   */
  placeholder: new MuRDARegister(new MuUTF8('Type something here')),
  placeholderColor: new MuRDARegister(
    new QuantizedVec3Schema(1, [172, 172, 164]),
  ),
  placeholderOpacity: UIOpacityRDA,
  /**
   * 旋转
   */
  rotation: ROTATION_SCHEMA,
  ...TEXT_STROKE_SPEC,
});

export const UITextRDA = new MuRDAStruct({
  /**
   * UI锚点
   * @default [0, 0] 即元素的左上角。
   * 取值范围：[0, 1]
   */
  anchor: new MuRDARegister(new QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
  /**
   * 位置
   */
  position: createUICoord2RDA({ offset: [0, 0], ratio: [0, 0] }),
  /**
   * 尺寸
   */
  size: createUICoord2RDA({ offset: [200, 50], ratio: [0, 0] }),
  /**
   * 自动缩放类型
   */
  autoResize: UIAutoResizeRDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbRDA,
  /**
   * 背景填充不透明度
   * 取值范围：[0, 1]
   */
  backgroundOpacity: new MuRDARegister(
    new MuQuantizedFloat(RATIO_PRECISION, 0),
  ),
  /**
   * 元素层级
   */
  zIndex: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局排序，仅在父元素开启有效布局配置时生效
   */
  layoutOrder: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局
   */
  layout: UILayoutRDA,
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(false)),
  textContent: new MuRDARegister(new MuUTF8('Text')),
  textFontSize: new MuRDARegister(new MuUint8(14)),
  textColor: new MuRDARegister(new QuantizedVec3Schema(1, [0, 0, 0])),
  textOpacity: UIOpacityRDA,
  textXAlignment: new MuRDARegister<MuSchema<TextXAlignType>>(
    new MuUint8(TextXAlignType.Center),
  ),
  textYAlignment: new MuRDARegister<MuSchema<TextYAlignType>>(
    new MuUint8(TextYAlignType.Center),
  ),
  textLineHeight: UILineHeightRDA,
  autoWordWrap: new MuRDARegister(new MuBoolean(false)),
  ...TEXT_STROKE_SPEC,
  /**
   * 是否开启富文本
   * 目前仅UIText有
   */
  richText: new MuRDARegister(new MuBoolean(false)),
  /**
   * 旋转
   */
  rotation: ROTATION_SCHEMA,
});

export type UIText = typeof UITextRDA.stateSchema.identity;
export type UIInput = typeof UIInputRDA.stateSchema.identity;

/**
 * 图片展示方式
 */
export enum ImageDisplayMode {
  /**
   * 铺满：（默认）适配元素外框长宽拉伸铺满展示，图片可能会变形
   */
  Fill = 0,
  /**
   * 等比铺满：等比缩放保证图片完整展示在外框内
   */
  Contain = 1,
  /**
   * 等比截取：等比缩放图片使图片填满外框，超出部分将被裁剪（隐藏显示）
   */
  Cover = 2,
  /**
   * 无：按图片正常尺寸与外框中心对齐展示，不对图片进行任何缩放调整，但是超出元素框部分会被裁剪（隐藏显示）
   */
  None = 3,
}

export const UIImageDisplayModeRDA = new MuRDARegister<
  MuSchema<ImageDisplayMode>
>(new MuUint8(ImageDisplayMode.Fill));
export const UIImageRDA = new MuRDAStruct({
  /**
   * UI锚点
   * @default [0, 0] 即元素的左上角。
   * 取值范围：[0, 1]
   */
  anchor: new MuRDARegister(new QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
  /**
   * 位置
   */
  position: createUICoord2RDA({ offset: [0, 0], ratio: [0, 0] }),
  /**
   * 尺寸
   */
  size: createUICoord2RDA({ offset: [200, 200], ratio: [0, 0] }),
  /**
   * 自动缩放类型
   */
  autoResize: UIAutoResizeRDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbRDA,
  /**
   * 背景填充不透明度
   * 取值范围：[0, 1]
   */
  backgroundOpacity: new MuRDARegister(
    new MuQuantizedFloat(RATIO_PRECISION, 1),
  ),
  /**
   * 元素层级
   */
  zIndex: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局排序，仅在父元素开启有效布局配置时生效
   */
  layoutOrder: new MuRDARegister(new MuVarint(1)),
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(false)),
  /**
   * 布局
   */
  layout: UILayoutRDA,
  image: new MuRDARegister(new MuUTF8('')),
  imageOpacity: UIOpacityRDA,
  /**
   * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
   * @default ImageDisplayMode.Fill
   */
  imageDisplayMode: UIImageDisplayModeRDA,
  /**
   * 旋转
   */
  rotation: ROTATION_SCHEMA,
});

export type UIImage = typeof UIImageRDA.stateSchema.identity;

/**
 * 滚动条的滚动方向
 */
export enum UIScrollDirection {
  X = 0,
  Y = 1,
  XY = 2,
}

/**
 * 滚动条水平方向的位置
 */
export enum UIScrollbarHorizontal {
  Left = 0,
  Right = 1,
}

/**
 * 滚动条垂直方向的位置
 */
export enum UIScrollbarVertical {
  Top = 0,
  Bottom = 1,
}

/**
 * 滚动条可见性
 */
export enum UIScrollbarVisibility {
  /**
   * 总是隐藏
   */
  Hidden = 0,
  /**
   * 可滚动时
   */
  Scrollable = 1,
}

export const UIScrollBoxRDA = new MuRDAStruct({
  /**
   * UI锚点
   * @default [0, 0] 即元素的左上角。
   * 取值范围：[0, 1]
   */
  anchor: new MuRDARegister(new QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
  /**
   * 位置
   */
  position: createUICoord2RDA({ offset: [0, 0], ratio: [0, 0] }),
  /**
   * 尺寸
   */
  size: createUICoord2RDA({ offset: [300, 300], ratio: [0, 0] }),
  /**
   * 自动缩放类型
   */
  autoResize: UIAutoResizeRDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbRDA,
  /**
   * 背景填充不透明度
   * 取值范围：[0, 1]
   */
  backgroundOpacity: new MuRDARegister(
    new MuQuantizedFloat(RATIO_PRECISION, 1),
  ),
  /**
   * 元素层级
   */
  zIndex: new MuRDARegister(new MuVarint(1)),
  /**
   * 布局排序，仅在父元素开启有效布局配置时生效
   */
  layoutOrder: new MuRDARegister(new MuVarint(1)),
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(true)),
  /**
   * 布局
   */
  layout: UILayoutRDA,
  /**
   * 滚动方向
   */
  scrollDirection: new MuRDARegister<MuSchema<UIScrollDirection>>(
    new MuUint8(UIScrollDirection.Y),
  ),
  /**
   * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
   */
  scrollbarHorizontal: new MuRDARegister<MuSchema<UIScrollbarHorizontal>>(
    new MuUint8(UIScrollbarHorizontal.Right),
  ),
  /**
   * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
   */
  scrollbarVertical: new MuRDARegister<MuSchema<UIScrollbarVertical>>(
    new MuUint8(UIScrollbarVertical.Bottom),
  ),
  /**
   * 滚动条 - 可见性
   */
  scrollbarVisibility: new MuRDARegister<MuSchema<UIScrollbarVisibility>>(
    new MuUint8(UIScrollbarVisibility.Scrollable),
  ),
  /**
   * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
   */
  scrollbarThickness: new MuRDARegister(new MuVarint(8)),
  /**
   * 滚动条 - 颜色
   */
  scrollbarColor: new MuRDARegister(
    new QuantizedVec3Schema(1, [153, 153, 153]),
  ),
  /**
   * 滚动条 - 不透明度
   */
  scrollbarOpacity: new MuRDARegister(new MuQuantizedFloat(RATIO_PRECISION, 1)),
  /**
   * 内容画布 - 自适应
   */
  scrollCanvasAutoResize: UIAutoResizeRDA,
  /**
   * 内容画布 - 尺寸配置
   */
  scrollCanvasSize: createUICoord2RDA({
    offset: [500, 500],
    ratio: [0, 0],
  }),
  /**
   * 滚动位置
   */
  scrollPosition: new MuRDARegister(
    new QuantizedVec2Schema(OFFSET_PRECISION, [0, 0]),
  ),
  /**
   * 旋转
   */
  rotation: ROTATION_SCHEMA,
});

export type UIScrollBox = typeof UIScrollBoxRDA.stateSchema.identity;

export const UIElementSpec = {
  box: UIBoxRDA,
  image: UIImageRDA,
  text: UITextRDA,
  scrollBox: UIScrollBoxRDA,
  input: UIInputRDA,
};

export const UIElementRDA = new MuRDAUnion(UIElementSpec);

/**
 * UI元素
 */
export type UIElement = typeof UIElementRDA.stateSchema.identity;
/**
 * UI元素的类型
 */
export type UIElementType = UIElement['type'];

export const UINodeSpec = {
  screen: UIScreenRDA,
  element: UIElementRDA,
};

export const UINodeRDA = new MuRDAUnion(UINodeSpec);

/**
 * UI节点
 */
export type UINode = typeof UINodeRDA.stateSchema.identity;
/**
 * UI节点的类型
 */
export type UINodeType = UINode['type'];

/**
 * 默认的屏幕id
 */
export const DEFAULT_SCREEN_ID = 'DEFAULT_SCREEN_ID';
/**
 * 默认的屏幕名字
 */
export const DEFAULT_SCREEN_NAME = 'screen';

/**
 * 指针事件行为
 * 实现packages/script-api/src/client/modules/ui.ts的枚举
 *
 * TODO 暂时不放入UITreeNode中，目前并未提供相关的编辑项
 */
export enum PointerEventBehavior {
  /**
   * 不响应，且不允许位于元素后方的其他元素响应。
   */
  DISABLE_AND_BLOCK_PASS_THROUGH = 0,
  /**
   * 不响应。
   */
  DISABLE = 1,
  /**
   * 不允许位于元素后方的其他元素响应。
   */
  BLOCK_PASS_THROUGH = 2,
  /**
   * 正常响应。
   */
  ENABLE = 3,
}

export const UITreeRDA = new MuRDATree(UINodeRDA, {
  [ROOT_ID]: {
    id: ROOT_ID,
    name: ROOT_NAME,
    type: TreeNodeType.root,
    parentId: '',
    childrenIds: [DEFAULT_SCREEN_ID],
    value: undefined,
  },
  /**
   * 默认有一个屏幕
   */
  [DEFAULT_SCREEN_ID]: {
    id: DEFAULT_SCREEN_ID,
    name: DEFAULT_SCREEN_NAME,
    type: TreeNodeType.node,
    parentId: ROOT_ID,
    childrenIds: [],
    value: {
      type: 'screen',
      data: {
        zIndex: 1,
        enable: true,
        layout: {
          type: 'none',
          data: undefined,
        },
      },
    },
  },
});

/**
 * UI树
 */
export type UITree = typeof UITreeRDA.stateSchema.identity;
/**
 * UI树的节点
 */
export type UITreeNode = typeof UITreeRDA.nodeSchema.identity;
