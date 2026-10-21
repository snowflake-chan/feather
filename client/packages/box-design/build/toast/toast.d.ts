import React, { type JSX } from 'react';
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
export declare const DEFAULT_DURATION = 3;
export interface ToastProps {
    type: ToastType;
    content: string;
    description?: string;
    duration?: number;
    onClose?: () => void;
}
export declare const MemoizedToast: React.MemoExoticComponent<typeof ToastView>;
declare function ToastView(props: ToastProps): JSX.Element;
export {};
//# sourceMappingURL=toast.d.ts.map