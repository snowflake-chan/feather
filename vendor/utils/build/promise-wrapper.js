"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseWrapper = void 0;
class PromiseWrapper {
    constructor(handle) {
        this.handle = handle;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
exports.PromiseWrapper = PromiseWrapper;
