import createDebug from 'debug';

// HACK: Disable browser colors in debug output 因为我们要发到 server, see: https://github.com/debug-js/debug/issues/463#issuecomment-302738744
// TODO 后面放到 bootstrap 中
createDebug['useColors'] = () => false;

Object.assign ||
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      const to = Object(target);
      for (let i = 1; i < arguments.length; i++) {
        let nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        const keysArray = Object.keys(Object(nextSource));
        for (
          let nextIndex = 0, len = keysArray.length;
          nextIndex < len;
          nextIndex++
        ) {
          const nextKey = keysArray[nextIndex];
          const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    },
  });

String.prototype.includes ||
  Object.defineProperty(String.prototype, 'includes', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (search, start) {
      'use strict';
      if (typeof start !== 'number') {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    },
  });

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul#Polyfill
if (!Math.imul) {
  Math.imul = function (a: number, b: number) {
    const aHi = (a >>> 16) & 0xffff;
    const aLo = a & 0xffff;
    const bHi = (b >>> 16) & 0xffff;
    const bLo = b & 0xffff;
    // the shift by 0 fixes the sign on the high part
    // the final |0 converts the unsigned value into a signed value
    return (aLo * bLo + (((aHi * bLo + aLo * bHi) << 16) >>> 0)) | 0;
  };
}

// WeakRef polyfill
(function (global) {
  // 检查是否原生支持 WeakRef,如果不支持 WeakRef，则进行 Polyfill
  if (
    typeof global === 'object' &&
    global &&
    typeof global['WeakRef'] === 'undefined'
  ) {
    // 检查是否原生支持 WeakMap,如果不支持 WeakMap,则采用另一个 polyfill
    if (typeof global['WeakMap'] === 'function') {
      // 定义 PolyfillWeakRef 类
      class PolyfillWeakRef<T extends symbol | object> {
        // 定义对象的 Symbol.toStringTag 属性，用来定制对象在被输出为字符串时的行为，通常用于标识对象的类型：
        // Object.prototype.toString.call(weakRef) =  "[object WeakRef]"
        readonly [Symbol.toStringTag]: 'WeakRef' = 'WeakRef';
        private _weakMap: WeakMap<object, T>;
        constructor(target: T) {
          // 使用 WeakMap 存储目标对象
          this._weakMap = new WeakMap();
          this._weakMap.set(this, target);
        }
        public deref(): T | undefined {
          // 从 WeakMap 中获取目标对象
          return this._weakMap.get(this);
        }
      }
      // 将 PolyfillWeakRef 赋值给全局对象的 WeakRef 属性
      global.WeakRef = PolyfillWeakRef;
    } else {
      // 定义 WeakRef 类
      class PolyfillWeakRef<T extends symbol | object> {
        readonly [Symbol.toStringTag]: 'WeakRef' = 'WeakRef';
        private _target: T;
        constructor(target: T) {
          this._target = target;
        }

        public deref(): T | undefined {
          return this._target;
        }
      }
      global.WeakRef = PolyfillWeakRef;
    }
  }
})(
  (function () {
    // 全局对象的可用性检查
    // 检查了 global 对象和其他全局对象（如 globalThis、self、window）
    // 以防在一些特殊的环境中，无法正确识别全局对象，从而影响代码的执行
    switch (true) {
      case typeof globalThis === 'object' && !!globalThis:
        return globalThis;
      case typeof self === 'object' && !!self:
        return self;
      case typeof window === 'object' && !!window:
        return window;
      case typeof global === 'object' && !!global:
        return global;
    }
    return null;
  })(),
);
