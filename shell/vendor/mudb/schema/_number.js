"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuNumber = exports.ranges = void 0;
function tuple(...args) {
    return args;
}
exports.ranges = {
    float32: tuple(-3.4028234663852886e+38, 3.4028234663852886e+38),
    float64: tuple(-1.7976931348623157e+308, 1.7976931348623157e+308),
    int8: tuple(-0x80, 0x7f),
    int16: tuple(-0x8000, 0x7fff),
    int32: tuple(-0x80000000, 0x7fffffff),
    uint8: tuple(0, 0xff),
    uint16: tuple(0, 0xffff),
    uint32: tuple(0, 0xffffffff),
    varint: tuple(0, 0xffffffff),
    rvarint: tuple(0, 0xffffffff),
};
class MuNumber {
    constructor(identity_, type) {
        const identity = identity_ === identity_ ? identity_ || 0 : NaN;
        const range = exports.ranges[type];
        if (identity !== Infinity && identity !== -Infinity && identity === identity) {
            if (identity < range[0] || identity > range[1]) {
                throw new RangeError(`${identity} is out of range of ${type}`);
            }
        }
        else if (type !== 'float32' && type !== 'float64') {
            throw new RangeError(`${identity} is out of range of ${type}`);
        }
        this.identity = identity;
        this.muType = type;
        this.json = {
            type,
            identity,
        };
    }
    alloc() { return this.identity; }
    free(num) { }
    equal(a, b) { return a === b; }
    clone(num) { return num; }
    assign(dst, src) { return src; }
    toJSON(num) { return num; }
    fromJSON(x) {
        if (typeof x === 'number') {
            return x;
        }
        return this.identity;
    }
}
exports.MuNumber = MuNumber;
//# sourceMappingURL=_number.js.map