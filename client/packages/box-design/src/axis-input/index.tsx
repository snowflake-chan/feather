import React, { memo, useCallback, type JSX } from 'react';
import { Input } from '../input';
import { AXIS, ComponentOptions, SerializedVec3 } from '../interfaces';
import { useClassName } from '../util';
import styles from './style.module.scss';

const DEFAULT_VALUES: SerializedVec3 = [0, 0, 0];
interface AxisInputsOptions extends ComponentOptions {
  vec3Value: SerializedVec3;
  min?: number;
  max?: number;
  onConfirm?: (newValue: SerializedVec3) => void;
}

export const AxisInputs = memo(AxisInputsView);

/**
 * 坐标输入框组件，包含三个独立的输入框
 */
export function AxisInputsView(props: AxisInputsOptions): JSX.Element {
  const {
    className: optionClassName,
    vec3Value = DEFAULT_VALUES,
    min = -Infinity,
    max = +Infinity,
    onConfirm,
    style,
  } = props;

  const classNames = useClassName(
    [styles.axisInputs, optionClassName],
    [optionClassName],
  );

  const onInputBlur = useCallback(
    (value: number, axis: number) => {
      const newValue: SerializedVec3 = [...vec3Value];
      newValue[axis] = value;
      onConfirm && onConfirm(newValue);
    },
    [onConfirm, vec3Value],
  );

  return (
    <div className={classNames} style={style}>
      {AXIS.map((axis, i) => {
        return (
          <div key={axis} className={styles.decorator}>
            <Input
              className={[styles.axisInput, styles[axis]].join(' ')}
              type="primary"
              size="middle"
              center
              valueType="number"
              value={vec3Value[i]}
              min={min}
              max={max}
              validator={(value) => {
                return /^\d{0,3}$/.test(value);
              }}
              onBlur={(value: string) => {
                onInputBlur(Number(value), i);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
