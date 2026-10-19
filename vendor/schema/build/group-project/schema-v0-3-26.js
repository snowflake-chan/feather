"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupProjectStateV26 = void 0;
const rda_1 = require("@box/mudb/rda");
const schema_1 = require("@box/mudb/schema");
const murda_union_1 = require("../project/murda-union");
const murda_tree_1 = require("../project/murda-tree");
const quantized_schema_1 = require("../utils/quantized-schema");
const math_schema_1 = require("../utils/math-schema");
const AssetEntryState = new schema_1.MuStruct({
    ownerId: new schema_1.MuVarint(0),
    contentId: new schema_1.MuFloat64(0),
    bounds: math_schema_1.Vec3Schema,
    animated: new schema_1.MuBoolean(false),
    type: new schema_1.MuVarint(),
    hash: new schema_1.MuASCII(),
    size: new schema_1.MuVarint(0),
    previewImage: new schema_1.MuASCII(),
});
const AssetsState = new schema_1.MuDictionary(AssetEntryState, Infinity);
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
const UIOpacityV26RDA = new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 1));
const UILineHeightV26RDA = new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(OFFSET_PRECISION, 1.2));
/**
 * 颜色RGB
 * 取值范围：[[0, 0, 0], [255, 255, 255]]
 */
const UIRgbV26RDA = new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [255, 255, 255]));
const UICoord2V26RDA = new rda_1.MuRDAStruct({
    /**
     * 偏移，单位是像素
     */
    offset: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(OFFSET_PRECISION)),
    /**
     * 比例，基于父节点对应轴的大小，按比例表示
     * 取值范围：[0, 1]
     */
    ratio: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(RATIO_PRECISION)),
});
/**
 * 创建UICoord2RDA结构、精度一致的RDA，参数为默认值
 * @param identities offset和ratio默认值
 */
function createUICoord2RDA(identities) {
    return new rda_1.MuRDAStruct({
        offset: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(OFFSET_PRECISION, identities.offset)),
        ratio: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(RATIO_PRECISION, identities.ratio)),
    });
}
var AutoResizeType;
(function (AutoResizeType) {
    /**
     * 不缩放
     */
    AutoResizeType[AutoResizeType["NONE"] = 0] = "NONE";
    /**
     * 仅X轴缩放
     */
    AutoResizeType[AutoResizeType["X"] = 1] = "X";
    /**
     * 仅Y轴缩放
     */
    AutoResizeType[AutoResizeType["Y"] = 2] = "Y";
    /**
     * XY轴都缩放
     */
    AutoResizeType[AutoResizeType["XY"] = 3] = "XY";
})(AutoResizeType || (AutoResizeType = {}));
const UIAutoResizeV26RDA = new rda_1.MuRDARegister(new schema_1.MuUint8(AutoResizeType.NONE));
/**
 * 文本水平对齐类型
 */
var TextXAlignType;
(function (TextXAlignType) {
    TextXAlignType[TextXAlignType["Center"] = 0] = "Center";
    TextXAlignType[TextXAlignType["Left"] = 1] = "Left";
    TextXAlignType[TextXAlignType["Right"] = 2] = "Right";
})(TextXAlignType || (TextXAlignType = {}));
/**
 * 文本纵向对齐类型
 */
var TextYAlignType;
(function (TextYAlignType) {
    TextYAlignType[TextYAlignType["Center"] = 0] = "Center";
    TextYAlignType[TextYAlignType["Top"] = 1] = "Top";
    TextYAlignType[TextYAlignType["Bottom"] = 2] = "Bottom";
})(TextYAlignType || (TextYAlignType = {}));
/**
 * 自动布局的起点角落
 */
var AutoLayoutStartCorner;
(function (AutoLayoutStartCorner) {
    AutoLayoutStartCorner[AutoLayoutStartCorner["TopLeft"] = 0] = "TopLeft";
    AutoLayoutStartCorner[AutoLayoutStartCorner["TopRight"] = 1] = "TopRight";
    AutoLayoutStartCorner[AutoLayoutStartCorner["BottomLeft"] = 2] = "BottomLeft";
    AutoLayoutStartCorner[AutoLayoutStartCorner["BottomRight"] = 3] = "BottomRight";
})(AutoLayoutStartCorner || (AutoLayoutStartCorner = {}));
/**
 * 自动布局的方向
 */
var AutoLayoutFillDirection;
(function (AutoLayoutFillDirection) {
    AutoLayoutFillDirection[AutoLayoutFillDirection["Horizontal"] = 0] = "Horizontal";
    AutoLayoutFillDirection[AutoLayoutFillDirection["Vertical"] = 1] = "Vertical";
})(AutoLayoutFillDirection || (AutoLayoutFillDirection = {}));
/**
 * 自动布局水平对齐类型
 */
