import type * as I from '@box/script-api';
import { EventBus } from '@box/utils/event';
import type { GamePointerLockChangeEvent } from 'src/engine/input/events';
import type { InputController } from 'src/engine/input/input-controller';
import { EventEmitter } from '../events';

export type InputSystemSpec = {
  inputController: InputController;
};

export class InputSystem implements I.InputSystem {
  /**
   * 提供pointerDown事件的订阅
   * @deprecated 后续不再使用eventBus的方式派发事件，使用对用模块的eventEmitter
   */
  public readonly onPointerDown: EventBus<I.UiEvent>;

  public readonly uiEvents: I.EventEmitter<I.UiNodeEvents>;

  /**
   * 内部的pointerLock事件派发
   *
   * 会从inputController订阅pointerLock相关事件。
   */
  public readonly pointerLockEvents: I.EventEmitter<I.PointerLockEvents>;

  private readonly inputController: InputController;

  constructor(spec: InputSystemSpec) {
    const { inputController } = spec;

    this.onPointerDown = new EventBus();

    this.uiEvents = new EventEmitter();

    this.inputController = inputController;

    this.pointerLockEvents = new EventEmitter();

    this.inputController.onPointerLockChange.sub(this.onInputPointerLockChange);
    this.inputController.onPointerLockError.sub(this.onInputPointerLockError);
  }

  public unlockPointer() {
    this.inputController.exitPointerLock();
    return;
  }

  public async lockPointer() {
    this.inputController.requestPointerLock();
    return;
  }

  /**
   * 订阅inputController的pointerLockChange事件
   */
  private onInputPointerLockChange = (evt: GamePointerLockChangeEvent) => {
    this.pointerLockEvents.emit('pointerlockchange', {
      isLocked: evt.isLocked,
    });
  };

  /**
   * 订阅inputController的pointerLockError事件
   */
  private onInputPointerLockError = () => {
    this.pointerLockEvents.emit('pointerlockerror', undefined);
  };

  /**
   * 销毁模块
   * - 取消订阅inputController的pointerLock相关事件。
   */
  public destroy() {
    this.inputController.onPointerLockChange.unsub(
      this.onInputPointerLockChange,
    );
    this.inputController.onPointerLockError.unsub(this.onInputPointerLockError);
  }
}
