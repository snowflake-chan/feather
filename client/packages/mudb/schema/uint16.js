"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuUint16 = void 0;
const _number_1 = require("./_number");
class MuUint16 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'uint16');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(2);
            out.writeUint16(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readUint16();
    }
}
exports.MuUint16 = MuUint16;
//# sourceMappingURL=uint16.js.map