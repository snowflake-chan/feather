"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const stringify_1 = require("../stringify");
test('toJSON()', (t) => {
    const now = new Date();
    t.equal((0, stringify_1.stableStringify)(now), `"${now.toJSON()}"`);
    t.equal((0, stringify_1.stableStringify)({ d: now }), `{"d":"${now.toJSON()}"}`);
    t.end();
});
test('undefined & null', (t) => {
    t.equal((0, stringify_1.stableStringify)({ a: 0, b: undefined, c: 1 }), '{"a":0,"c":1}');
    t.equal((0, stringify_1.stableStringify)({ a: 0, b: null, c: 1 }), '{"a":0,"b":null,"c":1}');
    t.equal((0, stringify_1.stableStringify)([0, undefined, 1]), '[0,null,1]');
    t.equal((0, stringify_1.stableStringify)([0, null, 1]), '[0,null,1]');
    t.end();
});
test('NaN & Infinity', (t) => {
    t.equal((0, stringify_1.stableStringify)({ a: 0, b: NaN, c: 1 }), '{"a":0,"b":null,"c":1}');
    t.equal((0, stringify_1.stableStringify)({ a: 0, b: Infinity, c: 1 }), '{"a":0,"b":null,"c":1}');
    t.equal((0, stringify_1.stableStringify)([0, NaN, 1]), '[0,null,1]');
    t.equal((0, stringify_1.stableStringify)([0, Infinity, 1]), '[0,null,1]');
    t.end();
});
test('sorting', (t) => {
    t.equal((0, stringify_1.stableStringify)({}), '{}');
    t.equal((0, stringify_1.stableStringify)([]), '[]');
    const flat = { b: false, ascii: '<a href="https://github.com/mikolalysenko/mudb/">mudb</a>', u: 'Iñtërnâtiônàlizætiøn☃💩', f32: 0.5, n: null };
    t.equal((0, stringify_1.stableStringify)(flat), `{"ascii":${JSON.stringify('<a href="https://github.com/mikolalysenko/mudb/">mudb</a>')},"b":false,"f32":0.5,"n":null,"u":"Iñtërnâtiônàlizætiøn☃💩"}`);
    const nested = { e: {}, a: [], o: { z: { b: { a: 0, c: 0, b: 0 }, a: 0, c: 0 }, a: [{ z: 0, a: [{ c: 0, b: 0, a: 0 }] }] }, f64: -1.5e308, b: true };
    t.equal((0, stringify_1.stableStringify)(nested), '{"a":[],"b":true,"e":{},"f64":-1.5e+308,"o":{"a":[{"a":[{"a":0,"b":0,"c":0}],"z":0}],"z":{"a":0,"b":{"a":0,"b":0,"c":0},"c":0}}}');
    t.end();
});
test('circular references', (t) => {
    const o = { a: 0, z: 1 };
    o['o'] = o;
    t.throws(() => (0, stringify_1.stableStringify)(o), TypeError, 'Converting circular structure to JSON');
    t.end();
});
test('repeated references', (t) => {
    const o = { a: 0 };
    const p = { b: o, c: o };
    t.equal((0, stringify_1.stableStringify)(p), '{"b":{"a":0},"c":{"a":0}}');
    t.end();
});
//# sourceMappingURL=stringify.js.map