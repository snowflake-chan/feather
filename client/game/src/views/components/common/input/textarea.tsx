import React, { useEffect, useRef } from 'react';
import { calc_class_name } from 'src/utils/classname';
import { WebText } from '../text';
import style from './index.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  errorMsg?: string;
  tips?: string;
  minHeight?: string;
  autoFocus?: boolean;
  allowResize?: boolean;
  maxBytes?: number;
  className?: string;
  onConfirm?: (ev?) => void;
  onCancel?: () => void;
  onFocus?: (ev: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLTextAreaElement>) => void;
  maxLine?: number; // flexible input height
  getFocus?: (focus: () => void) => void;
  getBlur?: (blur: () => void) => void;
  rows?: number;
}

export const InputTextarea = (props: Props) => {
  const inputEl = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (props.autoFocus && inputEl.current) {
      inputEl.current.focus();
    }
    if (props.getFocus) {
      props.getFocus(() => inputEl.current && inputEl.current.focus());
    }
    if (props.getBlur) {
      props.getBlur(() => inputEl.current && inputEl.current.blur());
    }
  }, []);

  useEffect(() => {
    if (!props.maxLine || !inputEl.current) {
      return;
    }
    const lineHeight = 24;
    if (!props.value) {
      inputEl.current.style.height = lineHeight + 16 + 'px';
      return;
    }
    const scrollHeight = inputEl.current.scrollHeight;
    const rows = ~~(scrollHeight / lineHeight);
    const minRows = Math.min(~~props.maxLine, rows);

    inputEl.current.scrollTop = scrollHeight;
    const height = lineHeight * minRows;
    inputEl.current.style.height = height + 16 + 'px';
  }, [props.value, props.maxLine]);

  const resize = () => {
    if (inputEl.current) {
      inputEl.current.style.height = 'auto';
      inputEl.current.style.height = inputEl.current.scrollHeight - 20 + 'px';
    }
  };

  return (
    <div className={calc_class_name('input-text', style.textareaContainer)}>
      <textarea
        ref={inputEl}
        style={{
          minHeight: props.minHeight,
        }}
        disabled={props.disabled}
        value={props.value}
        onChange={(ev) => {
          if (
            props.maxBytes &&
            new Blob([ev.target.value]).size > props.maxBytes
          ) {
            return;
          }
          props.onChange(ev.target.value);
          resize();
        }}
        placeholder={props.placeholder}
        className={calc_class_name(
          'input-textarea',
          style.inputTextarea,
          props.errorMsg && style.error,
          props.allowResize && style.allowResize,
          props.className,
        )}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={(ev) => {
          switch (
            ev.key ||
            ev.keyCode // ev.keyCode will be deprecated
          ) {
            case 27: // ESC
            case 'Escape':
              props.onCancel && props.onCancel();
              break;
            case 13: // ENTER
            case 'Enter':
              props.onConfirm && props.onConfirm(ev);
              break;
          }
        }}
        rows={props.rows}
      />
      {props.tips && (
        <WebText className={style.tips} size={12}>
          {props.tips}
        </WebText>
      )}
      {props.errorMsg && (
        <WebText className={style.errorMsg} size={12} color={'red'}>
          {props.errorMsg}
        </WebText>
      )}
    </div>
  );
};
