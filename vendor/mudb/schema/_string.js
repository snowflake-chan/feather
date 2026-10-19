"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuString = void 0;
class MuString {
    constructor(identity, type) {
        this.identity = identity;
        this.muType = type;
        this.json = {
            type,
            identity,
        };
    }
    alloc() { return this.identity; }
    free(str) { }
    equal(a, b) { return a === b; }
    clone(str) { return str; }
    assign(dst, src) { return src; }
    toJSON(str) { return str; }
    fromJSON(x) {
        if (typeof x === 'string') {
            return x;
        }
        return this.identity;
    }
}
exports.MuString = MuString;
//# sourceMappingURL=_string.js.map