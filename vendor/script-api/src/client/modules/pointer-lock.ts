/**
 * 指针锁定状态变化事件。
 */
export type PointerLockChangeEvent = {
  /**
   * 表示指针是否锁定。
   */
  isLocked: boolean;
};

/**
 * 玩家指针锁定状态变化或出错时产生的事件。
 */
export type PointerLockEvents = {
  pointerlockchange: PointerLockChangeEvent;
  pointerlockerror: undefined;
};
