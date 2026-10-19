"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuFloat64 = void 0;
const _number_1 = require("./_number");
class MuFloat64 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'float64');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(8);
            out.writeFloat64(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readFloat64();
    }
}
exports.MuFloat64 = MuFloat64;
//# sourceMappingURL=float64.js.map