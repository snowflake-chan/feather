"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuASCII = void 0;
const _string_1 = require("./_string");
class MuASCII extends _string_1.MuString {
    constructor(identity) {
        super(identity || '', 'ascii');
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(5 + target.length);
            out.writeVarint(target.length);
            out.writeASCII(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readASCII(inp.readVarint());
    }
}
exports.MuASCII = MuASCII;
//# sourceMappingURL=ascii.js.map