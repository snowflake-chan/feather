import React, { useMemo } from 'react';
import { ComponentOptions } from '../interfaces';
import styles from './style.module.scss';

export interface SwitchOptions extends ComponentOptions {
  /**
   * 默认是否选中
   */
  defaultChecked?: boolean;
  /**
   * 当前是否选中
   */
  checked?: boolean;
  /**
   * 开关状态改变时触发
   */
  onChange?: (checked: boolean) => void;
}

export function Switch(options: SwitchOptions) {
  const {
    defaultChecked = false,
    className: optionClassName,
    style,
    checked: optionChecked,
    onChange,
  } = options;

  const [innerChecked, setInnerChecked] = React.useState(defaultChecked);

  const checked = optionChecked === undefined ? innerChecked : optionChecked;

  const className = useMemo(() => {
    const list = [styles.switch];

    if (optionClassName) {
      list.push(optionClassName);
    }

    if (checked) {
      list.push(styles.checked);
    }

    return list.join(' ');
  }, [optionClassName, checked]);

  return (
    <div
      className={className}
      style={style}
      onClick={() => {
        setInnerChecked(!checked);

        onChange && onChange(!checked);
      }}
    >
      <div className={styles.background}>
        <div className={styles.thumb} />
      </div>
    </div>
  );
}
