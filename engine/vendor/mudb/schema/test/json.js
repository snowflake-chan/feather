"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const index_1 = require("../index");
const random_1 = require("../../util/random");
test('primitive.toJSON()', (t) => {
    const bool = new index_1.MuBoolean();
    t.equal(bool.toJSON(false), false);
    t.equal(bool.toJSON(true), true);
    const utf8 = new index_1.MuUTF8();
    t.equal(utf8.toJSON(''), '');
    t.equal(utf8.toJSON('Iñtërnâtiônàlizætiøn☃💩'), 'Iñtërnâtiônàlizætiøn☃💩');
    const float32 = new index_1.MuFloat32();
    t.equal(float32.toJSON(0), 0);
    t.equal(float32.toJSON(0.5), 0.5);
    t.end();
});
test('primitive.fromJSON()', (t) => {
    const bool = new index_1.MuBoolean();
    t.equal(bool.fromJSON(bool.toJSON(false)), false);
    t.equal(bool.fromJSON(bool.toJSON(true)), true);
    const utf8 = new index_1.MuUTF8();
    t.equal(utf8.fromJSON(utf8.toJSON('')), '');
    t.equal(utf8.fromJSON(utf8.toJSON('Iñtërnâtiônàlizætiøn☃💩')), 'Iñtërnâtiônàlizætiøn☃💩');
    const float32 = new index_1.MuFloat32();
    t.equal(float32.fromJSON(float32.toJSON(0)), 0);
    t.equal(float32.fromJSON(float32.toJSON(0.5)), 0.5);
    t.end();
});
test('primitive.fromJSON() with bad input', (t) => {
    const bool = new index_1.MuBoolean(true);
    t.equal(bool.fromJSON(undefined), true);
    t.equal(bool.fromJSON(null), true);
    t.equal(bool.fromJSON(0), true);
    t.equal(bool.fromJSON(''), true);
    t.equal(bool.fromJSON('false'), true);
    t.equal(bool.fromJSON([]), true);
    const float32 = new index_1.MuFloat32(0.5);
    t.equal(float32.fromJSON(undefined), 0.5);
    t.equal(float32.fromJSON(null), 0.5);
    t.equal(float32.fromJSON(false), 0.5);
    t.equal(float32.fromJSON(true), 0.5);
    t.equal(float32.fromJSON('1e3'), 0.5);
    t.equal(float32.fromJSON('1.1.1'), 0.5);
    t.equal(float32.fromJSON({}), 0.5);
    const utf8 = new index_1.MuUTF8('Iñtërnâtiônàlizætiøn☃💩');
    t.equal(utf8.fromJSON(undefined), 'Iñtërnâtiônàlizætiøn☃💩');
    t.equal(utf8.fromJSON(null), 'Iñtërnâtiônàlizætiøn☃💩');
    t.equal(utf8.fromJSON(false), 'Iñtërnâtiônàlizætiøn☃💩');
    t.equal(utf8.fromJSON(123), 'Iñtërnâtiônàlizætiøn☃💩');
    t.equal(utf8.fromJSON({}), 'Iñtërnâtiônàlizætiøn☃💩');
    t.end();
});
test('array.toJSON()', (t) => {
    const array = new index_1.MuArray(new index_1.MuFloat32(), Infinity);
    const a = array.alloc();
    t.notEqual(array.toJSON(a), a);
    t.deepEqual(array.toJSON(a), a);
    for (let i = 0; i < 1e3; ++i) {
        a.push((0, random_1.randFloat32)());
    }
    t.notEqual(array.toJSON(a), a);
    t.deepEqual(array.toJSON(a), a);
    t.end();
});
test('array.fromJSON()', (t) => {
    const array = new index_1.MuArray(new index_1.MuFloat32(), Infinity);
    const a = array.alloc();
    const j1 = array.toJSON(a);
    t.notEqual(array.fromJSON(j1), j1);
    t.deepEqual(array.fromJSON(j1), a);
    for (let i = 0; i < 1e3; ++i) {
        a.push((0, random_1.randFloat32)());
    }
    const j2 = array.toJSON(a);
    t.notEqual(array.fromJSON(j2), j2);
    t.deepEqual(array.fromJSON(j2), a);
    t.end();
});
test('array.toJSON()', (t) => {
    const vector = new index_1.MuVector(new index_1.MuFloat32(), 1e3);
    const array = new index_1.MuArray(vector, Infinity);
    const a1 = new Array(10);
    const a2 = new Array(a1.length);
    for (let i = 0; i < a1.length; ++i) {
        a1[i] = vector.alloc();
        a2[i] = new Array(vector.dimension);
        for (let j = 0; j < a1[i].length; ++j) {
            a2[i][j] = a1[i][j] = (0, random_1.randFloat32)();
        }
    }
    t.deepEqual(array.toJSON(a1), a2);
    t.end();
});
test('array.fromJSON()', (t) => {
    const vector = new index_1.MuVector(new index_1.MuFloat32(), 1e3);
    const array = new index_1.MuArray(vector, Infinity);
    const a1 = new Array(10);
    for (let i = 0; i < a1.length; ++i) {
        a1[i] = vector.alloc();
        for (let j = 0; j < a1[i].length; ++j) {
            a1[i][j] = (0, random_1.randFloat32)();
        }
    }
    const a2 = array.fromJSON(array.toJSON(a1));
    t.equal(a2.length, a1.length);
    t.true(a2[0] instanceof Float32Array);
    t.deepEqual(a2, a1);
    t.end();
});
test('sorted.toJSON()', (t) => {
    const sorted = new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity);
    const s = sorted.alloc();
    t.notEqual(sorted.toJSON(s), s);
    t.deepEqual(sorted.toJSON(s), s);
    for (let i = 0; i < 1e3; ++i) {
        s.push((0, random_1.randFloat32)());
    }
    t.notEqual(sorted.toJSON(s), s);
    t.deepEqual(sorted.toJSON(s), s);
    t.end();
});
test('sorted.fromJSON()', (t) => {
    const sorted = new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity);
    const s = sorted.alloc();
    const j1 = sorted.toJSON(s);
    t.notEqual(sorted.fromJSON(j1), j1);
    t.deepEqual(sorted.fromJSON(j1), s);
    for (let i = 0; i < 1e3; ++i) {
        s.push((0, random_1.randFloat32)());
    }
    const j2 = sorted.toJSON(s);
    t.notEqual(sorted.fromJSON(j2), j2);
    t.deepEqual(sorted.fromJSON(j2), s);
    t.end();
});
test('struct.toJSON()', (t) => {
    const float32 = new index_1.MuFloat32();
    const vector = new index_1.MuVector(float32, 1e3);
    const struct = new index_1.MuStruct({
        f: float32,
        v: vector,
    });
    const s = struct.alloc();
    t.true(Array.isArray(struct.toJSON(s).v));
    t.deepEqual(struct.toJSON(s), {
        f: float32.toJSON(float32.alloc()),
        v: vector.toJSON(vector.alloc()),
    });
    const o = {};
    o.f = s.f = (0, random_1.randFloat32)();
    o.v = new Array(s.v.length);
    for (let i = 0; i < s.v.length; ++i) {
        o.v[i] = s.v[i] = (0, random_1.randFloat32)();
    }
    t.deepEqual(struct.toJSON(s), o);
    t.end();
});
test('struct.fromJSON()', (t) => {
    const float32 = new index_1.MuFloat32();
    const vector = new index_1.MuVector(float32, 1e3);
    const struct = new index_1.MuStruct({
        f: float32,
        v: vector,
    });
    const s1 = struct.alloc();
    s1.f = (0, random_1.randFloat32)();
    for (let i = 0; i < s1.v.length; ++i) {
        s1.v[i] = (0, random_1.randFloat32)();
    }
    const s2 = struct.fromJSON(struct.toJSON(s1));
    t.true(s2.v instanceof Float32Array);
    t.deepEqual(s2, s1);
    t.end();
});
test('union.toJSON()', (t) => {
    const union = new index_1.MuUnion({
        f: new index_1.MuFloat32(),
        v: new index_1.MuVector(new index_1.MuFloat32(), 1e3),
    }, 'f');
    const u = union.alloc();
    u.data = (0, random_1.randFloat32)();
    t.notEqual(union.toJSON(u), u);
    t.deepEqual(union.toJSON(u), u);
    u.type = 'v';
    u.data = union.muData[u.type].alloc();
    const a = new Array(u.data.length);
    for (let i = 0; i < u.data.length; ++i) {
        a[i] = u.data[i] = (0, random_1.randFloat32)();
    }
    t.true(Array.isArray(union.toJSON(u).data));
    t.deepEqual(union.toJSON(u), {
        type: u.type,
        data: a,
    });
    t.end();
});
test('union.fromJSON()', (t) => {
    const union = new index_1.MuUnion({
        f: new index_1.MuFloat32(),
        v: new index_1.MuVector(new index_1.MuFloat32(), 1e3),
    }, 'v');
    const u1 = union.alloc();
    for (let i = 0; i < 1e3; ++i) {
        u1.data[i] = (0, random_1.randFloat32)();
    }
    const u2 = union.fromJSON(union.toJSON(u1));
    t.true(u2.data instanceof Float32Array);
    t.deepEqual(u2, u1);
    t.end();
});
test('bytes.toJSON()', (t) => {
    const bytes = new index_1.MuBytes();
    const a = new Array(100);
    for (let i = 0; i < a.length; ++i) {
        a[i] = (0, random_1.randUint8)();
    }
    const b = new Uint8Array(a);
    t.deepEqual(bytes.toJSON(b), a);
    t.end();
});
test('bytes.fromJSON()', (t) => {
    const bytes = new index_1.MuBytes();
    const b = new Uint8Array(100);
    for (let i = 0; i < b.length; ++i) {
        b[i] = (0, random_1.randUint8)();
    }
    t.deepEqual(bytes.fromJSON(bytes.toJSON(b)), b);
    t.end();
});
test('dictionary.toJSON()', (t) => {
    const dictionary = new index_1.MuDictionary(new index_1.MuFloat32(), Infinity);
    const d = dictionary.alloc();
    t.notEqual(dictionary.toJSON(d), d);
    t.deepEqual(dictionary.toJSON(d), d);
    let code = 97;
    for (let i = 0; i < 26; ++i) {
        d[String.fromCharCode(code++)] = (0, random_1.randFloat32)();
    }
    t.notEqual(dictionary.toJSON(d), d);
    t.deepEqual(dictionary.toJSON(d), d);
    t.end();
});
test('dictionary.fromJSON()', (t) => {
    const dictionary = new index_1.MuDictionary(new index_1.MuFloat32(), Infinity);
    const d = dictionary.alloc();
    const j1 = dictionary.toJSON(d);
    t.notEqual(dictionary.fromJSON(j1), j1);
    t.deepEqual(dictionary.fromJSON(j1), d);
    let code = 97;
    for (let i = 0; i < 26; ++i) {
        d[String.fromCharCode(code++)] = (0, random_1.randFloat32)();
    }
    const j2 = dictionary.toJSON(d);
    t.notEqual(dictionary.fromJSON(j2), j2);
    t.deepEqual(dictionary.fromJSON(j2), d);
    t.end();
});
test('vector.toJSON()', (t) => {
    const vector = new index_1.MuVector(new index_1.MuFloat32(), 1e3);
    const v = vector.alloc();
    const a = new Array(v.length);
    for (let i = 0; i < a.length; ++i) {
        a[i] = v[i] = (0, random_1.randFloat32)();
    }
    t.deepEqual(vector.toJSON(v), a);
    t.end();
});
test('vector.fromJSON()', (t) => {
    const vector = new index_1.MuVector(new index_1.MuFloat32(), 1e3);
    const v1 = vector.alloc();
    for (let i = 0; i < v1.length; ++i) {
        v1[i] = (0, random_1.randFloat32)();
    }
    const v2 = vector.fromJSON(vector.toJSON(v1));
    t.true(v2 instanceof Float32Array);
    t.deepEqual(v2, v1);
    t.end();
});
test('date.toJSON()', (t) => {
    const date = new index_1.MuDate();
    const d = date.alloc();
    t.equal(date.toJSON(d), d.toISOString());
    t.end();
});
test('date.fromJSON()', (t) => {
    const date = new index_1.MuDate();
    const d = date.alloc();
    t.deepEqual(date.fromJSON(date.toJSON(d)), d);
    t.notEqual(date.fromJSON(date.toJSON(d)), d);
    t.end();
});
test('json.toJSON()', (t) => {
    const json = new index_1.MuJSON();
    const o = {};
    t.equal(json.toJSON(o), o);
    t.end();
});
test('json.fromJSON()', (t) => {
    const json = new index_1.MuJSON();
    const o = {};
    t.equal(json.fromJSON(json.toJSON(o)), o);
    const o2 = { a: 1234 };
    t.equal(json.fromJSON(json.toJSON(o2)), o2);
    t.end();
});
test('option.toJSON()', (t) => {
    const op = new index_1.MuOption(new index_1.MuFloat32());
    const of = new index_1.MuOption(new index_1.MuStruct({ op: op }));
    t.equal(op.toJSON(undefined), undefined);
    t.equal(op.toJSON(4), 4);
    t.equal(of.toJSON(undefined), undefined);
    t.deepEqual(of.toJSON({ op: undefined }), { op: undefined });
    t.deepEqual(of.toJSON({ op: 4 }), { op: 4 });
    t.end();
});
test('option.fromJSON()', (t) => {
    const op = new index_1.MuOption(new index_1.MuFloat32());
    const of = new index_1.MuOption(new index_1.MuStruct({ op: op }));
    t.equal(op.fromJSON(op.toJSON(undefined)), undefined);
    t.equal(op.fromJSON(op.toJSON(4)), 4);
    t.equal(of.fromJSON(of.toJSON(undefined)), undefined);
    t.deepEqual(of.fromJSON(of.toJSON({ op: undefined })), { op: undefined });
    t.deepEqual(of.fromJSON(of.toJSON({ op: 4 })), { op: 4 });
    t.end();
});
test('nonPrimitive.fromJSON() with bad input', (t) => {
    const array = new index_1.MuArray(new index_1.MuFloat32(1), Infinity, [1, 2, 3]);
    const bytes = new index_1.MuBytes(new Uint8Array([1, 2, 3]));
    const date = new index_1.MuDate();
    const dictionary = new index_1.MuDictionary(new index_1.MuFloat32(1), Infinity, { e: Math.E });
    const json = new index_1.MuJSON({ foo: 'bar' });
    const sorted = new index_1.MuSortedArray(new index_1.MuFloat32(1), Infinity, undefined, [0.5, 1, 1.5]);
    const struct = new index_1.MuStruct({
        foo: new index_1.MuFloat32(1),
        bar: new index_1.MuUTF8('bar'),
    });
    const union = new index_1.MuUnion({
        f: new index_1.MuFloat32(1),
        u: new index_1.MuUTF8('foo'),
    }, 'u');
    const vector = new index_1.MuVector(new index_1.MuFloat32(1), 2);
    t.notEqual(array.fromJSON(undefined), array.identity);
    t.deepEqual(array.fromJSON(undefined), array.identity);
    t.deepEqual(array.fromJSON(null), array.identity);
    t.deepEqual(array.fromJSON(false), array.identity);
    t.deepEqual(array.fromJSON(0), array.identity);
    t.deepEqual(array.fromJSON('foo'), array.identity);
    t.deepEqual(array.fromJSON({}), array.identity);
    t.deepEqual(array.fromJSON(['', {}]), [1, 1]);
    t.notEqual(bytes.fromJSON(undefined), bytes.identity);
    t.deepEqual(bytes.fromJSON(undefined), bytes.identity);
    t.deepEqual(bytes.fromJSON(null), bytes.identity);
    t.deepEqual(bytes.fromJSON(false), bytes.identity);
    t.deepEqual(bytes.fromJSON(0), bytes.identity);
    t.deepEqual(bytes.fromJSON('bar'), bytes.identity);
    t.deepEqual(bytes.fromJSON({}), bytes.identity);
    t.deepEqual(bytes.fromJSON(['', {}]), new Uint8Array([0, 0]));
    t.notEqual(date.fromJSON(undefined), date.identity);
    t.deepEqual(date.fromJSON(undefined), date.identity);
    t.deepEqual(date.fromJSON(null), date.identity);
    t.deepEqual(date.fromJSON(false), date.identity);
    t.equal(date.fromJSON('baz').toString(), 'Invalid Date');
    t.deepEqual(date.fromJSON([]), date.identity);
    t.deepEqual(date.fromJSON({}), date.identity);
    t.notEqual(dictionary.fromJSON(undefined), dictionary.identity);
    t.deepEqual(dictionary.fromJSON(undefined), dictionary.identity);
    t.deepEqual(dictionary.fromJSON(null), dictionary.identity);
    t.deepEqual(dictionary.fromJSON(false), dictionary.identity);
    t.deepEqual(dictionary.fromJSON(0), dictionary.identity);
    t.deepEqual(dictionary.fromJSON('qux'), dictionary.identity);
    t.deepEqual(dictionary.fromJSON([]), dictionary.identity);
    t.deepEqual(dictionary.fromJSON({ a: '', b: {} }), { a: 1, b: 1 });
    t.notEqual(json.fromJSON(undefined), json.identity);
    t.deepEqual(json.fromJSON(undefined), json.identity);
    t.deepEqual(json.fromJSON(null), json.identity);
    t.deepEqual(json.fromJSON(false), json.identity);
    t.deepEqual(json.fromJSON(0), json.identity);
    t.deepEqual(json.fromJSON('quux'), json.identity);
    t.notEqual(sorted.fromJSON(undefined), sorted.identity);
    t.deepEqual(sorted.fromJSON(undefined), sorted.identity);
    t.deepEqual(sorted.fromJSON(null), sorted.identity);
    t.deepEqual(sorted.fromJSON(false), sorted.identity);
    t.deepEqual(sorted.fromJSON(0), sorted.identity);
    t.deepEqual(sorted.fromJSON('foo'), sorted.identity);
    t.deepEqual(sorted.fromJSON({}), sorted.identity);
    t.deepEqual(sorted.fromJSON(['', {}]), [1, 1]);
    t.notEqual(struct.fromJSON(undefined), struct.identity);
    t.deepEqual(struct.fromJSON(undefined), struct.identity);
    t.deepEqual(struct.fromJSON(null), struct.identity);
    t.deepEqual(struct.fromJSON(false), struct.identity);
    t.deepEqual(struct.fromJSON(0), struct.identity);
    t.deepEqual(struct.fromJSON('bar'), struct.identity);
    t.deepEqual(struct.fromJSON([]), struct.identity);
    t.deepEqual(struct.fromJSON({ qux: 'foo', quux: {} }), { foo: 1, bar: 'bar' });
    t.notEqual(union.fromJSON(undefined), union.identity);
    t.deepEqual(union.fromJSON(undefined), union.identity);
    t.deepEqual(union.fromJSON(null), union.identity);
    t.deepEqual(union.fromJSON(false), union.identity);
    t.deepEqual(union.fromJSON(0), union.identity);
    t.deepEqual(union.fromJSON('baz'), union.identity);
    t.deepEqual(union.fromJSON({}), union.identity);
    t.deepEqual(union.fromJSON([]), union.identity);
    t.deepEqual(union.fromJSON({ type: 'x' }), union.identity);
    t.deepEqual(union.fromJSON({ type: 'u', data: {} }), { type: 'u', data: 'foo' });
    t.notEqual(vector.fromJSON(undefined), vector.identity);
    t.deepEqual(vector.fromJSON(undefined), vector.identity);
    t.deepEqual(vector.fromJSON(null), vector.identity);
    t.deepEqual(vector.fromJSON(false), vector.identity);
    t.deepEqual(vector.fromJSON(0), vector.identity);
    t.deepEqual(vector.fromJSON('qux'), vector.identity);
    t.deepEqual(vector.fromJSON({}), vector.identity);
    t.deepEqual(vector.fromJSON(['', {}]), new Float32Array([1, 1]));
    t.end();
});
//# sourceMappingURL=json.js.map