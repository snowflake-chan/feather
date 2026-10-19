import { MuRDARegister, MuRDAStruct } from '@box/mudb/rda';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuQuantizedFloat } from '@box/mudb/schema/quantized-float';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuUint8 } from '@box/mudb/schema/uint8';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { MuVoid } from '@box/mudb/schema/void';
import { MuRDAUnion } from '../murda-union';
import { MuRDATree } from '../murda-tree';
import { QuantizedVec2Schema, QuantizedVec3Schema } from '../../utils/quantized-schema';
export declare const UICoord2RDA: MuRDAStruct<{
    /**
     * 偏移，单位是像素
     */
    offset: MuRDARegister<QuantizedVec2Schema>;
    /**
     * 比例，基于父节点对应轴的大小，按比例表示
     * 取值范围：[0, 1]
     */
    ratio: MuRDARegister<QuantizedVec2Schema>;
}>;
export type UICoord2 = typeof UICoord2RDA.stateSchema.identity;
export type UICoord2Keys = keyof UICoord2;
export declare enum AutoResizeType {
    /**
     * 不缩放
     */
    NONE = 0,
    /**
     * 仅X轴缩放
     */
    X = 1,
    /**
     * 仅Y轴缩放
     */
    Y = 2,
    /**
     * XY轴都缩放
     */
    XY = 3
}
export declare const UIAutoResizeRDA: MuRDARegister<MuSchema<AutoResizeType>>;
/**
 * 文本水平对齐类型
 */
export declare enum TextXAlignType {
    Center = 0,
    Left = 1,
    Right = 2
}
/**
 * 文本纵向对齐类型
 */
export declare enum TextYAlignType {
    Center = 0,
    Top = 1,
    Bottom = 2
}
/**
 * 自动布局的起点角落
 */
export declare enum AutoLayoutStartCorner {
    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}
/**
 * 自动布局的方向
 */
export declare enum AutoLayoutFillDirection {
    Horizontal = 0,
    Vertical = 1
}
/**
 * 自动布局水平对齐类型
 */
export declare enum AutoLayoutHorizontalAlignType {
    Center = 0,
    Left = 1,
    Right = 2
}
/**
 * 自动布局纵向对齐类型
 */
export declare enum AutoLayoutVerticalAlignType {
    Center = 0,
    Top = 1,
    Bottom = 2
}
export declare const UIAutoLayoutRDA: MuRDAStruct<{
    /**
     * 网格尺寸，生效规则如下：
     * - 根据lineHeightEnabled确定行高是否生效，
     * - 根据columnWidthEnabled确定列宽是否生效。
     */
    cellSize: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 是否启用行高限制
     */
    lineHeightEnabled: MuRDARegister<MuBoolean>;
    /**
     * 是否启用列宽限制
     */
    columnWidthEnabled: MuRDARegister<MuBoolean>;
    /**
     * 填充的起始角落
     */
    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
    /**
     * 填充的方向
     */
    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
    /**
     * 填充方向数量限制
     */
    maxCells: MuRDARegister<MuVarint>;
    /**
     * 填充方向数量限制是否启用
     */
    maxCellsEnabled: MuRDARegister<MuBoolean>;
    /**
     * 行列的间距
     */
    cellPadding: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 水平方向对齐方式
     */
    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
    /**
     * 垂直方向对齐方式
     */
    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
}>;
export type UIAutoLayoutType = typeof UIAutoLayoutRDA.stateSchema.identity;
declare const UILayoutSpec: {
    none: MuRDARegister<MuVoid>;
    autoLayout: MuRDAStruct<{
        /**
         * 网格尺寸，生效规则如下：
         * - 根据lineHeightEnabled确定行高是否生效，
         * - 根据columnWidthEnabled确定列宽是否生效。
         */
        cellSize: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 是否启用行高限制
         */
        lineHeightEnabled: MuRDARegister<MuBoolean>;
        /**
         * 是否启用列宽限制
         */
        columnWidthEnabled: MuRDARegister<MuBoolean>;
        /**
         * 填充的起始角落
         */
        startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
        /**
         * 填充的方向
         */
        fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
        /**
         * 填充方向数量限制
         */
        maxCells: MuRDARegister<MuVarint>;
        /**
         * 填充方向数量限制是否启用
         */
        maxCellsEnabled: MuRDARegister<MuBoolean>;
        /**
         * 行列的间距
         */
        cellPadding: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 水平方向对齐方式
         */
        horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
        /**
         * 垂直方向对齐方式
         */
        verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
    }>;
};
export type UILayoutSpecType = typeof UILayoutSpec;
export declare const UILayoutRDA: MuRDAUnion<{
    none: MuRDARegister<MuVoid>;
    autoLayout: MuRDAStruct<{
        /**
         * 网格尺寸，生效规则如下：
         * - 根据lineHeightEnabled确定行高是否生效，
         * - 根据columnWidthEnabled确定列宽是否生效。
         */
        cellSize: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 是否启用行高限制
         */
        lineHeightEnabled: MuRDARegister<MuBoolean>;
        /**
         * 是否启用列宽限制
         */
        columnWidthEnabled: MuRDARegister<MuBoolean>;
        /**
         * 填充的起始角落
         */
        startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
        /**
         * 填充的方向
         */
        fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
        /**
         * 填充方向数量限制
         */
        maxCells: MuRDARegister<MuVarint>;
        /**
         * 填充方向数量限制是否启用
         */
        maxCellsEnabled: MuRDARegister<MuBoolean>;
        /**
         * 行列的间距
         */
        cellPadding: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 水平方向对齐方式
         */
        horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
        /**
         * 垂直方向对齐方式
         */
        verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
    }>;
}, "none">;
export type UILayoutType = typeof UILayoutRDA.stateSchema.identity;
export declare const UIScreenRDA: MuRDAStruct<{
    /**
     * 是否显示
     * @default true
     */
    enable: MuRDARegister<MuBoolean>;
    layout: MuRDAUnion<{
        none: MuRDARegister<MuVoid>;
        autoLayout: MuRDAStruct<{
            /**
             * 网格尺寸，生效规则如下：
             * - 根据lineHeightEnabled确定行高是否生效，
             * - 根据columnWidthEnabled确定列宽是否生效。
             */
            cellSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 是否启用行高限制
             */
            lineHeightEnabled: MuRDARegister<MuBoolean>;
            /**
             * 是否启用列宽限制
             */
            columnWidthEnabled: MuRDARegister<MuBoolean>;
            /**
             * 填充的起始角落
             */
            startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
            /**
             * 填充的方向
             */
            fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
            /**
             * 填充方向数量限制
             */
            maxCells: MuRDARegister<MuVarint>;
            /**
             * 填充方向数量限制是否启用
             */
            maxCellsEnabled: MuRDARegister<MuBoolean>;
            /**
             * 行列的间距
             */
            cellPadding: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 水平方向对齐方式
             */
            horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
            /**
             * 垂直方向对齐方式
             */
            verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
        }>;
    }, "none">;
    /**
     * 元素层级
     */
    zIndex: MuRDARegister<MuVarint>;
}>;
/**
 * UI屏
 * UI元素只能渲染在UI屏中
 */
