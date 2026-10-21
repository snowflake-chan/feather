import { CSSProperties, ReactNode, type JSX } from 'react';
import { ComponentOptions } from '../interfaces';
import { ProgressOptions } from '../progress';
type ModalType = 'default' | 'warning' | 'loading';
export interface BaseModalOptions extends ComponentOptions {
    content?: ReactNode;
    type?: ModalType;
}
export interface ModalOptions extends BaseModalOptions {
    onBack?: () => void;
    title?: ReactNode;
    onClose?: () => void;
    confirmText?: ReactNode;
    onConfirm?: () => void | Promise<void>;
    cancelText?: ReactNode;
    onCancel?: () => void;
    type?: 'default' | 'warning';
    buttonSort?: 'ltr' | 'rtl';
    width?: number;
    rootClassName?: string;
    rootStyle?: CSSProperties;
    confirmLoading?: boolean;
}
export declare const ModalView: (props: ModalOptions) => JSX.Element;
export interface LoadingModalOptions extends BaseModalOptions {
    type: 'loading';
    progress?: false | ProgressOptions;
    cancellableDelay?: number;
    onCancel?: () => void;
}
export declare const LoadingModalView: (props: LoadingModalOptions) => JSX.Element;
type DestroyModal = () => void;
declare function destroyAll(): void;
type ModalOption = ModalOptions | LoadingModalOptions;
declare function show(option: ModalOption): DestroyModal;
export declare const Modal: {
    show: typeof show;
    destroyAll: typeof destroyAll;
};
export {};
//# sourceMappingURL=index.d.ts.map