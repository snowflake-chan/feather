import React, {
  forwardRef,
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
import styles from '../input/style.module.scss';

interface TextAreaOptions extends ComponentOptions {
  /**
   * 类型。
   */
  value: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
}

const TEXT_AREA_CLASS = 'boxTextArea';

type TextAreaProps = TextAreaOptions &
  Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'onBlur' | 'onChange'
  >;

function TextAreaView(
  props: TextAreaProps,
  inputRef: Ref<HTMLTextAreaElement | null>,
) {
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
    onBlur,
    ...remains
  } = props;

  const ref = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(inputRef, () => ref.current);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value);
  const [lastValue, setLastValue] = useState<string>(value);
  const displayText = useMemo<string>(() => {
    if (isEditing) {
      return inputValue;
    }
    return value;
  }, [isEditing, value, inputValue]);

  const [disabled, setDisabled] = useState<boolean>(optionDisabled);

  const classNames = useMemo<string>(() => {
    const list = [
      TEXT_AREA_CLASS,
      styles.inputWrapper,
      optionClassName,
      styles['textarea'],
      styles['middle'],
    ];
    disabled && list.push(styles.disabled);
    return list.join(' ');
  }, [optionClassName, disabled]);

  /**
   * 在编辑过程中input被disabled，disabled前手动调用blur保存当前输入
   */
  useEffect(() => {
    if (!isEditing || optionDisabled) {
      ref.current?.blur();
    }
    setDisabled(optionDisabled);
  }, [isEditing, optionDisabled]);

  const onTextAreaFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setInputValue(value);
      setIsEditing(true);
      onFocus && onFocus(e);
    },
    [onFocus, value],
  );

  const onTextAreaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // alt + enter 换行
      if (e.key === 'Enter') {
        if (e.altKey) {
          e.preventDefault();
          const cursorPosition = e.currentTarget.selectionStart;
          const value =
            e.currentTarget.value.substring(0, cursorPosition) +
            '\n' +
            e.currentTarget.value.substring(cursorPosition);
          e.currentTarget.selectionStart = cursorPosition + 1;
          e.currentTarget.selectionEnd = cursorPosition + 1;
          setInputValue(value);
        } else {
          setIsEditing(false);
        }
      }

      // escape键取消当次修改并结束输入
      if (e.key === 'Escape') {
        setInputValue(lastValue);
        setIsEditing(false);
      }
      onKeyDown && onKeyDown(e);
    },
    [lastValue, onKeyDown],
  );

  const onTextAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      // 允许输入空字符串，在失焦时再做限制
      setInputValue(value);
      onChange && onChange(value);
    },
    [onChange, setInputValue],
  );

  const onTextAreaBlur = useCallback(() => {
    setIsEditing(false);
    setLastValue(inputValue);

    onBlur && onBlur(inputValue);
  }, [inputValue, onBlur]);

  const onInputMouseUp = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
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
      <textarea
        ref={ref}
        value={displayText}
        disabled={disabled}
        className={styles.innerInput}
        onFocus={onTextAreaFocus}
        onKeyDown={onTextAreaKeyDown}
        onChange={onTextAreaChange}
        onBlur={onTextAreaBlur}
        onMouseUp={onInputMouseUp}
        {...remains}
      />
    </div>
  );
}

export const TextArea = genericMemo(forwardRef(TextAreaView));
