"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRefSchema = void 0;
const _noSerialize = () => {
    throw new Error('cannot serialize references');
};
class MuRefSchema {
    constructor() {
        this.identity = null;
        this.muType = 'ref';
        this.muData = { type: 'ref' };
        this.json = { type: 'ref' };
        this.diff = _noSerialize;
        this.patch = _noSerialize;
        this.toJSON = _noSerialize;
        this.fromJSON = _noSerialize;
    }
    alloc() {
        return null;
    }
    free() { }
    assign(dst, src) {
        return src;
    }
    clone(x) {
        return x;
    }
    equal(a, b) {
        return a === b;
    }
}
exports.MuRefSchema = MuRefSchema;
