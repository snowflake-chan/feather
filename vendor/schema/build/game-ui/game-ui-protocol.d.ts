import { MuProtocolSchema } from '@box/mudb/protocol';
import { MuBoolean, MuStruct, MuUTF8 } from '@box/mudb/schema';
declare const ResetSchema: MuStruct<{
    running: MuBoolean;
    uiTree: import("@box/mudb/schema").MuDictionary<MuStruct<{
        id: import("@box/mudb/schema").MuASCII;
        type: import("@box/mudb/schema").MuSchema<import("../project/murda-tree").TreeNodeType>;
        name: MuUTF8;
        parentId: import("@box/mudb/schema").MuASCII;
        childrenIds: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuASCII>;
        value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
            screen: MuStruct<{
                enable: MuBoolean;
                layout: import("@box/mudb/schema").MuUnion<{
                    none: import("@box/mudb/schema").MuVoid;
                    autoLayout: MuStruct<{
                        cellSize: MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        lineHeightEnabled: MuBoolean;
                        columnWidthEnabled: MuBoolean;
                        startCorner: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                        fillDirection: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                        maxCells: import("@box/mudb/schema").MuVarint;
                        maxCellsEnabled: MuBoolean;
                        cellPadding: MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        horizontalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                        verticalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                    }>;
                }>;
                zIndex: import("@box/mudb/schema").MuVarint;
            }>;
            element: import("@box/mudb/schema").MuUnion<{
                box: MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: import("@box/mudb/schema").MuVarint;
                    layoutOrder: import("@box/mudb/schema").MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                image: MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: import("@box/mudb/schema").MuVarint;
                    layoutOrder: import("@box/mudb/schema").MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    image: MuUTF8;
                    imageOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    imageDisplayMode: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").ImageDisplayMode>;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                text: MuStruct<{
                    richText: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: import("@box/mudb/schema").MuVarint;
                    layoutOrder: import("@box/mudb/schema").MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").TextXAlignType>;
                    textYAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").TextYAlignType>;
                    textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                }>;
                scrollBox: MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: import("@box/mudb/schema").MuVarint;
                    layoutOrder: import("@box/mudb/schema").MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    scrollDirection: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").UIScrollDirection>;
                    scrollbarHorizontal: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").UIScrollbarHorizontal>;
                    scrollbarVertical: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").UIScrollbarVertical>;
                    scrollbarVisibility: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").UIScrollbarVisibility>;
                    scrollbarThickness: import("@box/mudb/schema").MuVarint;
                    scrollbarColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    scrollbarOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    scrollCanvasAutoResize: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    scrollCanvasSize: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    scrollPosition: import("../utils/quantized-schema").QuantizedVec2Schema;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                input: MuStruct<{
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: import("@box/mudb/schema").MuVarint;
                    layoutOrder: import("@box/mudb/schema").MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: MuStruct<{
                            cellSize: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: import("@box/mudb/schema").MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").TextXAlignType>;
                    textYAlignment: import("@box/mudb/schema").MuSchema<import("../project/ui-rda/defs").TextYAlignType>;
                    textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                    placeholder: MuUTF8;
                    placeholderColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    placeholderOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
            }>;
        }>>;
    }>>;
    pictureAssets: import("@box/mudb/schema").MuDictionary<MuStruct<{
        metadataHash: import("@box/mudb/schema").MuASCII;
        hash: import("@box/mudb/schema").MuASCII;
        width: import("@box/mudb/schema").MuInt32;
        height: import("@box/mudb/schema").MuInt32;
    }>>;
    defaultScreenId: MuUTF8;
}>;
export declare const GameUIProtocol: MuProtocolSchema<{
    reset: typeof ResetSchema;
}, {}>;
export {};
//# sourceMappingURL=game-ui-protocol.d.ts.map