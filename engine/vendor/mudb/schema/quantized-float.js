"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuQuantizedFloat = void 0;
const SCHROEPPEL2 = 0xAAAAAAAA;
function readSchroeppel(stream) {
    const x = stream.readVarint();
    return ((SCHROEPPEL2 ^ x) - SCHROEPPEL2) >> 0;
}
class MuQuantizedFloat {
    constructor(precision, identity) {
        this.precision = precision;
        this.invPrecision = 1;
        this.identity = 0;
        this.muData = {
            type: 'quantized-float',
            precision: 0,
            identity: 0,
        };
        this.muType = 'quantized-float';
        this.invPrecision = 1 / this.precision;
        if (identity) {
            this.identity = this.precision * ((this.invPrecision * identity) >> 0);
        }
        this.json = this.muData = {
            type: 'quantized-float',
            precision: this.precision,
            identity: this.identity,
        };
    }
    assign(x, y) {
        return ((this.invPrecision * y) >> 0) * this.precision;
    }
    clone(y) {
        return ((this.invPrecision * y) >> 0) * this.precision;
    }
    alloc() {
        return this.identity;
    }
    free() { }
    toJSON(x) {
        return this.precision * ((this.invPrecision * x) >> 0);
    }
    fromJSON(x) {
        if (typeof x === 'number') {
            return this.clone(x);
        }
        return this.identity;
    }
    equal(x, y) {
        const sf = this.invPrecision;
        return ((sf * x) >> 0) === ((sf * y) >> 0);
    }
    diff(base, target, stream) {
        const sf = this.invPrecision;
        const b = (sf * base) >> 0;
        const t = (sf * target) >> 0;
        if (b === t) {
            return false;
        }
        stream.grow(5);
        stream.writeVarint((SCHROEPPEL2 + (t - b) ^ SCHROEPPEL2) >>> 0);
        return true;
    }
    patch(base, stream) {
        const b = (this.invPrecision * base) >> 0;
        const d = readSchroeppel(stream);
        return (b + d) * this.precision;
    }
}
exports.MuQuantizedFloat = MuQuantizedFloat;
//# sourceMappingURL=quantized-float.js.map