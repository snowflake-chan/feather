import { MuRDARegister, MuRDAStruct } from '@box/mudb/rda';
import {
  MuBoolean,
  MuQuantizedFloat,
  MuSchema,
  MuUTF8,
  MuUint8,
  MuVarint,
  MuVoid,
  MuStruct,
  MuFloat64,
  MuASCII,
  MuDictionary,
} from '@box/mudb/schema';

import { MuRDAUnion } from '../project/murda-union';
import {
  MuRDATree,
  ROOT_ID,
  ROOT_NAME,
  TreeNodeType,
} from '../project/murda-tree';
import {
  QuantizedVec2Schema,
  QuantizedVec3Schema,
} from '../utils/quantized-schema';
import { vec2 } from 'gl-matrix';
import { Vec3Schema } from '../utils/math-schema';

const AssetEntryState = new MuStruct({
  ownerId: new MuVarint(0),
  contentId: new MuFloat64(0),
  bounds: Vec3Schema,
  animated: new MuBoolean(false),
  type: new MuVarint(),
  hash: new MuASCII(),
  size: new MuVarint(0),
  previewImage: new MuASCII(),
});
const AssetsState = new MuDictionary(AssetEntryState, Infinity);

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

const UIOpacityV26RDA = new MuRDARegister(
  new MuQuantizedFloat(RATIO_PRECISION, 1),
);

const UILineHeightV26RDA = new MuRDARegister(
  new MuQuantizedFloat(OFFSET_PRECISION, 1.2),
);

/**
 * 颜色RGB
 * 取值范围：[[0, 0, 0], [255, 255, 255]]
 */
const UIRgbV26RDA = new MuRDARegister(
  new QuantizedVec3Schema(1, [255, 255, 255]),
);

const UICoord2V26RDA = new MuRDAStruct({
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
}): typeof UICoord2V26RDA {
  return new MuRDAStruct({
    offset: new MuRDARegister(
      new QuantizedVec2Schema(OFFSET_PRECISION, identities.offset),
    ),
    ratio: new MuRDARegister(
      new QuantizedVec2Schema(RATIO_PRECISION, identities.ratio),
    ),
  });
}

