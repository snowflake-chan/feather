"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuInt16 = void 0;
const _number_1 = require("./_number");
class MuInt16 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'int16');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(2);
            out.writeInt16(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readInt16();
    }
}
exports.MuInt16 = MuInt16;
//# sourceMappingURL=int16.js.map