var AutoLayoutHorizontalAlignType;
(function (AutoLayoutHorizontalAlignType) {
    AutoLayoutHorizontalAlignType[AutoLayoutHorizontalAlignType["Center"] = 0] = "Center";
    AutoLayoutHorizontalAlignType[AutoLayoutHorizontalAlignType["Left"] = 1] = "Left";
    AutoLayoutHorizontalAlignType[AutoLayoutHorizontalAlignType["Right"] = 2] = "Right";
})(AutoLayoutHorizontalAlignType || (AutoLayoutHorizontalAlignType = {}));
/**
 * 自动布局纵向对齐类型
 */
var AutoLayoutVerticalAlignType;
(function (AutoLayoutVerticalAlignType) {
    AutoLayoutVerticalAlignType[AutoLayoutVerticalAlignType["Center"] = 0] = "Center";
    AutoLayoutVerticalAlignType[AutoLayoutVerticalAlignType["Top"] = 1] = "Top";
    AutoLayoutVerticalAlignType[AutoLayoutVerticalAlignType["Bottom"] = 2] = "Bottom";
})(AutoLayoutVerticalAlignType || (AutoLayoutVerticalAlignType = {}));
const UIAutoLayoutV26RDA = new rda_1.MuRDAStruct({
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
    lineHeightEnabled: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 是否启用列宽限制
     */
    columnWidthEnabled: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 填充的起始角落
     */
    startCorner: new rda_1.MuRDARegister(new schema_1.MuUint8(AutoLayoutStartCorner.TopLeft)),
    /**
     * 填充的方向
     */
    fillDirection: new rda_1.MuRDARegister(new schema_1.MuUint8(AutoLayoutFillDirection.Horizontal)),
    /**
     * 填充方向数量限制
     */
    maxCells: new rda_1.MuRDARegister(new schema_1.MuVarint(3)),
    /**
     * 填充方向数量限制是否启用
     */
    maxCellsEnabled: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
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
    horizontalAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(AutoLayoutHorizontalAlignType.Left)),
    /**
     * 垂直方向对齐方式
     */
    verticalAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(AutoLayoutVerticalAlignType.Top)),
});
const UILayoutSpec = {
    none: new rda_1.MuRDARegister(new schema_1.MuVoid()),
    autoLayout: UIAutoLayoutV26RDA,
};
const UILayoutV26RDA = new murda_union_1.MuRDAUnion(UILayoutSpec, 'none');
const UIScreenV26RDA = new rda_1.MuRDAStruct({
    /**
     * 是否显示
     * @default true
     */
    enable: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    layout: UILayoutV26RDA,
    /**
     * 元素层级
     */
    zIndex: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
});
const UIBoxV26RDA = new rda_1.MuRDAStruct({
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
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
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbV26RDA,
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 1)),
    /**
     * 元素层级
     */
    zIndex: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局
     */
    layout: UILayoutV26RDA,
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
});
const UIInputV26RDA = new rda_1.MuRDAStruct({
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
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
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbV26RDA,
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 1)),
    /**
     * 元素层级
     */
    zIndex: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局
     */
    layout: UILayoutV26RDA,
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    textContent: new rda_1.MuRDARegister(new schema_1.MuUTF8('')),
    textFontSize: new rda_1.MuRDARegister(new schema_1.MuUint8(14)),
    textColor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [0, 0, 0])),
    textOpacity: UIOpacityV26RDA,
    textXAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextXAlignType.Center)),
    textYAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextYAlignType.Center)),
    /**
     * 行高
     */
    textLineHeight: UILineHeightV26RDA,
    /**
     * 自动换行
     */
    autoWordWrap: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    /**
     * placeholder
     */
    placeholder: new rda_1.MuRDARegister(new schema_1.MuUTF8('Type something here')),
    placeholderColor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [172, 172, 164])),
    placeholderOpacity: UIOpacityV26RDA,
});
const UITextV26RDA = new rda_1.MuRDAStruct({
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
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
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbV26RDA,
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 0)),
    /**
     * 元素层级
     */
    zIndex: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局
     */
    layout: UILayoutV26RDA,
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    textContent: new rda_1.MuRDARegister(new schema_1.MuUTF8('Text')),
    textFontSize: new rda_1.MuRDARegister(new schema_1.MuUint8(14)),
    textColor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [0, 0, 0])),
    textOpacity: UIOpacityV26RDA,
    textXAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextXAlignType.Center)),
    textYAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextYAlignType.Center)),
    textLineHeight: UILineHeightV26RDA,
    autoWordWrap: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
});
const UIImageV26RDA = new rda_1.MuRDAStruct({
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
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
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbV26RDA,
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 1)),
    /**
     * 元素层级
     */
    zIndex: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    /**
     * 布局
     */
    layout: UILayoutV26RDA,
    image: new rda_1.MuRDARegister(new schema_1.MuUTF8('')),
    imageOpacity: UIOpacityV26RDA,
});
/**
 * 滚动条的滚动方向
 */
