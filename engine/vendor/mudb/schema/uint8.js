"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuUint8 = void 0;
const _number_1 = require("./_number");
class MuUint8 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'uint8');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(1);
            out.writeUint8(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readUint8();
    }
}
exports.MuUint8 = MuUint8;
//# sourceMappingURL=uint8.js.map