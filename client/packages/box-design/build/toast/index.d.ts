import { ToastProps } from './toast';
type BasicToastConfig = Omit<ToastProps, 'type'>;
declare function unmountContainer(): void;
declare function createDefaultToast(config: BasicToastConfig): number;
declare function createSuccessToast(config: BasicToastConfig): number;
declare function createErrorToast(config: BasicToastConfig): number;
declare function createWarningToast(config: BasicToastConfig): number;
declare function createInfoToast(config: BasicToastConfig): number;
declare function createLoadingToast(config: BasicToastConfig): number;
export declare const Toast: {
    default: typeof createDefaultToast;
    success: typeof createSuccessToast;
    error: typeof createErrorToast;
    warning: typeof createWarningToast;
    info: typeof createInfoToast;
    loading: typeof createLoadingToast;
    destroyAll: typeof unmountContainer;
};
export {};
//# sourceMappingURL=index.d.ts.map