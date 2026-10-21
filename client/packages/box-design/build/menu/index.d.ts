import React, { ReactNode, MouseEvent } from 'react';
import type { ComponentOptions, ItemId } from '../interfaces';
interface MenuContextType {
    selectedItem?: ItemId;
    onItemSelect: (id: ItemId, e: MouseEvent) => void;
}
export interface MenuOptions extends ComponentOptions, MenuContextType {
    items: MenuItemOptions[];
}
export declare const Menu: React.ForwardRefExoticComponent<MenuOptions & React.RefAttributes<HTMLDivElement>>;
export interface MenuItemOptions {
    id: ItemId;
    text: string;
    icon?: string | ReactNode;
    className?: string;
    items?: MenuItemOptions[];
    disabled?: boolean;
}
export declare function MenuItem(props: MenuItemOptions): React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map