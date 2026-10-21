import {
  memo,
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  TouchEvent as ReactTouchEvent,
} from 'react';
import { SharedTipsContextType } from './context';
import { clamp } from 'ramda';
import type { SerializedVec2 } from './interfaces';

export const DEFAULT_DELAY = 500;

/**
 * 共享tips弹出延迟。
 * displayed为false时，delay为500。
 * displayed为true时，delay为0。
 * 通过setDisplayed更新。
 */
export function useSharedTipsDelay(): SharedTipsContextType {
  const [displayed, setDisplayed] = useState(false);

  const [disabled, setDisabled] = useState(false);

  const delay = useMemo(() => (displayed ? 0 : DEFAULT_DELAY), [displayed]);

  return {
    delay,
    displayed,
    setDisplayed,
    disabled,
    setDisabled,
  };
}

export type MousePosEvent = {
  clientX: number;
  clientY: number;
};

export type CombinedTouchEvent = TouchEvent | ReactTouchEvent;

export type UseSliderOptions = {
  railRef: MutableRefObject<HTMLElement | null>;
  min: SerializedVec2;
  max: SerializedVec2;
  /**
   * 步长
   */
  step?: number;
  /**
   * 拖拽过程中的回调，触发时机为mousemove
   */
  onChange: (value: SerializedVec2) => void;
  /**
   * 拖拽结束时的回调，触发时机未onMouseUp
   */
  onAfterChange?: (value: SerializedVec2) => void;
  /**
   * 触发边缘滚动的配置项
   */
  scroll?: Omit<DragScrollOptions, 'onScroll'>;
};

type Rect = { top: number; left: number; width: number; height: number };

export type SliderRailRectRef = MutableRefObject<Rect | undefined>;

export type UseSliderReturnValue = {
  /**
   * 绑定到mousedown/touchstart事件中，启动拖拽
   * <div ref={railRef} onMouseDown={onMouseDown}></div>
   * <div ref={railRef} onTouchStart={onMouseDown}></div>
   */
  onMouseDown: (evt: MousePosEvent | CombinedTouchEvent) => void;
  /**
   * 滑动的轨道
   */
  railRect: SliderRailRectRef;
  /**
   * 中断操作的方法
   */
  abort: () => void;
  /**
   * 根据鼠标位置计算value值的方法
   */
  calculate: (evt: MousePosEvent) => SerializedVec2;
};

export function useSlider(options: UseSliderOptions): UseSliderReturnValue {
  const { railRef, min, max, onChange, onAfterChange, step, scroll } = options;

  const railRect = useRef<Rect | undefined>(undefined);

  const updateRect = useCallback(() => {
    if (!railRef.current) {
      return;
    }

    const { top, left } = railRef.current.getBoundingClientRect();
    const { scrollWidth: width, scrollHeight: height } = railRef.current;

    railRect.current = {
      top,
      left,
      width,
      height,
    };
  }, [railRef]);

  const [minX, minY] = min;
  const [maxX, maxY] = max;

  const rangeX = useMemo(() => maxX - minX, [minX, maxX]);
  const rangeY = useMemo(() => maxY - minY, [minY, maxY]);

  useEffect(() => {
    updateRect();
  }, [updateRect]);

  const calculate = useCallback(
    (evt: MousePosEvent): SerializedVec2 => {
      if (!railRect.current || !railRef.current) {
        return [0, 0];
      }

      const { clientX, clientY } = evt;
      let { left, top, width, height } = railRect.current;

      // 计算坐标偏移量
      let offsetX = clamp(
        0,
        width,
        clientX - left + railRef.current.scrollLeft,
      );
      let offsetY = clamp(0, height, clientY - top + railRef.current.scrollTop);

      // 转换成对应的数值
      offsetX = (offsetX / width) * rangeX + minX;
      offsetY = (offsetY / height) * rangeY + minY;

      // 如果有步长，则计算步长的效果
      if (step) {
        offsetX = Math.round(offsetX / step) * step;
        offsetY = Math.round(offsetY / step) * step;
      }

      return [offsetX, offsetY];
    },
    [rangeX, rangeY, minX, minY, railRef, step],
  );

  const onDrag = useCallback(
    (evt: MousePosEvent) => {
      onChange(calculate(evt));
    },
    [onChange, calculate],
  );

  const onDragEnd = useCallback(
    (evt: MousePosEvent) => {
      onAfterChange?.(calculate(evt));
    },
    [onAfterChange, calculate],
  );

  const { onMouseDown: draggableMouseDown, abort } = useDraggable({
    containerRef: railRef,
    onDragStart: onDrag,
    onDrag,
    onDragEnd,
    scroll,
  });

  const onMouseDown = useCallback(
    (evt: MousePosEvent | CombinedTouchEvent) => {
      draggableMouseDown(evt);

      updateRect();

      // 在这里就会触发onChange
      if ('changedTouches' in evt) {
        onChange(calculate(evt.changedTouches[0]));
      } else {
        onChange(calculate(evt));
      }
    },
    [draggableMouseDown, updateRect, onChange, calculate],
  );

  return {
    onMouseDown,
    railRect,
    abort,
    calculate,
  };
}

