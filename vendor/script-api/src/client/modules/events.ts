/**
 * 事件处理模块
 */
export declare class EventEmitter<EventMap extends Record<string, any>> {
  /**
   * 监听指定的事件。
   * @param type - 监听的事件类型，是个字符串。
   * @param listener - 监听到事件类型后的处理函数。
   */
  on<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ): void;

  /**
   * 与 on 的区别是仅触发一次。
   * @param type - 监听的事件类型，是个字符串。
   * @param listener - 监听到事件类型后的处理函数。
   */
  once<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ): void;

  /**
   * 移除找到的第一个 listener。
   * @param type - 要移除的事件类型。
   * @param listener - 要移除的事件处理函数。
   */
  remove<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ): void;

  /**
   * 移除找到的所有 listener，不传则移除事件下所有。
   * @param type - 要移除的事件类型。
   * @param listener - 可选，要移除的事件处理函数。
   */
  removeAll<K extends keyof EventMap>(
    type?: K,
    listener?: (event: EventMap[K]) => void,
  ): void;

  /**
   * 与 on 是同一个方法，只是方法名不同。
   * @param type - 监听的事件类型，是个字符串。
   * @param listener - 监听到事件类型后的处理函数。
   */
  add<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ): void;

  /**
   * 与 remove 是同一个方法，只是方法名不同。
   * @param type - 要移除的事件类型。
   * @param listener - 要移除的事件处理函数。
   */
  off<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ): void;

  /**
   * 触发指定的事件
   */
  emit<K extends keyof EventMap>(type: K, event: EventMap[K]): void;
}
