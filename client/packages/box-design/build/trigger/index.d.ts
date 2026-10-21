import React, { ReactElement, ReactNode, MutableRefObject } from 'react';
export type Placement = 'rightTop' | 'bottomLeft' | 'bottomRight' | 'bottom' | 'top' | 'topLeft' | 'topRight';
export type AlignType = {
    offset: number[];
};
export type TriggerChildren = ReactElement<{
    className?: string;
    onClick?: (evt: MouseEvent) => void;
    onMouseEnter?: (evt: MouseEvent) => void;
    onMouseLeave?: (evt: MouseEvent) => void;
    ref?: MutableRefObject<HTMLElement | null>;
}>;
export type TriggerActionType = 'click' | 'hover' | 'blur' | 'focus';
export interface TriggerOptions {
    action?: TriggerActionType[];
    showAction?: TriggerActionType[];
    hideAction?: TriggerActionType[];
    onPopupVisibleChange?: (visible: boolean) => void;
    onPopupBlur?: () => void;
    popupVisible?: boolean;
    delay?: number;
    placement?: Placement;
    align?: AlignType;
    disabled?: boolean;
    moveWithCursor?: [number, number];
    getPortalContainer?: () => HTMLElement | undefined;
}
interface TriggerProps extends TriggerOptions {
    children?: TriggerChildren;
    popup: ReactNode;
}
export declare function Trigger(options: TriggerProps): React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map