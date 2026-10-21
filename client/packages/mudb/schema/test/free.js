"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const index_1 = require("../index");
const trace_1 = require("../trace");
test('schema.free()', (t) => {
    const arrayTrace = new trace_1.MuSchemaTrace(new index_1.MuArray(new index_1.MuFloat32(), Infinity));
    const array = new index_1.MuArray(arrayTrace, Infinity);
    const a = array.alloc();
    a.push(arrayTrace.alloc());
    array.free(a);
    t.equal(arrayTrace.freeCount, 1, 'array schema should call free() on subtype');
    const sortedArrayTrace = new trace_1.MuSchemaTrace(new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity));
    const sortedArray = new index_1.MuSortedArray(sortedArrayTrace, Infinity);
    const sa = sortedArray.alloc();
    sa.push(sortedArrayTrace.alloc());
    sortedArray.free(sa);
    t.equal(sortedArrayTrace.freeCount, 1, 'sorted array schema should call free() on subtype');
    const structTrace = new trace_1.MuSchemaTrace(new index_1.MuStruct({ f: new index_1.MuFloat32() }));
    const struct = new index_1.MuStruct({ s: structTrace });
    const s = struct.alloc();
    struct.free(s);
    t.equal(structTrace.freeCount, 1, 'struct schema should call free() on subtype');
    const vectorTrace = new trace_1.MuSchemaTrace(new index_1.MuVector(new index_1.MuFloat32(), 3));
    const union = new index_1.MuUnion({
        v: vectorTrace,
    }, 'v');
    const u = union.alloc();
    union.free(u);
    t.equal(vectorTrace.freeCount, 1, 'union schema should call free() on subtype');
    const vectorTrace2 = new trace_1.MuSchemaTrace(new index_1.MuVector(new index_1.MuFloat32(), 3));
    const option = new index_1.MuOption(vectorTrace2);
    const o = option.alloc();
    option.free(o);
    t.equal(vectorTrace2.freeCount, 1, 'option schema should call free() on subtype');
    t.doesNotThrow(() => { option.free(undefined); }, 'option schema can call free on undefined');
    const dictionaryTrace = new trace_1.MuSchemaTrace(new index_1.MuDictionary(new index_1.MuFloat32(), Infinity));
    const dictionary = new index_1.MuDictionary(dictionaryTrace, Infinity);
    const d = dictionary.alloc();
    d.d = dictionaryTrace.alloc();
    dictionary.free(d);
    t.equal(dictionaryTrace.freeCount, 1, 'dictionary schema should call free() on subtype');
    t.end();
});
test('bytes.free()', (t) => {
    const bytes = new index_1.MuBytes();
    bytes.free(new Uint8Array(1));
    bytes.free(new Uint8Array(2));
    bytes.free(new Uint8Array(2));
    t.equal(bytes.pool[1].length, 1);
    t.equal(bytes.pool[2].length, 2);
    t.end();
});
//# sourceMappingURL=free.js.map