"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuVector = void 0;
const muTypeToTypedArray = {
    float32: Float32Array,
    float64: Float64Array,
    int8: Int8Array,
    int16: Int16Array,
    int32: Int32Array,
    uint8: Uint8Array,
    uint16: Uint16Array,
    uint32: Uint32Array,
};
class MuVector {
    stats() {
        return {
            allocCount: this.allocCount,
            freeCount: this.freeCount,
            poolSize: this.pool.length,
        };
    }
    constructor(schema, dimension) {
        this.muType = 'vector';
        this.allocCount = 0;
        this.freeCount = 0;
        this.pool = [];
        this.muData = schema;
        this.dimension = dimension;
        this.TypedArray = muTypeToTypedArray[schema.muType];
        this.identity = new this.TypedArray(dimension);
        for (let i = 0; i < dimension; ++i) {
            this.identity[i] = schema.identity;
        }
        this.json = {
            type: 'vector',
            valueType: schema.json,
            dimension,
        };
        this.__b = new this.TypedArray(dimension);
        this.__t = new this.TypedArray(dimension);
        this._b = new Uint8Array(this.__b.buffer);
        this._t = new Uint8Array(this.__t.buffer);
    }
    alloc() {
        this.allocCount++;
        return this.pool.pop() || new this.TypedArray(this.dimension);
    }
    free(vec) {
        this.freeCount++;
        this.pool.push(vec);
    }
    equal(a, b) {
        if (!(a instanceof this.TypedArray) || !(b instanceof this.TypedArray)) {
            return false;
        }
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
    clone(vec) {
        const copy = this.alloc();
        copy.set(vec);
        return copy;
    }
    assign(dst, src) {
        dst.set(src);
        return dst;
    }
    diff(base, target, out) {
        this.__b.set(base);
        this.__t.set(target);
        const byteLength = this.identity.byteLength;
        out.grow(Math.ceil(byteLength * 9 / 8));
        const head = out.offset;
        let trackerOffset = head;
        out.offset += Math.ceil(byteLength / 8);
        let tracker = 0;
        let numPatches = 0;
        for (let i = 0; i < byteLength; ++i) {
            if (this._b[i] !== this._t[i]) {
                out.writeUint8(this._t[i]);
                tracker |= 1 << (i & 7);
                ++numPatches;
            }
            if ((i & 7) === 7) {
                out.writeUint8At(trackerOffset++, tracker);
                tracker = 0;
            }
        }
        if (numPatches === 0) {
            out.offset = head;
            return false;
        }
        if (byteLength & 7) {
            out.writeUint8At(trackerOffset, tracker);
        }
        return true;
    }
    patch(base, inp) {
        const head = inp.offset;
        const numTrackerBits = this.dimension * this.identity.BYTES_PER_ELEMENT;
        const numTrackerFullBytes = Math.floor(numTrackerBits / 8);
        const numTrackerBytes = Math.ceil(numTrackerBits / 8);
        inp.offset = head + numTrackerBytes;
        this.__b.set(base);
        for (let i = 0; i < numTrackerFullBytes; ++i) {
            const start = i * 8;
            const tracker = inp.readUint8At(head + i);
            for (let j = 0; j < 8; ++j) {
                if (tracker & (1 << j)) {
                    this._b[start + j] = inp.readUint8();
                }
            }
        }
        if (numTrackerBits & 7) {
            const start = numTrackerFullBytes * 8;
            const tracker = inp.readUint8At(head + numTrackerFullBytes);
            const partialBits = numTrackerBits & 7;
            for (let j = 0; j < partialBits; ++j) {
                if (tracker & (1 << j)) {
                    this._b[start + j] = inp.readUint8();
                }
            }
        }
        return this.clone(this.__b);
    }
    toJSON(vec) {
        const arr = new Array(vec.length);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = vec[i];
        }
        return arr;
    }
    fromJSON(x) {
        if (Array.isArray(x)) {
            const vec = this.alloc();
            for (let i = 0; i < vec.length; ++i) {
                vec[i] = this.muData.fromJSON(x[i]);
            }
            return vec;
        }
        return this.clone(this.identity);
    }
}
exports.MuVector = MuVector;
//# sourceMappingURL=vector.js.map