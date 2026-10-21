"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuFixedASCII = void 0;
const _string_1 = require("./_string");
class MuFixedASCII extends _string_1.MuString {
    constructor(lengthOrIdentity) {
        const identity = typeof lengthOrIdentity === 'number' ?
            new Array(lengthOrIdentity + 1).join(' ') :
            lengthOrIdentity;
        super(identity, 'fixed-ascii');
        this.length = identity.length;
    }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(this.length);
            out.writeASCII(target);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        return inp.readASCII(this.length);
    }
}
exports.MuFixedASCII = MuFixedASCII;
//# sourceMappingURL=fixed-ascii.js.map