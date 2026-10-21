import React, {
  memo,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import styles from './style.module.scss';
import {
  IconTipsCheckCircleFill,
  IconTipsCloseCircleFill,
  IconTipsExclamationCircleFill,
  IconTipsInfoCircleFill,
  IconLoading,
} from '@box/icons';

export type ToastType =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading';

export const DEFAULT_DURATION = 3;
const DEFAULT_ANIMATION_TIME = 0.3;

const TYPE_ICON_MAP: Record<ToastType, ReactNode> = {
  default: undefined,
  success: <IconTipsCheckCircleFill className={styles.success} />,
  error: <IconTipsCloseCircleFill className={styles.error} />,
  warning: <IconTipsExclamationCircleFill className={styles.warning} />,
  info: <IconTipsInfoCircleFill className={styles.info} />,
  loading: <IconLoading className={styles.loading} />,
};

export interface ToastProps {
  type: ToastType;
  content: string;
  description?: string;
  /**
   * never auto disappear if less then 0
   */
  duration?: number;
  onClose?: () => void;
}

export const MemoizedToast = memo(ToastView);
function ToastView(props: ToastProps): JSX.Element {
  const {
    type,
    content,
    description = '',
    duration = DEFAULT_DURATION,
    onClose,
  } = props;

  const [willUnmount, setWillUnmount] = useState(false);
  const fadeOutTimer = useRef<number>(-1);
  const closeTimer = useRef<number>(-1);

  useEffect(() => {
    function beforeClose() {
      setWillUnmount(true);
      fadeOutTimer.current = window.setTimeout(() => {
        onClose && onClose();
      }, DEFAULT_ANIMATION_TIME * 1000);
    }

    function onStart() {
      if (duration <= 0) {
        return;
      }
      closeTimer.current = window.setTimeout(
        () => {
          beforeClose();
        },
        (duration + DEFAULT_ANIMATION_TIME) * 1000,
      );
    }

    onStart();

    return () => {
      window.clearTimeout(fadeOutTimer.current);
      window.clearTimeout(closeTimer.current);
    };
  }, [duration, onClose]);

  const prefix = useMemo<ReactNode>(() => {
    return (
      TYPE_ICON_MAP[type] && (
        <div className={styles.prefix}>{TYPE_ICON_MAP[type]}</div>
      )
    );
  }, [type]);

  const animatedClass = useMemo<string>(() => {
    const classes = [styles.toast];
    willUnmount && classes.push(styles.fadeOut);
    return classes.join(' ');
  }, [willUnmount]);

  return (
    <div className={animatedClass}>
      <div className={styles.title}>
        {prefix}
        {content}
      </div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
}
