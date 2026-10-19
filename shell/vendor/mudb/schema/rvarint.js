"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRelativeVarint = void 0;
const _number_1 = require("./_number");
const SCHROEPPEL2 = 0xAAAAAAAA;
class MuRelativeVarint extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'rvarint');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(5);
            out.writeVarint((SCHROEPPEL2 + (target - base)) ^ SCHROEPPEL2);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        const delta = (SCHROEPPEL2 ^ inp.readVarint()) - SCHROEPPEL2 >> 0;
        return base + delta;
    }
}
exports.MuRelativeVarint = MuRelativeVarint;
//# sourceMappingURL=rvarint.js.map