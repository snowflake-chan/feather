import type { EventEmitter } from './events';
import type { PointerLockEvents } from './pointer-lock';
import type { UiNodeEvents } from './ui';

/**
 * 全局监听玩家的输入。
 */
export declare class InputSystem {
  /**
   * 全局监听玩家指针与UI元素交互时的产生的事件。
   */
  public readonly uiEvents: EventEmitter<UiNodeEvents>;

  /**
   * 全局监听当玩家指针锁定状态变化或出错时产生的事件。
   */
  public readonly pointerLockEvents: EventEmitter<PointerLockEvents>;

  /**
   * @param args - 绑定数据时传入的参数。
   * @ignore
   */
  constructor(...args: any);

  /**
   * 调用后解锁指针。
   */
  public unlockPointer(): void;

  /**
   * 调用后锁定指针，由于浏览器限制，此操作可能会失败。
   * 有兴趣可以查看https://w3c.github.io/pointerlock/#dom-element-requestpointerlock。
   */
  public lockPointer(): void;
}

/**
 * 全局监听玩家的输入。
 */
export declare const input: InputSystem;
