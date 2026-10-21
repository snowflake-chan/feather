import { memo, useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { clamp } from 'ramda';

const DEFAULT_DELAY = 500;
function useSharedTipsDelay() {
  const [displayed, setDisplayed] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const delay = useMemo(() => displayed ? 0 : DEFAULT_DELAY, [displayed]);
  return {
    delay,
    displayed,
    setDisplayed,
    disabled,
    setDisabled
  };
}
function useSlider(options) {
  const {
    railRef,
    min,
    max,
    onChange,
    onAfterChange,
    step,
    scroll
  } = options;
  const railRect = useRef(undefined);
  const updateRect = useCallback(() => {
    if (!railRef.current) {
      return;
    }
    const {
      top,
      left
    } = railRef.current.getBoundingClientRect();
    const {
      scrollWidth: width,
      scrollHeight: height
    } = railRef.current;
    railRect.current = {
      top,
      left,
      width,
      height
    };
  }, [railRef]);
  const [minX, minY] = min;
  const [maxX, maxY] = max;
  const rangeX = useMemo(() => maxX - minX, [minX, maxX]);
  const rangeY = useMemo(() => maxY - minY, [minY, maxY]);
  useEffect(() => {
    updateRect();
  }, [updateRect]);
  const calculate = useCallback(evt => {
    if (!railRect.current || !railRef.current) {
      return [0, 0];
    }
    const {
      clientX,
      clientY
    } = evt;
    let {
      left,
      top,
      width,
      height
    } = railRect.current;
    let offsetX = clamp(0, width, clientX - left + railRef.current.scrollLeft);
    let offsetY = clamp(0, height, clientY - top + railRef.current.scrollTop);
    offsetX = offsetX / width * rangeX + minX;
    offsetY = offsetY / height * rangeY + minY;
    if (step) {
      offsetX = Math.round(offsetX / step) * step;
      offsetY = Math.round(offsetY / step) * step;
    }
    return [offsetX, offsetY];
  }, [rangeX, rangeY, minX, minY, railRef, step]);
  const onDrag = useCallback(evt => {
    onChange(calculate(evt));
  }, [onChange, calculate]);
  const onDragEnd = useCallback(evt => {
    onAfterChange === null || onAfterChange === void 0 ? void 0 : onAfterChange(calculate(evt));
  }, [onAfterChange, calculate]);
  const {
    onMouseDown: draggableMouseDown,
    abort
  } = useDraggable({
    containerRef: railRef,
    onDragStart: onDrag,
    onDrag,
    onDragEnd,
    scroll
  });
  const onMouseDown = useCallback(evt => {
    draggableMouseDown(evt);
    updateRect();
    if ('changedTouches' in evt) {
      onChange(calculate(evt.changedTouches[0]));
    } else {
      onChange(calculate(evt));
    }
  }, [draggableMouseDown, updateRect, onChange, calculate]);
  return {
    onMouseDown,
    railRect,
    abort,
    calculate
  };
}
const genericMemo = memo;
function useMouseUpListener(onMouseUp) {
  const onMouseUpRef = useRef(event => {});
  useEffect(() => {
    onMouseUpRef.current = onMouseUp;
  }, [onMouseUp]);
  const mouseupListener = useCallback(event => {
    onMouseUpRef.current(event);
    window.removeEventListener('mouseup', mouseupListener);
  }, []);
  useEffect(() => {
    return () => {
      window.removeEventListener('mouseup', mouseupListener);
    };
  }, [mouseupListener]);
  return useCallback(() => {
    window.addEventListener('mouseup', mouseupListener);
  }, [mouseupListener]);
}
const DEFAULT_THRESHOLD_RATIO = 0.05;
function useDragScroll(scrollElement, options = {}) {
  const {
    interval = 50,
    scrollX = true,
    scrollY = true,
    scrollXRatio = 0.05,
    scrollYRatio = 0.05,
    thresholdX: optionThresholdX,
    thresholdY: optionThresholdY,
    onScroll
  } = options;
  const timer = useRef(-1);
  const topBottom = useRef([0, 0]);
  const leftRight = useRef([0, 0]);
  const scrollXStep = useRef(0);
  const scrollYStep = useRef(0);
  const thresholdX = useRef([0, 0]);
  const thresholdY = useRef([0, 0]);
  const scrollLimit = useRef([0, 0]);
  const calculateScroll = useCallback((mousePosValue, offsetPos, threshold, step, maxValue, currentValue) => {
    let newValue = currentValue;
    if (mousePosValue < offsetPos[0] || mousePosValue > offsetPos[1]) {
      return;
    }
    if (mousePosValue <= threshold[0]) {
      newValue -= step;
    } else if (mousePosValue >= threshold[1]) {
      newValue += step;
    }
    newValue = clamp(0, maxValue, Math.round(newValue));
    return newValue;
  }, []);
  const updateScrollLeft = useCallback(clientX => {
    if (!scrollElement.current || !scrollX) {
      return;
    }
    const newValue = calculateScroll(clientX, leftRight.current, thresholdX.current, scrollXStep.current, scrollLimit.current[0], scrollElement.current.scrollLeft);
    if (newValue === undefined) {
      return;
    }
    scrollElement.current.scrollLeft = newValue;
  }, [scrollX, scrollElement, calculateScroll]);
  const updateScrollTop = useCallback(clientY => {
    if (!scrollElement.current || !scrollY) {
      return;
    }
    const newValue = calculateScroll(clientY, topBottom.current, thresholdY.current, scrollYStep.current, scrollLimit.current[1], scrollElement.current.scrollTop);
    if (newValue === undefined) {
      return;
    }
    scrollElement.current.scrollTop = newValue;
  }, [scrollY, scrollElement, calculateScroll]);
  const scrollInterval = useCallback(mousePos => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const {
        clientX,
        clientY
      } = mousePos;
      updateScrollLeft(clientX);
      updateScrollTop(clientY);
    }, interval);
  }, [interval, updateScrollLeft, updateScrollTop]);
  const triggerScroll = useCallback(() => {
    if (!scrollElement.current) {
      return;
    }
    const {
      left,
      top,
      width,
      height
    } = scrollElement.current.getBoundingClientRect();
    const {
      scrollWidth,
      scrollHeight
    } = scrollElement.current;
    leftRight.current = [left, left + width];
    topBottom.current = [top, top + height];
    if (optionThresholdX !== undefined) {
      const [left, right] = optionThresholdX;
      thresholdX.current = [leftRight.current[0] + left, leftRight.current[1] - right];
    } else {
      const thresholdXRegion = width * DEFAULT_THRESHOLD_RATIO;
      thresholdX.current = [leftRight.current[0] + thresholdXRegion, leftRight.current[1] - thresholdXRegion];
    }
    if (optionThresholdY !== undefined) {
      const [top, bottom] = optionThresholdY;
      thresholdY.current = [leftRight.current[0] + top, leftRight.current[1] - bottom];
    } else {
      const thresholdYRegion = height * DEFAULT_THRESHOLD_RATIO;
      thresholdY.current = [topBottom.current[0] + thresholdYRegion, topBottom.current[1] - thresholdYRegion];
    }
    scrollXStep.current = width * scrollXRatio;
    scrollYStep.current = height * scrollYRatio;
    scrollLimit.current = [scrollWidth, scrollHeight];
    onScroll && scrollElement.current.addEventListener('scroll', onScroll);
  }, [scrollElement, optionThresholdX, optionThresholdY, scrollXRatio, scrollYRatio, onScroll]);
  const abortDragScroll = useCallback(() => {
    var _a;
    window.clearInterval(timer.current);
    onScroll && ((_a = scrollElement.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('scroll', onScroll));
  }, [onScroll, scrollElement]);
  useEffect(() => {
    return () => {
      abortDragScroll();
    };
  }, [abortDragScroll]);
  useEffect(() => {
    const timerId = timer.current;
    return () => {
      window.clearInterval(timerId);
    };
  }, []);
  return {
    triggerScroll,
    scrollInterval,
    abortDragScroll
  };
}
var DragState;
(function (DragState) {
  DragState[DragState["Idle"] = 0] = "Idle";
  DragState[DragState["Triggered"] = 1] = "Triggered";
  DragState[DragState["Dragging"] = 2] = "Dragging";
})(DragState || (DragState = {}));
var DragType;
(function (DragType) {
  DragType[DragType["Mouse"] = 0] = "Mouse";
  DragType[DragType["Touch"] = 1] = "Touch";
})(DragType || (DragType = {}));
function useDraggable(options) {
  const {
    containerRef,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragCancel,
    onScroll: optionScroll,
    scroll
  } = options;
  const dragState = useRef(DragState.Idle);
  const dragType = useRef(DragType.Mouse);
  const draggableEvent = useRef({
    clientX: 0,
    clientY: 0
  });
  const onScroll = useCallback(evt => {
    onDrag === null || onDrag === void 0 ? void 0 : onDrag(draggableEvent.current);
    optionScroll === null || optionScroll === void 0 ? void 0 : optionScroll(evt);
  }, [onDrag, optionScroll]);
  const {
    triggerScroll,
    scrollInterval,
    abortDragScroll
  } = useDragScroll(containerRef, Object.assign(Object.assign({}, scroll), {
    onScroll
  }));
  const onMove = useCallback(evt => {
    scrollInterval(evt);
    if (dragState.current === DragState.Triggered) {
      dragState.current = DragState.Dragging;
      onDragStart === null || onDragStart === void 0 ? void 0 : onDragStart(evt);
      return;
    }
    if (dragState.current === DragState.Dragging) {
      onDrag === null || onDrag === void 0 ? void 0 : onDrag(evt);
    }
  }, [onDrag, onDragStart, scrollInterval]);
  const {
    onMouseDown,
    abort
  } = useMemo(() => {
    const onMouseMove = evt => {
      draggableEvent.current = {
        clientX: evt.clientX,
        clientY: evt.clientY
      };
      onMove(draggableEvent.current);
    };
    const onTouchMove = evt => {
      const touch = evt.changedTouches[0];
      draggableEvent.current = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      onMove(draggableEvent.current);
    };
    const cancel = () => {
      abortDragScroll();
      dragState.current = DragState.Idle;
      if (dragType.current === DragType.Mouse) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      } else {
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      }
    };
    const abort = () => {
      cancel();
      onDragCancel === null || onDragCancel === void 0 ? void 0 : onDragCancel();
    };
    const onMouseUp = evt => {
      cancel();
      onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd(evt);
    };
    const onTouchEnd = evt => {
      cancel();
      onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd(evt.changedTouches[0]);
    };
    const onMouseDown = evt => {
      if (dragState.current !== DragState.Idle) {
        return;
      }
      dragState.current = DragState.Triggered;
      if ('changedTouches' in evt) {
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);
        dragType.current = DragType.Touch;
      } else {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        dragType.current = DragType.Mouse;
      }
      triggerScroll();
    };
    return {
      onMouseDown,
      abort
    };
  }, [onDragEnd, triggerScroll, onDragCancel, abortDragScroll, onMove]);
  return {
    onMouseDown,
    abort
  };
}

export { DEFAULT_DELAY, genericMemo, useDraggable, useMouseUpListener, useSharedTipsDelay, useSlider };
//# sourceMappingURL=hooks.js.map
