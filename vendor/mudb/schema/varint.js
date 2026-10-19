"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuVarint = void 0;
const _number_1 = require("./_number");
class MuVarint extends _number_1.MuNumber {
    constructor(identity) {
        super(identity, 'varint');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(5);
            out.writeVarint(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readVarint();
    }
}
exports.MuVarint = MuVarint;
//# sourceMappingURL=varint.js.map