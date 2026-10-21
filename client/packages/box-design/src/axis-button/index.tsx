import React, { memo, useMemo } from 'react';
import { AXIS, AxisType, ComponentOptions } from '../interfaces';
import { TooltipTrigger, TooltipTriggerOptions } from '../tooltip';
import { useClassName } from '../util';
import styles from './style.module.scss';

interface AxisButtonsOptions extends ComponentOptions {
  background?: boolean;
  /**
   * 三个按钮的disable状态
   * 入参若为数组即按照x,y,z顺序表示禁用某个轴
   */
  disabled?: boolean | [boolean, boolean, boolean];
  /**
   * 仅在mirror模式下有效，记录当前按钮的选中状态
   */
  activated?: Record<AxisType, boolean>;
  tooltips?: TooltipTriggerOptions[];
  handler?: (axis: AxisType) => void;
}

const DEFAULT_SETTING: Record<AxisType, boolean> = {
  X: false,
  Y: false,
  Z: false,
};

export const AxisButtons = memo(AxisButtonsView);

/**
 * 坐标按钮组组件，包含三个按钮
 */
export function AxisButtonsView(props: AxisButtonsOptions) {
  const {
    className: optionClassName,
    background = false,
    disabled = false,
    activated = DEFAULT_SETTING,
    tooltips,
    handler,
  } = props;

  const className = useClassName(
    [styles.axisButtons, optionClassName],
    [optionClassName],
  );

  const buttonClassName = useMemo(() => {
    const list = [styles.axisButton];
    background && list.push(styles.background);
    return list.join(' ');
  }, [background]);

  const [buttonX, buttonY, buttonZ] = useMemo(() => {
    return AXIS.map((v, i) => {
      const selectedBar = (
        <div
          className={[
            styles.bar,
            styles[v],
            activated[v] ? styles.activated : '',
          ].join(' ')}
        ></div>
      );
      const axisDisabled = Array.isArray(disabled) ? disabled[i] : disabled;
      let axisButton = (
        <button
          className={[
            buttonClassName,
            styles[v],
            activated[v] ? styles.activated : '',
          ].join(' ')}
          disabled={axisDisabled}
          onClick={() => handler && handler(v)}
        >
          {v}
        </button>
      );

      if (tooltips) {
        axisButton = (
          <TooltipTrigger className={styles.tooltip} {...tooltips[i]}>
            {axisButton}
          </TooltipTrigger>
        );
      }

      return (
        <div key={v} className={[styles.buttonContainer, styles[v]].join(' ')}>
          {axisButton}
          {selectedBar}
        </div>
      );
    });
  }, [activated, buttonClassName, disabled, handler, tooltips]);

  return (
    <div className={className}>
      {buttonX}
      {buttonY}
      {buttonZ}
    </div>
  );
}
