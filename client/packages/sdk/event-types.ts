import { AuthEventType, ChildrenEventType, ErrorType } from './defs';

/**
 * 自定义事件类型
 * status事件表示当前页面状态变化：ready => 准备页面 | started => 进入游戏后的游玩状态 | closed => 断连状态
 * jumpTo链接跳转事件：url => 跳转链接 | isNewTab => 是否新页面 | isLoginBack => 是否需要登录后跳转回当前页
 * loaded表示通讯初始化成功，可以进行事件派发
 * error表示加载过程或者通讯初始化的错误
 * auth表示登录态相关的事件。比如children通知parent登录态失效、或者parent通知children登录态需要更新。
 */
export type EventsType = {
  status: 'ready' | 'started' | 'closed';
  jumpTo: {
    url: string;
    isNewTab: boolean;
    isLoginBack: boolean;
  };
  loaded: undefined;
  error: ErrorEvent;
  auth: AuthEvent;
  children: ChildrenEvent;
};

// 可扩展的自定义事件类型
export type EventObject = { [key: string]: any };

export type EventOnType<K extends EventObject = EventsType> = <
  T extends keyof K,
>(
  key: T,
  handler: (value: K[T]) => void,
) => void;

export type EmitEventType<E extends EventObject = EventsType> = <
  T extends keyof E,
>(
  key: T,
  value?: E[T],
  callback?: (res: unknown) => void,
) => void;

export type CallAsyncType<E extends EventObject = EventsType> = <
  T extends keyof E,
>(
  key: T,
  value?: E[T],
) => Promise<unknown>;

/**
 * 通用的错误类型
 */
export type ErrorEvent = {
  type: ErrorType;
  msg?: string;
};

export type AuthEvent =
  | {
      type: AuthEventType.Unauthorized;
      msg?: string;
    }
  | {
      type: AuthEventType.UpdateToken;
      value: string;
    };

export type ChildrenEvent = {
  type: ChildrenEventType;
  msg?: string;
};
