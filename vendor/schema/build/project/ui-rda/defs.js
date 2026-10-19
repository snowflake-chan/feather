"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UITreeRDA = exports.PointerEventBehavior = exports.DEFAULT_SCREEN_NAME = exports.DEFAULT_SCREEN_ID = exports.UINodeRDA = exports.UINodeSpec = exports.UIElementRDA = exports.UIElementSpec = exports.UIScrollBoxRDA = exports.UIScrollbarVisibility = exports.UIScrollbarVertical = exports.UIScrollbarHorizontal = exports.UIScrollDirection = exports.UIImageRDA = exports.UIImageDisplayModeRDA = exports.ImageDisplayMode = exports.UITextRDA = exports.UIInputRDA = exports.UITextFontFamily = exports.UIBoxRDA = exports.UIScreenRDA = exports.UILayoutRDA = exports.UIAutoLayoutRDA = exports.AutoLayoutVerticalAlignType = exports.AutoLayoutHorizontalAlignType = exports.AutoLayoutFillDirection = exports.AutoLayoutStartCorner = exports.TextYAlignType = exports.TextXAlignType = exports.UIAutoResizeRDA = exports.AutoResizeType = exports.UICoord2RDA = void 0;
const rda_1 = require("@box/mudb/rda");
const schema_1 = require("@box/mudb/schema");
const murda_union_1 = require("../murda-union");
const murda_tree_1 = require("../murda-tree");
const quantized_schema_1 = require("../../utils/quantized-schema");
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
const UIOpacityRDA = new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 1));
const UILineHeightRDA = new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(OFFSET_PRECISION, 1.2));
/**
 * 颜色RGB
 * 取值范围：[[0, 0, 0], [255, 255, 255]]
 */
const UIRgbRDA = new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [255, 255, 255]));
exports.UICoord2RDA = new rda_1.MuRDAStruct({
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
})(AutoResizeType || (exports.AutoResizeType = AutoResizeType = {}));
exports.UIAutoResizeRDA = new rda_1.MuRDARegister(new schema_1.MuUint8(AutoResizeType.NONE));
/**
 * 文本水平对齐类型
 */
var TextXAlignType;
(function (TextXAlignType) {
    TextXAlignType[TextXAlignType["Center"] = 0] = "Center";
    TextXAlignType[TextXAlignType["Left"] = 1] = "Left";
    TextXAlignType[TextXAlignType["Right"] = 2] = "Right";
})(TextXAlignType || (exports.TextXAlignType = TextXAlignType = {}));
/**
 * 文本纵向对齐类型
 */
var TextYAlignType;
(function (TextYAlignType) {
    TextYAlignType[TextYAlignType["Center"] = 0] = "Center";
    TextYAlignType[TextYAlignType["Top"] = 1] = "Top";
    TextYAlignType[TextYAlignType["Bottom"] = 2] = "Bottom";
})(TextYAlignType || (exports.TextYAlignType = TextYAlignType = {}));
/**
 * 自动布局的起点角落
 */
var AutoLayoutStartCorner;
(function (AutoLayoutStartCorner) {
    AutoLayoutStartCorner[AutoLayoutStartCorner["TopLeft"] = 0] = "TopLeft";
    AutoLayoutStartCorner[AutoLayoutStartCorner["TopRight"] = 1] = "TopRight";
    AutoLayoutStartCorner[AutoLayoutStartCorner["BottomLeft"] = 2] = "BottomLeft";
    AutoLayoutStartCorner[AutoLayoutStartCorner["BottomRight"] = 3] = "BottomRight";
})(AutoLayoutStartCorner || (exports.AutoLayoutStartCorner = AutoLayoutStartCorner = {}));
/**
 * 自动布局的方向
 */
var AutoLayoutFillDirection;
(function (AutoLayoutFillDirection) {
    AutoLayoutFillDirection[AutoLayoutFillDirection["Horizontal"] = 0] = "Horizontal";
    AutoLayoutFillDirection[AutoLayoutFillDirection["Vertical"] = 1] = "Vertical";
})(AutoLayoutFillDirection || (exports.AutoLayoutFillDirection = AutoLayoutFillDirection = {}));
/**
 * 自动布局水平对齐类型
 */
