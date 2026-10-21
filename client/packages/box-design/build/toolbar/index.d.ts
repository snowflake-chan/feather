import React, { ReactNode } from 'react';
import { ComponentOptions, ItemId } from '../interfaces';
import { TooltipTriggerOptions } from '../tooltip';
export interface ToolbarOptions extends ComponentOptions {
    children: ReactNode;
    onSelect: (data: {
        id: ItemId;
    }) => void;
    defaultSelection?: ItemId;
    selection?: ItemId;
}
export declare function Toolbar(props: ToolbarOptions): React.JSX.Element;
export interface ToolItemOptions {
    id: ItemId;
    icon: ReactNode;
    disabled?: boolean;
    children?: ReactNode;
    subSelections?: {
        id: ItemId;
        icon: string | ReactNode;
    }[];
    tooltip?: TooltipTriggerOptions | ((id?: ItemId) => TooltipTriggerOptions);
    onItemClick?: (id?: ItemId) => void;
    selectedItem?: ItemId;
}
export declare const TOOL_ITEM_CLASS = "boxToolItem";
export declare const SELECTED_TOOL_ITEM_CLASS = "boxToolSelected";
export declare function ToolItem(props: ToolItemOptions): React.JSX.Element;
export interface ToolbarGapOptions extends ComponentOptions {
    height: number;
}
export declare function ToolbarGap(options: ToolbarGapOptions): React.JSX.Element;
//# sourceMappingURL=index.d.ts.map