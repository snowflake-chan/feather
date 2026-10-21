import { Parent } from './parent';
import { Children } from './children';
import { EventsType } from './event-types';
export type { Children } from './children';
export type { Parent } from './parent';
export * from './defs';
export * from './event-types';

// 业务方用，此处增加 K, E 泛型是为了给业务方添加自定义事件类型，方便后续的emitEvent和EventOn等方法的类型提示
// K用来约束eventsOn和eventOn的自定义事件类型，T用来约束emitEvent的自定义事件类型
export function create<K extends EventsType, E extends EventsType>(param: {
  type: string;
  url: string;
}) {
  const { type, url } = param;
  return new Parent<K, E>(url, type);
}

// engine内部用
export function createTool<K extends EventsType, E extends EventsType>() {
  return new Children<K, E>();
}