export type UIScreen = typeof UIScreenRDA.stateSchema.identity;
export declare const UIBoxRDA: MuRDAStruct<{
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: MuRDARegister<QuantizedVec2Schema>;
    /**
     * 位置
     */
    position: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 尺寸
     */
    size: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 自动缩放类型
     */
    autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
    /**
     * 是否显示
     * @default true
     */
    visible: MuRDARegister<MuBoolean>;
    /**
     * 背景填充颜色
     */
    backgroundColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 元素层级
     */
    zIndex: MuRDARegister<MuVarint>;
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: MuRDARegister<MuVarint>;
    /**
     * 布局
     */
    layout: MuRDAUnion<{
        none: MuRDARegister<MuVoid>;
        autoLayout: MuRDAStruct<{
            /**
             * 网格尺寸，生效规则如下：
             * - 根据lineHeightEnabled确定行高是否生效，
             * - 根据columnWidthEnabled确定列宽是否生效。
             */
            cellSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 是否启用行高限制
             */
            lineHeightEnabled: MuRDARegister<MuBoolean>;
            /**
             * 是否启用列宽限制
             */
            columnWidthEnabled: MuRDARegister<MuBoolean>;
            /**
             * 填充的起始角落
             */
            startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
            /**
             * 填充的方向
             */
            fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
            /**
             * 填充方向数量限制
             */
            maxCells: MuRDARegister<MuVarint>;
            /**
             * 填充方向数量限制是否启用
             */
            maxCellsEnabled: MuRDARegister<MuBoolean>;
            /**
             * 行列的间距
             */
            cellPadding: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 水平方向对齐方式
             */
            horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
            /**
             * 垂直方向对齐方式
             */
            verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
        }>;
    }, "none">;
    /**
     * 裁剪
     */
    clipsDescendants: MuRDARegister<MuBoolean>;
    /**
     * 旋转
     */
    rotation: MuRDARegister<MuQuantizedFloat>;
}>;
export type UIBox = typeof UIBoxRDA.stateSchema.identity;
export declare enum UITextFontFamily {
    /**
     * 默认字体
     * Rubik
     */
    Default = 0,
    /**
     * 粗圆体
     * 目前是GenSen-Rounded-Bold字体
     */
    BoldRound = 1,
    /**
     * Code New Roman Bold
     */
    CodeNewRomanBold = 2,
    /**
     * EN-Serif
     */
    ENSerif = 3
}
export declare const UIInputRDA: MuRDAStruct<{
    /**
     * 描边颜色
     */
    textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 描边不透明度
     */
    textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 描边粗细
     */
    textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
    /**
     * 字体
     */
    textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: MuRDARegister<QuantizedVec2Schema>;
    /**
     * 位置
     */
    position: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 尺寸
     */
    size: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 自动缩放类型
     */
    autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
    /**
     * 是否显示
     * @default true
     */
    visible: MuRDARegister<MuBoolean>;
    /**
     * 背景填充颜色
     */
    backgroundColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 元素层级
     */
    zIndex: MuRDARegister<MuVarint>;
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: MuRDARegister<MuVarint>;
    /**
     * 布局
     */
    layout: MuRDAUnion<{
        none: MuRDARegister<MuVoid>;
        autoLayout: MuRDAStruct<{
            /**
             * 网格尺寸，生效规则如下：
             * - 根据lineHeightEnabled确定行高是否生效，
             * - 根据columnWidthEnabled确定列宽是否生效。
             */
            cellSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 是否启用行高限制
             */
            lineHeightEnabled: MuRDARegister<MuBoolean>;
            /**
             * 是否启用列宽限制
             */
            columnWidthEnabled: MuRDARegister<MuBoolean>;
            /**
             * 填充的起始角落
             */
            startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
            /**
             * 填充的方向
             */
            fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
            /**
             * 填充方向数量限制
             */
            maxCells: MuRDARegister<MuVarint>;
            /**
             * 填充方向数量限制是否启用
             */
            maxCellsEnabled: MuRDARegister<MuBoolean>;
            /**
             * 行列的间距
             */
            cellPadding: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 水平方向对齐方式
             */
            horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
            /**
             * 垂直方向对齐方式
             */
            verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
        }>;
    }, "none">;
    /**
     * 裁剪
     */
    clipsDescendants: MuRDARegister<MuBoolean>;
    textContent: MuRDARegister<MuUTF8>;
    textFontSize: MuRDARegister<MuUint8>;
    textColor: MuRDARegister<QuantizedVec3Schema>;
    textOpacity: MuRDARegister<MuQuantizedFloat>;
    textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
    textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
    /**
     * 行高
     */
    textLineHeight: MuRDARegister<MuQuantizedFloat>;
    /**
     * 自动换行
     */
    autoWordWrap: MuRDARegister<MuBoolean>;
    /**
     * placeholder
     */
    placeholder: MuRDARegister<MuUTF8>;
    placeholderColor: MuRDARegister<QuantizedVec3Schema>;
    placeholderOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 旋转
     */
    rotation: MuRDARegister<MuQuantizedFloat>;
}>;
export declare const UITextRDA: MuRDAStruct<{
    /**
     * 是否开启富文本
     * 目前仅UIText有
     */
    richText: MuRDARegister<MuBoolean>;
    /**
     * 旋转
     */
    rotation: MuRDARegister<MuQuantizedFloat>;
    /**
     * 描边颜色
     */
    textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 描边不透明度
     */
    textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 描边粗细
     */
    textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
    /**
     * 字体
     */
    textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: MuRDARegister<QuantizedVec2Schema>;
    /**
     * 位置
     */
    position: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 尺寸
     */
    size: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 自动缩放类型
     */
    autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
    /**
     * 是否显示
     * @default true
     */
    visible: MuRDARegister<MuBoolean>;
    /**
     * 背景填充颜色
     */
    backgroundColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 元素层级
     */
    zIndex: MuRDARegister<MuVarint>;
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: MuRDARegister<MuVarint>;
    /**
     * 布局
     */
    layout: MuRDAUnion<{
        none: MuRDARegister<MuVoid>;
        autoLayout: MuRDAStruct<{
            /**
             * 网格尺寸，生效规则如下：
             * - 根据lineHeightEnabled确定行高是否生效，
             * - 根据columnWidthEnabled确定列宽是否生效。
             */
            cellSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 是否启用行高限制
             */
            lineHeightEnabled: MuRDARegister<MuBoolean>;
            /**
             * 是否启用列宽限制
             */
            columnWidthEnabled: MuRDARegister<MuBoolean>;
            /**
             * 填充的起始角落
             */
            startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
            /**
             * 填充的方向
             */
            fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
            /**
             * 填充方向数量限制
             */
            maxCells: MuRDARegister<MuVarint>;
            /**
             * 填充方向数量限制是否启用
             */
            maxCellsEnabled: MuRDARegister<MuBoolean>;
            /**
             * 行列的间距
             */
            cellPadding: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 水平方向对齐方式
             */
            horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
            /**
             * 垂直方向对齐方式
             */
            verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
        }>;
    }, "none">;
    /**
     * 裁剪
     */
    clipsDescendants: MuRDARegister<MuBoolean>;
    textContent: MuRDARegister<MuUTF8>;
    textFontSize: MuRDARegister<MuUint8>;
    textColor: MuRDARegister<QuantizedVec3Schema>;
    textOpacity: MuRDARegister<MuQuantizedFloat>;
    textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
    textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
    textLineHeight: MuRDARegister<MuQuantizedFloat>;
    autoWordWrap: MuRDARegister<MuBoolean>;
}>;
export type UIText = typeof UITextRDA.stateSchema.identity;
export type UIInput = typeof UIInputRDA.stateSchema.identity;
/**
 * 图片展示方式
 */
