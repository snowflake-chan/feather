import { touchable } from '../../utils/mobile';
import { GameClientState } from '../game-client-schema';
import {
  GameKeys,
  MouseState,
  MouseButton,
  CameraBindingMode,
  InputTouchSetSchema,
  InputTouchSchema,
  InputPauseFlags,
  InputTouchSet,
  InputTouch,
} from '@box/schema/input/input-schema';
import { saveSettings } from '../settings/settings-controller';
import { ClockClient } from '../clock/clock-client-controller';
import { InputProtocolSchema } from '@box/schema/input/input-protocol';
import { MuClient } from '@box/mudb';
import { MuClientProtocol } from '@box/mudb/client';
import { getById } from '@box/utils/id';
import { EventBus } from '@box/utils/event';
import {
  GameAxisChangeEvent,
  GameContextMenuEvent,
  GameElement,
  GameMouseEvent,
  GamePointerLockChangeEvent,
  GameTouchClickEvent,
  GameTouchesEvent,
  GameWheelEvent,
  IntersectElementsFun,
  normalizedToMouseEvent,
  normalizedToTouchesEvent,
  PointerEventType,
} from './events';
import { exitPointerLock } from '../utils/pointer-lock';
import { SerializedVec2 } from '../interfaces';

const LONG_PRESS_TIME = 600;
const TAP_TIME = 200;

enum SingleTouchStage {
  idle = 0,
  active = 1,
  running = 2,
}

// Hook all input handlers here
export class InputController {
  public onKeyDown = new EventBus<GameKeys>();
  public onKeyUp = new EventBus<GameKeys>();
  public onAxisChange = new EventBus<GameAxisChangeEvent>();
  public onPointerLockChange = new EventBus<GamePointerLockChangeEvent>();
  public onPointerLockError = new EventBus<undefined>();

  public singleTouchClick = new EventBus<GameTouchClickEvent>();

  public touchStart = new EventBus<GameTouchesEvent>();
  public touchEnd = new EventBus<GameTouchesEvent>();
  public touchMove = new EventBus<GameTouchesEvent>();

  public unlockedContextMenu = new EventBus<GameContextMenuEvent>();

  public unlockedMouseMove = new EventBus<GameMouseEvent>();
  public unlockedMouseDown = new EventBus<GameMouseEvent>();
  public unlockedMouseUp = new EventBus<GameMouseEvent>();
  public unlockedClick = new EventBus<GameMouseEvent>();
  public unlockedDoubleClick = new EventBus<GameMouseEvent>();

  public unlockedWheel = new EventBus<GameWheelEvent>();

  public protocol: MuClientProtocol<typeof InputProtocolSchema>;

  private intersectElements: IntersectElementsFun[] = [];

  // Chromium rejects a pointer-lock request made immediately after a lock was
  // released (even when the call originated from the same click). Keep a
  // short cooldown and swallow the rejected promise so this browser policy
  // does not surface as an uncaught game error.
  private _lastPointerLockExitAt = 0;
  private _pointerLockRequestPending = false;
  private _wasPointerLocked = false;

  private intersects = (
    out: GameElement[],
    pos: SerializedVec2,
    eventType: PointerEventType,
    identifier?: number,
  ) => {
    for (const fn of this.intersectElements) {
      const propagation = fn(out, pos, eventType, identifier);
      if (!propagation) {
        return;
      }
    }
  };

  public disableAxis() {
    this._state.input.disableAxis++;
  }

  public enableAxis() {
    if (this._state.input.disableAxis <= 0) {
      this._state.input.disableAxis = 0;
      return;
    }

    this._state.input.disableAxis--;
  }

  public isAxisEnabled() {
    return this._state.input.disableAxis === 0;
  }