var UIScrollDirection;
(function (UIScrollDirection) {
    UIScrollDirection[UIScrollDirection["X"] = 0] = "X";
    UIScrollDirection[UIScrollDirection["Y"] = 1] = "Y";
    UIScrollDirection[UIScrollDirection["XY"] = 2] = "XY";
})(UIScrollDirection || (UIScrollDirection = {}));
/**
 * 滚动条水平方向的位置
 */
var UIScrollbarHorizontal;
(function (UIScrollbarHorizontal) {
    UIScrollbarHorizontal[UIScrollbarHorizontal["Left"] = 0] = "Left";
    UIScrollbarHorizontal[UIScrollbarHorizontal["Right"] = 1] = "Right";
})(UIScrollbarHorizontal || (UIScrollbarHorizontal = {}));
/**
 * 滚动条垂直方向的位置
 */
var UIScrollbarVertical;
(function (UIScrollbarVertical) {
    UIScrollbarVertical[UIScrollbarVertical["Top"] = 0] = "Top";
    UIScrollbarVertical[UIScrollbarVertical["Bottom"] = 1] = "Bottom";
})(UIScrollbarVertical || (UIScrollbarVertical = {}));
/**
 * 滚动条可见性
 */
var UIScrollbarVisibility;
(function (UIScrollbarVisibility) {
    /**
     * 总是隐藏
     */
    UIScrollbarVisibility[UIScrollbarVisibility["Hidden"] = 0] = "Hidden";
    /**
     * 可滚动时
     */
    UIScrollbarVisibility[UIScrollbarVisibility["Scrollable"] = 1] = "Scrollable";
})(UIScrollbarVisibility || (UIScrollbarVisibility = {}));
const UIScrollBoxV26RDA = new rda_1.MuRDAStruct({
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(RATIO_PRECISION, [0, 0])),
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
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbV26RDA,
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 1)),
    /**
     * 元素层级
     */
    zIndex: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 布局
     */
    layout: UILayoutV26RDA,
    /**
     * 滚动方向
     */
    scrollDirection: new rda_1.MuRDARegister(new schema_1.MuUint8(UIScrollDirection.Y)),
    /**
     * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
     */
    scrollbarHorizontal: new rda_1.MuRDARegister(new schema_1.MuUint8(UIScrollbarHorizontal.Right)),
    /**
     * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
     */
    scrollbarVertical: new rda_1.MuRDARegister(new schema_1.MuUint8(UIScrollbarVertical.Bottom)),
    /**
     * 滚动条 - 可见性
     */
    scrollbarVisibility: new rda_1.MuRDARegister(new schema_1.MuUint8(UIScrollbarVisibility.Scrollable)),
    /**
     * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
     */
    scrollbarThickness: new rda_1.MuRDARegister(new schema_1.MuVarint(8)),
    /**
     * 滚动条 - 颜色
     */
    scrollbarColor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [153, 153, 153])),
    /**
     * 滚动条 - 不透明度
     */
    scrollbarOpacity: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 1)),
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
    scrollPosition: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec2Schema(OFFSET_PRECISION, [0, 0])),
});
const UIElementSpec = {
    box: UIBoxV26RDA,
    image: UIImageV26RDA,
    text: UITextV26RDA,
    scrollBox: UIScrollBoxV26RDA,
    input: UIInputV26RDA,
};
const UIElementV26RDA = new murda_union_1.MuRDAUnion(UIElementSpec);
const UINodeSpec = {
    screen: UIScreenV26RDA,
    element: UIElementV26RDA,
};
const UINodeV26RDA = new murda_union_1.MuRDAUnion(UINodeSpec);
const UITreeV26RDA = new murda_tree_1.MuRDATree(UINodeV26RDA, {
    [murda_tree_1.ROOT_ID]: {
        id: murda_tree_1.ROOT_ID,
        name: murda_tree_1.ROOT_NAME,
        type: murda_tree_1.TreeNodeType.root,
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
        type: murda_tree_1.TreeNodeType.node,
        parentId: murda_tree_1.ROOT_ID,
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
exports.GroupProjectStateV26 = new schema_1.MuStruct({
    uiTree: UITreeV26RDA.stateSchema,
    audioAssets: AssetsState,
});
//# sourceMappingURL=schema-v0-3-26.js.map