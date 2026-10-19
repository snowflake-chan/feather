import type { UIElement, UIElementSpec, UIElementType, UILayoutSpecType, UILayoutType, UINode, UINodeSpec, UINodeType } from './defs';
import { MuRDAUnionSpec } from '../murda-union';
type UINodeSpecType = typeof UINodeSpec;
type UIElementSpecType = typeof UIElementSpec;
/**
 * 通过RDA字典和key，推断出对应RDA的stateSchema.identity
 */
type UnionRDAInstance<Spec extends MuRDAUnionSpec, Type extends keyof MuRDAUnionSpec> = {
    type: Type;
    data: Spec[Type]['stateSchema']['identity'];
};
type PickUIType<T extends UINodeType | UIElementType> = T extends UINodeType ? UnionRDAInstance<UINodeSpecType, T> : T extends UIElementType ? {
    type: 'element';
    data: UnionRDAInstance<UIElementSpecType, T>;
} : undefined;
export declare function isUIScreen(value: UINode): value is PickUIType<'screen'>;
export declare function isUIElement(value: UINode): value is PickUIType<'element'>;
export declare function isUIBoxElement(value: UIElement): value is PickUIType<'box'>['data'];
export declare function isUIBoxNode(value: UINode): value is PickUIType<'box'>;
export declare function isUITextElement(value: UIElement): value is PickUIType<'text'>['data'];
export declare function isUITextNode(value: UINode): value is PickUIType<'text'>;
export declare function isUIInputElement(value: UIElement): value is PickUIType<'input'>['data'];
export declare function isUIInputNode(value: UINode): value is PickUIType<'input'>;
export declare function isUIImageElement(value: UIElement): value is PickUIType<'image'>['data'];
export declare function isUIImageNode(value: UINode): value is PickUIType<'image'>;
export declare function isUIScrollBoxElement(value: UIElement): value is PickUIType<'scrollBox'>['data'];
export declare function isUIScrollBoxNode(value: UINode): value is PickUIType<'scrollBox'>;
export declare function isUIAutoLayout(value: UILayoutType): value is UnionRDAInstance<UILayoutSpecType, 'autoLayout'>;
/**
 * 获取屏幕节点或元素节点的布局属性
 */
export declare function pickLayoutProp(value: UINode): import("@box/mudb/schema/union").UnionInstance<{
    none: import("@box/mudb/schema").MuVoid;
    autoLayout: import("@box/mudb/schema").MuStruct<{
        cellSize: import("@box/mudb/schema").MuStruct<{
            offset: import("../../utils/quantized-schema").QuantizedVec2Schema;
            ratio: import("../../utils/quantized-schema").QuantizedVec2Schema;
        }>;
        lineHeightEnabled: import("@box/mudb/schema").MuBoolean;
        columnWidthEnabled: import("@box/mudb/schema").MuBoolean;
        startCorner: import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutStartCorner>;
        fillDirection: import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutFillDirection>;
        maxCells: import("@box/mudb/schema").MuVarint;
        maxCellsEnabled: import("@box/mudb/schema").MuBoolean;
        cellPadding: import("@box/mudb/schema").MuStruct<{
            offset: import("../../utils/quantized-schema").QuantizedVec2Schema;
            ratio: import("../../utils/quantized-schema").QuantizedVec2Schema;
        }>;
        horizontalAlignment: import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutHorizontalAlignType>;
        verticalAlignment: import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutVerticalAlignType>;
    }>;
}, "none" | "autoLayout"> | undefined;
/**
 * 获取节点的自布局属性，如果未开启自动布局，返回undefined
 */
export declare function pickAutoLayoutProp(value: UINode): UnionRDAInstance<{
    none: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuVoid>;
    autoLayout: import("@box/mudb/rda").MuRDAStruct<{
        cellSize: import("@box/mudb/rda").MuRDAStruct<{
            offset: import("@box/mudb/rda").MuRDARegister<import("../../utils/quantized-schema").QuantizedVec2Schema>;
            ratio: import("@box/mudb/rda").MuRDARegister<import("../../utils/quantized-schema").QuantizedVec2Schema>;
        }>;
        lineHeightEnabled: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuBoolean>;
        columnWidthEnabled: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuBoolean>;
        startCorner: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutStartCorner>>;
        fillDirection: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutFillDirection>>;
        maxCells: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuVarint>;
        maxCellsEnabled: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuBoolean>;
        cellPadding: import("@box/mudb/rda").MuRDAStruct<{
            offset: import("@box/mudb/rda").MuRDARegister<import("../../utils/quantized-schema").QuantizedVec2Schema>;
            ratio: import("@box/mudb/rda").MuRDARegister<import("../../utils/quantized-schema").QuantizedVec2Schema>;
        }>;
        horizontalAlignment: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutHorizontalAlignType>>;
        verticalAlignment: import("@box/mudb/rda").MuRDARegister<import("@box/mudb/schema").MuSchema<import("./defs").AutoLayoutVerticalAlignType>>;
    }>;
}, "autoLayout"> | undefined;
export {};
//# sourceMappingURL=util.d.ts.map