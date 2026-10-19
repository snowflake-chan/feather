"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuArray = void 0;
const is_primitive_1 = require("./is-primitive");
function assignPrimitive(dst, src) {
    const N = src.length;
    const M = dst.length;
    const L = Math.min(M, N);
    for (let i = 0; i < L; ++i) {
        dst[i] = src[i];
    }
    for (let i = M; i < N; ++i) {
        dst.push(src[i]);
    }
    dst.length = N;
    return dst;
}
function clonePrimitive(src) {
    this.allocCount += 1;
    return src.slice();
}
function equalPrimitive(a, b) {
    const N = a.length;
    const M = b.length;
    if (N !== M) {
        return false;
    }
    for (let i = 0; i < N; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
function toJSONPrimitive(a) {
    return a.slice();
}
function assignGeneric(schema) {
    return function (dst, src) {
        const N = src.length;
        const M = dst.length;
        const L = Math.min(M, N);
        for (let i = 0; i < L; ++i) {
            dst[i] = schema.assign(dst[i], src[i]);
        }
        for (let i = M; i < N; ++i) {
            dst.push(schema.clone(src[i]));
        }
        for (let i = N; i < M; ++i) {
            schema.free(dst[i]);
        }
        dst.length = N;
        return dst;
    };
}
function cloneGeneric(schema) {
    return function (src) {
        this.allocCount += 1;
        const result = src.slice();
        for (let i = 0; i < result.length; ++i) {
            result[i] = schema.clone(result[i]);
        }
        return result;
    };
}
function freeGeneric(schema) {
    return function (src) {
        this.freeCount += 1;
        for (let i = 0; i < src.length; ++i) {
            schema.free(src[i]);
        }
        src.length = 0;
    };
}
function equalGeneric(schema) {
    return function (a, b) {
        const N = a.length;
        const M = b.length;
        if (N !== M) {
            return false;
        }
        for (let i = 0; i < N; ++i) {
            if (!schema.equal(a[i], b[i])) {
                return false;
            }
        }
        return true;
    };
}
function toJSONGeneric(schema) {
    return function (arr) {
        const result = new Array(arr.length);
        for (let i = 0; i < arr.length; ++i) {
            result[i] = schema.toJSON(arr[i]);
        }
        return result;
    };
}
class MuArray {
    stats() {
        return {
            allocCount: this.allocCount,
            freeCount: this.freeCount,
            poolSize: 0,
        };
    }
    constructor(schema, capacity, identity) {
        this.muType = 'array';
        this.allocCount = 0;
        this.freeCount = 0;
        this.muData = schema;
        this.capacity = capacity;
        if (identity) {
            const copy = this.identity = identity.slice();
            for (let i = 0; i < copy.length; ++i) {
                copy[i] = schema.clone(copy[i]);
            }
        }
        else {
            this.identity = [];
        }
        this.json = {
            type: 'array',
            valueType: schema.json,
            identity: JSON.stringify(this.identity),
        };
        if ((0, is_primitive_1.isMuPrimitiveType)(schema.muType)) {
            this.assign = assignPrimitive;
            this.clone = clonePrimitive;
            this.free = function (x) {
                this.freeCount += 1;
                x.length = 0;
            };
            this.equal = equalPrimitive;
            this.toJSON = toJSONPrimitive;
        }
        else {
            this.assign = assignGeneric(schema);
            this.clone = cloneGeneric(schema);
            this.free = freeGeneric(schema);
            this.equal = equalGeneric(schema);
            this.toJSON = toJSONGeneric(schema);
        }
    }
    alloc() {
        this.allocCount += 1;
        return [];
    }
    diff(base, target, out) {
        const tLeng = target.length;
        const numTrackers = Math.ceil(tLeng / 8);
        out.grow(4 + numTrackers);
        const head = out.offset;
        out.writeVarint(tLeng);
        let trackerOffset = out.offset;
        out.offset += numTrackers;
        let tracker = 0;
        let numPatches = 0;
        const bLeng = base.length;
        const schema = this.muData;
        for (let i = 0; i < Math.min(bLeng, tLeng); ++i) {
            if (schema.diff(base[i], target[i], out)) {
                tracker |= 1 << (i & 7);
                ++numPatches;
            }
            if ((i & 7) === 7) {
                out.writeUint8At(trackerOffset++, tracker);
                tracker = 0;
            }
        }
        for (let i = bLeng; i < tLeng; ++i) {
            if (schema.diff(schema.identity, target[i], out)) {
                tracker |= 1 << (i & 7);
                ++numPatches;
            }
            if ((i & 7) === 7) {
                out.writeUint8At(trackerOffset++, tracker);
                tracker = 0;
            }
        }
        if (tLeng & 7) {
            out.writeUint8At(trackerOffset, tracker);
        }
        if (numPatches > 0 || bLeng !== tLeng) {
            return true;
        }
        out.offset = head;
        return false;
    }
    patch(base, inp) {
        const tLeng = inp.readVarint();
        if (tLeng > this.capacity) {
            throw new RangeError(`target length ${tLeng} exceeds capacity ${this.capacity}`);
        }
        const bLeng = base.length;
        const L = Math.min(bLeng, tLeng);
        const numTrackers = Math.ceil(tLeng / 8);
        let trackerOffset = inp.offset;
        inp.offset += numTrackers;
        this.allocCount += 1;
        const result = base.slice();
        const schema = this.muData;
        result.length = L;
        let tracker = 0;
        for (let i = 0; i < L; ++i) {
            const mod8 = i & 7;
            if (!mod8) {
                tracker = inp.readUint8At(trackerOffset++);
            }
            if ((1 << mod8) & tracker) {
                result[i] = schema.patch(base[i], inp);
            }
            else {
                result[i] = schema.clone(base[i]);
            }
        }
        for (let i = bLeng; i < tLeng; ++i) {
            const mod8 = i & 7;
            if (!mod8) {
                tracker = inp.readUint8At(trackerOffset++);
            }
            if ((1 << mod8) & tracker) {
                result.push(schema.patch(schema.identity, inp));
            }
            else {
                result.push(schema.clone(schema.identity));
            }
        }
        return result;
    }
    fromJSON(x) {
        if (Array.isArray(x)) {
            const arr = new Array(x.length);
            const schema = this.muData;
            for (let i = 0; i < x.length; ++i) {
                arr[i] = schema.fromJSON(x[i]);
            }
            this.allocCount += 1;
            return arr;
        }
        return this.clone(this.identity);
    }
}
exports.MuArray = MuArray;
//# sourceMappingURL=array.js.map