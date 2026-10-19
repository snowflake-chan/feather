"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuDate = void 0;
class MuDate {
    constructor(identity) {
        this.muType = 'date';
        this.identity = new Date(0);
        if (identity) {
            this.identity.setTime(identity.getTime());
        }
        this.json = {
            type: 'date',
            identity: this.identity.toISOString(),
        };
    }
    alloc() {
        return new Date();
    }
    free(date) {
    }
    equal(a, b) {
        return a.getTime() === b.getTime();
    }
    clone(date_) {
        const date = this.alloc();
        date.setTime(date_.getTime());
        return date;
    }
    assign(dst, src) {
        dst.setTime(src.getTime());
        return dst;
    }
    diff(base, target, out) {
        const bt = base.getTime();
        const tt = target.getTime();
        if (bt !== tt) {
            out.grow(10);
            out.writeVarint(tt % 0x10000000);
            out.writeVarint(tt / 0x10000000 | 0);
            return true;
        }
        return false;
    }
    patch(base, inp) {
        const date = this.alloc();
        const lo = inp.readVarint();
        const hi = inp.readVarint();
        date.setTime(lo + 0x10000000 * hi);
        return date;
    }
    toJSON(date) {
        return date.toISOString();
    }
    fromJSON(x) {
        if (typeof x === 'string') {
            return new Date(x);
        }
        return this.clone(this.identity);
    }
}
exports.MuDate = MuDate;
//# sourceMappingURL=date.js.map