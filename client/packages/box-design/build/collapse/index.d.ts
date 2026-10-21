import React, { ReactNode, MouseEventHandler } from 'react';
import { ComponentOptions } from '../interfaces';
interface CollapseOptions extends ComponentOptions {
    expandIcon: string | ReactNode;
    onChange?: (id: number[]) => void;
    onArrowClicked?: (id: number, isExpanded: boolean) => void;
    activeIds?: number[];
    defaultActiveIds?: number[];
    disabled?: boolean;
    children?: ReactNode;
    onMouseLeave?: MouseEventHandler;
}
export declare function Collapse(props: CollapseOptions): React.JSX.Element;
export interface CollapsePanelOptions extends ComponentOptions {
    id: number;
    header: ReactNode;
    showArrow?: boolean;
    showDivider?: boolean;
    extra?: ReactNode;
    children?: ReactNode;
}
export declare function CollapsePanel(props: CollapsePanelOptions): React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map