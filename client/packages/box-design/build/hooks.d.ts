import { MutableRefObject, RefObject, TouchEvent as ReactTouchEvent } from 'react';
import { SharedTipsContextType } from './context';
import type { SerializedVec2 } from './interfaces';
export declare const DEFAULT_DELAY = 500;
export declare function useSharedTipsDelay(): SharedTipsContextType;
export type MousePosEvent = {
    clientX: number;
    clientY: number;
};
export type CombinedTouchEvent = TouchEvent | ReactTouchEvent;
export type UseSliderOptions = {
    railRef: MutableRefObject<HTMLElement | null>;
    min: SerializedVec2;
    max: SerializedVec2;
    step?: number;
    onChange: (value: SerializedVec2) => void;
    onAfterChange?: (value: SerializedVec2) => void;
    scroll?: Omit<DragScrollOptions, 'onScroll'>;
};
type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
};
export type SliderRailRectRef = MutableRefObject<Rect | undefined>;
export type UseSliderReturnValue = {
    onMouseDown: (evt: MousePosEvent | CombinedTouchEvent) => void;
    railRect: SliderRailRectRef;
    abort: () => void;
    calculate: (evt: MousePosEvent) => SerializedVec2;
};
export declare function useSlider(options: UseSliderOptions): UseSliderReturnValue;
export declare const genericMemo: <T>(component: T) => T;
export declare function useMouseUpListener(onMouseUp: (event: MouseEvent) => void): () => void;
export type DragScrollOptions = {
    interval?: number;
    scrollX?: boolean;
    scrollXRatio?: number;
    scrollY?: boolean;
    scrollYRatio?: number;
    thresholdX?: SerializedVec2;
    thresholdY?: SerializedVec2;
    onScroll?: (evt: Event) => void;
};
export type DraggableOptions = {
    containerRef: RefObject<HTMLElement | null>;
    onDragStart?: (evt: MousePosEvent) => void;
    onDrag?: (evt: MousePosEvent) => void;
    onDragEnd?: (evt: MousePosEvent) => void;
    onDragCancel?: () => void;
    onScroll?: (evt: Event) => void;
    scroll?: Omit<DragScrollOptions, 'onScroll'>;
};
export type DraggableReturnValue = {
    onMouseDown: (evt: MousePosEvent | CombinedTouchEvent) => void;
    abort: () => void;
};
export declare function useDraggable(options: DraggableOptions): DraggableReturnValue;
export {};
//# sourceMappingURL=hooks.d.ts.map