"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuUint32 = void 0;
const _number_1 = require("./_number");
class MuUint32 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'uint32');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(4);
            out.writeUint32(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readUint32();
    }
}
exports.MuUint32 = MuUint32;
//# sourceMappingURL=uint32.js.map