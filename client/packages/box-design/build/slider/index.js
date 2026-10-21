import { memo, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useClassName } from '../util.js';
import { useSlider } from '../hooks.js';
import styles from './style.module.scss.js';
import { Button } from '../button/index.js';
import { jsx, jsxs } from 'react/jsx-runtime';

function SliderView(options) {
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
    buttonSteps = 20
  } = options;
  const sliderRef = useRef(null);
  const wrapperClassName = useClassName([styles.wrapper, optionClassName, disabled ? styles.disabled : undefined], [optionClassName, disabled]);
  const sliderClassName = useClassName([styles.sliderWrapper, optionSliderClassName], [optionSliderClassName]);
  const [sliderValue, setSliderValue] = useState(value);
  const [sliderOffset, setSliderOffset] = useState(0);
  useEffect(() => {
    setSliderValue(value);
  }, [value]);
  const onSliderChange = useCallback(([value]) => {
    setSliderValue(value);
    onChange && onChange(value);
  }, [onChange]);
  const onAfterChange = useCallback(([value]) => {
    setSliderValue(value);
    optionOnAfterChange && optionOnAfterChange(value);
  }, [optionOnAfterChange]);
  const {
    onMouseDown: sliderMouseDown,
    railRect,
    abort
  } = useSlider({
    railRef: sliderRef,
    min: [min, 0],
    max: [max, 0],
    step,
    onChange: onSliderChange,
    onAfterChange
  });
  if (abortRef) {
    abortRef.current = abort;
  }
  const onMouseDown = useCallback(e => {
    if (!disabled) {
      optionMouseDown === null || optionMouseDown === void 0 ? void 0 : optionMouseDown();
      sliderMouseDown(e);
    }
  }, [disabled, sliderMouseDown, optionMouseDown]);
  useEffect(() => {
    if (!railRect.current) {
      return;
    }
    const offset = (sliderValue - min) / (max - min) * (railRect.current.width - 6);
    setSliderOffset(offset);
  }, [min, max, railRect, sliderValue]);
  const onButtonChange = useCallback(sign => {
    const step = (max - min) / buttonSteps;
    let newValue = value + step * sign;
    newValue = Math.max(min, newValue);
    newValue = Math.min(max, newValue);
    onSliderChange([newValue, 0]);
  }, [min, max, buttonSteps, value, onSliderChange]);
  const {
    buttonInc,
    buttonDec
  } = useMemo(() => {
    let buttonInc;
    let buttonDec;
    if (type !== 'withButton') {
      return {
        buttonInc,
        buttonDec
      };
    }
    buttonInc = /*#__PURE__*/jsx(Button, {
      className: styles.buttonInc,
      type: "icon",
      size: "custom",
      icon: buttonIncIcon,
      disabled: disabled,
      onClick: () => onButtonChange(1)
    });
    buttonDec = /*#__PURE__*/jsx(Button, {
      className: styles.buttonDec,
      type: "icon",
      size: "custom",
      icon: buttonDecIcon,
      disabled: disabled,
      onClick: () => onButtonChange(-1)
    });
    return {
      buttonInc,
      buttonDec
    };
  }, [buttonDecIcon, buttonIncIcon, type, disabled, onButtonChange]);
  return /*#__PURE__*/jsxs("div", {
    className: wrapperClassName,
    style: style,
    children: [buttonDec, /*#__PURE__*/jsxs("div", {
      className: sliderClassName,
      ref: sliderRef,
      onMouseDown: onMouseDown,
      onTouchStart: onMouseDown,
      children: [/*#__PURE__*/jsx("div", {
        className: styles.rail
      }), /*#__PURE__*/jsx("div", {
        className: styles.track,
        style: {
          width: sliderOffset
        }
      }), /*#__PURE__*/jsx("div", {
        className: styles.handle,
        style: {
          left: sliderOffset
        }
      })]
    }), input, buttonInc]
  });
}
const Slider = /*#__PURE__*/memo(SliderView);

export { Slider };
//# sourceMappingURL=index.js.map
