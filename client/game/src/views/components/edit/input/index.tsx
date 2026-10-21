import React, { useState, useEffect, useRef, type JSX } from 'react';
import { InputPause, useInputPause } from '../../input-lock';
import { InputPauseFlags } from '@box/schema/input/input-schema';

import style from './index.module.css';

type Props = {
  value: string | number;
  placeholder?: string;
  textarea?: boolean;
  disabled?: boolean;
  small?: boolean;
  number?: boolean;
  clearBtn?: boolean;
  className?: string;
  numberFixed?: number;
  maxLength?: number;
  maxBytes?: number;
  isError?: boolean;
  errorMessage?: string;
  inputStyle?: { [key: string]: string };
  containerStyle?: React.CSSProperties;
  immediatelyChange?: boolean;
  onChange?: (v: string, ev?) => void;
  onBlur?: (v: string) => void;
};

const defaultNumberFixed = 6;

export const Input: React.FC<Props> = (props): JSX.Element => {
  const [value, setValue] = useState<string | number>('');
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isInputPause, setIsInputPause] = useState<boolean>(false);
  const isTyping = useRef<boolean>(false);
  const { inputPauseChange } = useInputPause();

  useEffect(() => {
    const numberFixed = 10 * (props.numberFixed || defaultNumberFixed);
    let initValue = props.number
      ? Math.round(+props.value * numberFixed) / numberFixed
      : props.value;
    if (typeof initValue === 'number') {
      initValue = Number(initValue).toString();
    }
    setValue(initValue);
    setDisplayValue(initValue);
  }, []);

  useEffect(() => {
    if (isTyping.current) {
      return;
    }
    if (props.number) {
      if (+props.value !== +value) {
        const numberFixed = Math.pow(
          10,
          props.numberFixed || defaultNumberFixed,
        );
        const newValue = Math.round(+props.value * numberFixed) / numberFixed;
        setValue(newValue);
        setDisplayValue(newValue.toString());
      }
    } else {
      if (props.value !== value) {
        setValue(props.value);
        setDisplayValue(props.value.toString());
      }
    }
  }, [props.number, props.value]);

  useEffect(() => {
    isTyping.current = false;
  }, [value, displayValue]);

  const _onInputChange = (ev) => {
    setDisplayValue(ev.target.value);
    isTyping.current = true;
    if (props.immediatelyChange) {
      isTyping.current = false;
      props.onChange && props.onChange(ev.target.value);
    }
  };

  const _checkValue = () => {
    if (props.number) {
      const val = Number(displayValue);
      if (typeof val != 'number' || val.toString() == 'NaN') {
        setDisplayValue(value.toString());
        return;
      }
      const numberFixed = 10 * (props.numberFixed || defaultNumberFixed);
      const newValue = Math.round(+val * numberFixed) / numberFixed;

      setValue(newValue);
      setDisplayValue(newValue.toString());
      props.onChange && props.onChange(newValue.toString());
    } else {
      setValue(displayValue);
      props.onChange && props.onChange(displayValue);
    }
  };

  const _handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValue(e.target.value);
    props.onChange && props.onChange(e.target.value);
  };

  const validByteLength = (validValue: string) => {
    if (!props.maxBytes) {
      return true;
    }
    if (new Blob([validValue]).size <= props.maxBytes) {
      return true;
    }
    return false;
  };

  const classNames = [style.inputContainer];
  if (props.small) {
    classNames.push(style.small);
  }
  if (props.disabled) {
    classNames.push(style.disable);
  }
  if (props.className) {
    classNames.push(props.className);
  }
  const isErrorStyle = !props.disabled && props.isError;

  return (
    <>
      {isInputPause && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      <div className={classNames.join(' ')} style={{ ...props.containerStyle }}>
        {props.textarea ? (
          <textarea
            style={{ ...props.inputStyle }}
            className={isErrorStyle ? style.error : ''}
            spellCheck={false}
            value={value}
            placeholder={props.placeholder}
            onChange={(ev) => {
              if (!validByteLength(ev.target.value)) {
                return;
              }
              _handleChange(ev);
            }}
            onFocus={(e) => {
              if (props.disabled) {
                e.target.blur();
                e.preventDefault();
                e.stopPropagation();
              }
              setIsInputPause(true);
            }}
            onClick={(e) => {
              if (props.disabled) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onBlur={() => setIsInputPause(false)}
            maxLength={props.maxLength}
          />
        ) : (
          <input
            style={{ ...props.inputStyle }}
            className={isErrorStyle ? style.error : ''}
            type="text"
            spellCheck={false}
            value={displayValue}
            placeholder={props.placeholder}
            onChange={(ev) => {
              if (!validByteLength(ev.target.value)) {
                return;
              }
              _onInputChange(ev);
            }}
            onFocus={(e) => {
              if (props.disabled) {
                e.target.blur();
                e.preventDefault();
                e.stopPropagation();
              }
              setIsInputPause(true);
            }}
            onClick={(e) => {
              if (props.disabled) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onKeyPress={(ev) => {
              if (ev.charCode === 13) {
                _checkValue();
              } else if (
                props.number &&
                !(
                  (ev.charCode >= 48 && ev.charCode <= 57) ||
                  ev.key == '-' ||
                  ev.key == '.'
                )
              ) {
                ev.preventDefault();
                ev.stopPropagation();
              }
            }}
            onBlur={(ev) => {
              _checkValue();
              props.onBlur && props.onBlur(displayValue.toString());
              setIsInputPause(false);
            }}
            maxLength={props.maxLength}
          />
        )}
        {(props.clearBtn && value.toString().length && !props.textarea && (
          <div className={style.clearBtnContainer}>
            <div
              className={style.clearBtn}
              onClick={() => props.onChange && props.onChange('')}
            ></div>
          </div>
        )) || <></>}
      </div>
      <>
        {props.isError && props.errorMessage && (
          <div className={style.errorMessage}>{props.errorMessage}</div>
        )}
      </>
    </>
  );
};
