import { MuRDAStruct, MuRDARegister, MuRDAConstant, MuRDAMap } from '@box/mudb/rda';
import { MuUTF8, MuArray, MuFloat64, MuBoolean, MuASCII, MuVarint, MuSchema } from '@box/mudb/schema';
export declare enum AssetType {
    JS_SCRIPT = 1,
    VOXEL_MODEL = 2,
    COLOR_LUT = 3,
    PARTICLE_TEXTURE = 4,
    IMAGE = 5,
    AUDIO = 6,
    CLIENT_JS_SCRIPT = 7,
    /**
     * 新增图片类型资源
     * PICTURE会被存储至OSS中。
     * IMAGE存储至IPFS中。
     */
    PICTURE = 8,
    /**
     * 新增GLTF类型资源
     */
    GLTF_MODEL = 9
}
export declare const AssetTypeSchema: MuSchema<AssetType>;
export declare const CommonAssets: {
    type: MuRDAConstant<MuSchema<AssetType>>;
    /**
     * type为VOXEL_MODEL时
     * voxa导出的作品这里存的是modelFileHash，数据是modelMetaData
     * 旧版.vb作品这里存的是.vb格式的hash，为工程文件
     */
    hash: MuRDARegister<MuASCII>;
    size: MuRDARegister<MuVarint>;
    previewImage: MuRDARegister<MuASCII>;
};
export declare const GroupAssetEntryRDA: MuRDAStruct<{
    type: MuRDAConstant<MuSchema<AssetType>>;
    /**
     * type为VOXEL_MODEL时
     * voxa导出的作品这里存的是modelFileHash，数据是modelMetaData
     * 旧版.vb作品这里存的是.vb格式的hash，为工程文件
     */
    hash: MuRDARegister<MuASCII>;
    size: MuRDARegister<MuVarint>;
    previewImage: MuRDARegister<MuASCII>;
    id: MuRDARegister<MuASCII>;
    updateAt: MuRDARegister<MuFloat64>;
}>;
export declare const GroupAssetsRDA: MuRDAMap<MuUTF8, MuRDAStruct<{
    type: MuRDAConstant<MuSchema<AssetType>>;
    /**
     * type为VOXEL_MODEL时
     * voxa导出的作品这里存的是modelFileHash，数据是modelMetaData
     * 旧版.vb作品这里存的是.vb格式的hash，为工程文件
     */
    hash: MuRDARegister<MuASCII>;
    size: MuRDARegister<MuVarint>;
    previewImage: MuRDARegister<MuASCII>;
    id: MuRDARegister<MuASCII>;
    updateAt: MuRDARegister<MuFloat64>;
}>>;
export type GroupAssetEntry = typeof GroupAssetEntryRDA.stateSchema.identity;
export type GroupAssetEntries = typeof GroupAssetsRDA.stateSchema.identity;
/**
 * 地图组数据的RDA，用于定义地图数据结构
 * 该数据会合并到ProjectRDA中
 */
