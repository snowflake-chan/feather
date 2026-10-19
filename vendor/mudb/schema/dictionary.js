"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuDictionary = void 0;
const is_primitive_1 = require("./is-primitive");
function assignPrimitive(dst, src) {
    const dKeys = Object.keys(dst);
    const sKeys = Object.keys(src);
    for (let i = 0; i < dKeys.length; ++i) {
        const k = dKeys[i];
        if (!(k in src)) {
            delete dst[k];
        }
    }
    for (let i = 0; i < sKeys.length; ++i) {
        const k = sKeys[i];
        dst[k] = src[k];
    }
    return dst;
}
function assignGeneric(schema) {
    return (dst, src) => {
        const dKeys = Object.keys(dst);
        const sKeys = Object.keys(src);
        for (let i = 0; i < dKeys.length; ++i) {
            const k = dKeys[i];
            if (!(k in src)) {
                schema.free(dst[k]);
                delete dst[k];
            }
        }
        for (let i = 0; i < sKeys.length; ++i) {
            const k = sKeys[i];
            if (k in dst) {
                dst[k] = schema.assign(dst[k], src[k]);
            }
            else {
                dst[k] = schema.clone(src[k]);
            }
        }
        return dst;
    };
}
class MuDictionary {
    stats() {
        return {
            allocCount: this.allocCount,
            freeCount: this.freeCount,
            poolSize: 0,
        };
    }
    constructor(schema, capacity, identity) {
        this.muType = 'dictionary';
        this._isPrimitive = false;
        this.allocCount = 0;
        this.freeCount = 0;
        this.muData = schema;
        this.capacity = capacity;
        this.identity = {};
        if (identity) {
            const keys = Object.keys(identity);
            for (let i = 0; i < keys.length; ++i) {
                const k = keys[i];
                this.identity[k] = schema.clone(identity[k]);
            }
        }
        this.json = {
            type: 'dictionary',
            valueType: schema.json,
            identity: JSON.stringify(this.identity),
        };
        this._isPrimitive = (0, is_primitive_1.isMuPrimitiveType)(schema.muType);
        if (this._isPrimitive) {
            this.assign = assignPrimitive;
        }
        else {
            this.assign = assignGeneric(schema);
        }
    }
    alloc() {
        this.allocCount += 1;
        return {};
    }
    free(dict) {
        this.freeCount += 1;
        if (!this._isPrimitive) {
            const props = Object.keys(dict);
            const schema = this.muData;
            for (let i = 0; i < props.length; ++i) {
                schema.free(dict[props[i]]);
            }
        }
    }
    equal(a, b) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        for (let i = aKeys.length - 1; i >= 0; --i) {
            if (!(aKeys[i] in b)) {
                return false;
            }
        }
        const schema = this.muData;
        for (let i = 0; i < aKeys.length; ++i) {
            const k = aKeys[i];
            if (!schema.equal(a[k], b[k])) {
                return false;
            }
        }
        return true;
    }
    clone(dict) {
        this.allocCount += 1;
        if (this._isPrimitive) {
            return Object.assign({}, dict);
        }
        else {
            const copy = {};
            const keys = Object.keys(dict);
            const schema = this.muData;
            for (let i = 0; i < keys.length; ++i) {
                const k = keys[i];
                copy[k] = schema.clone(dict[k]);
            }
            return copy;
        }
    }
    diff(base, target, out) {
        let numDel = 0;
        let numPatch = 0;
        let numAdd = 0;
        out.grow(12);
        const head = out.offset;
        out.offset += 12;
        const bKeys = Object.keys(base).sort();
        out.grow(5 * bKeys.length);
        for (let i = 0; i < bKeys.length; ++i) {
            if (!(bKeys[i] in target)) {
                ++numDel;
                out.writeVarint(i);
            }
        }
        const tKeys = Object.keys(target);
        const schema = this.muData;
        const newKeys = [];
        for (let i = 0; i < tKeys.length; ++i) {
            const key = tKeys[i];
            if (key in base) {
                const prefix = out.offset;
                out.grow(5);
                out.writeVarint(bKeys.indexOf(key));
                if (schema.diff(base[key], target[key], out)) {
                    ++numPatch;
                }
                else {
                    out.offset = prefix;
                }
            }
            else {
                newKeys.push(key);
            }
        }
        numAdd = newKeys.length;
        const numTrackers = Math.ceil(numAdd / 8);
        out.grow(numTrackers);
        let trackerOffset = out.offset;
        out.offset += numTrackers;
        let tracker = 0;
        for (let i = 0; i < numAdd; ++i) {
            const key = newKeys[i];
            out.writeString(key);
            if (schema.diff(schema.identity, target[key], out)) {
                tracker |= 1 << (i & 7);
            }
            if ((i & 7) === 7) {
                out.writeUint8At(trackerOffset++, tracker);
                tracker = 0;
            }
        }
        if (numAdd & 7) {
            out.writeUint8At(trackerOffset, tracker);
        }
        if (numDel > 0 || numPatch > 0 || numAdd > 0) {
            out.writeUint32At(head, numDel);
            out.writeUint32At(head + 4, numPatch);
            out.writeUint32At(head + 8, numAdd);
            return true;
        }
        out.offset = head;
        return false;
    }
    patch(base, inp) {
        const numDel = inp.readUint32();
        const numPatch = inp.readUint32();
        const numAdd = inp.readUint32();
        const bKeys = Object.keys(base).sort();
        const numTargetProps = bKeys.length - numDel + numAdd;
        if (numTargetProps > this.capacity) {
            throw new Error(`number of target props ${numTargetProps} exceeds capacity ${this.capacity}`);
        }
        const result = {};
        const schema = this.muData;
        const keysToDel = {};
        for (let i = 0; i < numDel; ++i) {
            keysToDel[bKeys[inp.readVarint()]] = true;
        }
        for (let i = 0; i < bKeys.length; ++i) {
            const key = bKeys[i];
            if (!keysToDel[key]) {
                result[key] = schema.clone(base[key]);
            }
        }
        for (let i = 0; i < numPatch; ++i) {
            const idx = inp.readVarint();
            const key = bKeys[idx];
            if (!key) {
                throw new Error(`invalid index of key`);
            }
            result[key] = schema.patch(base[key], inp);
        }
        const numFullTrackers = numAdd / 8 | 0;
        const numTrackers = Math.ceil(numAdd / 8);
        let trackerOffset = inp.offset;
        inp.offset += numTrackers;
        for (let i = 0; i < numFullTrackers; ++i) {
            const tracker = inp.readUint8At(trackerOffset++);
            for (let j = 0; j < 8; ++j) {
                result[inp.readString()] = tracker & (1 << j) ?
                    schema.patch(schema.identity, inp) :
                    schema.clone(schema.identity);
            }
        }
        if (numAdd & 7) {
            const tracker = inp.readUint8At(trackerOffset);
            for (let i = 0; i < (numAdd & 7); ++i) {
                result[inp.readString()] = tracker & (1 << i) ?
                    schema.patch(schema.identity, inp) :
                    schema.clone(schema.identity);
            }
        }
        this.allocCount += 1;
        return result;
    }
    toJSON(dict) {
        const json = {};
        const keys = Object.keys(dict);
        const schema = this.muData;
        for (let i = 0; i < keys.length; ++i) {
            const k = keys[i];
            json[k] = schema.toJSON(dict[k]);
        }
        return json;
    }
    fromJSON(x) {
        this.allocCount += 1;
        if (Object.prototype.toString.call(x) === '[object Object]') {
            const dict = {};
            const keys = Object.keys(x);
            const schema = this.muData;
            for (let i = 0; i < keys.length; ++i) {
                const k = keys[i];
                dict[k] = schema.fromJSON(x[k]);
            }
            return dict;
        }
        return this.clone(this.identity);
    }
}
exports.MuDictionary = MuDictionary;
//# sourceMappingURL=dictionary.js.map