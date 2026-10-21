import React, { ReactNode, memo, useCallback, useMemo } from 'react';
import { IconDone } from '@box/icons';
import styles from './style.module.scss';

type SizeType = 'large' | 'medium' | 'small';

export type CheckboxProps = {
  value: boolean;
  mixed: boolean;
  onChange: (value: boolean, mixed: boolean) => void;
  size?: SizeType;
};

function CheckboxView(props: CheckboxProps) {
  const { value, mixed, onChange, size = 'large' } = props;

  const { child, className } = useMemo(() => {
    let child: ReactNode;

    const classNames: string[] = [styles.checkbox];

    classNames.push(styles[size]);

    if (mixed) {
      child = <div className={styles.mixedChild} />;

      classNames.push(styles.mixed);
    } else if (value) {
      child = <IconDone />;

      classNames.push(styles.activated);
    }

    return {
      child,
      className: classNames.join(' '),
    };
  }, [size, mixed, value]);

  const onClick = useCallback(() => {
    onChange(!value, mixed);
  }, [onChange, value, mixed]);

  return (
    <div className={className} onClick={onClick}>
      <div className={styles.rect}>{child}</div>
    </div>
  );
}

export const Checkbox = memo(CheckboxView);
