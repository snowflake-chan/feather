import { __rest } from 'tslib';
import { clamp } from 'ramda';
import { forwardRef, useRef, useImperativeHandle, useCallback, useState, useMemo, useEffect } from 'react';
import { genericMemo } from '../hooks.js';
import { isValidNumber, substringByWidth } from '../util.js';
import styles from './style.module.scss.js';
import { jsxs, jsx } from 'react/jsx-runtime';

const INPUT_CLASS = 'boxInput';
function InputView(props, inputRef) {
  const {
      className: optionClassName,
      style,
      valueType,
      value,
      type,
      size,
      disabled: optionDisabled = false,
      center = false,
      prefix: optionPrefix,
      suffix: optionSuffix,
      error,
      maxLength,
      placeholder: optionPlaceholder,
      onFocus,
      onKeyDown,
      onMouseUp,
      onChange,
      onBlur,
      formatter = value => `${value}`,
      validator = valueType === 'number' ? isValidNumber : undefined,
      onBlurValidator = value => !!value,
      min = -Infinity,
      max = Infinity,
      precision,
      mixed = false,
      step = 1,
      getNewestValue
    } = props,
    remains = __rest(props, ["className", "style", "valueType", "value", "type", "size", "disabled", "center", "prefix", "suffix", "error", "maxLength", "placeholder", "onFocus", "onKeyDown", "onMouseUp", "onChange", "onBlur", "formatter", "validator", "onBlurValidator", "min", "max", "precision", "mixed", "step", "getNewestValue"]);
  const ref = useRef(null);
  useImperativeHandle(inputRef, () => ref.current);
  const getValidValueStr = useCallback(value => {
    if (value === undefined) {
      return '';
    }
    if (valueType === 'string') {
      return value.toString();
    }
    let number = clamp(min, max, Number(value));
    if (precision !== undefined) {
      number = Number(number.toFixed(precision));
    }
    return number.toString();
  }, [max, min, precision, valueType]);
  const valueStr = getValidValueStr(value);
  const [isEditing, setIsEditing] = useState(false);
  const [lastValidValue, setLastValidValue] = useState(valueStr);
  const [inputValue, setInputValue] = useState(valueStr);
  const displayText = useMemo(() => {
    if (isEditing) {
      return inputValue;
    }
    if (mixed) {
      return '';
    }
    return value !== undefined ? formatter(valueStr) : valueStr;
  }, [isEditing, mixed, value, formatter, valueStr, inputValue]);
  const [selectAll, setSelectAll] = useState(false);
  const [disabled, setDisabled] = useState(optionDisabled);
  const prefix = useMemo(() => {
    return optionPrefix || undefined;
  }, [optionPrefix]);
  const suffix = useMemo(() => {
    return optionSuffix || undefined;
  }, [optionSuffix]);
  const classNames = useMemo(() => {
    const list = [INPUT_CLASS, styles.inputWrapper, optionClassName, styles[type], styles[size]];
    disabled && list.push(styles.disabled);
    center && list.push(styles.center);
    error && list.push(styles.error);
    prefix && list.push(styles.hasPrefix);
    suffix && list.push(styles.hasSuffix);
    return list.join(' ');
  }, [optionClassName, type, size, disabled, center, error, prefix, suffix]);
  const placeholder = useMemo(() => {
    if (mixed) {
      return 'Mixed';
    }
    return optionPlaceholder || '';
  }, [mixed, optionPlaceholder]);
  useEffect(() => {
    var _a;
    if (selectAll) {
      (_a = ref.current) === null || _a === void 0 ? void 0 : _a.select();
      setSelectAll(false);
    }
  }, [selectAll]);
  useEffect(() => {
    var _a;
    if (!isEditing || optionDisabled) {
      (_a = ref.current) === null || _a === void 0 ? void 0 : _a.blur();
    }
    setDisabled(optionDisabled);
  }, [isEditing, optionDisabled]);
  const onInputFocus = useCallback(e => {
    const newValue = getNewestValue ? getNewestValue() : value;
    let valueStr = getValidValueStr(newValue);
    if (valueType === 'number' && mixed) {
      valueStr = '';
    }
    setLastValidValue(valueStr);
    setInputValue(valueStr);
    setIsEditing(true);
    onFocus && onFocus(e);
  }, [getNewestValue, getValidValueStr, mixed, onFocus, value, valueType]);
  const onInputKeyDown = useCallback(e => {
    onKeyDown && onKeyDown(e);
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setInputValue(lastValidValue);
      setIsEditing(false);
    }
    if (valueType === 'string') {
      return;
    }
    if (!mixed && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      let number = Number(inputValue);
      if (isNaN(number)) {
        return;
      }
      const scale = 1 / step;
      if (e.key === 'ArrowUp') {
        number = Math.floor(number * scale);
        number += step * scale;
      } else {
        number = Math.ceil(number * scale);
        number -= step * scale;
      }
      number = number / scale;
      setInputValue(number.toString());
      setSelectAll(true);
    }
  }, [inputValue, lastValidValue, mixed, onKeyDown, step, valueType]);
  const onInputChange = useCallback(e => {
    const value = e.target.value;
    if (value === '') {
      setInputValue(value);
      onChange && onChange(value);
      return;
    }
    if (validator && !validator(value)) {
      return;
    }
    let newValue = value;
    if (maxLength !== undefined && maxLength >= 0) {
      newValue = substringByWidth(value, maxLength);
    }
    setInputValue(newValue);
    onChange && onChange(newValue);
  }, [maxLength, onChange, setInputValue, validator]);
  const onInputBlur = useCallback(() => {
    setIsEditing(false);
    if (onBlurValidator(inputValue)) {
      const valueStr = getValidValueStr(inputValue);
      setLastValidValue(valueStr);
      onBlur && onBlur(valueStr);
      return;
    }
    if (lastValidValue) {
      onBlur && onBlur(lastValidValue);
    }
  }, [getValidValueStr, inputValue, lastValidValue, onBlur, onBlurValidator]);
  const onInputMouseUp = useCallback(e => {
    onMouseUp && onMouseUp(e);
    if (ref.current && ref.current.selectionEnd === ref.current.selectionStart) {
      ref.current.select();
    }
  }, [onMouseUp]);
  return /*#__PURE__*/jsxs("div", {
    className: classNames,
    style: style,
    children: [prefix, /*#__PURE__*/jsx("input", {
      ref: ref,
      value: displayText,
      disabled: disabled,
      className: styles.innerInput,
      placeholder: placeholder,
      onFocus: onInputFocus,
      onKeyDown: onInputKeyDown,
      onChange: onInputChange,
      onBlur: onInputBlur,
      onMouseUp: onInputMouseUp,
      ...remains
    }), suffix]
  });
}
const Input = genericMemo(/*#__PURE__*/forwardRef(InputView));

export { Input };
//# sourceMappingURL=index.js.map