  public pauseChange = (
    prevFlags: InputPauseFlags,
    nextFlags: InputPauseFlags,
  ) => {
    const changed = prevFlags ^ nextFlags;
    const onFlags = nextFlags & changed;
    const offFlags = prevFlags & changed;
    if (onFlags & InputPauseFlags.KEYBOARD) {
      this._state.input.keyPauseCount += 1;
    } else if (offFlags & InputPauseFlags.KEYBOARD) {
      this._state.input.keyPauseCount -= 1;
    }
    if (onFlags & InputPauseFlags.POINTER_LOCK) {
      this._state.input.pointerLockPauseCount += 1;
      if (this._state.input.pointerLockPauseCount === 1) {
        this.exitPointerLock();
      }
    } else if (offFlags & InputPauseFlags.POINTER_LOCK) {
      this._state.input.pointerLockPauseCount -= 1;
    }
    if (onFlags & InputPauseFlags.MOUSE) {
      this._state.input.mousePauseCount += 1;
    } else if (offFlags & InputPauseFlags.MOUSE) {
      this._state.input.mousePauseCount -= 1;
    }
  };

  public pauseState = () => {
    return (
      (this._state.input.keyPauseCount > 0 ? InputPauseFlags.KEYBOARD : 0) +
      (this._state.input.pointerLockPauseCount > 0
        ? InputPauseFlags.POINTER_LOCK
        : 0) +
      (this._state.input.mousePauseCount > 0 ? InputPauseFlags.MOUSE : 0)
    );
  };

  constructor(
    client: MuClient,
    private _state: GameClientState,
    private _clock: ClockClient,
  ) {
    this.protocol = client.protocol(InputProtocolSchema);
    this.protocol.configure({
      message: {
        setCameraPitch: (value) => {
          _state.local.yaw = (value / 255) * Math.PI - Math.PI / 2;
        },
        setCameraYaw: (value) => {
          this._state.local.pitch = (2 * Math.PI * value) / 256;
          const input = getById(_state.playerInputs, _state.secret.id);
          if (input) {
            input.angle = input.cameraAngle = value;
          }
        },
      },
    });
  }

  public setHandlers() {
    if (touchable) {
      this._bindTouchEvents();
    } else {
      this._bindMouseEvents();
    }
  }

  public poll = () => {
    if (this._state.input.keyPauseCount > 0) {
      this._handleBlur();
    } else {
      this._handleLongPress(this._state.clock.clock);
    }

    if (this._state.input.mousePauseCount > 0) {
      this._handleMouseRelease();
    }

    if (this._hasPointerLock()) {
      const m = this._state.input.mouse;
      m[0] = 0.5 * this._state.camera.viewport[0];
      m[1] = 0.5 * this._state.camera.viewport[1];
    }
  };

  private _handleMouseRelease() {
    // 触发移动端touchend
    if (touchable) {
      if (this._state.input.touches.length) {
        const input = this._state.input;
        input.mouseState = MouseState.release;
        input.mouseButton = MouseButton.left;
        this._singleTouchStep = 0;

        const touchesEvent = new GameTouchesEvent('touchEnd');
        normalizedToTouchesEvent(touchesEvent, {
          intersect: this.intersects,
          currTouches: this._state.input.touches,
        });
        this.touchEnd.notify(touchesEvent);

        for (let i = 0; i < this._state.input.touches.length; ++i) {
          InputTouchSchema.free(this._state.input.touches[i]);
        }

        this._touchIdentifier = undefined;
        this._state.input.touches.length = 0;
        this._state.input.touchStart = false;

        this._twoFingerTouchStart = false;
        this._twoFingerStartState = undefined;
      }

      return;
    }

    // 触发mouseup
    if (this._state.input.mouseState === MouseState.press) {
      const input = this._state.input;
      input.mouseState = MouseState.release;
      input.mouseButton = MouseButton.left;

      if (!this._hasPointerLock()) {
        const pointerEvent = new GameMouseEvent('unlockedMouseUp');

        normalizedToMouseEvent(pointerEvent, {
          input: this._state.input,
        });

        this.intersects(
          pointerEvent.targets,
          pointerEvent.mouse,
          'unlockedMouseUp',
        );

        this.unlockedMouseUp.notify(pointerEvent);
      }
    }
  }

