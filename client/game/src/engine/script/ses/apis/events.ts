import type * as I from '@box/script-api';
import { EventEmitter as NativeEventEmitter } from 'events';

/**
 * 仅供API使用的事件管理模块，我们自己的模块不要用
 */
export class EventEmitter<EventMap extends Record<string, any>>
  implements I.EventEmitter<EventMap>
{
  public on: <K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ) => void;
  public once: <K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ) => void;
  public remove: <K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
  ) => void;
  public removeAll: <K extends keyof EventMap>(
    type?: K,
    listener?: (event: EventMap[K]) => void,
  ) => void;
  public add: typeof EventEmitter['prototype']['on'];
  public off: typeof EventEmitter['prototype']['remove'];
  public emit: <K extends keyof EventMap>(type: K, event: EventMap[K]) => void;

  constructor() {
    const ev = new NativeEventEmitter();
    this.emit = (t, cb) => {
      ev.emit(t as string, cb); // ts 的类型推断有点问题，这里手动修正一下·
    };
    this.add = (t, cb) => {
      ev.addListener(t as string, cb);
    };
    this.remove = (t, cb) => {
      ev.removeListener(t as string, cb);
    };
    this.on = (t, cb) => {
      ev.on(t as string, cb);
    };
    this.off = (t, cb) => {
      ev.off(t as string, cb);
    };
    this.once = (t, cb) => {
      ev.once(t as string, cb);
    };
    this.removeAll = (t) => {
      if (t) {
        ev.removeAllListeners(t as string);
      }
      ev.removeAllListeners();
    };
  }
}
