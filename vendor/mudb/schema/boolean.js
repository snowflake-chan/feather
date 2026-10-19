"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuBoolean = void 0;
class MuBoolean {
    constructor(identity) {
        this.muType = 'boolean';
        this.identity = !!identity;
        this.json = {
            type: 'boolean',
            identity: this.identity,
        };
    }
    alloc() { return this.identity; }
    free(bool) { }
    equal(a, b) { return a === b; }
    clone(bool) { return bool; }
    assign(dst, src) { return src; }
    diff(base, target, out) {
        if (base !== target) {
            out.grow(1);
            out.writeUint8(target ? 1 : 0);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        const result = inp.readUint8();
        if (result > 1) {
            throw new Error(`invalid value for boolean`);
        }
        return !!result;
    }
    toJSON(bool) { return bool; }
    fromJSON(x) {
        if (typeof x === 'boolean') {
            return x;
        }
        return this.identity;
    }
}
exports.MuBoolean = MuBoolean;
//# sourceMappingURL=boolean.js.map