var AutoLayoutHorizontalAlignType;
(function (AutoLayoutHorizontalAlignType) {
    AutoLayoutHorizontalAlignType[AutoLayoutHorizontalAlignType["Center"] = 0] = "Center";
    AutoLayoutHorizontalAlignType[AutoLayoutHorizontalAlignType["Left"] = 1] = "Left";
    AutoLayoutHorizontalAlignType[AutoLayoutHorizontalAlignType["Right"] = 2] = "Right";
})(AutoLayoutHorizontalAlignType || (exports.AutoLayoutHorizontalAlignType = AutoLayoutHorizontalAlignType = {}));
/**
 * 自动布局纵向对齐类型
 */
var AutoLayoutVerticalAlignType;
(function (AutoLayoutVerticalAlignType) {
    AutoLayoutVerticalAlignType[AutoLayoutVerticalAlignType["Center"] = 0] = "Center";
    AutoLayoutVerticalAlignType[AutoLayoutVerticalAlignType["Top"] = 1] = "Top";
    AutoLayoutVerticalAlignType[AutoLayoutVerticalAlignType["Bottom"] = 2] = "Bottom";
})(AutoLayoutVerticalAlignType || (exports.AutoLayoutVerticalAlignType = AutoLayoutVerticalAlignType = {}));
exports.UIAutoLayoutRDA = new rda_1.MuRDAStruct({
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
    autoLayout: exports.UIAutoLayoutRDA,
};
exports.UILayoutRDA = new murda_union_1.MuRDAUnion(UILayoutSpec, 'none');
exports.UIScreenRDA = new rda_1.MuRDAStruct({
    /**
     * 是否显示
     * @default true
     */
    enable: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    layout: exports.UILayoutRDA,
    /**
     * 元素层级
     */
    zIndex: new rda_1.MuRDARegister(new schema_1.MuVarint(1)),
});
/**
 * 旋转
 */
const ROTATION_SCHEMA = new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 0));
exports.UIBoxRDA = new rda_1.MuRDAStruct({
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
    autoResize: exports.UIAutoResizeRDA,
    /**
     * 是否显示
     * @default true
     */
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbRDA,
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
    layout: exports.UILayoutRDA,
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    /**
     * 旋转
     */
    rotation: ROTATION_SCHEMA,
});
var UITextFontFamily;
(function (UITextFontFamily) {
    /**
     * 默认字体
     * Rubik
     */
    UITextFontFamily[UITextFontFamily["Default"] = 0] = "Default";
    /**
     * 粗圆体
     * 目前是GenSen-Rounded-Bold字体
     */
    UITextFontFamily[UITextFontFamily["BoldRound"] = 1] = "BoldRound";
    /**
     * Code New Roman Bold
     */
    UITextFontFamily[UITextFontFamily["CodeNewRomanBold"] = 2] = "CodeNewRomanBold";
    /**
     * EN-Serif
     */
    UITextFontFamily[UITextFontFamily["ENSerif"] = 3] = "ENSerif";
})(UITextFontFamily || (exports.UITextFontFamily = UITextFontFamily = {}));
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
    textStrokeThickness: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(RATIO_PRECISION, 0)),
    /**
     * 字体
     */
    textFontFamily: new rda_1.MuRDARegister(new schema_1.MuUint8(UITextFontFamily.Default)),
};
exports.UIInputRDA = new rda_1.MuRDAStruct(Object.assign({ 
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
    autoResize: exports.UIAutoResizeRDA, 
    /**
     * 是否显示
     * @default true
     */
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)), 
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbRDA, 
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
    layout: exports.UILayoutRDA, 
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)), textContent: new rda_1.MuRDARegister(new schema_1.MuUTF8('')), textFontSize: new rda_1.MuRDARegister(new schema_1.MuUint8(14)), textColor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [0, 0, 0])), textOpacity: UIOpacityRDA, textXAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextXAlignType.Center)), textYAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextYAlignType.Center)), 
    /**
     * 行高
     */
    textLineHeight: UILineHeightRDA, 
    /**
     * 自动换行
     */
    autoWordWrap: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)), 
    /**
     * placeholder
     */
    placeholder: new rda_1.MuRDARegister(new schema_1.MuUTF8('Type something here')), placeholderColor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [172, 172, 164])), placeholderOpacity: UIOpacityRDA, 
    /**
     * 旋转
     */
    rotation: ROTATION_SCHEMA }, TEXT_STROKE_SPEC));