  public unbind = (keyCode: number) => {
    const keys = this._state.settings.keyBindings;
    if (keyCode in keys) {
      this._handleKeyUp({ keyCode });
      delete keys[keyCode];
      saveSettings(this._state.settings);
    }
  };

  public bind = (keyCode: number, key: GameKeys) => {
    const keys = this._state.settings.keyBindings;
    if (keyCode in keys) {
      this._handleKeyUp({ keyCode });
    }
    this._state.settings.keyBindings[keyCode] = key;
    saveSettings(this._state.settings);
  };

  public setCameraBindingMode(mode: CameraBindingMode) {
    this._state.input.cameraBindingMode = mode;
  }

  private _handleLongPress = (timeStamp: number) => {
    if (
      this._state.input.touchStart &&
      timeStamp - this._state.input.touchStartTime > LONG_PRESS_TIME
    ) {
      this._onLongPress(GameKeys.ACTION_0);
      this._state.input.touchStart = false;
    }
  };

  private _handleKeyDown = (ev) => {
    const code = ev.keyCode || ev.charCode;

    // 记录按下的按键
    if (!this._state.input.keyboardState.includes(code)) {
      this._state.input.keyboardState.push(code);
    }

    if (this._state.input.keyPauseCount > 0) {
      return;
    }
    const keys = this._state.settings.keyBindings;
    if (keys) {
      if (code in keys) {
        const key = keys[code];
        this._preventDefault(ev);
        this._handlePress(key);
      }
    }
  };

  private _handleKeyUp = (ev) => {
    const code = ev.keyCode || ev.charCode;
    const index = this._state.input.keyboardState.indexOf(code);
    if (index > -1) {
      this._state.input.keyboardState.splice(index, 1);
    }

    if (this._state.input.keyPauseCount > 0) {
      return;
    }
    const keys = this._state.settings.keyBindings;

    if (keys) {
      if (code in keys) {
        const key = keys[code];
        this._handleRelease(key);
      }
    }
  };

  private _handleBlur = () => {
    const keyState = this._state.input.keyState;
    for (let i = 0; i < keyState.length; ++i) {
      if (keyState[i]) {
        this._handleRelease(i);
      }
    }
  };

  private _updateMouse(ev: { clientX: number; clientY: number }) {
    const rect = this._state.dom.element?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const input = this._state.input;
    input.mouse[0] = ev.clientX - rect.left;
    input.mouse[1] = ev.clientY - rect.top;
  }

  private _handleMouseDown = (ev: MouseEvent) => {
    const { input } = this._state;

    if (input.mousePauseCount > 0) {
      return;
    }

    const isMouseDownTarget =
      ev.target instanceof HTMLElement &&
      (this.hasTagName(ev.target, 'CANVAS') ||
        this.firstClassName(ev.target, 'MOUSEINPUTAREA'));

    if (isMouseDownTarget) {
      this._updateMouse(ev);
      input.mouseButton = ev.button;
      input.mouseState = MouseState.press;
    }

    if (!this._hasPointerLock()) {
      if (isMouseDownTarget) {
        const pointerEvent = new GameMouseEvent('unlockedMouseDown');

        normalizedToMouseEvent(pointerEvent, {
          input: this._state.input,
          event: ev,
        });

        this.intersects(
          pointerEvent.targets,
          pointerEvent.mouse,
          'unlockedMouseDown',
        );

        this.unlockedMouseDown.notify(pointerEvent);
      }

      if (input.cameraBindingMode === CameraBindingMode.leftKey) {
        return;
      }
    }

    if (ev.target === this._state.dom.element) {
      if (ev.button === MouseButton.right) {
        this._handlePress(GameKeys.ACTION_1);
      } else {
        this._handlePress(GameKeys.ACTION_0);
      }
    }
  };

