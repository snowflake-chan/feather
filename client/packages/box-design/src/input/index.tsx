import { clamp } from 'ramda';
import React, {
  forwardRef,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { genericMemo } from '../hooks';
import { ComponentOptions } from '../interfaces';
import { isValidNumber, substringByWidth } from '../util';
import styles from './style.module.scss';

/**
 * input的类型
 * primary - 全包围边框；line - 只有下边框；noBorder - 没有边框
 */
type InputType = 'primary' | 'line' | 'noBorder';
/**
 * input的高度
 * 分别为44/32/24px（不含边框）
 * custom为自定义高度
 */
export type InputSizes = 'large' | 'middle' | 'small' | 'custom';

interface InputCommonOptions extends ComponentOptions {
  /**
   * input的类型。
   */
  type: InputType;
  /**
   * input的大小。
   */
  size: InputSizes;
  /**
   * 是否禁止输入，默认可以输入。
   */
  disabled?: boolean;
  /**
   * input内容是否居中，默认不居中（左对齐）。
   */
  center?: boolean;
  /**
   * input内容不合法时的错误样式
   */
  error?: boolean;
  /**
   * input前缀
   */
  prefix?: ReactNode;
  /**
   * input后缀
   */
  suffix?: ReactNode;
  /**
   * 内容最大长度，半角字符为1个单位，全角字符为2个单位。默认没有限制。
   */
  maxLength?: number;
  /**
   * 在input失焦时对input内容进行格式化。
   */
  formatter?: (value: string) => string;
  /**
   * 在input内容改变时校验输入内容是否合法。
   */
  validator?: (value: string) => boolean;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  /**
   * 结束输入时，校验内容是否合法。
   * 比如空字符串是否合法。
   * @default value => !!value
   */
  onBlurValidator?: (value: string) => boolean;
  /**
   * 最小值，默认为-Infinity
   */
  min?: number;
  /**
   * 最大值，默认为Infinity
   */
  max?: number;
  /**
   * 数值精度（小数点后保留位数）
   */
  precision?: number;
  /**
   * 是否为Mixed状态，默认为否。
   */
  mixed?: boolean;
  /**
   * 步长，默认为1.
   */
  step?: number;
}

interface ValueType {
  string: string;
  number: number;
}

const INPUT_CLASS = 'boxInput';

export interface InputOptions<T extends keyof ValueType>
  extends InputCommonOptions {
  valueType: T;
  value?: ValueType[T];
  /**
   * 在focus时重新获取一次最新的value
   */
  getNewestValue?: () => ValueType[T];
}

type InputProps<T extends keyof ValueType> = InputOptions<T> &
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'type' | 'size' | 'onBlur' | 'onChange' | 'min' | 'max' | 'prefix'
  >;

function InputView<T extends keyof ValueType>(
  props: InputProps<T>,
  inputRef: Ref<HTMLInputElement | null>,
) {
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
    formatter = (value) => `${value}`,
    validator = valueType === 'number' ? isValidNumber : undefined,
    onBlurValidator = (value: string) => !!value,
    min = -Infinity,
    max = Infinity,
    precision,
    mixed = false,
    step = 1,
    getNewestValue,
    ...remains
  } = props;

  const ref = useRef<HTMLInputElement>(null);
  useImperativeHandle(inputRef, () => ref.current);

  const getValidValueStr = useCallback(
    (value?: number | string) => {
      if (value === undefined) {
        return '';
      }

      if (valueType === 'string') {
        return value.toString();
      }

      // 自动矫正为边界值
      let number = clamp(min, max, Number(value));
      // 调整精度
      if (precision !== undefined) {
        number = Number(number.toFixed(precision));
      }
      return number.toString();
    },
    [max, min, precision, valueType],
  );

  const valueStr = getValidValueStr(value);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [lastValidValue, setLastValidValue] = useState<string>(valueStr);
  const [inputValue, setInputValue] = useState<string>(valueStr);
  const displayText = useMemo<string>(() => {
    if (isEditing) {
      return inputValue;
    }
    if (mixed) {
      return '';
    }
    // 未传入任何内容时不进行format
    return value !== undefined ? formatter(valueStr) : valueStr;
  }, [isEditing, mixed, value, formatter, valueStr, inputValue]);

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(optionDisabled);

  const prefix = useMemo<ReactNode>(() => {
    return optionPrefix || undefined;
  }, [optionPrefix]);

  const suffix = useMemo<ReactNode>(() => {
    return optionSuffix || undefined;
  }, [optionSuffix]);

  const classNames = useMemo<string>(() => {
    const list = [
      INPUT_CLASS,
      styles.inputWrapper,
      optionClassName,
      styles[type],
      styles[size],
    ];
    disabled && list.push(styles.disabled);
    center && list.push(styles.center);
    error && list.push(styles.error);
    prefix && list.push(styles.hasPrefix);
    suffix && list.push(styles.hasSuffix);
    return list.join(' ');
  }, [optionClassName, type, size, disabled, center, error, prefix, suffix]);

  /**
   * Mixed状态下显示特定placeholder
   */
  const placeholder = useMemo<string>(() => {
    if (mixed) {
      return 'Mixed';
    }
    return optionPlaceholder || '';
  }, [mixed, optionPlaceholder]);

  /**
   * 通过上下键增减数值时，选中输入框内容
   */
  useEffect(() => {
    if (selectAll) {
      ref.current?.select();
      setSelectAll(false);
    }
  }, [selectAll]);

  /**
   * 在编辑过程中input被disabled，disabled前手动调用blur保存当前输入
   */
  useEffect(() => {
    if (!isEditing || optionDisabled) {
      ref.current?.blur();
    }
    setDisabled(optionDisabled);
  }, [isEditing, optionDisabled]);

  const onInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const newValue = getNewestValue ? getNewestValue() : value;
      let valueStr = getValidValueStr(newValue);
      // mixed状态下不显示内容，显示placeholder
      if (valueType === 'number' && mixed) {
        valueStr = '';
      }
      setLastValidValue(valueStr);
      setInputValue(valueStr);
      setIsEditing(true);
      onFocus && onFocus(e);
    },
    [getNewestValue, getValidValueStr, mixed, onFocus, value, valueType],
  );

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown && onKeyDown(e);
      // enter键结束输入
      if (e.key === 'Enter') {
        setIsEditing(false);
      }
      // escape键取消当次修改并结束输入
      if (e.key === 'Escape') {
        setInputValue(lastValidValue);
        setIsEditing(false);
      }

      if (valueType === 'string') {
        return;
      }

      // 数值型输入框，通过上下键进行增减
      if (!mixed && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        let number = Number(inputValue);
        if (isNaN(number)) {
          return;
        }
        const scale = 1 / step;
        if (e.key === 'ArrowUp') {
          // 转为整数进行计算，浮点数的计算结果可能出现无限循环小数
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
    },
    [inputValue, lastValidValue, mixed, onKeyDown, step, valueType],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // 允许输入空字符串，在失焦时再做限制
      if (value === '') {
        setInputValue(value);
        onChange && onChange(value);
        return;
      }

      // 不允许输入非法字符
      if (validator && !validator(value)) {
        return;
      }

      // 长度限制
      let newValue = value;
      if (maxLength !== undefined && maxLength >= 0) {
        newValue = substringByWidth(value, maxLength);
      }

      setInputValue(newValue);
      onChange && onChange(newValue);
    },
    [maxLength, onChange, setInputValue, validator],
  );

  const onInputBlur = useCallback(() => {
    setIsEditing(false);

    if (onBlurValidator(inputValue)) {
      const valueStr = getValidValueStr(inputValue);
      setLastValidValue(valueStr);
      onBlur && onBlur(valueStr);
      return;
    }

    // 输入内容为空，如果存在上一次保存的合法值，则恢复；否则不产生任何修改
    if (lastValidValue) {
      onBlur && onBlur(lastValidValue);
    }
  }, [getValidValueStr, inputValue, lastValidValue, onBlur, onBlurValidator]);

  const onInputMouseUp = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      onMouseUp && onMouseUp(e);
      // focus时,若没有选中内容,则在松开鼠标时自动选中全部内容
      if (
        ref.current &&
        ref.current.selectionEnd === ref.current.selectionStart
      ) {
        ref.current.select();
      }
    },
    [onMouseUp],
  );

  return (
    <div className={classNames} style={style}>
      {prefix}
      <input
        ref={ref}
        value={displayText}
        disabled={disabled}
        className={styles.innerInput}
        placeholder={placeholder}
        onFocus={onInputFocus}
        onKeyDown={onInputKeyDown}
        onChange={onInputChange}
        onBlur={onInputBlur}
        onMouseUp={onInputMouseUp}
        {...remains}
      />
      {suffix}
    </div>
  );
}

export const Input = genericMemo(forwardRef(InputView));
