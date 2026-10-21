import React, { ReactNode } from 'react';
import type { ComponentOptions } from '../interfaces';
import { TooltipTriggerOptions } from '../tooltip';
export interface TabsOptions extends ComponentOptions {
    defaultActiveId: string | number;
    activeId?: string | number;
    onChange?: (id: string | number) => void;
    onTabClick?: (id: string | number) => void;
    children?: ReactNode;
}
export declare function Tabs(options: TabsOptions): React.JSX.Element;
type TabType = 'text' | 'icon';
export interface TabPanelOptions extends ComponentOptions {
    id: string | number;
    type: TabType;
    icon?: ReactNode;
    tab?: ReactNode;
    disabled?: boolean;
    tooltipTrigger?: TooltipTriggerOptions;
    children?: ReactNode;
}
export declare function TabPanel(options: TabPanelOptions): React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map