export declare enum ImageDisplayMode {
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
    None = 3
}
export declare const UIImageDisplayModeRDA: MuRDARegister<MuSchema<ImageDisplayMode>>;
export declare const UIImageRDA: MuRDAStruct<{
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: MuRDARegister<QuantizedVec2Schema>;
    /**
     * 位置
     */
    position: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 尺寸
     */
    size: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 自动缩放类型
     */
    autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
    /**
     * 是否显示
     * @default true
     */
    visible: MuRDARegister<MuBoolean>;
    /**
     * 背景填充颜色
     */
    backgroundColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 元素层级
     */
    zIndex: MuRDARegister<MuVarint>;
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: MuRDARegister<MuVarint>;
    /**
     * 裁剪
     */
    clipsDescendants: MuRDARegister<MuBoolean>;
    /**
     * 布局
     */
    layout: MuRDAUnion<{
        none: MuRDARegister<MuVoid>;
        autoLayout: MuRDAStruct<{
            /**
             * 网格尺寸，生效规则如下：
             * - 根据lineHeightEnabled确定行高是否生效，
             * - 根据columnWidthEnabled确定列宽是否生效。
             */
            cellSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 是否启用行高限制
             */
            lineHeightEnabled: MuRDARegister<MuBoolean>;
            /**
             * 是否启用列宽限制
             */
            columnWidthEnabled: MuRDARegister<MuBoolean>;
            /**
             * 填充的起始角落
             */
            startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
            /**
             * 填充的方向
             */
            fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
            /**
             * 填充方向数量限制
             */
            maxCells: MuRDARegister<MuVarint>;
            /**
             * 填充方向数量限制是否启用
             */
            maxCellsEnabled: MuRDARegister<MuBoolean>;
            /**
             * 行列的间距
             */
            cellPadding: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 水平方向对齐方式
             */
            horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
            /**
             * 垂直方向对齐方式
             */
            verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
        }>;
    }, "none">;
    image: MuRDARegister<MuUTF8>;
    imageOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
     * @default ImageDisplayMode.Fill
     */
    imageDisplayMode: MuRDARegister<MuSchema<ImageDisplayMode>>;
    /**
     * 旋转
     */
    rotation: MuRDARegister<MuQuantizedFloat>;
}>;
export type UIImage = typeof UIImageRDA.stateSchema.identity;
/**
 * 滚动条的滚动方向
 */
