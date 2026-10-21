import React, { type JSX } from 'react';
import type { ComponentOptions, ItemId } from '../interfaces';
import { MenuItemOptions } from '../menu';
import { AlignType, Placement } from '../trigger';
type SizeType = 'large' | 'medium' | 'small';
export interface SelectProps extends ComponentOptions {
    size?: SizeType;
    onSelect: (data: {
        id: ItemId;
    }) => void;
    selection?: ItemId;
    disabled?: boolean;
    items: MenuItemOptions[];
    mixed?: boolean;
    placement?: Placement;
    align?: AlignType;
}
declare function SelectView(props: SelectProps): JSX.Element;
export declare const Select: React.MemoExoticComponent<typeof SelectView>;
export {};
//# sourceMappingURL=index.d.ts.map