  private _handleMouseUp = (ev: MouseEvent) => {
    if (this._state.input.mousePauseCount > 0) {
      return;
    }

    const { input } = this._state;

    this._updateMouse(ev);
    input.mouseButton = ev.button;
    input.mouseState = MouseState.release;

    if (!this._hasPointerLock()) {
      const pointerEvent = new GameMouseEvent('unlockedMouseUp');

      normalizedToMouseEvent(pointerEvent, {
        input: this._state.input,
        event: ev,
      });

      this.intersects(
        pointerEvent.targets,
        pointerEvent.mouse,
        'unlockedMouseUp',
      );

      this.unlockedMouseUp.notify(pointerEvent);

      if (input.cameraBindingMode === CameraBindingMode.leftKey) {
        return;
      }
    }

    if (ev.button === MouseButton.right) {
      this._handleRelease(GameKeys.ACTION_1);
    } else {
      this._handleRelease(GameKeys.ACTION_0);
    }
  };

  private _handleMouseMove = (ev: MouseEvent) => {
    if (this._state.input.mousePauseCount > 0) {
      return;
    }

    const { input } = this._state;

    this._updateMouse(ev);

    if (input.mouseState === MouseState.press) {
      input.mouseState = MouseState.drag;
    }

    if (input.mouseState === MouseState.release) {
      input.mouseButton = MouseButton.none;
    }

    if (!this._hasPointerLock()) {
      const unlockedEvent = new GameMouseEvent('unlockedMouseMove');

      normalizedToMouseEvent(unlockedEvent, {
        input: this._state.input,
        event: ev,
      });

      this.intersects(
        unlockedEvent.targets,
        unlockedEvent.mouse,
        'unlockedMouseMove',
      );
      this.unlockedMouseMove.notify(unlockedEvent);

      if (this._state.input.cameraBindingMode === CameraBindingMode.leftKey) {
        return;
      }
    }

    // apply axis movement
    if (
      input.cameraBindingMode === CameraBindingMode.leftKey ||
      (input.cameraBindingMode === CameraBindingMode.rightKey &&
        input.mouseButton === MouseButton.right &&
        input.mouseState === MouseState.drag)
    ) {
      this._applyAxisMovement(ev.movementX, ev.movementY);
    }
  };

  private _handleMouseWheel = (ev: WheelEvent) => {
    if (
      this._state.input.mousePauseCount > 0 ||
      ev.target !== this._state.dom.canvas
    ) {
      return;
    }

    // 这里是为了防止触控板上滑动整个页面，导致浏览器历史记录前进/后退
    ev.preventDefault();

    const targets: GameElement[] = [];
    this._updateMouse(ev);
    const mouse: SerializedVec2 = [
      this._state.input.mouse[0],
      this._state.input.mouse[1],
    ];

    this.intersects(targets, mouse, 'unlockedWheel');

    this.unlockedWheel.notify({
      mouse,
      deltaX: ev.deltaX,
      deltaY: ev.deltaY,
      deltaZ: ev.deltaZ,
      shiftKey: ev.shiftKey,
      targets,
    });
  };

  private _handleClick = (ev: MouseEvent) => {
    if (!this._state.dom.element || this._hasPointerLock()) {
      return;
    }

    const pointerEvent = new GameMouseEvent('unlockedClick');

    normalizedToMouseEvent(pointerEvent, {
      input: this._state.input,
      event: ev,
    });

    this.intersects(pointerEvent.targets, pointerEvent.mouse, 'unlockedClick');

    this.unlockedClick.notify(pointerEvent);
  };

  private _hasPointerLock = (): boolean => {
    return document && !!document.pointerLockElement;
  };

  private _handleContextMenu = (e: MouseEvent) => {
    if (
      this._state.input.keyPauseCount > 0 ||
      this._state.input.mousePauseCount > 0
    ) {
      return;
    }
    this._preventDefault(e);

    if (!this._hasPointerLock()) {
      const {
        mouse: [x, y],
      } = this._state.input;

      this.unlockedContextMenu.notify({
        mouse: [x, y],
        clientPosition: [e.clientX, e.clientY],
      });
    }
  };