exports.UITextRDA = new rda_1.MuRDAStruct(Object.assign(Object.assign({ 
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
    autoResize: exports.UIAutoResizeRDA, 
    /**
     * 是否显示
     * @default true
     */
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)), 
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbRDA, 
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
    layout: exports.UILayoutRDA, 
    /**
     * 裁剪
     */
    clipsDescendants: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)), textContent: new rda_1.MuRDARegister(new schema_1.MuUTF8('Text')), textFontSize: new rda_1.MuRDARegister(new schema_1.MuUint8(14)), textColor: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1, [0, 0, 0])), textOpacity: UIOpacityRDA, textXAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextXAlignType.Center)), textYAlignment: new rda_1.MuRDARegister(new schema_1.MuUint8(TextYAlignType.Center)), textLineHeight: UILineHeightRDA, autoWordWrap: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)) }, TEXT_STROKE_SPEC), { 
    /**
     * 是否开启富文本
     * 目前仅UIText有
     */
    richText: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)), 
    /**
     * 旋转
     */
    rotation: ROTATION_SCHEMA }));
/**
 * 图片展示方式
 */
var ImageDisplayMode;
(function (ImageDisplayMode) {
    /**
     * 铺满：（默认）适配元素外框长宽拉伸铺满展示，图片可能会变形
     */
    ImageDisplayMode[ImageDisplayMode["Fill"] = 0] = "Fill";
    /**
     * 等比铺满：等比缩放保证图片完整展示在外框内
     */
    ImageDisplayMode[ImageDisplayMode["Contain"] = 1] = "Contain";
    /**
     * 等比截取：等比缩放图片使图片填满外框，超出部分将被裁剪（隐藏显示）
     */
    ImageDisplayMode[ImageDisplayMode["Cover"] = 2] = "Cover";
    /**
     * 无：按图片正常尺寸与外框中心对齐展示，不对图片进行任何缩放调整，但是超出元素框部分会被裁剪（隐藏显示）
     */
    ImageDisplayMode[ImageDisplayMode["None"] = 3] = "None";
})(ImageDisplayMode || (exports.ImageDisplayMode = ImageDisplayMode = {}));
exports.UIImageDisplayModeRDA = new rda_1.MuRDARegister(new schema_1.MuUint8(ImageDisplayMode.Fill));
exports.UIImageRDA = new rda_1.MuRDAStruct({
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
    autoResize: exports.UIAutoResizeRDA,
    /**
     * 是否显示
     * @default true
     */
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbRDA,
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
    layout: exports.UILayoutRDA,
    image: new rda_1.MuRDARegister(new schema_1.MuUTF8('')),
    imageOpacity: UIOpacityRDA,
    /**
     * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
     * @default ImageDisplayMode.Fill
     */
    imageDisplayMode: exports.UIImageDisplayModeRDA,
    /**
     * 旋转
     */
    rotation: ROTATION_SCHEMA,
});
/**
 * 滚动条的滚动方向
 */
var UIScrollDirection;
(function (UIScrollDirection) {
    UIScrollDirection[UIScrollDirection["X"] = 0] = "X";
    UIScrollDirection[UIScrollDirection["Y"] = 1] = "Y";
    UIScrollDirection[UIScrollDirection["XY"] = 2] = "XY";
})(UIScrollDirection || (exports.UIScrollDirection = UIScrollDirection = {}));
/**
 * 滚动条水平方向的位置
 */
