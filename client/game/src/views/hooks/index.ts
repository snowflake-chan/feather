import { RefObject, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CombinedTouchEvent,
  MousePosEvent,
  UseSliderOptions,
  UseSliderReturnValue,
  useSlider,
} from '@box/box-design/build/hooks';
import { SerializedVec2 } from '@box/box-design/build/interfaces';

// ref: https://usehooks-ts.com/react-hook/use-event-listener
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
): void;
export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLDivElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: RefObject<T | null>,
): void;

export function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  T extends HTMLElement | void = void,
>(
  eventName: KW | KH,
  handler: (
    event: WindowEventMap[KW] | HTMLElementEventMap[KH] | Event,
  ) => void,
  element?: RefObject<T | null>,
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current || window;
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    // Create event listener that calls handler function stored in ref
    const eventListener: typeof handler = (event) =>
      savedHandler.current(event);

    targetElement.addEventListener(eventName, eventListener);

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

/**
 * 缓存ResizeObserver的回调，避免重复挂载监听
 */
export function useResizeObserver<
  T extends HTMLElement = HTMLDivElement,
  Handler extends Function = Function,
>(element: T | null, handler: Handler) {
  const cachedHandler = useRef<Handler>(handler);

  useMemo(() => {
    cachedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => {
      cachedHandler.current();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return cachedHandler;
}

interface UseAppSliderOptions extends UseSliderOptions {
  onAfterChange?: (value: SerializedVec2) => void;
}

/**
 * 基于useSlider封装的钩子
 */
export function useAppSlider(
  options: UseAppSliderOptions,
): UseSliderReturnValue {
  const { onChange, onAfterChange: optionAfterChange, ...remain } = options;

  const onAfterChange = useCallback(
    (value: SerializedVec2) => {
      optionAfterChange?.(value);
    },
    [optionAfterChange],
  );

  const {
    onMouseDown: sliderMouseDown,
    abort: sliderAbort,
    calculate,
    railRect,
  } = useSlider({
    ...remain,
    onChange,
    onAfterChange,
  });

  const abort = useCallback(() => {
    sliderAbort();
  }, [sliderAbort]);

  const onMouseDown = useCallback(
    (evt: MousePosEvent | CombinedTouchEvent) => {
      sliderMouseDown(evt);
    },
    [sliderMouseDown],
  );

  return {
    onMouseDown,
    abort,
    calculate,
    railRect,
  };
}
