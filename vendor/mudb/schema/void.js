"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuVoid = void 0;
class MuVoid {
    constructor() {
        this.identity = undefined;
        this.muType = 'void';
        this.json = {
            type: 'void',
        };
    }
    alloc() { }
    free(_) { }
    equal(a, b) { return true; }
    clone(_) { }
    assign(d, s) { }
    diff(b, t, out) { return false; }
    patch(b, inp) { }
    toJSON(_) { return null; }
    fromJSON(_) { return; }
}
exports.MuVoid = MuVoid;
//# sourceMappingURL=void.js.map