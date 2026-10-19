"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const stream_1 = require("../../stream");
const index_1 = require("../index");
test('guarding array.patch()', (t) => {
    const infiniteArray = new index_1.MuArray(new index_1.MuFloat32(), Infinity);
    const out = new stream_1.MuWriteStream(1);
    infiniteArray.diff([], [1], out);
    infiniteArray.diff([], [1, 2, 3], out);
    infiniteArray.diff([], [1, 2, 3, 4], out);
    const finiteArray = new index_1.MuArray(new index_1.MuFloat32(), 3);
    const inp = new stream_1.MuReadStream(out.buffer.uint8);
    t.doesNotThrow(() => finiteArray.patch([], inp));
    t.doesNotThrow(() => finiteArray.patch([], inp));
    t.throws(() => finiteArray.patch([], inp), RangeError);
    t.end();
});
test('guarding sortedArray.patch()', (t) => {
    const infiniteSortedArray = new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity);
    const out = new stream_1.MuWriteStream(1);
    infiniteSortedArray.diff([], [1], out);
    infiniteSortedArray.diff([], [1, 2, 3], out);
    infiniteSortedArray.diff([], [1, 2, 3, 4], out);
    const finiteSortedArray = new index_1.MuSortedArray(new index_1.MuFloat32(), 3);
    const inp = new stream_1.MuReadStream(out.buffer.uint8);
    t.doesNotThrow(() => finiteSortedArray.patch([], inp));
    t.doesNotThrow(() => finiteSortedArray.patch([], inp));
    t.throws(() => finiteSortedArray.patch([], inp), RangeError);
    t.end();
});
test('guarding dictionary.patch()', (t) => {
    const infiniteDictionary = new index_1.MuDictionary(new index_1.MuFloat32(), Infinity);
    const out = new stream_1.MuWriteStream(1);
    infiniteDictionary.diff({}, { a: 0, b: 0, c: 0, d: 0 }, out);
    const finiteDictionary = new index_1.MuDictionary(new index_1.MuFloat32(), 3);
    const inp = new stream_1.MuReadStream(out.buffer.uint8);
    t.throws(() => finiteDictionary.patch({}, inp), Error);
    t.end();
});
//# sourceMappingURL=capacity.js.map