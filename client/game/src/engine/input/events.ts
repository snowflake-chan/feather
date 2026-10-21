import {
  GameKeys,
  MouseButton,
  InputState,
  InputTouchSet,
  InputTouchSetSchema,
} from '@box/schema/input/input-schema';
import type { SerializedVec2 } from '../interfaces';

/**
 * InputController按键事件
 */
export type GameKeyboardEvent = GameKeys;

export type GameTouchEventType = 'touchStart' | 'touchMove' | 'touchEnd';

export type GameMouseEventType =
  | 'unlockedMouseDown'
  | 'unlockedMouseUp'
  | 'unlockedMouseMove'
  | 'unlockedWheel'
  | 'unlockedClick'
  | 'unlockedDoubleClick';

export type PointerEventType = GameTouchEventType | GameMouseEventType;

export class GameTouchEvent<T extends GameElement = GameElement> {
  public readonly mouse: SerializedVec2 = [0, 0];

  public readonly targets: T[] = [];

  public readonly identifier: number;

  public readonly movement: SerializedVec2 = [0, 0];

  constructor(identifier: number) {
    this.identifier = identifier;
  }
}

export class GameTouchesEvent<T extends GameElement = GameElement> {
  public readonly type: GameTouchEventType;

  public readonly touches: GameTouchEvent<T>[] = [];

  public nativeEvent?: TouchEvent;

  constructor(type: GameTouchEventType, nativeEvent?: TouchEvent) {
    this.type = type;
    this.nativeEvent = nativeEvent;
  }
}

export class GameMouseEvent<T extends GameElement = GameElement> {
  public readonly type: GameMouseEventType;

  public readonly mouse: SerializedVec2 = [0, 0];

  public readonly targets: T[] = [];

  public mouseButton: MouseButton = MouseButton.none;

  public readonly clientPosition: SerializedVec2 = [0, 0];

  public readonly movement: SerializedVec2 = [0, 0];

  public shiftKey: boolean = false;

  public nativeEvent?: MouseEvent;

  constructor(type: GameMouseEventType) {
    this.type = type;
  }
}

/**
 * 把inputState和原生事件转换成自定义Mouse事件
 * @param out 自定义Mouse事件，会被更新
 * @param spec inputState和原生事件
 */
export function normalizedToMouseEvent(
  out: GameMouseEvent,
  spec: {
    input: InputState;
    event?: MouseEvent;
  },
) {
  const { input, event } = spec;
  const {
    mouse: [x, y],
    mouseButton,
  } = input;

  out.mouse[0] = x;
  out.mouse[1] = y;

  out.mouseButton = mouseButton;

  if (event) {
    out.shiftKey = event.shiftKey;
    out.nativeEvent = event;

    out.movement[0] = event.movementX;
    out.movement[1] = event.movementY;

    out.clientPosition[0] = event.clientX;
    out.clientPosition[1] = event.clientY;
  }
}

export function normalizedToTouchesEvent(
  out: GameTouchesEvent,
  spec: {
    intersect: (
      out: GameElement[],
      pos: SerializedVec2,
      eventType: PointerEventType,
      identifier: number,
    ) => void;
    currTouches: InputTouchSet;
    prevTouches?: InputTouchSet;
  },
) {
  const { currTouches, intersect, prevTouches } = spec;

  const emptyTouches = InputTouchSetSchema.alloc();
  for (let i = 0; i < currTouches.length; i++) {
    const touch = new GameTouchEvent(currTouches[i].identifier);
    touch.mouse[0] = currTouches[i].mouse[0];
    touch.mouse[1] = currTouches[i].mouse[1];
    intersect(touch.targets, touch.mouse, out.type, touch.identifier);
    const prevTouch = prevTouches?.find(
      (t) => t.identifier === touch.identifier,
    );
    if (prevTouch) {
      touch.movement[0] = currTouches[i].screenXY[0] - prevTouch.screenXY[0];
      touch.movement[1] = currTouches[i].screenXY[1] - prevTouch.screenXY[1];
    }
    out.touches[i] = touch;

    if (!touch.targets.length) {
      emptyTouches.push(currTouches[i]);
    }
  }
  return emptyTouches;
}

/**
 * 自定义的click事件
 * - 仅在touch事件可用时触发
 * - 触发时机在touchEnd之前
 *
 * 目前的使用的场景：
 * - interactClient监听该事件触发移动端交互按钮
 * - interactClient监听该事件触发玩家信息
 */
export type GameTouchClickEvent = {
  /**
   * 相对坐标（计算boundingClientRect）
   */
  mouse: SerializedVec2;
  /**
   * [clientX, clientY]
   */
  clientPosition: SerializedVec2;
};

export type GameAxisChangeEvent = { x: number; y: number };

export type GamePointerLockChangeEvent = {
  isLocked: boolean;
};

export type GameContextMenuEvent = GameTouchClickEvent;

export type GameWheelEvent<T extends GameElement = GameElement> = Pick<
  WheelEvent,
  'deltaX' | 'deltaY' | 'deltaZ' | 'shiftKey'
> & {
  mouse: SerializedVec2;
  targets: T[];
};

export enum GameElementType {
  GameUI,
  GUI,
  Gamepad,
  GameDialog,
}

export interface GameElement {
  elementType: GameElementType;
}

/**
 * 自定义2D检测点击方法，返回布尔值为propagation
 * 返回值如果为true会继续向下检测，调用下面注册的intersect方法，如果为false则停止检测
 * @param out 输出值，输出为检测点击到的元素
 * @param pos 当前鼠标/手指的位置
 * @param eventType 当前检测的事件类型
 * @param identifier 选填。如果是touch事件则会告知是哪个identifier
 */
export type IntersectElementsFun<T extends GameElement = GameElement> = (
  out: T[],
  pos: SerializedVec2,
  eventType: PointerEventType,
  identifier?: number,
) => boolean;

export type HitArea = {
  x: number;
  y: number;
  w: number;
  h: number;
};
