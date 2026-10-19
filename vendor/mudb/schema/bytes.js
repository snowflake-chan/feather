"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuBytes = void 0;
class MuBytes {
    constructor(identity) {
        this.muType = 'bytes';
        this.pool = {};
        if (identity) {
            this.identity = identity.slice();
        }
        else {
            this.identity = new Uint8Array(1);
        }
        this.json = {
            type: 'bytes',
            identity: `[${(Array.prototype.slice.call(this.identity).join())}]`,
        };
    }
    _allocBytes(length) {
        return (this.pool[length] && this.pool[length].pop()) || new Uint8Array(length);
    }
    alloc() {
        return this._allocBytes(this.identity.length);
    }
    free(bytes) {
        const length = bytes.length;
        if (!this.pool[length]) {
            this.pool[length] = [];
        }
        this.pool[length].push(bytes);
    }
    equal(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = a.length - 1; i >= 0; --i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    clone(bytes) {
        const copy = this._allocBytes(bytes.length);
        copy.set(bytes);
        return copy;
    }
    assign(dst, src) {
        if (dst.length !== src.length) {
            throw new Error('dst and src are of different lengths');
        }
        dst.set(src);
        return dst;
    }
    diff(base, target, out) {
        const length = target.length;
        out.grow(5 + length);
        out.writeVarint(length);
        out.buffer.uint8.set(target, out.offset);
        out.offset += length;
        return true;
    }
    patch(base, inp) {
        const length = inp.readVarint();
        const target = this._allocBytes(length);
        const bytes = inp.buffer.uint8.subarray(inp.offset, inp.offset += length);
        target.set(bytes);
        return target;
    }
    toJSON(bytes) {
        const arr = new Array(bytes.length);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = bytes[i];
        }
        return arr;
    }
    fromJSON(x) {
        if (Array.isArray(x)) {
            const bytes = this._allocBytes(x.length);
            bytes.set(x);
            return bytes;
        }
        return this.clone(this.identity);
    }
}
exports.MuBytes = MuBytes;
//# sourceMappingURL=bytes.js.map