export declare const GroupProjectRDA: {
    uiTree: import("../project/murda-tree").MuRDATree<import("../project/murda-union").MuRDAUnion<{
        screen: MuRDAStruct<{
            enable: MuRDARegister<MuBoolean>;
            layout: import("../project/murda-union").MuRDAUnion<{
                none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                autoLayout: MuRDAStruct<{
                    cellSize: MuRDAStruct<{
                        offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    }>;
                    lineHeightEnabled: MuRDARegister<MuBoolean>;
                    columnWidthEnabled: MuRDARegister<MuBoolean>;
                    startCorner: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>>;
                    fillDirection: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>>;
                    maxCells: MuRDARegister<MuVarint>;
                    maxCellsEnabled: MuRDARegister<MuBoolean>;
                    cellPadding: MuRDAStruct<{
                        offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    }>;
                    horizontalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                    verticalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>>;
                }>;
            }, "none">;
            zIndex: MuRDARegister<MuVarint>;
        }>;
        element: import("../project/murda-union").MuRDAUnion<{
            box: MuRDAStruct<{
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                layout: import("../project/murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                clipsDescendants: MuRDARegister<MuBoolean>;
                rotation: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
            }>;
            image: MuRDAStruct<{
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                clipsDescendants: MuRDARegister<MuBoolean>;
                layout: import("../project/murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                image: MuRDARegister<MuUTF8>;
                imageOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                imageDisplayMode: MuRDARegister<MuSchema<import("../project/ui-rda/defs").ImageDisplayMode>>;
                rotation: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
            }>;
            text: MuRDAStruct<{
                richText: MuRDARegister<MuBoolean>;
                rotation: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                textStrokeColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                textStrokeOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                textStrokeThickness: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                textFontFamily: MuRDARegister<MuSchema<import("../project/ui-rda/defs").UITextFontFamily>>;
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                layout: import("../project/murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                clipsDescendants: MuRDARegister<MuBoolean>;
                textContent: MuRDARegister<MuUTF8>;
                textFontSize: MuRDARegister<import("@box/mudb/schema").MuUint8>;
                textColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                textOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                textXAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").TextXAlignType>>;
                textYAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").TextYAlignType>>;
                textLineHeight: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                autoWordWrap: MuRDARegister<MuBoolean>;
            }>;
            scrollBox: MuRDAStruct<{
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                clipsDescendants: MuRDARegister<MuBoolean>;
                layout: import("../project/murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                scrollDirection: MuRDARegister<MuSchema<import("../project/ui-rda/defs").UIScrollDirection>>;
                scrollbarHorizontal: MuRDARegister<MuSchema<import("../project/ui-rda/defs").UIScrollbarHorizontal>>;
                scrollbarVertical: MuRDARegister<MuSchema<import("../project/ui-rda/defs").UIScrollbarVertical>>;
                scrollbarVisibility: MuRDARegister<MuSchema<import("../project/ui-rda/defs").UIScrollbarVisibility>>;
                scrollbarThickness: MuRDARegister<MuVarint>;
                scrollbarColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                scrollbarOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                scrollCanvasAutoResize: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoResizeType>>;
                scrollCanvasSize: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                scrollPosition: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                rotation: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
            }>;
            input: MuRDAStruct<{
                textStrokeColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                textStrokeOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                textStrokeThickness: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                textFontFamily: MuRDARegister<MuSchema<import("../project/ui-rda/defs").UITextFontFamily>>;
                anchor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                position: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                size: MuRDAStruct<{
                    offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                    ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                }>;
                autoResize: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoResizeType>>;
                visible: MuRDARegister<MuBoolean>;
                backgroundColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                backgroundOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                zIndex: MuRDARegister<MuVarint>;
                layoutOrder: MuRDARegister<MuVarint>;
                layout: import("../project/murda-union").MuRDAUnion<{
                    none: MuRDARegister<import("@box/mudb/schema").MuVoid>;
                    autoLayout: MuRDAStruct<{
                        cellSize: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        lineHeightEnabled: MuRDARegister<MuBoolean>;
                        columnWidthEnabled: MuRDARegister<MuBoolean>;
                        startCorner: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>>;
                        fillDirection: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>>;
                        maxCells: MuRDARegister<MuVarint>;
                        maxCellsEnabled: MuRDARegister<MuBoolean>;
                        cellPadding: MuRDAStruct<{
                            offset: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                            ratio: MuRDARegister<import("../utils/quantized-schema").QuantizedVec2Schema>;
                        }>;
                        horizontalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>>;
                        verticalAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>>;
                    }>;
                }, "none">;
                clipsDescendants: MuRDARegister<MuBoolean>;
                textContent: MuRDARegister<MuUTF8>;
                textFontSize: MuRDARegister<import("@box/mudb/schema").MuUint8>;
                textColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                textOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                textXAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").TextXAlignType>>;
                textYAlignment: MuRDARegister<MuSchema<import("../project/ui-rda/defs").TextYAlignType>>;
                textLineHeight: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                autoWordWrap: MuRDARegister<MuBoolean>;
                placeholder: MuRDARegister<MuUTF8>;
                placeholderColor: MuRDARegister<import("../utils/quantized-schema").QuantizedVec3Schema>;
                placeholderOpacity: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
                rotation: MuRDARegister<import("@box/mudb/schema").MuQuantizedFloat>;
            }>;
        }, "text" | "input" | "image" | "box" | "scrollBox">;
    }, "element" | "screen">>;
    audioAssets: MuRDAMap<MuUTF8, MuRDAStruct<{
        type: MuRDAConstant<MuSchema<AssetType>>;
        /**
         * type为VOXEL_MODEL时
         * voxa导出的作品这里存的是modelFileHash，数据是modelMetaData
         * 旧版.vb作品这里存的是.vb格式的hash，为工程文件
         */
        hash: MuRDARegister<MuASCII>;
        size: MuRDARegister<MuVarint>;
        previewImage: MuRDARegister<MuASCII>;
        id: MuRDARegister<MuASCII>;
        updateAt: MuRDARegister<MuFloat64>;
    }>>;
    pictureAssets: MuRDAMap<MuUTF8, MuRDAStruct<{
        type: MuRDAConstant<MuSchema<AssetType>>;
        /**
         * type为VOXEL_MODEL时
         * voxa导出的作品这里存的是modelFileHash，数据是modelMetaData
         * 旧版.vb作品这里存的是.vb格式的hash，为工程文件
         */
        hash: MuRDARegister<MuASCII>;
        size: MuRDARegister<MuVarint>;
        previewImage: MuRDARegister<MuASCII>;
        id: MuRDARegister<MuASCII>;
        updateAt: MuRDARegister<MuFloat64>;
    }>>;
};
declare const GroupProjectStoreSchema: import("@box/mudb/schema").MuStruct<{
    uiTree: MuArray<import("@box/mudb/schema").MuStruct<{
        deleted: MuBoolean;
        id: MuASCII;
        type: MuSchema<import("../project/murda-tree").TreeNodeType>;
        name: MuUTF8;
        parentId: MuASCII;
        children: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
            sequence: MuASCII;
            value: MuASCII;
        }>>;
        value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
            screen: import("@box/mudb/schema").MuStruct<{
                enable: MuBoolean;
                layout: import("@box/mudb/schema").MuUnion<{
                    none: import("@box/mudb/schema").MuVoid;
                    autoLayout: import("@box/mudb/schema").MuStruct<{
                        cellSize: import("@box/mudb/schema").MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        lineHeightEnabled: MuBoolean;
                        columnWidthEnabled: MuBoolean;
                        startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                        fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                        maxCells: MuVarint;
                        maxCellsEnabled: MuBoolean;
                        cellPadding: import("@box/mudb/schema").MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                        verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                    }>;
                }>;
                zIndex: MuVarint;
            }>;
            element: import("@box/mudb/schema").MuUnion<{
                box: import("@box/mudb/schema").MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                image: import("@box/mudb/schema").MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    image: MuUTF8;
                    imageOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    imageDisplayMode: MuSchema<import("../project/ui-rda/defs").ImageDisplayMode>;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                text: import("@box/mudb/schema").MuStruct<{
                    richText: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: MuSchema<import("../project/ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: MuSchema<import("../project/ui-rda/defs").TextXAlignType>;
                    textYAlignment: MuSchema<import("../project/ui-rda/defs").TextYAlignType>;
                    textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                }>;
                scrollBox: import("@box/mudb/schema").MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    scrollDirection: MuSchema<import("../project/ui-rda/defs").UIScrollDirection>;
                    scrollbarHorizontal: MuSchema<import("../project/ui-rda/defs").UIScrollbarHorizontal>;
                    scrollbarVertical: MuSchema<import("../project/ui-rda/defs").UIScrollbarVertical>;
                    scrollbarVisibility: MuSchema<import("../project/ui-rda/defs").UIScrollbarVisibility>;
                    scrollbarThickness: MuVarint;
                    scrollbarColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    scrollbarOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    scrollCanvasAutoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    scrollCanvasSize: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    scrollPosition: import("../utils/quantized-schema").QuantizedVec2Schema;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                input: import("@box/mudb/schema").MuStruct<{
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: MuSchema<import("../project/ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: MuSchema<import("../project/ui-rda/defs").TextXAlignType>;
                    textYAlignment: MuSchema<import("../project/ui-rda/defs").TextYAlignType>;
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
    audioAssets: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        deleted: MuBoolean;
        key: MuUTF8;
        value: import("@box/mudb/schema").MuStruct<{
            type: MuSchema<AssetType>;
            hash: MuASCII;
            size: MuVarint;
            previewImage: MuASCII;
            id: MuASCII;
            updateAt: MuFloat64;
        }>;
    }>>;
    pictureAssets: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuStruct<{
        id: MuVarint;
        sequence: MuVarint;
        deleted: MuBoolean;
        key: MuUTF8;
        value: import("@box/mudb/schema").MuStruct<{
            type: MuSchema<AssetType>;
            hash: MuASCII;
            size: MuVarint;
            previewImage: MuASCII;
            id: MuASCII;
            updateAt: MuFloat64;
        }>;
    }>>;
}>, GroupProjectStateSchema: import("@box/mudb/schema").MuStruct<{
    uiTree: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
        id: MuASCII;
        type: MuSchema<import("../project/murda-tree").TreeNodeType>;
        name: MuUTF8;
        parentId: MuASCII;
        childrenIds: MuArray<MuASCII>;
        value: import("@box/mudb/schema").MuOption<import("@box/mudb/schema").MuUnion<{
            screen: import("@box/mudb/schema").MuStruct<{
                enable: MuBoolean;
                layout: import("@box/mudb/schema").MuUnion<{
                    none: import("@box/mudb/schema").MuVoid;
                    autoLayout: import("@box/mudb/schema").MuStruct<{
                        cellSize: import("@box/mudb/schema").MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        lineHeightEnabled: MuBoolean;
                        columnWidthEnabled: MuBoolean;
                        startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                        fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                        maxCells: MuVarint;
                        maxCellsEnabled: MuBoolean;
                        cellPadding: import("@box/mudb/schema").MuStruct<{
                            offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                            ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                        }>;
                        horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                        verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                    }>;
                }>;
                zIndex: MuVarint;
            }>;
            element: import("@box/mudb/schema").MuUnion<{
                box: import("@box/mudb/schema").MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                image: import("@box/mudb/schema").MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    image: MuUTF8;
                    imageOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    imageDisplayMode: MuSchema<import("../project/ui-rda/defs").ImageDisplayMode>;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                text: import("@box/mudb/schema").MuStruct<{
                    richText: MuBoolean;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: MuSchema<import("../project/ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: MuSchema<import("../project/ui-rda/defs").TextXAlignType>;
                    textYAlignment: MuSchema<import("../project/ui-rda/defs").TextYAlignType>;
                    textLineHeight: import("@box/mudb/schema").MuQuantizedFloat;
                    autoWordWrap: MuBoolean;
                }>;
                scrollBox: import("@box/mudb/schema").MuStruct<{
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    clipsDescendants: MuBoolean;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    scrollDirection: MuSchema<import("../project/ui-rda/defs").UIScrollDirection>;
                    scrollbarHorizontal: MuSchema<import("../project/ui-rda/defs").UIScrollbarHorizontal>;
                    scrollbarVertical: MuSchema<import("../project/ui-rda/defs").UIScrollbarVertical>;
                    scrollbarVisibility: MuSchema<import("../project/ui-rda/defs").UIScrollbarVisibility>;
                    scrollbarThickness: MuVarint;
                    scrollbarColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    scrollbarOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    scrollCanvasAutoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    scrollCanvasSize: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    scrollPosition: import("../utils/quantized-schema").QuantizedVec2Schema;
                    rotation: import("@box/mudb/schema").MuQuantizedFloat;
                }>;
                input: import("@box/mudb/schema").MuStruct<{
                    textStrokeColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textStrokeOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textStrokeThickness: import("@box/mudb/schema").MuQuantizedFloat;
                    textFontFamily: MuSchema<import("../project/ui-rda/defs").UITextFontFamily>;
                    anchor: import("../utils/quantized-schema").QuantizedVec2Schema;
                    position: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    size: import("@box/mudb/schema").MuStruct<{
                        offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                        ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                    }>;
                    autoResize: MuSchema<import("../project/ui-rda/defs").AutoResizeType>;
                    visible: MuBoolean;
                    backgroundColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    backgroundOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    zIndex: MuVarint;
                    layoutOrder: MuVarint;
                    layout: import("@box/mudb/schema").MuUnion<{
                        none: import("@box/mudb/schema").MuVoid;
                        autoLayout: import("@box/mudb/schema").MuStruct<{
                            cellSize: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            lineHeightEnabled: MuBoolean;
                            columnWidthEnabled: MuBoolean;
                            startCorner: MuSchema<import("../project/ui-rda/defs").AutoLayoutStartCorner>;
                            fillDirection: MuSchema<import("../project/ui-rda/defs").AutoLayoutFillDirection>;
                            maxCells: MuVarint;
                            maxCellsEnabled: MuBoolean;
                            cellPadding: import("@box/mudb/schema").MuStruct<{
                                offset: import("../utils/quantized-schema").QuantizedVec2Schema;
                                ratio: import("../utils/quantized-schema").QuantizedVec2Schema;
                            }>;
                            horizontalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutHorizontalAlignType>;
                            verticalAlignment: MuSchema<import("../project/ui-rda/defs").AutoLayoutVerticalAlignType>;
                        }>;
                    }>;
                    clipsDescendants: MuBoolean;
                    textContent: MuUTF8;
                    textFontSize: import("@box/mudb/schema").MuUint8;
                    textColor: import("../utils/quantized-schema").QuantizedVec3Schema;
                    textOpacity: import("@box/mudb/schema").MuQuantizedFloat;
                    textXAlignment: MuSchema<import("../project/ui-rda/defs").TextXAlignType>;
                    textYAlignment: MuSchema<import("../project/ui-rda/defs").TextYAlignType>;
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
    audioAssets: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
        type: MuSchema<AssetType>;
        hash: MuASCII;
        size: MuVarint;
        previewImage: MuASCII;
        id: MuASCII;
        updateAt: MuFloat64;
    }>>;
    pictureAssets: import("@box/mudb/schema").MuDictionary<import("@box/mudb/schema").MuStruct<{
        type: MuSchema<AssetType>;
        hash: MuASCII;
        size: MuVarint;
        previewImage: MuASCII;
        id: MuASCII;
        updateAt: MuFloat64;
    }>>;
}>;
export { GroupProjectStoreSchema, GroupProjectStateSchema };
export type GroupProjectStore = typeof GroupProjectStoreSchema.identity;
export type GroupProjectState = typeof GroupProjectStateSchema.identity;
type GroupProjectKeys = keyof GroupProjectState;
export type GroupProjectMetaData = {
    /**
     * GroupProject数据版本号
     * 只在数据需要做本地migration（引擎数据升级）时，才需要升级这个版本
     * 后端的migration只是在处理数据合并，不会影响该版本号
     */
    version: string;
    hashes: Record<GroupProjectKeys, string>;
};
//# sourceMappingURL=rda.d.ts.map