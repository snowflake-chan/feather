"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuSystemScheduler = void 0;
const perf_now_1 = require("./perf-now");
const root = (typeof self !== 'undefined' ? self : global) || {};
const frameDuration = 1000 / 60;
let rAF = root['requestAnimationFrame']
    || root['webkitRequestAnimationFrame']
    || root['mozRequestAnimationFrame'];
let cAF = root['cancelAnimationFrame']
    || root['webkitCancelAnimationFrame']
    || root['mozCancelAnimationFrame']
    || root['webkitCancelRequestAnimationFrame']
    || root['mozCancelRequestAnimationFrame'];
if (!rAF || !cAF) {
    const queue = [];
    let last = 0;
    let id = 0;
    rAF = (callback) => {
        if (queue.length === 0) {
            const now_ = (0, perf_now_1.perfNow)();
            const next = Math.max(0, frameDuration - (now_ - last));
            last = now_ + next;
            setTimeout(() => {
                const copy = queue.slice(0);
                queue.length = 0;
                for (let i = 0; i < copy.length; ++i) {
                    if (!copy[i].cancelled) {
                        try {
                            copy[i].callback(last);
                        }
                        catch (e) {
                            setTimeout(() => { throw e; }, 0);
                        }
                    }
                }
            }, Math.round(next));
        }
        queue.push({
            handle: ++id,
            callback: callback,
            cancelled: false,
        });
        return id;
    };
    cAF = (handle) => {
        for (let i = 0; i < queue.length; ++i) {
            if (queue[i].handle === handle) {
                queue[i].cancelled = true;
            }
        }
    };
}
let rIC = root['requestIdleCallback'];
let cIC = root['cancelIdleCallback'];
if (!rIC || !cIC) {
    rIC = (cb, options) => {
        const timeout = options ? options.timeout : 1;
        return setTimeout(() => {
            const start = (0, perf_now_1.perfNow)();
            cb({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50 - ((0, perf_now_1.perfNow)() - start)),
            });
        }, timeout);
    };
    cIC = (handle) => clearTimeout(handle);
}
let nextTick;
if (typeof process === 'object' && process && process.nextTick) {
    nextTick = process.nextTick;
}
else if (typeof setImmediate === 'function') {
    nextTick = (cb) => {
        setImmediate(cb);
    };
}
else {
    nextTick = (cb) => {
        setTimeout(cb, 0);
    };
}
exports.MuSystemScheduler = {
    now: () => +new Date(),
    setTimeout: (cb, ms) => setTimeout(cb, ms),
    clearTimeout: (handle) => clearTimeout(handle),
    setInterval: (cb, ms) => setInterval(cb, ms),
    clearInterval: (handle) => clearInterval(handle),
    requestAnimationFrame: (cb) => rAF(cb),
    cancelAnimationFrame: (handle) => cAF(handle),
    requestIdleCallback: (cb, options) => rIC(cb, options),
    cancelIdleCallback: (handle) => cIC(handle),
    nextTick: (cb) => nextTick(cb),
};
if (typeof performance === 'object' && performance && performance.now) {
    exports.MuSystemScheduler.now = () => performance.now();
}
else if (typeof process === 'object' && process && process.hrtime) {
    exports.MuSystemScheduler.now = () => {
        const time = process.hrtime();
        return time[0] * 1e3 + time[1] / 1e6;
    };
}
else if (Date.now) {
    exports.MuSystemScheduler.now = () => Date.now();
}
//# sourceMappingURL=system.js.map