import { memo, useCallback } from 'react';
import { Input } from '../input/index.js';
import { AXIS } from '../interfaces.js';
import { useClassName } from '../util.js';
import styles from './style.module.scss.js';
import { jsx } from 'react/jsx-runtime';

const DEFAULT_VALUES = [0, 0, 0];
const AxisInputs = /*#__PURE__*/memo(AxisInputsView);
function AxisInputsView(props) {
  const {
    className: optionClassName,
    vec3Value = DEFAULT_VALUES,
    min = -Infinity,
    max = +Infinity,
    onConfirm,
    style
  } = props;
  const classNames = useClassName([styles.axisInputs, optionClassName], [optionClassName]);
  const onInputBlur = useCallback((value, axis) => {
    const newValue = [...vec3Value];
    newValue[axis] = value;
    onConfirm && onConfirm(newValue);
  }, [onConfirm, vec3Value]);
  return /*#__PURE__*/jsx("div", {
    className: classNames,
    style: style,
    children: AXIS.map((axis, i) => {
      return /*#__PURE__*/jsx("div", {
        className: styles.decorator,
        children: /*#__PURE__*/jsx(Input, {
          className: [styles.axisInput, styles[axis]].join(' '),
          type: "primary",
          size: "middle",
          center: true,
          valueType: "number",
          value: vec3Value[i],
          min: min,
          max: max,
          validator: value => {
            return /^\d{0,3}$/.test(value);
          },
          onBlur: value => {
            onInputBlur(Number(value), i);
          }
        })
      }, axis);
    })
  });
}

export { AxisInputs, AxisInputsView };
//# sourceMappingURL=index.js.map
