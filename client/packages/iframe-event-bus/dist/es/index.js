import EventEmitter from 'eventemitter3';
export class IframeEventBus extends EventEmitter {
    constructor(target, targetOrigin = '*') {
        super();
        this.target = target;
        this.targetOrigin = targetOrigin;
        if (typeof window === 'undefined') {
            return;
        }
        window.addEventListener('message', (e) => {
            var _a;
            const { type, data, messageType } = (_a = e === null || e === void 0 ? void 0 : e.data) !== null && _a !== void 0 ? _a : {};
            if (messageType === IframeEventBus.TYPE) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.emit(type, Object.assign(Object.assign({}, data), { triggeredBy: 'that' }));
            }
        });
    }
    expose(eventName, e) {
        const sEvent = simplifyEvent(e);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.emit(eventName, Object.assign(Object.assign({}, sEvent), { triggeredBy: 'this' }));
        if (typeof window === 'undefined') {
            return;
        }
        if (this.target && this.target !== window) {
            this.target.postMessage({
                messageType: IframeEventBus.TYPE,
                type: eventName,
                data: sEvent,
            }, this.targetOrigin);
        }
    }
}
IframeEventBus.TYPE = 'IframeEventBus';
/**
 * 随便查看了几个 Event, 除了无法序列号的 Element(target / srcElement) 和 function 之外,
 * 都是 number string boolean, 没见到过 Array 之类的,
 * 所以就简单地仅保留这些 value 了。
 * 之后如果发现其他有必要的属性值, 再来修改这个方法吧
 */
export function simplifyEvent(e) {
    if (!e || typeof e !== 'object' || Array.isArray(e)) {
        return {};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = {};
    for (let proto = e; proto !== null; proto = Object.getPrototypeOf(proto)) {
        Object.keys(proto).forEach((k) => {
            const value = e[k];
            result[k] =
                value === undefined ||
                    value === null ||
                    ['number', 'string', 'boolean'].includes(typeof value)
                    ? value
                    : undefined;
        });
    }
    return result;
}
//# sourceMappingURL=index.js.map