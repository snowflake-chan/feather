"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfNow = void 0;
if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    exports.perfNow = () => performance.now();
}
else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
    exports.perfNow = (() => {
        function nanoSeconds() {
            const hrt = process.hrtime();
            return hrt[0] * 1e9 + hrt[1];
        }
        const loadTime = nanoSeconds() - process.uptime() * 1e9;
        return () => (nanoSeconds() - loadTime) / 1e6;
    })();
}
else if (typeof Date.now === 'function') {
    exports.perfNow = (() => {
        const loadTime = Date.now();
        return () => Date.now() - loadTime;
    })();
}
else {
    exports.perfNow = (() => {
        const loadTime = new Date().getTime();
        return () => new Date().getTime() - loadTime;
    })();
}
//# sourceMappingURL=perf-now.js.map