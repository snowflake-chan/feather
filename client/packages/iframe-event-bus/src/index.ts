import EventEmitter from 'eventemitter3';

export class IframeEventBus<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  K extends keyof T = keyof T,
> extends EventEmitter<{
  [key in K]: [SimplifyWithTrigger<T[key]>];
}> {
  static readonly TYPE = 'IframeEventBus';

  target?: Window | WindowProxy | null;

  targetOrigin: string;

  constructor(target?: Window | WindowProxy | null, targetOrigin = '*') {
    super();
    this.target = target;
    this.targetOrigin = targetOrigin;
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('message', (e) => {
      const { type, data, messageType } = e?.data ?? {};
      if (messageType === IframeEventBus.TYPE) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.emit<K>(type, {
          ...data,
          triggeredBy: 'that',
        });
      }
    });
  }

  public expose(eventName: K, e: T[K]) {
    const sEvent = simplifyEvent(e);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit<K>(eventName, {
      ...sEvent,
      triggeredBy: 'this',
    });
    if (typeof window === 'undefined') {
      return;
    }
    if (this.target && this.target !== window) {
      this.target.postMessage(
        {
          messageType: IframeEventBus.TYPE,
          type: eventName,
          data: sEvent,
        },
        this.targetOrigin,
      );
    }
  }
}

type SimplifyType = number | string | boolean | undefined | null;

export type SimplifyObject<T extends {}> = {
  [key in keyof T]: T[key] extends SimplifyType ? T[key] : undefined;
};

export type SimplifyWithTrigger<T extends {}> = SimplifyObject<T> & {
  triggeredBy: 'this' | 'that';
};

/**
 * 随便查看了几个 Event, 除了无法序列号的 Element(target / srcElement) 和 function 之外,
 * 都是 number string boolean, 没见到过 Array 之类的,
 * 所以就简单地仅保留这些 value 了。
 * 之后如果发现其他有必要的属性值, 再来修改这个方法吧
 */
export function simplifyEvent<T extends {}>(e: T) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) {
    return {} as SimplifyObject<T>;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = {} as Record<string, any>;

  for (let proto = e; proto !== null; proto = Object.getPrototypeOf(proto)) {
    Object.keys(proto).forEach((k) => {
      const value = e[k as keyof T];
      result[k] =
        value === undefined ||
        value === null ||
        ['number', 'string', 'boolean'].includes(typeof value)
          ? value
          : undefined;
    });
  }

  return result as SimplifyObject<T>;
}
