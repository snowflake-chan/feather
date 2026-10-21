import { IconArrowBack, IconCancel, IconLoading } from '@box/icons';
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '../button';
import { ComponentOptions } from '../interfaces';
import { Progress, ProgressOptions } from '../progress';
import styles from './style.module.scss';

type ModalType = 'default' | 'warning' | 'loading';

export interface BaseModalOptions extends ComponentOptions {
  /**
   * 模态框的内容
   */
  content?: ReactNode;
  /**
   * Modal的类型
   */
  type?: ModalType;
}

export interface ModalOptions extends BaseModalOptions {
  /**
   * 版头返回按钮 默认禁用
   * 返回按钮-回调
   */
  onBack?: () => void;
  /**
   * 标题
   */
  title?: ReactNode;
  /**
   * 版头关闭按钮 默认禁用
   * 关闭按钮-回调
   */
  onClose?: () => void;
  /**
   * 确认按钮的文本
   * @default 'Confirm'
   */
  confirmText?: ReactNode;
  /**
   * 按下确认按钮时的回调
   */
  onConfirm?: () => void | Promise<void>;
  /**
   * 取消按钮的文本
   * @default 'Cancel'
   */
  cancelText?: ReactNode;
  /**
   * 按下取消按钮时的回调
   */
  onCancel?: () => void;
  /**
   * 模态框类型
   */
  type?: 'default' | 'warning';
  /**
   * 按钮排列
   * 'ltr' 从左向右，'确认' -> '取消'。
   * 'rtl' 从右向左，'取消' <- '确认'。
   * @default 'ltr'
   */
  buttonSort?: 'ltr' | 'rtl';
  /**
   * 模态框的宽度 允许自定义
   */
  width?: number;
  /**
   * 模态框的最外层容器的类名
   */
  rootClassName?: string;
  /**
   * 模态框的最外层容器的样式
   */
  rootStyle?: CSSProperties;
  /**
   * confirm 按钮的loading状态
   */
  confirmLoading?: boolean;
}

const DEFAULT_CONFIRM_TEXT = 'confirm';
const DEFAULT_CANCEL_TEXT = 'cancel';
const CONTAINER_ID = 'boxModals';

/**
 * 标准模态框。带有标题、内容、按钮等基本信息。
 * 无层级特性
 */
export const ModalView = (props: ModalOptions) => {
  const {
    onBack,
    title,
    onClose,
    content,
    type = 'default',
    confirmText = DEFAULT_CONFIRM_TEXT,
    onConfirm,
    cancelText = DEFAULT_CANCEL_TEXT,
    onCancel,
    buttonSort = 'ltr',
    width: customWidth,
    className: optionClassName,
    style,
    rootClassName: optionRootClassName,
    rootStyle,
    confirmLoading,
  } = props;

  const confirmBtn = useMemo<ReactNode>(() => {
    if (!onConfirm) return;

    const onClick = () => {
      onConfirm && onConfirm();
    };

    const buttonType = type === 'default' ? 'primary' : 'warning';

    return (
      <Button
        className={styles.btn}
        type={buttonType}
        onClick={onClick}
        loading={confirmLoading}
      >
        {confirmText}
      </Button>
    );
  }, [type, confirmText, onConfirm, confirmLoading]);

  const cancelBtn = useMemo<ReactNode>(() => {
    if (!onCancel) return;

    const onClick = () => {
      onCancel && onCancel();
    };

    return (
      <Button className={styles.btn} type="secondary" onClick={onClick}>
        {cancelText}
      </Button>
    );
  }, [cancelText, onCancel]);

  const buttons =
    buttonSort === 'ltr' ? (
      <>
        {confirmBtn}
        {cancelBtn}
      </>
    ) : (
      <>
        {cancelBtn}
        {confirmBtn}
      </>
    );

  const rootClassName = useMemo(() => {
    return optionRootClassName || '';
  }, [optionRootClassName]);

  const className = useMemo(() => {
    return optionClassName || '';
  }, [optionClassName]);

  return (
    <div className={`${styles.modal} ${rootClassName}`} style={rootStyle}>
      <div className={styles.mask} />
      <div
        className={`${styles.body} ${className}`}
        style={{ width: customWidth, ...style }}
      >
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {onBack && (
                <IconArrowBack
                  className={styles.backIcon}
                  onClick={() => {
                    onBack();
                  }}
                />
              )}
              <div className={styles.titleContainer}>
                <div className={styles.title}>{title}</div>
              </div>
            </div>
            {onClose && (
              <IconCancel
                onClick={() => {
                  onClose();
                }}
              />
            )}
          </div>
          {content !== undefined && (
            <div className={styles.content}>{content}</div>
          )}
        </div>
        {(onCancel || onConfirm) && (
          <div className={styles.footer}>{buttons}</div>
        )}
      </div>
    </div>
  );
};

