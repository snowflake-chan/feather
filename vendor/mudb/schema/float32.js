"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuFloat32 = void 0;
const _number_1 = require("./_number");
class MuFloat32 extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'float32');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(4);
            out.writeFloat32(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readFloat32();
    }
}
exports.MuFloat32 = MuFloat32;
//# sourceMappingURL=float32.js.map