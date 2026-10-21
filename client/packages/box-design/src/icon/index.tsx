import React, { type JSX } from 'react';
import { ComponentOptions } from '../interfaces';
import { useClassName } from '../util';
import styles from './style.module.scss';

interface IconOptions extends ComponentOptions {
  /**
   * svg symbol的id
   */
  symbolId: string;
}

export const BOX_ICON_CLASS = 'boxIcon';

/**
 * 纯Icon组件。无交互效果。
 */
export function Icon(option: IconOptions): JSX.Element {
  const { symbolId, className: optionClassName, style } = option;

  const className = useClassName(
    [styles.icon, BOX_ICON_CLASS, optionClassName],
    [optionClassName],
  );

  return (
    <svg className={className} style={style}>
      <use xlinkHref={symbolId}></use>
    </svg>
  );
}