var UIScrollbarHorizontal;
(function (UIScrollbarHorizontal) {
    UIScrollbarHorizontal[UIScrollbarHorizontal["Left"] = 0] = "Left";
    UIScrollbarHorizontal[UIScrollbarHorizontal["Right"] = 1] = "Right";
})(UIScrollbarHorizontal || (exports.UIScrollbarHorizontal = UIScrollbarHorizontal = {}));
/**
 * 滚动条垂直方向的位置
 */
var UIScrollbarVertical;
(function (UIScrollbarVertical) {
    UIScrollbarVertical[UIScrollbarVertical["Top"] = 0] = "Top";
    UIScrollbarVertical[UIScrollbarVertical["Bottom"] = 1] = "Bottom";
})(UIScrollbarVertical || (exports.UIScrollbarVertical = UIScrollbarVertical = {}));
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
})(UIScrollbarVisibility || (exports.UIScrollbarVisibility = UIScrollbarVisibility = {}));
exports.UIScrollBoxRDA = new rda_1.MuRDAStruct({
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
    autoResize: exports.UIAutoResizeRDA,
    /**
     * 是否显示
     * @default true
     */
    visible: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    /**
     * 背景填充颜色
     */
    backgroundColor: UIRgbRDA,
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
    layout: exports.UILayoutRDA,
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
    scrollCanvasAutoResize: exports.UIAutoResizeRDA,
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
    /**
     * 旋转
     */
    rotation: ROTATION_SCHEMA,
});
exports.UIElementSpec = {
    box: exports.UIBoxRDA,
    image: exports.UIImageRDA,
    text: exports.UITextRDA,
    scrollBox: exports.UIScrollBoxRDA,
    input: exports.UIInputRDA,
};
exports.UIElementRDA = new murda_union_1.MuRDAUnion(exports.UIElementSpec);
exports.UINodeSpec = {
    screen: exports.UIScreenRDA,
    element: exports.UIElementRDA,
};
exports.UINodeRDA = new murda_union_1.MuRDAUnion(exports.UINodeSpec);
/**
 * 默认的屏幕id
 */
exports.DEFAULT_SCREEN_ID = 'DEFAULT_SCREEN_ID';
/**
 * 默认的屏幕名字
 */
exports.DEFAULT_SCREEN_NAME = 'screen';
/**
 * 指针事件行为
 * 实现packages/script-api/src/client/modules/ui.ts的枚举
 *
 * TODO 暂时不放入UITreeNode中，目前并未提供相关的编辑项
 */
var PointerEventBehavior;
(function (PointerEventBehavior) {
    /**
     * 不响应，且不允许位于元素后方的其他元素响应。
     */
    PointerEventBehavior[PointerEventBehavior["DISABLE_AND_BLOCK_PASS_THROUGH"] = 0] = "DISABLE_AND_BLOCK_PASS_THROUGH";
    /**
     * 不响应。
     */
    PointerEventBehavior[PointerEventBehavior["DISABLE"] = 1] = "DISABLE";
    /**
     * 不允许位于元素后方的其他元素响应。
     */
    PointerEventBehavior[PointerEventBehavior["BLOCK_PASS_THROUGH"] = 2] = "BLOCK_PASS_THROUGH";
    /**
     * 正常响应。
     */
    PointerEventBehavior[PointerEventBehavior["ENABLE"] = 3] = "ENABLE";
})(PointerEventBehavior || (exports.PointerEventBehavior = PointerEventBehavior = {}));
exports.UITreeRDA = new murda_tree_1.MuRDATree(exports.UINodeRDA, {
    [murda_tree_1.ROOT_ID]: {
        id: murda_tree_1.ROOT_ID,
        name: murda_tree_1.ROOT_NAME,
        type: murda_tree_1.TreeNodeType.root,
        parentId: '',
        childrenIds: [exports.DEFAULT_SCREEN_ID],
        value: undefined,
    },
    /**
     * 默认有一个屏幕
     */
    [exports.DEFAULT_SCREEN_ID]: {
        id: exports.DEFAULT_SCREEN_ID,
        name: exports.DEFAULT_SCREEN_NAME,
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
//# sourceMappingURL=defs.js.map