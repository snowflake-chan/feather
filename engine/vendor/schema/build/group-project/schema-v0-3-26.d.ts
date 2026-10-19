import { MuBoolean, MuQuantizedFloat, MuSchema, MuUTF8, MuUint8, MuVarint, MuVoid, MuStruct, MuFloat64, MuASCII, MuDictionary } from '@box/mudb/schema';
import { TreeNodeType } from '../project/murda-tree';
import { QuantizedVec2Schema, QuantizedVec3Schema } from '../utils/quantized-schema';
declare enum AutoResizeType {
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
/**
 * 文本水平对齐类型
 */
declare enum TextXAlignType {
    Center = 0,
    Left = 1,
    Right = 2
}
/**
 * 文本纵向对齐类型
 */
declare enum TextYAlignType {
    Center = 0,
    Top = 1,
    Bottom = 2
}
/**
 * 自动布局的起点角落
 */
declare enum AutoLayoutStartCorner {
    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}
/**
 * 自动布局的方向
 */
declare enum AutoLayoutFillDirection {
    Horizontal = 0,
    Vertical = 1
}
/**
 * 自动布局水平对齐类型
 */
declare enum AutoLayoutHorizontalAlignType {
    Center = 0,
    Left = 1,
    Right = 2
}
/**
 * 自动布局纵向对齐类型
 */
declare enum AutoLayoutVerticalAlignType {
    Center = 0,
    Top = 1,
    Bottom = 2
}
/**
 * 滚动条的滚动方向
 */
declare enum UIScrollDirection {
    X = 0,
    Y = 1,
    XY = 2
}
/**
 * 滚动条水平方向的位置
 */
declare enum UIScrollbarHorizontal {
    Left = 0,
    Right = 1
}
/**
 * 滚动条垂直方向的位置
 */
declare enum UIScrollbarVertical {
    Top = 0,
    Bottom = 1
}
/**
 * 滚动条可见性
 */
declare enum UIScrollbarVisibility {
    /**
     * 总是隐藏
     */
    Hidden = 0,
    /**
     * 可滚动时
     */
    Scrollable = 1
}
export declare const GroupProjectStateV26: MuStruct<{
    uiTree: MuDictionary<MuStruct<{
        id: MuASCII;
        type: MuSchema<TreeNodeType>;
        name: MuUTF8;
        parentId: MuASCII;
        childrenIds: import("@box/mudb/schema").MuArray<MuASCII>;
        value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
            screen: MuStruct<{
                enable: MuBoolean;
                layout: import("@box/mudb/schema").MuUnion<{
                    none: MuVoid;
                    autoLayout: MuStruct<{
                        cellSize: MuStruct<{
                            offset: QuantizedVec2Schema;
                            ratio: QuantizedVec2Schema;
                        }>;
                        lineHeightEnabled: MuBoolean;
                        columnWidthEnabled: MuBoolean;
                        startCorner: MuSchema<AutoLayoutStartCorner>;
                        fillDirection: MuSchema<AutoLayoutFillDirection>;
                        maxCells: MuVarint;
                        maxCellsEnabled: MuBoolean;
                        cellPadding: MuStruct<{
                            offset: QuantizedVec2Schema;
                            ratio: QuantizedVec2Schema;
                        }>;
                        horizontalAlignment: MuSchema<AutoLayoutHorizontalAlignType>;
                        verticalAlignment: MuSchema<AutoLayoutVerticalAlignType>;
                    }>;
                }>;
                zIndex: MuVarint;
            }>;
            element: import("@box/mudb/schema").MuUnion<{
                box: MuStruct<{
                    anchor: QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: QuantizedVec3Schema;
                    backgroundOpacity: MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<AutoLayoutStartCorner>;
                            fillDirection: MuSchema<AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                }>;
                image: MuStruct<{
                    anchor: QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: QuantizedVec3Schema;
                    backgroundOpacity: MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<AutoLayoutStartCorner>;
                            fillDirection: MuSchema<AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    image: MuUTF8;
                    imageOpacity: MuQuantizedFloat;
                }>;
                text: MuStruct<{
                    anchor: QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: QuantizedVec3Schema;
                    backgroundOpacity: MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<AutoLayoutStartCorner>;
                            fillDirection: MuSchema<AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: MuUint8;
                    textColor: QuantizedVec3Schema;
                    textOpacity: MuQuantizedFloat;
                    textXAlignment: MuSchema<TextXAlignType>;
                    textYAlignment: MuSchema<TextYAlignType>;
                    textLineHeight: MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                }>;
                scrollBox: MuStruct<{
                    anchor: QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: QuantizedVec3Schema;
                    backgroundOpacity: MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<AutoLayoutStartCorner>;
                            fillDirection: MuSchema<AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    scrollDirection: MuSchema<UIScrollDirection>;
                    scrollbarHorizontal: MuSchema<UIScrollbarHorizontal>;
                    scrollbarVertical: MuSchema<UIScrollbarVertical>;
                    scrollbarVisibility: MuSchema<UIScrollbarVisibility>;
                    scrollbarThickness: MuVarint;
                    scrollbarColor: QuantizedVec3Schema;
                    scrollbarOpacity: MuQuantizedFloat;
                    scrollCanvasAutoResize: MuSchema<AutoResizeType>;
                    scrollCanvasSize: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    scrollPosition: QuantizedVec2Schema;
                }>;
                input: MuStruct<{
                    anchor: QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: QuantizedVec2Schema;
                        ratio: QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: QuantizedVec3Schema;
                    backgroundOpacity: MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<AutoLayoutStartCorner>;
                            fillDirection: MuSchema<AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: QuantizedVec2Schema;
                                ratio: QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: MuUint8;
                    textColor: QuantizedVec3Schema;
                    textOpacity: MuQuantizedFloat;
                    textXAlignment: MuSchema<TextXAlignType>;
                    textYAlignment: MuSchema<TextYAlignType>;
                    textLineHeight: MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                    placeholder: MuUTF8;
                    placeholderColor: QuantizedVec3Schema;
                    placeholderOpacity: MuQuantizedFloat;
                }>;
            }>;
        }>>;
    }>>;
    audioAssets: MuDictionary<MuStruct<{
        ownerId: MuVarint;
        contentId: MuFloat64;
        bounds: MuSchema<import("gl-matrix").vec3>;
        animated: MuBoolean;
        type: MuVarint;
        hash: MuASCII;
        size: MuVarint;
        previewImage: MuASCII;
    }>>;
}>;
export {};
//# sourceMappingURL=schema-v0-3-26.d.ts.map