  private _handleDoubleClick = (e: MouseEvent) => {
    if (
      this._state.input.keyPauseCount > 0 ||
      this._state.input.mousePauseCount > 0
    ) {
      return;
    }

    // 可能有用，移动端双击缩放
    this._preventDefault(e);

    if (this._hasPointerLock()) {
      return;
    }

    const pointerEvent = new GameMouseEvent('unlockedDoubleClick');

    normalizedToMouseEvent(pointerEvent, {
      input: this._state.input,
      event: e,
    });

    this.intersects(
      pointerEvent.targets,
      pointerEvent.mouse,
      'unlockedDoubleClick',
    );

    this.unlockedDoubleClick.notify(pointerEvent);
  };

  public destroy = () => {
    this.intersectElements.length = 0;
    this._unBindTouchEvents();
    this.onKeyDown.unsubAll();
    this.onKeyUp.unsubAll();
    this.onAxisChange.unsubAll();
    this.onPointerLockChange.unsubAll();
    this.onPointerLockError.unsubAll();
    this.singleTouchClick.unsubAll();
    this.touchStart.unsubAll();
    this.touchEnd.unsubAll();
    this.touchMove.unsubAll();
    this.unlockedContextMenu.unsubAll();
    this.unlockedMouseMove.unsubAll();
    this.unlockedMouseDown.unsubAll();
    this.unlockedMouseUp.unsubAll();
    this.unlockedClick.unsubAll();
    this.unlockedDoubleClick.unsubAll();
    this.unlockedWheel.unsubAll();
    const element = this._state.dom.element;
    if (!element) {
      return;
    }

    this.exitPointerLock();

    if (document.fullscreenElement) {
      // TODO: should be DocumentOrShadowRoot.fullscreenElement after typescript updated
      document.exitFullscreen();
    }

    document.removeEventListener('keyup', this._handleKeyUp, true);
    document.removeEventListener('keydown', this._handleKeyDown, true);
    document.removeEventListener('mouseup', this._handleMouseUp, true);
    document.removeEventListener('mousedown', this._handleMouseDown, true);
    document.removeEventListener('mousemove', this._handleMouseMove, true);
    document.removeEventListener(
      'pointerlockchange',
      this._onPointerLockChange,
    );
    document.removeEventListener('pointerlockerror', this._onPointerLockError);

    element.removeEventListener('wheel', this._handleMouseWheel, true);
    element.removeEventListener('blur', this._handleBlur, true);
    element.removeEventListener('focusout', this._handleBlur, true);
    element.removeEventListener('click', this._handleClick, true);
    element.removeEventListener('contextmenu', this._handleContextMenu, true);
    element.removeEventListener('dblclick', this._handleDoubleClick, true);
  };

  private _bindMouseEvents = () => {
    const element = this._state.dom.element;
    if (!element) {
      return;
    }

    document.addEventListener('keyup', this._handleKeyUp, true);
    document.addEventListener('keydown', this._handleKeyDown, true);
    document.addEventListener('mouseup', this._handleMouseUp, true);
    document.addEventListener('mousedown', this._handleMouseDown, true);
    document.addEventListener('mousemove', this._handleMouseMove, true);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('pointerlockerror', this._onPointerLockError);

    element.addEventListener('wheel', this._handleMouseWheel, true);
    element.addEventListener('blur', this._handleBlur, true);
    element.addEventListener('focusout', this._handleBlur, true);
    element.addEventListener('click', this._handleClick, true);
    element.addEventListener('contextmenu', this._handleContextMenu, true);
    element.addEventListener('dblclick', this._handleDoubleClick, true);
  };

  private _bindTouchEvents = () => {
    const body = process.env.RUSTY ? (window as any) : document.body;
    body.addEventListener('touchstart', this._handleTouchStart, true);
    body.addEventListener('touchmove', this._handleTouchMove, {
      capture: true,
      passive: false,
    });
    body.addEventListener('touchend', this._handleTouchEnd, true);
    body.addEventListener('touchcancel', this._handleTouchEnd, true);
  };

  private _unBindTouchEvents = () => {
    const body = process.env.RUSTY ? (window as any) : document.body;
    body.removeEventListener('touchstart', this._handleTouchStart, true);
    body.removeEventListener('touchmove', this._handleTouchMove, {
      capture: true,
      passive: false,
    });
    body.removeEventListener('touchend', this._handleTouchEnd, true);
    body.removeEventListener('touchcancel', this._handleTouchEnd, true);
  };