export interface LoadingModalOptions extends BaseModalOptions {
  type: 'loading';
  /**
   * 是否采用进度条模式
   * @default false
   */
  progress?: false | ProgressOptions;
  /**
   * 延迟多久能够取消。单位是毫秒。
   * @default 0
   */
  cancellableDelay?: number;
  /**
   * 取消时的回调
   */
  onCancel?: () => void;
}

export const LoadingModalView = (props: LoadingModalOptions) => {
  const {
    content,
    className: optionClassName,
    cancellableDelay = 0,
    progress = false,
    onCancel,
  } = props;

  const className = useMemo(() => {
    const list = [styles.modal, styles.loading, optionClassName];

    if (progress) {
      list.push(styles.progress);
    }

    return list.join(' ');
  }, [optionClassName, progress]);

  const [cancellable, setCancellable] = useState(cancellableDelay === 0);
  const cancellableTimer = useRef(-1);

  useEffect(() => {
    clearTimeout(cancellableTimer.current);

    if (!cancellable && cancellableDelay > 0) {
      cancellableTimer.current = window.setTimeout(
        () => setCancellable(true),
        cancellableDelay,
      );
    }

    return () => {
      clearTimeout(cancellableTimer.current);
    };
  }, [cancellableDelay, cancellable]);

  const animation = useMemo(() => {
    if (!progress) {
      // TODO 补上动画
      return <IconLoading className={styles.loading} />;
    }

    return <Progress {...progress} />;
  }, [progress]);

  return (
    <div className={className}>
      <div className={styles.mask} />
      <div className={styles.body}>
        <div className={styles.main}>
          {cancellable && (
            <IconCancel className={styles.close} onClick={onCancel} />
          )}
          {animation}
          <div className={styles.content}>{content}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * 获取装载模态框的根容器。
 */
function getRootContainer() {
  let rootModalContainer = document.querySelector(`#${CONTAINER_ID}`);
  if (!rootModalContainer) {
    rootModalContainer = document.createElement('div');
    rootModalContainer.id = CONTAINER_ID;
    document.body.appendChild(rootModalContainer);
  }
  return rootModalContainer;
}

type DestroyModal = () => void;
const DestroyFns: DestroyModal[] = [];

function destroyAll() {
  DestroyFns.forEach((fn) => fn());
}

type ModalOption = ModalOptions | LoadingModalOptions;

/**
 * 显示一个模态框
 * @param option 模态框的参数
 */
function show(option: ModalOption): DestroyModal {
  const container = document.createElement('div');
  const rootContainer = getRootContainer();
  let modal: JSX.Element;

  if (option.type === 'loading') {
    modal = <LoadingModalView {...option} />;
  } else {
    modal = <ModalView {...option} />;
  }

  const root = createRoot(container);
  root.render(modal);
  rootContainer.appendChild(container);

  const destroy: DestroyModal = () => {
    root.unmount();
    rootContainer.removeChild(container);
    const idx = DestroyFns.findIndex((fn) => fn === destroy);
    if (idx > -1) {
      DestroyFns.splice(idx, 1);
    }
  };
  DestroyFns.push(destroy);
  return destroy;
}

export const Modal = {
  show,
  destroyAll,
};
