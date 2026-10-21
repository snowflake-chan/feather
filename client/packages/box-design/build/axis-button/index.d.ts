import React from 'react';
import { AxisType, ComponentOptions } from '../interfaces';
import { TooltipTriggerOptions } from '../tooltip';
interface AxisButtonsOptions extends ComponentOptions {
    background?: boolean;
    disabled?: boolean | [boolean, boolean, boolean];
    activated?: Record<AxisType, boolean>;
    tooltips?: TooltipTriggerOptions[];
    handler?: (axis: AxisType) => void;
}
export declare const AxisButtons: React.MemoExoticComponent<typeof AxisButtonsView>;
export declare function AxisButtonsView(props: AxisButtonsOptions): React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map