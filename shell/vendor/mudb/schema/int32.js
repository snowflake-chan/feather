"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuInt32 = void 0;
const _number_1 = require("./_number");
class MuInt32 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'int32');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(4);
            out.writeInt32(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readInt32();
    }
}
exports.MuInt32 = MuInt32;
//# sourceMappingURL=int32.js.map