enum AutoResizeType {
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

const UIAutoResizeV26RDA = new MuRDARegister<MuSchema<AutoResizeType>>(
  new MuUint8(AutoResizeType.NONE),
);

/**
 * 文本水平对齐类型
 */
enum TextXAlignType {
  Center,
  Left,
  Right,
}

/**
 * 文本纵向对齐类型
 */
enum TextYAlignType {
  Center,
  Top,
  Bottom,
}

/**
 * 自动布局的起点角落
 */
enum AutoLayoutStartCorner {
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}

/**
 * 自动布局的方向
 */
enum AutoLayoutFillDirection {
  Horizontal,
  Vertical,
}

/**
 * 自动布局水平对齐类型
 */
enum AutoLayoutHorizontalAlignType {
  Center = 0,
  Left = 1,
  Right = 2,
}

/**
 * 自动布局纵向对齐类型
 */
enum AutoLayoutVerticalAlignType {
  Center = 0,
  Top = 1,
  Bottom = 2,
}

const UIAutoLayoutV26RDA = new MuRDAStruct({
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

const UILayoutSpec = {
  none: new MuRDARegister(new MuVoid()),
  autoLayout: UIAutoLayoutV26RDA,
};

const UILayoutV26RDA = new MuRDAUnion(UILayoutSpec, 'none');

const UIScreenV26RDA = new MuRDAStruct({
  /**
   * 是否显示
   * @default true
   */
  enable: new MuRDARegister(new MuBoolean(true)),
  layout: UILayoutV26RDA,
  /**
   * 元素层级
   */
  zIndex: new MuRDARegister(new MuVarint(1)),
});

const UIBoxV26RDA = new MuRDAStruct({
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
  autoResize: UIAutoResizeV26RDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbV26RDA,
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
  layout: UILayoutV26RDA,
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(false)),
});

const UIInputV26RDA = new MuRDAStruct({
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
  autoResize: UIAutoResizeV26RDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbV26RDA,
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
  layout: UILayoutV26RDA,
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(false)),
  textContent: new MuRDARegister(new MuUTF8('')),
  textFontSize: new MuRDARegister(new MuUint8(14)),
  textColor: new MuRDARegister(new QuantizedVec3Schema(1, [0, 0, 0])),
  textOpacity: UIOpacityV26RDA,
  textXAlignment: new MuRDARegister<MuSchema<TextXAlignType>>(
    new MuUint8(TextXAlignType.Center),
  ),
  textYAlignment: new MuRDARegister<MuSchema<TextYAlignType>>(
    new MuUint8(TextYAlignType.Center),
  ),
  /**
   * 行高
   */
  textLineHeight: UILineHeightV26RDA,
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
  placeholderOpacity: UIOpacityV26RDA,
});

const UITextV26RDA = new MuRDAStruct({
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
  autoResize: UIAutoResizeV26RDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbV26RDA,
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
  layout: UILayoutV26RDA,
  /**
   * 裁剪
   */
  clipsDescendants: new MuRDARegister(new MuBoolean(false)),
  textContent: new MuRDARegister(new MuUTF8('Text')),
  textFontSize: new MuRDARegister(new MuUint8(14)),
  textColor: new MuRDARegister(new QuantizedVec3Schema(1, [0, 0, 0])),
  textOpacity: UIOpacityV26RDA,
  textXAlignment: new MuRDARegister<MuSchema<TextXAlignType>>(
    new MuUint8(TextXAlignType.Center),
  ),
  textYAlignment: new MuRDARegister<MuSchema<TextYAlignType>>(
    new MuUint8(TextYAlignType.Center),
  ),
  textLineHeight: UILineHeightV26RDA,
  autoWordWrap: new MuRDARegister(new MuBoolean(false)),
});

const UIImageV26RDA = new MuRDAStruct({
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
  autoResize: UIAutoResizeV26RDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbV26RDA,
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
  layout: UILayoutV26RDA,
  image: new MuRDARegister(new MuUTF8('')),
  imageOpacity: UIOpacityV26RDA,
});

/**
 * 滚动条的滚动方向
 */
enum UIScrollDirection {
  X = 0,
  Y = 1,
  XY = 2,
}

/**
 * 滚动条水平方向的位置
 */
enum UIScrollbarHorizontal {
  Left = 0,
  Right = 1,
}

/**
 * 滚动条垂直方向的位置
 */
enum UIScrollbarVertical {
  Top = 0,
  Bottom = 1,
}

/**
 * 滚动条可见性
 */
enum UIScrollbarVisibility {
  /**
   * 总是隐藏
   */
  Hidden = 0,
  /**
   * 可滚动时
   */
  Scrollable = 1,
}

const UIScrollBoxV26RDA = new MuRDAStruct({
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
  autoResize: UIAutoResizeV26RDA,
  /**
   * 是否显示
   * @default true
   */
  visible: new MuRDARegister(new MuBoolean(true)),
  /**
   * 背景填充颜色
   */
  backgroundColor: UIRgbV26RDA,
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
  layout: UILayoutV26RDA,
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
  scrollCanvasAutoResize: UIAutoResizeV26RDA,
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
});

const UIElementSpec = {
  box: UIBoxV26RDA,
  image: UIImageV26RDA,
  text: UITextV26RDA,
  scrollBox: UIScrollBoxV26RDA,
  input: UIInputV26RDA,
};

const UIElementV26RDA = new MuRDAUnion(UIElementSpec);

const UINodeSpec = {
  screen: UIScreenV26RDA,
  element: UIElementV26RDA,
};

const UINodeV26RDA = new MuRDAUnion(UINodeSpec);

const UITreeV26RDA = new MuRDATree(UINodeV26RDA, {
  [ROOT_ID]: {
    id: ROOT_ID,
    name: ROOT_NAME,
    type: TreeNodeType.root,
    parentId: '',
    childrenIds: ['DEFAULT_SCREEN_ID'],
    value: undefined,
  },
  /**
   * 默认有一个屏幕
   */
  ['DEFAULT_SCREEN_ID']: {
    id: 'DEFAULT_SCREEN_ID',
    name: 'screen',
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

export const GroupProjectStateV26 = new MuStruct({
  uiTree: UITreeV26RDA.stateSchema,
  audioAssets: AssetsState,
});
