import { __rest } from 'tslib';
import { forwardRef, useRef, useImperativeHandle, useState, useMemo, useEffect, useCallback } from 'react';
import { genericMemo } from '../hooks.js';
import styles from '../input/style.module.scss.js';
import { jsx } from 'react/jsx-runtime';

const TEXT_AREA_CLASS = 'boxTextArea';
function TextAreaView(props, inputRef) {
  const {
      className: optionClassName,
      style,
      value,
      disabled: optionDisabled = false,
      placeholder: optionPlaceholder,
      onFocus,
      onKeyDown,
      onMouseUp,
      onChange,
      onBlur
    } = props,
    remains = __rest(props, ["className", "style", "value", "disabled", "placeholder", "onFocus", "onKeyDown", "onMouseUp", "onChange", "onBlur"]);
  const ref = useRef(null);
  useImperativeHandle(inputRef, () => ref.current);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  const displayText = useMemo(() => {
    if (isEditing) {
      return inputValue;
    }
    return value;
  }, [isEditing, value, inputValue]);
  const [disabled, setDisabled] = useState(optionDisabled);
  const classNames = useMemo(() => {
    const list = [TEXT_AREA_CLASS, styles.inputWrapper, optionClassName, styles['textarea'], styles['middle']];
    disabled && list.push(styles.disabled);
    return list.join(' ');
  }, [optionClassName, disabled]);
  useEffect(() => {
    var _a;
    if (!isEditing || optionDisabled) {
      (_a = ref.current) === null || _a === void 0 ? void 0 : _a.blur();
    }
    setDisabled(optionDisabled);
  }, [isEditing, optionDisabled]);
  const onTextAreaFocus = useCallback(e => {
    setInputValue(value);
    setIsEditing(true);
    onFocus && onFocus(e);
  }, [onFocus, value]);
  const onTextAreaKeyDown = useCallback(e => {
    if (e.key === 'Enter') {
      if (e.altKey) {
        e.preventDefault();
        const cursorPosition = e.currentTarget.selectionStart;
        const value = e.currentTarget.value.substring(0, cursorPosition) + '\n' + e.currentTarget.value.substring(cursorPosition);
        e.currentTarget.selectionStart = cursorPosition + 1;
        e.currentTarget.selectionEnd = cursorPosition + 1;
        setInputValue(value);
      } else {
        setIsEditing(false);
      }
    }
    if (e.key === 'Escape') {
      setInputValue(lastValue);
      setIsEditing(false);
    }
    onKeyDown && onKeyDown(e);
  }, [lastValue, onKeyDown]);
  const onTextAreaChange = useCallback(e => {
    const value = e.target.value;
    setInputValue(value);
    onChange && onChange(value);
  }, [onChange, setInputValue]);
  const onTextAreaBlur = useCallback(() => {
    setIsEditing(false);
    setLastValue(inputValue);
    onBlur && onBlur(inputValue);
  }, [inputValue, onBlur]);
  const onInputMouseUp = useCallback(e => {
    onMouseUp && onMouseUp(e);
    if (ref.current && ref.current.selectionEnd === ref.current.selectionStart) {
      ref.current.select();
    }
  }, [onMouseUp]);
  return /*#__PURE__*/jsx("div", {
    className: classNames,
    style: style,
    children: /*#__PURE__*/jsx("textarea", {
      ref: ref,
      value: displayText,
      disabled: disabled,
      className: styles.innerInput,
      onFocus: onTextAreaFocus,
      onKeyDown: onTextAreaKeyDown,
      onChange: onTextAreaChange,
      onBlur: onTextAreaBlur,
      onMouseUp: onInputMouseUp,
      ...remains
    })
  });
}
const TextArea = genericMemo(/*#__PURE__*/forwardRef(TextAreaView));

export { TextArea };
//# sourceMappingURL=index.js.map
