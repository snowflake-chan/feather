import React, {
  forwardRef,
  memo,
  ReactNode,
  Ref,
  useMemo,
  type JSX,
} from 'react';
import { ComponentOptions } from '../interfaces';
import { Icon } from '../icon';
import styles from './style.module.scss';

type ButtonType =
  | 'primary'
  | 'secondary'
  | 'text'
  | 'warning'
  | 'hyperLink'
  | 'icon';

type SizeType = 'large' | 'medium' | 'small' | 'custom';

interface ButtonOptions extends ComponentOptions {
  type?: ButtonType;
  /**
   * @default medium
   */
  size?: SizeType;
  activated?: boolean;
  background?: boolean;
  loading?: boolean;
  icon?: string | ReactNode;
  children?: ReactNode;
}

type ButtonProps = ButtonOptions &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const BUTTON_CLASS = 'boxButton';

function ButtonView(
  props: ButtonProps,
  ref: Ref<HTMLButtonElement>,
): JSX.Element {
  const {
    className: optionClassName,
    type = 'primary',
    size = 'medium',
    activated,
    background,
    loading,
    icon,
    children,
    disabled,
    ...remains
  } = props;

  const classNames = useMemo<string>(() => {
    const list = [styles.button, optionClassName, styles[type], BUTTON_CLASS];

    size !== 'custom' && list.push(styles[size]);
    loading && list.push(styles.loading);
    background && list.push(styles.background);
    !disabled && activated && list.push(styles.activated);

    return list.join(' ');
  }, [optionClassName, type, size, loading, background, disabled, activated]);

  const iconNode = useMemo<ReactNode | undefined>(() => {
    if (!icon) {
      return;
    }

    if (typeof icon === 'string') {
      return <Icon symbolId={icon} />;
    }

    return icon;
  }, [icon]);

  const content = loading ? undefined : (
    <>
      {iconNode}
      {background && <div className={styles.selectedBar} />}
      {children && <p>{children}</p>}
    </>
  );

  return (
    <button ref={ref} {...remains} className={classNames} disabled={disabled}>
      {content}
    </button>
  );
}

export const Button = memo(forwardRef(ButtonView));
