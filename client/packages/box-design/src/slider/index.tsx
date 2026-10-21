import React from 'react';
import {
  useCallback,
  useRef,
  useState,
  useEffect,
  ReactNode,
  MutableRefObject,
  memo,
  useMemo,
} from 'react';
import type { ComponentOptions, SerializedVec2 } from '../interfaces';
import { useClassName } from '../util';
import { useSlider } from '../hooks';
import styles from './style.module.scss';
import { Button } from '../button';

/**
 * normal - 普通滑动条；
 * withButton - 两端带按钮的滑动条
 */
type SliderType = 'normal' | 'withButton';

export interface SliderOptions extends ComponentOptions {
  type: SliderType;
  /**
   * 最小值，默认为0
   */
  min?: number;
  /**
   * 最大值，默认为100
   */
  max?: number;
  /**
   * slider的值，默认等于min
   */
  value?: number;
  /**
   * 步长
   */
  step?: number;
  /**
   * 当滑动条被点击时触发
   */
  onMouseDown?: () => void;
  /**
   * slider值发生改变时调用
   */
  onChange?: (value: number) => void;
  /**
   * slider值完成改变时调用
   */
  onAfterChange?: (value: number) => void;
  /**
   * 中断拖拽操作的引用。
   * 组件会更新该引用的current，更新为可触发中断的函数。
   */
  abortRef?: MutableRefObject<() => void>;
  /**
   * 滑动条的className
   */
  sliderClassName?: string;
  /**
   * 放置于slider右侧的input
   */
  input?: ReactNode;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * “增加”按钮的icon
   * 仅在type为'withButton'时生效
   */
  buttonIncIcon?: ReactNode;
  /**
   * 减少”按钮的icon
   * 仅在type为'withButton'时生效
   */
  buttonDecIcon?: ReactNode;
  /**
   * 从min到max，button可增加的次数
   * 仅在type为'withButton'时生效
   */
  buttonSteps?: number;
}

function SliderView(options: SliderOptions) {
  const {
    min = 0,
    max = 100,
    value = min,
    step,
    onChange,
    onMouseDown: optionMouseDown,
    onAfterChange: optionOnAfterChange,
    style,
    className: optionClassName,
    sliderClassName: optionSliderClassName,
    input,
    disabled,
    abortRef,
    type,
    buttonIncIcon,
    buttonDecIcon,
    buttonSteps = 20,
  } = options;

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const wrapperClassName = useClassName(
    [styles.wrapper, optionClassName, disabled ? styles.disabled : undefined],
    [optionClassName, disabled],
  );
  const sliderClassName = useClassName(
    [styles.sliderWrapper, optionSliderClassName],
    [optionSliderClassName],
  );

  const [sliderValue, setSliderValue] = useState<number>(value);
  const [sliderOffset, setSliderOffset] = useState<number>(0);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const onSliderChange = useCallback(
    ([value]: SerializedVec2) => {
      setSliderValue(value);

      onChange && onChange(value);
    },
    [onChange],
  );

  const onAfterChange = useCallback(
    ([value]: SerializedVec2) => {
      setSliderValue(value);

      optionOnAfterChange && optionOnAfterChange(value);
    },
    [optionOnAfterChange],
  );

  const {
    onMouseDown: sliderMouseDown,
    railRect,
    abort,
  } = useSlider({
    railRef: sliderRef,
    min: [min, 0],
    max: [max, 0],
    step,
    onChange: onSliderChange,
    onAfterChange,
  });

  if (abortRef) {
    abortRef.current = abort;
  }

  const onMouseDown = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    ) => {
      if (!disabled) {
        optionMouseDown?.();

        sliderMouseDown(e);
      }
    },
    [disabled, sliderMouseDown, optionMouseDown],
  );

  useEffect(() => {
    if (!railRect.current) {
      return;
    }
    const offset =
      ((sliderValue - min) / (max - min)) * (railRect.current.width - 6);
    setSliderOffset(offset);
  }, [min, max, railRect, sliderValue]);

  const onButtonChange = useCallback(
    (sign: number) => {
      const step = (max - min) / buttonSteps;

      let newValue = value + step * sign;

      newValue = Math.max(min, newValue);
      newValue = Math.min(max, newValue);

      onSliderChange([newValue, 0]);
    },
    [min, max, buttonSteps, value, onSliderChange],
  );

  const { buttonInc, buttonDec } = useMemo(() => {
    let buttonInc: ReactNode | undefined;
    let buttonDec: ReactNode | undefined;

    if (type !== 'withButton') {
      return { buttonInc, buttonDec };
    }

    buttonInc = (
      <Button
        className={styles.buttonInc}
        type="icon"
        size="custom"
        icon={buttonIncIcon}
        disabled={disabled}
        onClick={() => onButtonChange(1)}
      />
    );
    buttonDec = (
      <Button
        className={styles.buttonDec}
        type="icon"
        size="custom"
        icon={buttonDecIcon}
        disabled={disabled}
        onClick={() => onButtonChange(-1)}
      />
    );

    return { buttonInc, buttonDec };
  }, [buttonDecIcon, buttonIncIcon, type, disabled, onButtonChange]);

  return (
    <div className={wrapperClassName} style={style}>
      {buttonDec}
      <div
        className={sliderClassName}
        ref={sliderRef}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      >
        <div className={styles.rail} />
        <div className={styles.track} style={{ width: sliderOffset }} />
        <div className={styles.handle} style={{ left: sliderOffset }} />
      </div>
      {input}
      {buttonInc}
    </div>
  );
}

export const Slider = memo(SliderView);