  public onTouch = (key: GameKeys) => {
    if (this._state.input.keyPauseCount > 0) {
      return;
    }
    this._handlePress(key);
  };

  public unTouch = (key: GameKeys) => {
    if (this._state.input.keyPauseCount > 0) {
      return;
    }
    this._handleRelease(key);
  };

  private _onLongPress = (key: GameKeys) => {
    if (this._state.input.keyPauseCount > 0) {
      return;
    }
    this._handlePress(key);
    setTimeout(() => this._handleRelease(key), 100);
  };

  private hasTagName(element: Element, tagName: string) {
    if (element && element.tagName && element.tagName === tagName) {
      return true;
    }
    return false;
  }

  private firstClassName(element: Element, className: string) {
    if (
      element &&
      element.className &&
      typeof element.className === 'string' &&
      element.className.split(' ')[0] === className
    ) {
      return true;
    }
    return false;
  }

  private _singleTouchStep = SingleTouchStage.idle;
  private _touchIdentifier?: number;
  private _twoFingerTouchStart = false;
  private _twoFingerStartState?: InputTouchSet;

  private getFingersDistance(p1: InputTouch, p2: InputTouch) {
    const x = p1.screenXY[0] - p2.screenXY[0];
    const y = p1.screenXY[1] - p2.screenXY[1];
    return Math.sqrt(x * x + y * y);
  }

  private _computeTouchSet(ev: TouchEvent) {
    const result = InputTouchSetSchema.alloc();
    const touches = ev.targetTouches;
    if (!touches.length) {
      return result;
    }

    let rect: { top: number; left: number } | undefined =
      this._state.dom.element?.getBoundingClientRect();

    if (process.env.RUSTY) {
      rect = {
        top: 0,
        left: 0,
      };
    }

    if (!rect) {
      return result;
    }

    for (let i = 0; i < touches.length; ++i) {
      const touch = touches[i];
      const event = InputTouchSchema.alloc();
      result.push(event);
      event.screenXY[0] = touch.screenX;
      event.screenXY[1] = touch.screenY;
      event.mouse[0] = touch.clientX - rect.left;
      event.mouse[1] = touch.clientY - rect.top;
      event.identifier = touch.identifier;
    }
    return result;
  }

  private _handleTouchStart = (ev: TouchEvent) => {
    if (this._state.input.mousePauseCount > 0) {
      return;
    }

    const checkTarget =
      process.env.RUSTY ||
      this.hasTagName(ev.target as Element, 'CANVAS') ||
      this.firstClassName(ev.target as Element, 'MOUSEINPUTAREA');
    if (!checkTarget) {
      return;
    }

    InputTouchSetSchema.free(this._state.input.touches);
    this._state.input.touches = this._computeTouchSet(ev);

    const touchesEvent = new GameTouchesEvent('touchStart', ev);
    const emptyTouches = normalizedToTouchesEvent(touchesEvent, {
      intersect: this.intersects,
      currTouches: this._state.input.touches,
    });
    this.touchStart.notify(touchesEvent);

    switch (emptyTouches.length) {
      case 1:
        const input = this._state.input;
        input.mouseState = MouseState.press;
        input.mouseButton = MouseButton.left;
        if (this._state.input.useCrossHair) {
          input.mouse[0] = this._state.dom.width / 2;
          input.mouse[1] = this._state.dom.height / 2;
        } else {
          input.mouse[0] = emptyTouches[0].mouse[0];
          input.mouse[1] = emptyTouches[0].mouse[1];
        }
        this._singleTouchStep = SingleTouchStage.active;
        this._touchIdentifier = emptyTouches[0].identifier;

        this._clock.poll(ev.timeStamp);
        this._state.input.touchStart = true;
        this._state.input.touchStartTime = this._state.clock.clock;
        break;
      case 2:
        this._twoFingerTouchStart = true;
        this._twoFingerStartState = emptyTouches;
        break;
    }
  };