export declare enum UIScrollDirection {
    X = 0,
    Y = 1,
    XY = 2
}
/**
 * 滚动条水平方向的位置
 */
export declare enum UIScrollbarHorizontal {
    Left = 0,
    Right = 1
}
/**
 * 滚动条垂直方向的位置
 */
export declare enum UIScrollbarVertical {
    Top = 0,
    Bottom = 1
}
/**
 * 滚动条可见性
 */
export declare enum UIScrollbarVisibility {
    /**
     * 总是隐藏
     */
    Hidden = 0,
    /**
     * 可滚动时
     */
    Scrollable = 1
}
export declare const UIScrollBoxRDA: MuRDAStruct<{
    /**
     * UI锚点
     * @default [0, 0] 即元素的左上角。
     * 取值范围：[0, 1]
     */
    anchor: MuRDARegister<QuantizedVec2Schema>;
    /**
     * 位置
     */
    position: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 尺寸
     */
    size: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 自动缩放类型
     */
    autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
    /**
     * 是否显示
     * @default true
     */
    visible: MuRDARegister<MuBoolean>;
    /**
     * 背景填充颜色
     */
    backgroundColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 背景填充不透明度
     * 取值范围：[0, 1]
     */
    backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 元素层级
     */
    zIndex: MuRDARegister<MuVarint>;
    /**
     * 布局排序，仅在父元素开启有效布局配置时生效
     */
    layoutOrder: MuRDARegister<MuVarint>;
    /**
     * 裁剪
     */
    clipsDescendants: MuRDARegister<MuBoolean>;
    /**
     * 布局
     */
    layout: MuRDAUnion<{
        none: MuRDARegister<MuVoid>;
        autoLayout: MuRDAStruct<{
            /**
             * 网格尺寸，生效规则如下：
             * - 根据lineHeightEnabled确定行高是否生效，
             * - 根据columnWidthEnabled确定列宽是否生效。
             */
            cellSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 是否启用行高限制
             */
            lineHeightEnabled: MuRDARegister<MuBoolean>;
            /**
             * 是否启用列宽限制
             */
            columnWidthEnabled: MuRDARegister<MuBoolean>;
            /**
             * 填充的起始角落
             */
            startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
            /**
             * 填充的方向
             */
            fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
            /**
             * 填充方向数量限制
             */
            maxCells: MuRDARegister<MuVarint>;
            /**
             * 填充方向数量限制是否启用
             */
            maxCellsEnabled: MuRDARegister<MuBoolean>;
            /**
             * 行列的间距
             */
            cellPadding: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 水平方向对齐方式
             */
            horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
            /**
             * 垂直方向对齐方式
             */
            verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
        }>;
    }, "none">;
    /**
     * 滚动方向
     */
    scrollDirection: MuRDARegister<MuSchema<UIScrollDirection>>;
    /**
     * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
     */
    scrollbarHorizontal: MuRDARegister<MuSchema<UIScrollbarHorizontal>>;
    /**
     * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
     */
    scrollbarVertical: MuRDARegister<MuSchema<UIScrollbarVertical>>;
    /**
     * 滚动条 - 可见性
     */
    scrollbarVisibility: MuRDARegister<MuSchema<UIScrollbarVisibility>>;
    /**
     * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
     */
    scrollbarThickness: MuRDARegister<MuVarint>;
    /**
     * 滚动条 - 颜色
     */
    scrollbarColor: MuRDARegister<QuantizedVec3Schema>;
    /**
     * 滚动条 - 不透明度
     */
    scrollbarOpacity: MuRDARegister<MuQuantizedFloat>;
    /**
     * 内容画布 - 自适应
     */
    scrollCanvasAutoResize: MuRDARegister<MuSchema<AutoResizeType>>;
    /**
     * 内容画布 - 尺寸配置
     */
    scrollCanvasSize: MuRDAStruct<{
        /**
         * 偏移，单位是像素
         */
        offset: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 比例，基于父节点对应轴的大小，按比例表示
         * 取值范围：[0, 1]
         */
        ratio: MuRDARegister<QuantizedVec2Schema>;
    }>;
    /**
     * 滚动位置
     */
    scrollPosition: MuRDARegister<QuantizedVec2Schema>;
    /**
     * 旋转
     */
    rotation: MuRDARegister<MuQuantizedFloat>;
}>;
export type UIScrollBox = typeof UIScrollBoxRDA.stateSchema.identity;
export declare const UIElementSpec: {
    box: MuRDAStruct<{
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
    image: MuRDAStruct<{
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        image: MuRDARegister<MuUTF8>;
        imageOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
         * @default ImageDisplayMode.Fill
         */
        imageDisplayMode: MuRDARegister<MuSchema<ImageDisplayMode>>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
    text: MuRDAStruct<{
        /**
         * 是否开启富文本
         * 目前仅UIText有
         */
        richText: MuRDARegister<MuBoolean>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
        /**
         * 描边颜色
         */
        textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 描边不透明度
         */
        textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 描边粗细
         */
        textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
        /**
         * 字体
         */
        textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        textContent: MuRDARegister<MuUTF8>;
        textFontSize: MuRDARegister<MuUint8>;
        textColor: MuRDARegister<QuantizedVec3Schema>;
        textOpacity: MuRDARegister<MuQuantizedFloat>;
        textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
        textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
        textLineHeight: MuRDARegister<MuQuantizedFloat>;
        autoWordWrap: MuRDARegister<MuBoolean>;
    }>;
    scrollBox: MuRDAStruct<{
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 滚动方向
         */
        scrollDirection: MuRDARegister<MuSchema<UIScrollDirection>>;
        /**
         * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
         */
        scrollbarHorizontal: MuRDARegister<MuSchema<UIScrollbarHorizontal>>;
        /**
         * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
         */
        scrollbarVertical: MuRDARegister<MuSchema<UIScrollbarVertical>>;
        /**
         * 滚动条 - 可见性
         */
        scrollbarVisibility: MuRDARegister<MuSchema<UIScrollbarVisibility>>;
        /**
         * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
         */
        scrollbarThickness: MuRDARegister<MuVarint>;
        /**
         * 滚动条 - 颜色
         */
        scrollbarColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 滚动条 - 不透明度
         */
        scrollbarOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 内容画布 - 自适应
         */
        scrollCanvasAutoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 内容画布 - 尺寸配置
         */
        scrollCanvasSize: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 滚动位置
         */
        scrollPosition: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
    input: MuRDAStruct<{
        /**
         * 描边颜色
         */
        textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 描边不透明度
         */
        textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 描边粗细
         */
        textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
        /**
         * 字体
         */
        textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        textContent: MuRDARegister<MuUTF8>;
        textFontSize: MuRDARegister<MuUint8>;
        textColor: MuRDARegister<QuantizedVec3Schema>;
        textOpacity: MuRDARegister<MuQuantizedFloat>;
        textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
        textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
        /**
         * 行高
         */
        textLineHeight: MuRDARegister<MuQuantizedFloat>;
        /**
         * 自动换行
         */
        autoWordWrap: MuRDARegister<MuBoolean>;
        /**
         * placeholder
         */
        placeholder: MuRDARegister<MuUTF8>;
        placeholderColor: MuRDARegister<QuantizedVec3Schema>;
        placeholderOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
};
export declare const UIElementRDA: MuRDAUnion<{
    box: MuRDAStruct<{
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
    image: MuRDAStruct<{
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        image: MuRDARegister<MuUTF8>;
        imageOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
         * @default ImageDisplayMode.Fill
         */
        imageDisplayMode: MuRDARegister<MuSchema<ImageDisplayMode>>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
    text: MuRDAStruct<{
        /**
         * 是否开启富文本
         * 目前仅UIText有
         */
        richText: MuRDARegister<MuBoolean>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
        /**
         * 描边颜色
         */
        textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 描边不透明度
         */
        textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 描边粗细
         */
        textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
        /**
         * 字体
         */
        textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        textContent: MuRDARegister<MuUTF8>;
        textFontSize: MuRDARegister<MuUint8>;
        textColor: MuRDARegister<QuantizedVec3Schema>;
        textOpacity: MuRDARegister<MuQuantizedFloat>;
        textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
        textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
        textLineHeight: MuRDARegister<MuQuantizedFloat>;
        autoWordWrap: MuRDARegister<MuBoolean>;
    }>;
    scrollBox: MuRDAStruct<{
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 滚动方向
         */
        scrollDirection: MuRDARegister<MuSchema<UIScrollDirection>>;
        /**
         * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
         */
        scrollbarHorizontal: MuRDARegister<MuSchema<UIScrollbarHorizontal>>;
        /**
         * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
         */
        scrollbarVertical: MuRDARegister<MuSchema<UIScrollbarVertical>>;
        /**
         * 滚动条 - 可见性
         */
        scrollbarVisibility: MuRDARegister<MuSchema<UIScrollbarVisibility>>;
        /**
         * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
         */
        scrollbarThickness: MuRDARegister<MuVarint>;
        /**
         * 滚动条 - 颜色
         */
        scrollbarColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 滚动条 - 不透明度
         */
        scrollbarOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 内容画布 - 自适应
         */
        scrollCanvasAutoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 内容画布 - 尺寸配置
         */
        scrollCanvasSize: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 滚动位置
         */
        scrollPosition: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
    input: MuRDAStruct<{
        /**
         * 描边颜色
         */
        textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 描边不透明度
         */
        textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 描边粗细
         */
        textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
        /**
         * 字体
         */
        textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
        /**
         * UI锚点
         * @default [0, 0] 即元素的左上角。
         * 取值范围：[0, 1]
         */
        anchor: MuRDARegister<QuantizedVec2Schema>;
        /**
         * 位置
         */
        position: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 尺寸
         */
        size: MuRDAStruct<{
            /**
             * 偏移，单位是像素
             */
            offset: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 比例，基于父节点对应轴的大小，按比例表示
             * 取值范围：[0, 1]
             */
            ratio: MuRDARegister<QuantizedVec2Schema>;
        }>;
        /**
         * 自动缩放类型
         */
        autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
        /**
         * 是否显示
         * @default true
         */
        visible: MuRDARegister<MuBoolean>;
        /**
         * 背景填充颜色
         */
        backgroundColor: MuRDARegister<QuantizedVec3Schema>;
        /**
         * 背景填充不透明度
         * 取值范围：[0, 1]
         */
        backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
        /**
         * 布局排序，仅在父元素开启有效布局配置时生效
         */
        layoutOrder: MuRDARegister<MuVarint>;
        /**
         * 布局
         */
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 裁剪
         */
        clipsDescendants: MuRDARegister<MuBoolean>;
        textContent: MuRDARegister<MuUTF8>;
        textFontSize: MuRDARegister<MuUint8>;
        textColor: MuRDARegister<QuantizedVec3Schema>;
        textOpacity: MuRDARegister<MuQuantizedFloat>;
        textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
        textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
        /**
         * 行高
         */
        textLineHeight: MuRDARegister<MuQuantizedFloat>;
        /**
         * 自动换行
         */
        autoWordWrap: MuRDARegister<MuBoolean>;
        /**
         * placeholder
         */
        placeholder: MuRDARegister<MuUTF8>;
        placeholderColor: MuRDARegister<QuantizedVec3Schema>;
        placeholderOpacity: MuRDARegister<MuQuantizedFloat>;
        /**
         * 旋转
         */
        rotation: MuRDARegister<MuQuantizedFloat>;
    }>;
}, "text" | "input" | "image" | "box" | "scrollBox">;
/**
 * UI元素
 */
export type UIElement = typeof UIElementRDA.stateSchema.identity;
/**
 * UI元素的类型
 */
export type UIElementType = UIElement['type'];
export declare const UINodeSpec: {
    screen: MuRDAStruct<{
        /**
         * 是否显示
         * @default true
         */
        enable: MuRDARegister<MuBoolean>;
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
    }>;
    element: MuRDAUnion<{
        box: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        image: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            image: MuRDARegister<MuUTF8>;
            imageOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
             * @default ImageDisplayMode.Fill
             */
            imageDisplayMode: MuRDARegister<MuSchema<ImageDisplayMode>>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        text: MuRDAStruct<{
            /**
             * 是否开启富文本
             * 目前仅UIText有
             */
            richText: MuRDARegister<MuBoolean>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边颜色
             */
            textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 描边不透明度
             */
            textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边粗细
             */
            textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
            /**
             * 字体
             */
            textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            textContent: MuRDARegister<MuUTF8>;
            textFontSize: MuRDARegister<MuUint8>;
            textColor: MuRDARegister<QuantizedVec3Schema>;
            textOpacity: MuRDARegister<MuQuantizedFloat>;
            textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
            textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
            textLineHeight: MuRDARegister<MuQuantizedFloat>;
            autoWordWrap: MuRDARegister<MuBoolean>;
        }>;
        scrollBox: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 滚动方向
             */
            scrollDirection: MuRDARegister<MuSchema<UIScrollDirection>>;
            /**
             * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
             */
            scrollbarHorizontal: MuRDARegister<MuSchema<UIScrollbarHorizontal>>;
            /**
             * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
             */
            scrollbarVertical: MuRDARegister<MuSchema<UIScrollbarVertical>>;
            /**
             * 滚动条 - 可见性
             */
            scrollbarVisibility: MuRDARegister<MuSchema<UIScrollbarVisibility>>;
            /**
             * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
             */
            scrollbarThickness: MuRDARegister<MuVarint>;
            /**
             * 滚动条 - 颜色
             */
            scrollbarColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 滚动条 - 不透明度
             */
            scrollbarOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 内容画布 - 自适应
             */
            scrollCanvasAutoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 内容画布 - 尺寸配置
             */
            scrollCanvasSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 滚动位置
             */
            scrollPosition: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        input: MuRDAStruct<{
            /**
             * 描边颜色
             */
            textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 描边不透明度
             */
            textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边粗细
             */
            textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
            /**
             * 字体
             */
            textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            textContent: MuRDARegister<MuUTF8>;
            textFontSize: MuRDARegister<MuUint8>;
            textColor: MuRDARegister<QuantizedVec3Schema>;
            textOpacity: MuRDARegister<MuQuantizedFloat>;
            textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
            textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
            /**
             * 行高
             */
            textLineHeight: MuRDARegister<MuQuantizedFloat>;
            /**
             * 自动换行
             */
            autoWordWrap: MuRDARegister<MuBoolean>;
            /**
             * placeholder
             */
            placeholder: MuRDARegister<MuUTF8>;
            placeholderColor: MuRDARegister<QuantizedVec3Schema>;
            placeholderOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
    }, "text" | "input" | "image" | "box" | "scrollBox">;
};
export declare const UINodeRDA: MuRDAUnion<{
    screen: MuRDAStruct<{
        /**
         * 是否显示
         * @default true
         */
        enable: MuRDARegister<MuBoolean>;
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
    }>;
    element: MuRDAUnion<{
        box: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        image: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            image: MuRDARegister<MuUTF8>;
            imageOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
             * @default ImageDisplayMode.Fill
             */
            imageDisplayMode: MuRDARegister<MuSchema<ImageDisplayMode>>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        text: MuRDAStruct<{
            /**
             * 是否开启富文本
             * 目前仅UIText有
             */
            richText: MuRDARegister<MuBoolean>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边颜色
             */
            textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 描边不透明度
             */
            textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边粗细
             */
            textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
            /**
             * 字体
             */
            textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            textContent: MuRDARegister<MuUTF8>;
            textFontSize: MuRDARegister<MuUint8>;
            textColor: MuRDARegister<QuantizedVec3Schema>;
            textOpacity: MuRDARegister<MuQuantizedFloat>;
            textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
            textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
            textLineHeight: MuRDARegister<MuQuantizedFloat>;
            autoWordWrap: MuRDARegister<MuBoolean>;
        }>;
        scrollBox: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 滚动方向
             */
            scrollDirection: MuRDARegister<MuSchema<UIScrollDirection>>;
            /**
             * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
             */
            scrollbarHorizontal: MuRDARegister<MuSchema<UIScrollbarHorizontal>>;
            /**
             * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
             */
            scrollbarVertical: MuRDARegister<MuSchema<UIScrollbarVertical>>;
            /**
             * 滚动条 - 可见性
             */
            scrollbarVisibility: MuRDARegister<MuSchema<UIScrollbarVisibility>>;
            /**
             * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
             */
            scrollbarThickness: MuRDARegister<MuVarint>;
            /**
             * 滚动条 - 颜色
             */
            scrollbarColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 滚动条 - 不透明度
             */
            scrollbarOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 内容画布 - 自适应
             */
            scrollCanvasAutoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 内容画布 - 尺寸配置
             */
            scrollCanvasSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 滚动位置
             */
            scrollPosition: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        input: MuRDAStruct<{
            /**
             * 描边颜色
             */
            textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 描边不透明度
             */
            textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边粗细
             */
            textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
            /**
             * 字体
             */
            textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            textContent: MuRDARegister<MuUTF8>;
            textFontSize: MuRDARegister<MuUint8>;
            textColor: MuRDARegister<QuantizedVec3Schema>;
            textOpacity: MuRDARegister<MuQuantizedFloat>;
            textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
            textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
            /**
             * 行高
             */
            textLineHeight: MuRDARegister<MuQuantizedFloat>;
            /**
             * 自动换行
             */
            autoWordWrap: MuRDARegister<MuBoolean>;
            /**
             * placeholder
             */
            placeholder: MuRDARegister<MuUTF8>;
            placeholderColor: MuRDARegister<QuantizedVec3Schema>;
            placeholderOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
    }, "text" | "input" | "image" | "box" | "scrollBox">;
}, "element" | "screen">;
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
export declare const DEFAULT_SCREEN_ID = "DEFAULT_SCREEN_ID";
/**
 * 默认的屏幕名字
 */
export declare const DEFAULT_SCREEN_NAME = "screen";
/**
 * 指针事件行为
 * 实现packages/script-api/src/client/modules/ui.ts的枚举
 *
 * TODO 暂时不放入UITreeNode中，目前并未提供相关的编辑项
 */
export declare enum PointerEventBehavior {
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
    ENABLE = 3
}
export declare const UITreeRDA: MuRDATree<MuRDAUnion<{
    screen: MuRDAStruct<{
        /**
         * 是否显示
         * @default true
         */
        enable: MuRDARegister<MuBoolean>;
        layout: MuRDAUnion<{
            none: MuRDARegister<MuVoid>;
            autoLayout: MuRDAStruct<{
                /**
                 * 网格尺寸，生效规则如下：
                 * - 根据lineHeightEnabled确定行高是否生效，
                 * - 根据columnWidthEnabled确定列宽是否生效。
                 */
                cellSize: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 是否启用行高限制
                 */
                lineHeightEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 是否启用列宽限制
                 */
                columnWidthEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 填充的起始角落
                 */
                startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                /**
                 * 填充的方向
                 */
                fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                /**
                 * 填充方向数量限制
                 */
                maxCells: MuRDARegister<MuVarint>;
                /**
                 * 填充方向数量限制是否启用
                 */
                maxCellsEnabled: MuRDARegister<MuBoolean>;
                /**
                 * 行列的间距
                 */
                cellPadding: MuRDAStruct<{
                    /**
                     * 偏移，单位是像素
                     */
                    offset: MuRDARegister<QuantizedVec2Schema>;
                    /**
                     * 比例，基于父节点对应轴的大小，按比例表示
                     * 取值范围：[0, 1]
                     */
                    ratio: MuRDARegister<QuantizedVec2Schema>;
                }>;
                /**
                 * 水平方向对齐方式
                 */
                horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                /**
                 * 垂直方向对齐方式
                 */
                verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
            }>;
        }, "none">;
        /**
         * 元素层级
         */
        zIndex: MuRDARegister<MuVarint>;
    }>;
    element: MuRDAUnion<{
        box: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        image: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            image: MuRDARegister<MuUTF8>;
            imageOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 图片在容器内展示方式，只受imageDisplayMode影响，与容器的裁剪&自适应无关
             * @default ImageDisplayMode.Fill
             */
            imageDisplayMode: MuRDARegister<MuSchema<ImageDisplayMode>>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        text: MuRDAStruct<{
            /**
             * 是否开启富文本
             * 目前仅UIText有
             */
            richText: MuRDARegister<MuBoolean>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边颜色
             */
            textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 描边不透明度
             */
            textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边粗细
             */
            textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
            /**
             * 字体
             */
            textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            textContent: MuRDARegister<MuUTF8>;
            textFontSize: MuRDARegister<MuUint8>;
            textColor: MuRDARegister<QuantizedVec3Schema>;
            textOpacity: MuRDARegister<MuQuantizedFloat>;
            textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
            textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
            textLineHeight: MuRDARegister<MuQuantizedFloat>;
            autoWordWrap: MuRDARegister<MuBoolean>;
        }>;
        scrollBox: MuRDAStruct<{
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 滚动方向
             */
            scrollDirection: MuRDARegister<MuSchema<UIScrollDirection>>;
            /**
             * 滚动条 - 水平方向位置（开启垂直方向滚动时生效）
             */
            scrollbarHorizontal: MuRDARegister<MuSchema<UIScrollbarHorizontal>>;
            /**
             * 滚动条 - 垂直方向位置（开启水平方向滚动时生效）
             */
            scrollbarVertical: MuRDARegister<MuSchema<UIScrollbarVertical>>;
            /**
             * 滚动条 - 可见性
             */
            scrollbarVisibility: MuRDARegister<MuSchema<UIScrollbarVisibility>>;
            /**
             * 滚动条 - 厚度（水平的滚动条的高 / 垂直的滚动条的宽）
             */
            scrollbarThickness: MuRDARegister<MuVarint>;
            /**
             * 滚动条 - 颜色
             */
            scrollbarColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 滚动条 - 不透明度
             */
            scrollbarOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 内容画布 - 自适应
             */
            scrollCanvasAutoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 内容画布 - 尺寸配置
             */
            scrollCanvasSize: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 滚动位置
             */
            scrollPosition: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
        input: MuRDAStruct<{
            /**
             * 描边颜色
             */
            textStrokeColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 描边不透明度
             */
            textStrokeOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 描边粗细
             */
            textStrokeThickness: MuRDARegister<MuQuantizedFloat>;
            /**
             * 字体
             */
            textFontFamily: MuRDARegister<MuSchema<UITextFontFamily>>;
            /**
             * UI锚点
             * @default [0, 0] 即元素的左上角。
             * 取值范围：[0, 1]
             */
            anchor: MuRDARegister<QuantizedVec2Schema>;
            /**
             * 位置
             */
            position: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 尺寸
             */
            size: MuRDAStruct<{
                /**
                 * 偏移，单位是像素
                 */
                offset: MuRDARegister<QuantizedVec2Schema>;
                /**
                 * 比例，基于父节点对应轴的大小，按比例表示
                 * 取值范围：[0, 1]
                 */
                ratio: MuRDARegister<QuantizedVec2Schema>;
            }>;
            /**
             * 自动缩放类型
             */
            autoResize: MuRDARegister<MuSchema<AutoResizeType>>;
            /**
             * 是否显示
             * @default true
             */
            visible: MuRDARegister<MuBoolean>;
            /**
             * 背景填充颜色
             */
            backgroundColor: MuRDARegister<QuantizedVec3Schema>;
            /**
             * 背景填充不透明度
             * 取值范围：[0, 1]
             */
            backgroundOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 元素层级
             */
            zIndex: MuRDARegister<MuVarint>;
            /**
             * 布局排序，仅在父元素开启有效布局配置时生效
             */
            layoutOrder: MuRDARegister<MuVarint>;
            /**
             * 布局
             */
            layout: MuRDAUnion<{
                none: MuRDARegister<MuVoid>;
                autoLayout: MuRDAStruct<{
                    /**
                     * 网格尺寸，生效规则如下：
                     * - 根据lineHeightEnabled确定行高是否生效，
                     * - 根据columnWidthEnabled确定列宽是否生效。
                     */
                    cellSize: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 是否启用行高限制
                     */
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 是否启用列宽限制
                     */
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 填充的起始角落
                     */
                    startCorner: MuRDARegister<MuSchema<AutoLayoutStartCorner>>;
                    /**
                     * 填充的方向
                     */
                    fillDirection: MuRDARegister<MuSchema<AutoLayoutFillDirection>>;
                    /**
                     * 填充方向数量限制
                     */
                    maxCells: MuRDARegister<MuVarint>;
                    /**
                     * 填充方向数量限制是否启用
                     */
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    /**
                     * 行列的间距
                     */
                    cellPadding: MuRDAStruct<{
                        /**
                         * 偏移，单位是像素
                         */
                        offset: MuRDARegister<QuantizedVec2Schema>;
                        /**
                         * 比例，基于父节点对应轴的大小，按比例表示
                         * 取值范围：[0, 1]
                         */
                        ratio: MuRDARegister<QuantizedVec2Schema>;
                    }>;
                    /**
                     * 水平方向对齐方式
                     */
                    horizontalAlignment: MuRDARegister<MuSchema<AutoLayoutHorizontalAlignType>>;
                    /**
                     * 垂直方向对齐方式
                     */
                    verticalAlignment: MuRDARegister<MuSchema<AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            /**
             * 裁剪
             */
            clipsDescendants: MuRDARegister<MuBoolean>;
            textContent: MuRDARegister<MuUTF8>;
            textFontSize: MuRDARegister<MuUint8>;
            textColor: MuRDARegister<QuantizedVec3Schema>;
            textOpacity: MuRDARegister<MuQuantizedFloat>;
            textXAlignment: MuRDARegister<MuSchema<TextXAlignType>>;
            textYAlignment: MuRDARegister<MuSchema<TextYAlignType>>;
            /**
             * 行高
             */
            textLineHeight: MuRDARegister<MuQuantizedFloat>;
            /**
             * 自动换行
             */
            autoWordWrap: MuRDARegister<MuBoolean>;
            /**
             * placeholder
             */
            placeholder: MuRDARegister<MuUTF8>;
            placeholderColor: MuRDARegister<QuantizedVec3Schema>;
            placeholderOpacity: MuRDARegister<MuQuantizedFloat>;
            /**
             * 旋转
             */
            rotation: MuRDARegister<MuQuantizedFloat>;
        }>;
    }, "text" | "input" | "image" | "box" | "scrollBox">;
}, "element" | "screen">>;
/**
 * UI树
 */
export type UITree = typeof UITreeRDA.stateSchema.identity;
/**
 * UI树的节点
 */
export type UITreeNode = typeof UITreeRDA.nodeSchema.identity;
export {};
