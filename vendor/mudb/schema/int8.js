"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuInt8 = void 0;
const _number_1 = require("./_number");
class MuInt8 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'int8');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(1);
            out.writeInt8(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readInt8();
    }
}
exports.MuInt8 = MuInt8;
//# sourceMappingURL=int8.js.map