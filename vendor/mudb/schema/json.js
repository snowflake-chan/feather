"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuJSON = exports.deepClone = exports.deepEqual = void 0;
function equal(a, b) {
    if (a === b) {
        return true;
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        const aIsArr = Array.isArray(a);
        const bIsArr = Array.isArray(b);
        if (aIsArr !== bIsArr) {
            return false;
        }
        if (aIsArr) {
            const leng = a.length;
            if (leng !== b.length) {
                return false;
            }
            for (let i = leng - 1; i >= 0; --i) {
                if (!equal(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
        const keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) {
            return false;
        }
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            if (!b.hasOwnProperty(key) || !equal(a[key], b[key])) {
                return false;
            }
        }
        return true;
    }
    return a !== a && b !== b;
}
function clone(x) {
    if (typeof x !== 'object' || x === null) {
        return x;
    }
    const copy = Array.isArray(x) ? [] : {};
    if (Array.isArray(copy)) {
        copy.length = x.length;
        for (let i = 0; i < x.length; ++i) {
            copy[i] = clone(x[i]);
        }
    }
    else {
        const keys = Object.keys(x);
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            copy[key] = clone(x[key]);
        }
    }
    return copy;
}
exports.deepEqual = equal;
exports.deepClone = clone;
class MuJSON {
    constructor(identity) {
        this.muType = 'json';
        this.identity = identity && clone(identity);
        this.identity = this.identity || {};
        this.json = {
            type: 'json',
            identity: this.identity,
        };
    }
    alloc() { return {}; }
    free() { }
    equal(a, b) {
        return (0, exports.deepEqual)(a, b);
    }
    clone(obj) {
        return (0, exports.deepClone)(obj);
    }
    assign(dst, src) {
        if (Array.isArray(dst) && Array.isArray(src)) {
            dst.length = src.length;
            for (let i = 0; i < dst.length; ++i) {
                dst[i] = (0, exports.deepClone)(src[i]);
            }
            return dst;
        }
        const dKeys = Object.keys(dst);
        for (let i = 0; i < dKeys.length; ++i) {
            const key = dKeys[i];
            if (!(key in src)) {
                delete dst[key];
            }
        }
        const sKeys = Object.keys(src);
        for (let i = 0; i < sKeys.length; ++i) {
            const key = sKeys[i];
            dst[key] = (0, exports.deepClone)(src[key]);
        }
        return dst;
    }
    diff(base, target, out) {
        const str = JSON.stringify(target);
        out.writeString(str);
        return true;
    }
    patch(base, inp) {
        return JSON.parse(inp.readString());
    }
    toJSON(obj) { return obj; }
    fromJSON(x) {
        if (typeof x === 'object' && x) {
            return x;
        }
        return this.clone(this.identity);
    }
}
exports.MuJSON = MuJSON;
//# sourceMappingURL=json.js.map