  private _handleTouchMove = (ev: TouchEvent) => {
    if (this._state.input.mousePauseCount > 0) {
      return;
    }

    const checkTarget =
      process.env.RUSTY ||
      this.hasTagName(ev.target as Element, 'CANVAS') ||
      this.firstClassName(ev.target as Element, 'MOUSEINPUTAREA');
    if (!checkTarget) {
      return;
    }

    const prevTouches = this._state.input.touches;
    this._state.input.touches = this._computeTouchSet(ev);

    const touchesEvent = new GameTouchesEvent('touchMove', ev);
    normalizedToTouchesEvent(touchesEvent, {
      intersect: this.intersects,
      currTouches: this._state.input.touches,
      prevTouches,
    });
    this.touchMove.notify(touchesEvent);

    // 处理3D单指移动
    if (
      this._singleTouchStep === SingleTouchStage.active ||
      this._singleTouchStep === SingleTouchStage.running
    ) {
      const touchEvent = touchesEvent.touches.find(
        (t) => t.identifier === this._touchIdentifier,
      );
      if (touchEvent) {
        if (
          Math.abs(touchEvent.movement[0]) + Math.abs(touchEvent.movement[1]) >
          0.3
        ) {
          this._state.input.touchStart = false;
          this._singleTouchStep = SingleTouchStage.running;
        }

        this._applyAxisMovement(touchEvent.movement[0], touchEvent.movement[1]);

        const input = this._state.input;
        input.mouseState = MouseState.drag;
        input.mouseButton = MouseButton.left;
        if (this._state.input.useCrossHair) {
          input.mouse[0] = this._state.dom.width / 2;
          input.mouse[1] = this._state.dom.height / 2;
        } else {
          input.mouse[0] = touchEvent.mouse[0];
          input.mouse[1] = touchEvent.mouse[1];
        }
      }
    }

    // 处理3D双指
    // scale the world
    if (this._twoFingerTouchStart && this._twoFingerStartState) {
      const [old0, old1] = this._twoFingerStartState;
      const now0 = this._state.input.touches.find(
        (t) => t.identifier === old0.identifier,
      );
      const now1 = this._state.input.touches.find(
        (t) => t.identifier === old1.identifier,
      );
      if (now0 && now1) {
        const scale =
          this.getFingersDistance(now0, now1) /
          this.getFingersDistance(old0, old1);
        this._state.camera.distance += (1.0 - scale) / 2.0;
      }
    }

    this._preventDefault(ev);
    InputTouchSetSchema.free(prevTouches);
  };

  private _handleTouchEnd = (ev: TouchEvent) => {
    if (this._state.input.mousePauseCount > 0) {
      return;
    }

    const input = this._state.input;

    const currIdentifiers: number[] = [];
    for (let i = 0; i < ev.targetTouches.length; i++) {
      currIdentifiers.push(ev.targetTouches[i].identifier);
    }

    const touches = InputTouchSetSchema.alloc();
    const touchesEndEvent = InputTouchSetSchema.alloc();
    const touchesEndIdentifiers: number[] = [];
    for (let i = 0; i < input.touches.length; i++) {
      if (currIdentifiers.includes(input.touches[i].identifier)) {
        touches.push(input.touches[i]);
      } else {
        touchesEndEvent.push(input.touches[i]);
        touchesEndIdentifiers.push(input.touches[i].identifier);
      }
    }

    // 取消3D世界的单指事件
    if (
      this._touchIdentifier !== undefined &&
      touchesEndIdentifiers.includes(this._touchIdentifier)
    ) {
      if (
        this._state.input.touchStart &&
        this._state.clock.clock - this._state.input.touchStartTime < TAP_TIME
      ) {
        const { mouse } = this._state.input;

        this.singleTouchClick.notify({
          mouse: [mouse[0], mouse[1]],
          clientPosition: [mouse[0], mouse[1]],
        });
      }

      if (this._singleTouchStep > 0) {
        input.mouseState = MouseState.release;
        input.mouseButton = MouseButton.left;
        this._singleTouchStep = 0;
      }
      input.touchStart = false;
      this._touchIdentifier = undefined;
    }

    // 取消3D世界双指事件
    if (
      this._twoFingerStartState &&
      this._twoFingerStartState.find((t) =>
        touchesEndIdentifiers.includes(t.identifier),
      )
    ) {
      this._twoFingerTouchStart = false;
      this._twoFingerStartState = undefined;
    }

    const touchesEvent = new GameTouchesEvent('touchEnd', ev);
    normalizedToTouchesEvent(touchesEvent, {
      intersect: this.intersects,
      currTouches: touchesEndEvent,
    });
    this.touchEnd.notify(touchesEvent);
    InputTouchSetSchema.free(touchesEndEvent);
    input.touches = touches;
  };