export const genericMemo: <T>(component: T) => T = memo;

/**
 * 返回一个方法，用于在window上添加mouseup事件的监听
 * mouseup触发时和组件销毁时移除mouseup监听
 */
export function useMouseUpListener(onMouseUp: (event: MouseEvent) => void) {
  const onMouseUpRef = useRef((event: MouseEvent) => {});

  useEffect(() => {
    onMouseUpRef.current = onMouseUp;
  }, [onMouseUp]);

  const mouseupListener = useCallback((event: MouseEvent) => {
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

export type DragScrollOptions = {
  /**
   * 检测滚动的间隔
   * @default 50
   */
  interval?: number;
  /**
   * 水平滚动
   * @default true
   */
  scrollX?: boolean;
  /**
   * 水平滚动时，每次滚动占总宽度的比例
   * @default 0.05
   */
  scrollXRatio?: number;
  /**
   * 垂直滚动
   */
  scrollY?: boolean;
  /**
   * 垂直滚动时，每次滚动占总高度的比例
   * @default 0.05
   */
  scrollYRatio?: number;
  /**
   * 水平滚动阈值，默认为容器宽度的5%
   * @default width * 0.05
   */
  thresholdX?: SerializedVec2;
  /**
   * 垂直滚动阈值，默认为容器高度的5%
   * @default height * 0.05
   */
  thresholdY?: SerializedVec2;
  /**
   * 滚动触发的钩子
   */
  onScroll?: (evt: Event) => void;
};

const DEFAULT_THRESHOLD_RATIO = 0.05;

/**
 * 处理拖拽滚动的钩子，在useDraggable中使用。
 * @param scrollElement 需要响应拖拽滚动的元素
 * @param options 配置项
 */
function useDragScroll(
  scrollElement: RefObject<HTMLElement | null>,
  options: DragScrollOptions = {},
) {
  const {
    interval = 50,
    scrollX = true,
    scrollY = true,
    scrollXRatio = 0.05,
    scrollYRatio = 0.05,
    thresholdX: optionThresholdX,
    thresholdY: optionThresholdY,
    onScroll,
  } = options;

  const timer = useRef(-1);
  const topBottom = useRef([0, 0]);
  const leftRight = useRef([0, 0]);

  const scrollXStep = useRef(0);
  const scrollYStep = useRef(0);

  const thresholdX = useRef([0, 0]);
  const thresholdY = useRef([0, 0]);

  const scrollLimit = useRef([0, 0]);

  const calculateScroll = useCallback(
    (
      mousePosValue: number,
      offsetPos: number[],
      threshold: number[],
      step: number,
      maxValue: number,
      currentValue: number,
    ) => {
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
    },
    [],
  );

  const updateScrollLeft = useCallback(
    (clientX: number) => {
      if (!scrollElement.current || !scrollX) {
        return;
      }

      const newValue = calculateScroll(
        clientX,
        leftRight.current,
        thresholdX.current,
        scrollXStep.current,
        scrollLimit.current[0],
        scrollElement.current.scrollLeft,
      );

      if (newValue === undefined) {
        return;
      }

      scrollElement.current.scrollLeft = newValue;
    },
    [scrollX, scrollElement, calculateScroll],
  );

  const updateScrollTop = useCallback(
    (clientY: number) => {
      if (!scrollElement.current || !scrollY) {
        return;
      }

      const newValue = calculateScroll(
        clientY,
        topBottom.current,
        thresholdY.current,
        scrollYStep.current,
        scrollLimit.current[1],
        scrollElement.current.scrollTop,
      );

      if (newValue === undefined) {
        return;
      }

      scrollElement.current.scrollTop = newValue;
    },
    [scrollY, scrollElement, calculateScroll],
  );

  const scrollInterval = useCallback(
    (mousePos: MousePosEvent) => {
      window.clearInterval(timer.current);

      timer.current = window.setInterval(() => {
        const { clientX, clientY } = mousePos;

        updateScrollLeft(clientX);
        updateScrollTop(clientY);
      }, interval);
    },
    [interval, updateScrollLeft, updateScrollTop],
  );

  const triggerScroll = useCallback(() => {
    if (!scrollElement.current) {
      return;
    }

    const { left, top, width, height } =
      scrollElement.current.getBoundingClientRect();

    const { scrollWidth, scrollHeight } = scrollElement.current;

    leftRight.current = [left, left + width];
    topBottom.current = [top, top + height];

    if (optionThresholdX !== undefined) {
      const [left, right] = optionThresholdX;

      thresholdX.current = [
        leftRight.current[0] + left,
        leftRight.current[1] - right,
      ];
    } else {
      const thresholdXRegion = width * DEFAULT_THRESHOLD_RATIO;

      thresholdX.current = [
        leftRight.current[0] + thresholdXRegion,
        leftRight.current[1] - thresholdXRegion,
      ];
    }

    if (optionThresholdY !== undefined) {
      const [top, bottom] = optionThresholdY;

      thresholdY.current = [
        leftRight.current[0] + top,
        leftRight.current[1] - bottom,
      ];
    } else {
      const thresholdYRegion = height * DEFAULT_THRESHOLD_RATIO;

      thresholdY.current = [
        topBottom.current[0] + thresholdYRegion,
        topBottom.current[1] - thresholdYRegion,
      ];
    }

    scrollXStep.current = width * scrollXRatio;
    scrollYStep.current = height * scrollYRatio;

    scrollLimit.current = [scrollWidth, scrollHeight];

    onScroll && scrollElement.current.addEventListener('scroll', onScroll);
  }, [
    scrollElement,
    optionThresholdX,
    optionThresholdY,
    scrollXRatio,
    scrollYRatio,
    onScroll,
  ]);

  const abortDragScroll = useCallback(() => {
    window.clearInterval(timer.current);

    onScroll && scrollElement.current?.removeEventListener('scroll', onScroll);
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

  return { triggerScroll, scrollInterval, abortDragScroll };
}

enum DragState {
  Idle,
  Triggered,
  Dragging,
}

enum DragType {
  Mouse,
  Touch,
}

export type DraggableOptions = {
  /**
   * 拖拽发生的容器，当移动到该容器边缘的时候，触发容器滚动
   */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * 开始拖拽（trigger后首次触发mousemove）时的回调
   */
  onDragStart?: (evt: MousePosEvent) => void;
  /**
   * 拖拽中的回调
   */
  onDrag?: (evt: MousePosEvent) => void;
  /**
   * 拖拽结束的回调
   */
  onDragEnd?: (evt: MousePosEvent) => void;
  /**
   * 取消拖拽时的回调
   */
  onDragCancel?: () => void;
  /**
   * 拖拽至容器边缘时，触发滚动的回调
   */
  onScroll?: (evt: Event) => void;
  /**
   * 拖拽至容器边缘时，触发滚动的相关配置
   */
  scroll?: Omit<DragScrollOptions, 'onScroll'>;
};

export type DraggableReturnValue = {
  /**
   * 绑定在mousedown回调的方法，触发拖拽
   */
  onMouseDown: (evt: MousePosEvent | CombinedTouchEvent) => void;
  /**
   * 中断拖拽
   */
  abort: () => void;
};

// TODO 如果是面对列表那种复杂情况，需要考虑drop的情况，应该需要 context + useDraggable + useDroppable
/**
 * 用mouse事件模拟拖拽交互，但不处理数据和DOM的拖拽表现（DOM不会被拽起来）
 * - 提供触发器函数，需要自行绑定到触发拖拽的行为中，比如mousedown
 * - 提供基础的钩子
 * - 拖拽时，如果停留在边缘，滚动容器元素
 */
export function useDraggable(options: DraggableOptions): DraggableReturnValue {
  const {
    containerRef,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragCancel,
    onScroll: optionScroll,
    scroll,
  } = options;

  const dragState = useRef(DragState.Idle);
  const dragType = useRef(DragType.Mouse);

  /**
   * 缓存事件，在触发onScroll时，传入该参数作为入参
   */
  const draggableEvent = useRef<MousePosEvent>({ clientX: 0, clientY: 0 });

  const onScroll = useCallback(
    (evt: Event) => {
      onDrag?.(draggableEvent.current);

      optionScroll?.(evt);
    },
    [onDrag, optionScroll],
  );

  const { triggerScroll, scrollInterval, abortDragScroll } = useDragScroll(
    containerRef,
    {
      ...scroll,
      // 触发滚动的时候，也需要触发onDrag
      onScroll,
    },
  );

  const onMove = useCallback(
    (evt: MousePosEvent) => {
      scrollInterval(evt);

      if (dragState.current === DragState.Triggered) {
        dragState.current = DragState.Dragging;

        onDragStart?.(evt);

        return;
      }

      if (dragState.current === DragState.Dragging) {
        onDrag?.(evt);
      }
    },
    [onDrag, onDragStart, scrollInterval],
  );

  const { onMouseDown, abort } = useMemo(() => {
    const onMouseMove = (evt: MouseEvent) => {
      draggableEvent.current = { clientX: evt.clientX, clientY: evt.clientY };

      onMove(draggableEvent.current);
    };

    const onTouchMove = (evt: TouchEvent) => {
      const touch = evt.changedTouches[0];

      draggableEvent.current = {
        clientX: touch.clientX,
        clientY: touch.clientY,
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

      onDragCancel?.();
    };

    const onMouseUp = (evt: MouseEvent) => {
      cancel();

      onDragEnd?.(evt);
    };

    const onTouchEnd = (evt: TouchEvent) => {
      cancel();

      onDragEnd?.(evt.changedTouches[0]);
    };

    const onMouseDown = (evt: MousePosEvent | CombinedTouchEvent) => {
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
      abort,
    };
  }, [onDragEnd, triggerScroll, onDragCancel, abortDragScroll, onMove]);

  return { onMouseDown, abort };
}
