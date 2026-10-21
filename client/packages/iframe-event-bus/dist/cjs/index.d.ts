import EventEmitter from 'eventemitter3';
export declare class IframeEventBus<T extends Record<string, any>, K extends keyof T = keyof T> extends EventEmitter<{
    [key in K]: [SimplifyWithTrigger<T[key]>];
}> {
    static readonly TYPE = "IframeEventBus";
    target?: Window | WindowProxy | null;
    targetOrigin: string;
    constructor(target?: Window | WindowProxy | null, targetOrigin?: string);
    expose(eventName: K, e: T[K]): void;
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
export declare function simplifyEvent<T extends {}>(e: T): SimplifyObject<T>;
export {};
//# sourceMappingURL=index.d.ts.map