  private _applyAxisMovement = (x: number, y: number) => {
    const element = this._state.dom.element;
    if (this.isAxisEnabled() && (element || process.env.RUSTY)) {
      const moveState = this._state.events.lookAxisMovement;
      const bounds = element
        ? element.getBoundingClientRect()
        : {
            width: window.innerWidth,
            height: window.innerHeight,
          };
      moveState[0] +=
        (x / bounds.width) * 4 * this._state.settings.cameraSensitivity;
      moveState[1] +=
        (y / bounds.width) * 4 * this._state.settings.cameraSensitivity;
      this.onAxisChange.notify({
        x: moveState[0],
        y: moveState[1],
      });
    }
  };

  private _handlePress = (code: GameKeys) => {
    // only fire event if state has changed
    if (this._state.input.keyState[code]) {
      return;
    }
    this._state.input.keyState[code] = 1;

    // tap times
    const prevPressTime = this._state.input.keyLastPressed[code];
    const curPressTime = Date.now();
    if (curPressTime < prevPressTime + TAP_TIME) {
      this._state.events.keyTap[code] += 1;
    }
    this._state.input.keyLastPressed[code] = curPressTime;

    // issue notification
    this.onKeyDown.notify(code);
  };

  private _handleRelease(code: GameKeys) {
    if (!this._state.input.keyState[code]) {
      return;
    }
    this._state.input.keyState[code] = 0;

    // issue notification
    this.onKeyUp.notify(code);
  }

  private _preventDefault(ev: MouseEvent | TouchEvent) {
    if (ev.cancelable) {
      if (!ev.defaultPrevented) {
        ev.preventDefault();
      }
    }
  }

  private _onPointerLockChange = () => {
    const isLocked = this._hasPointerLock();
    if (this._wasPointerLocked && !isLocked) {
      this._lastPointerLockExitAt = Date.now();
    }
    this._wasPointerLocked = isLocked;
    this.onPointerLockChange.notify({
      isLocked,
    });
  };

  private _onPointerLockError = () => {
    this.onPointerLockError.notify(undefined);
  };

  public addIntersectElements<T extends GameElement = GameElement>(
    ...func: IntersectElementsFun<T>[]
  ) {
    this.intersectElements.splice(
      this.intersectElements.length,
      func.length,
      ...(func as any),
    );
  }

  public requestPointerLock = () => {
    if (this._hasPointerLock() || this._pointerLockRequestPending) {
      return;
    }

    if (Date.now() - this._lastPointerLockExitAt < 250) {
      return;
    }

    const {
      input: { pointerLockPauseCount },
      dom: { element },
    } = this._state;

    if (pointerLockPauseCount > 0 || !element) {
      return;
    }

    const requestPointerLock: Element['requestPointerLock'] =
      element.requestPointerLock || element['mozRequestPointerLock'];

    this._pointerLockRequestPending = true;
    const result = requestPointerLock.call(element);
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => undefined);
    }
    // The browser reports the actual state through pointerlockchange. This
    // only prevents duplicate requests while the promise is settling.
    Promise.resolve().then(() => {
      this._pointerLockRequestPending = false;
    });

    return;
  };

  public exitPointerLock = () => {
    if (!this._hasPointerLock()) {
      return;
    }

    this._lastPointerLockExitAt = Date.now();
    return exitPointerLock();
  };
}
