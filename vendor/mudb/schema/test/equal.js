"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const index_1 = require("../index");
test('primitive.equal()', (t) => {
    const bool = new index_1.MuBoolean();
    t.true(bool.equal(true, true));
    t.true(bool.equal(false, false));
    t.false(bool.equal(true, false));
    t.false(bool.equal(false, true));
    const utf8 = new index_1.MuUTF8();
    t.true(utf8.equal('', ''));
    t.true(utf8.equal(`<a href="https://github.com/mikolalysenko/mudb/">mudb</a>`, `<a href="https://github.com/mikolalysenko/mudb/">mudb</a>`));
    t.true(utf8.equal('Iñtërnâtiônàlizætiøn☃💩', 'Iñtërnâtiônàlizætiøn☃💩'));
    t.false(utf8.equal('a', 'b'));
    const float32 = new index_1.MuFloat32();
    t.true(float32.equal(0.5, 0.5));
    t.false(float32.equal(0, 1));
    t.end();
});
test('array.equal()', (t) => {
    const array = new index_1.MuArray(new index_1.MuFloat32(), Infinity);
    t.true(array.equal([], []));
    t.true(array.equal([0.5], [0.5]));
    t.true(array.equal([0, 0.5, 1], [0, 0.5, 1]));
    t.false(array.equal([], [0]));
    t.false(array.equal([0, 1], [0]));
    t.false(array.equal([0], [1]));
    t.false(array.equal([0, 0.5, 1], [0, 1, 0.5]));
    const nestedArray = new index_1.MuArray(new index_1.MuArray(new index_1.MuFloat32(), Infinity), Infinity);
    t.true(nestedArray.equal([], []));
    t.true(nestedArray.equal([[]], [[]]));
    t.true(nestedArray.equal([[0.5]], [[0.5]]));
    t.true(nestedArray.equal([[0.5, 0, 1]], [[0.5, 0, 1]]));
    t.true(nestedArray.equal([[0.5, 0, 1], [0, 0.5, 1]], [[0.5, 0, 1], [0, 0.5, 1]]));
    t.false(nestedArray.equal([[]], []));
    t.false(nestedArray.equal([[0]], [[]]));
    t.false(nestedArray.equal([[0, 1]], [[0]]));
    t.false(nestedArray.equal([[1]], [[0]]));
    t.false(nestedArray.equal([[0, 1, 0.5]], [[0, 0.5, 1]]));
    t.false(nestedArray.equal([[0.5, 0, 1], [0, 0.5, 1]], [[0.5, 0, 1]]));
    t.false(nestedArray.equal([[0.5, 0, 1], [0, 0.5, 1]], [[0, 0.5, 1], [0.5, 0, 1]]));
    t.end();
});
test('sortedArray.equal()', (t) => {
    const array = new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity);
    t.true(array.equal([], []));
    t.true(array.equal([0.5], [0.5]));
    t.true(array.equal([0, 0.5, 1], [0, 0.5, 1]));
    t.false(array.equal([], [0]));
    t.false(array.equal([0, 1], [0]));
    t.false(array.equal([0], [1]));
    t.false(array.equal([0, 0.5, 1], [0, 0.5, 1.5]));
    const nestedArray = new index_1.MuSortedArray(new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity), Infinity);
    t.true(nestedArray.equal([], []));
    t.true(nestedArray.equal([[]], [[]]));
    t.true(nestedArray.equal([[0.5]], [[0.5]]));
    t.true(nestedArray.equal([[0, 0.5, 1]], [[0, 0.5, 1]]));
    t.true(nestedArray.equal([[0, 0.5, 1], [0, 0.5, 1]], [[0, 0.5, 1], [0, 0.5, 1]]));
    t.false(nestedArray.equal([[]], []));
    t.false(nestedArray.equal([[0]], [[]]));
    t.false(nestedArray.equal([[0, 1]], [[0]]));
    t.false(nestedArray.equal([[1]], [[0]]));
    t.false(nestedArray.equal([[0, 0.5, 1]], [[0, 0.5, 1.5]]));
    t.false(nestedArray.equal([[0, 0.5, 1], [0, 0.5, 1]], [[0, 0.5, 1]]));
    t.false(nestedArray.equal([[0, 0.5, 1], [0, 0.5, 1]], [[0, 0.5, 1], [0, 0.5, 1.5]]));
    t.end();
});
test('struct.equal()', (t) => {
    const struct = new index_1.MuStruct({
        struct: new index_1.MuStruct({
            ascii: new index_1.MuASCII(),
            fixed: new index_1.MuFixedASCII(1),
            utf8: new index_1.MuUTF8(),
            bool: new index_1.MuBoolean(),
            float32: new index_1.MuFloat32(),
            float64: new index_1.MuFloat64(),
            int8: new index_1.MuInt8(),
            int16: new index_1.MuInt16(),
            int32: new index_1.MuInt32(),
            uint8: new index_1.MuUint8(),
            uint16: new index_1.MuUint16(),
            uint32: new index_1.MuUint32(),
            varint: new index_1.MuVarint(),
            rvarint: new index_1.MuRelativeVarint(),
            array: new index_1.MuArray(new index_1.MuFloat32(), Infinity),
            sorted: new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity),
            dict: new index_1.MuDictionary(new index_1.MuFloat32(), Infinity),
            vector: new index_1.MuVector(new index_1.MuFloat32(), 3),
            union: new index_1.MuUnion({
                b: new index_1.MuBoolean(),
                f: new index_1.MuFloat32(),
            }),
        }),
    });
    const s0 = struct.alloc();
    t.true(struct.equal(s0, s0));
    let s1 = struct.alloc();
    s1.struct.ascii = 'a';
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.fixed = 'a';
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.utf8 = 'a';
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.bool = true;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.float32 = 0.5;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.float64 = 0.5;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.int8 = -1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.int16 = -1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.int32 = -1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.uint8 = 1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.uint16 = 1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.uint32 = 1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.varint = 1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.rvarint = -1;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.array.push(0);
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.sorted.push(0);
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.dict['a'] = 0;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.vector[0] = 0.5;
    t.false(struct.equal(s0, s1));
    s1 = struct.alloc();
    s1.struct.union.type = 'b';
    s1.struct.union.data = false;
    t.end();
});
test('union.equal()', (t) => {
    const stringOrFloat = new index_1.MuUnion({
        u: new index_1.MuUTF8(),
        f: new index_1.MuFloat32(),
    });
    t.true(stringOrFloat.equal({ type: 'u', data: 'ab' }, { type: 'u', data: 'ab' }));
    t.true(stringOrFloat.equal({ type: 'f', data: 0.5 }, { type: 'f', data: 0.5 }));
    t.false(stringOrFloat.equal({ type: 'u', data: 'ab' }, { type: 'u', data: 'abc' }));
    t.false(stringOrFloat.equal({ type: 'f', data: 0.5 }, { type: 'f', data: 1 }));
    t.false(stringOrFloat.equal({ type: 'u', data: 'ab' }, { type: 'f', data: 0.5 }));
    const voxelOrTool = new index_1.MuUnion({
        voxel: new index_1.MuStruct({
            name: new index_1.MuUTF8(),
            destructible: new index_1.MuBoolean(),
        }),
        tool: new index_1.MuStruct({
            name: new index_1.MuUTF8(),
            durability: new index_1.MuFloat32(),
        }),
    });
    t.true(voxelOrTool.equal({ type: 'voxel', data: { name: 'soil', destructible: true } }, { type: 'voxel', data: { name: 'soil', destructible: true } }));
    t.true(voxelOrTool.equal({ type: 'tool', data: { name: 'torch', durability: 1 } }, { type: 'tool', data: { name: 'torch', durability: 1 } }));
    t.false(voxelOrTool.equal({ type: 'voxel', data: { name: 'soil', destructible: true } }, { type: 'voxel', data: { name: 'water', destructible: false } }));
    t.false(voxelOrTool.equal({ type: 'tool', data: { name: 'torch', durability: 1 } }, { type: 'tool', data: { name: 'torch', durability: 0.5 } }));
    t.false(voxelOrTool.equal({ type: 'voxel', data: { name: 'soil', destructible: true } }, { type: 'tool', data: { name: 'torch', durability: 1 } }));
    t.end();
});
test('bytes.equal()', (t) => {
    const bytes = new index_1.MuBytes();
    t.true(bytes.equal(new Uint8Array([]), new Uint8Array([])));
    t.false(bytes.equal(new Uint8Array([0]), new Uint8Array([])));
    t.false(bytes.equal(new Uint8Array([0]), new Uint8Array([0, 0])));
    t.true(bytes.equal(new Uint8Array([0, 0]), new Uint8Array([0, 0])));
    t.false(bytes.equal(new Uint8Array([0, 0]), new Uint8Array([1, 0])));
    t.end();
});
test('dictionary.equal()', (t) => {
    const dictionary = new index_1.MuDictionary(new index_1.MuFloat32(), Infinity);
    t.true(dictionary.equal({}, {}));
    t.true(dictionary.equal({ a: 0 }, { a: 0 }));
    t.true(dictionary.equal({ a: 0, b: 1 }, { a: 0, b: 1 }));
    t.false(dictionary.equal({}, { a: 0 }));
    t.false(dictionary.equal({ a: 0, b: 0 }, { a: 0 }));
    t.false(dictionary.equal({ a: 0 }, { b: 0 }));
    t.false(dictionary.equal({ a: 0 }, { a: 1 }));
    const nestedDictionary = new index_1.MuDictionary(new index_1.MuDictionary(new index_1.MuFloat32(), Infinity), Infinity);
    t.true(nestedDictionary.equal({}, {}));
    t.true(nestedDictionary.equal({ a: {} }, { a: {} }));
    t.true(nestedDictionary.equal({ a: {}, b: {} }, { a: {}, b: {} }));
    t.true(nestedDictionary.equal({ a: { b: 0 } }, { a: { b: 0 } }));
    t.true(nestedDictionary.equal({ a: { b: 0, c: 1 } }, { a: { b: 0, c: 1 } }));
    t.true(nestedDictionary.equal({ a: { c: 0 }, b: { d: 1 } }, { a: { c: 0 }, b: { d: 1 } }));
    t.true(nestedDictionary.equal({ a: { c: 0, d: 1 }, b: { c: 0, d: 1 } }, { a: { c: 0, d: 1 }, b: { c: 0, d: 1 } }));
    t.false(nestedDictionary.equal({}, { a: {} }));
    t.false(nestedDictionary.equal({ a: {}, b: {} }, { a: {} }));
    t.false(nestedDictionary.equal({ a: {} }, { b: {} }));
    t.false(nestedDictionary.equal({ a: { b: 0 } }, { a: { b: 1 } }));
    t.end();
});
test('vector.equal()', (t) => {
    const mat3 = new index_1.MuVector(new index_1.MuFloat32(), 9);
    const m1 = mat3.alloc();
    const m2 = mat3.alloc();
    t.true(mat3.equal(m1, m2));
    m2[8] += 0.5;
    t.false(mat3.equal(m1, m2));
    t.end();
});
test('date.equal()', (t) => {
    const date = new index_1.MuDate();
    const d1 = date.alloc();
    const d2 = date.alloc();
    d2.setTime(0);
    t.false(date.equal(d1, d2));
    d2.setTime(d1.getTime());
    t.true(date.equal(d1, d2));
    t.end();
});
test('option.equal()', (t) => {
    const optNum = new index_1.MuOption(new index_1.MuUint8());
    t.true(optNum.equal(undefined, undefined));
    t.false(optNum.equal(2, undefined));
    t.false(optNum.equal(undefined, 2));
    t.false(optNum.equal(4, 2));
    t.true(optNum.equal(2, 2));
    const struct = new index_1.MuStruct({ a: optNum });
    t.true(struct.equal({ a: undefined }, { a: undefined }));
    t.false(struct.equal({ a: 2 }, { a: undefined }));
    t.false(struct.equal({ a: undefined }, { a: 2 }));
    t.false(struct.equal({ a: 4 }, { a: 2 }));
    t.true(struct.equal({ a: 2 }, { a: 2 }));
    t.end();
});
test('json.equal()', (t) => {
    const json = new index_1.MuJSON();
    t.true(json.equal({}, {}));
    t.true(json.equal({ a: 0 }, { a: 0 }));
    t.true(json.equal({ a: 0, b: NaN }, { a: 0, b: NaN }));
    t.true(json.equal({ a: 0, b: 1 }, { b: 1, a: 0 }));
    t.false(json.equal({}, { a: 0 }));
    t.false(json.equal({ a: 0, b: 0 }, { a: 0 }));
    t.false(json.equal({ a: 0 }, { b: 0 }));
    t.false(json.equal({ a: 0 }, { a: 1 }));
    t.true(json.equal({ a: {} }, { a: {} }));
    t.true(json.equal({ a: {}, b: {} }, { a: {}, b: {} }));
    t.true(json.equal({ a: { b: 0 } }, { a: { b: 0 } }));
    t.true(json.equal({ a: { b: 0, c: 1 } }, { a: { b: 0, c: 1 } }));
    t.true(json.equal({ a: { c: 0 }, b: { d: 1 } }, { a: { c: 0 }, b: { d: 1 } }));
    t.true(json.equal({ a: { c: 0, d: 1 }, b: { c: 0, d: 1 } }, { a: { c: 0, d: 1 }, b: { c: 0, d: 1 } }));
    t.false(json.equal({}, { a: {} }));
    t.false(json.equal({ a: {}, b: {} }, { a: {} }));
    t.false(json.equal({ a: {} }, { b: {} }));
    t.false(json.equal({ a: { b: 0 } }, { a: { b: 1 } }));
    t.true(json.equal([], []));
    t.false(json.equal([], {}));
    t.true(json.equal([0.5], [0.5]));
    t.true(json.equal([0.5, NaN], [0.5, NaN]));
    t.false(json.equal([], [0]));
    t.false(json.equal([0, 1], [0]));
    t.false(json.equal([0], [1]));
    t.false(json.equal([0, 0.5, 1], [0, 1, 0.5]));
    t.true(json.equal([], []));
    t.true(json.equal([[]], [[]]));
    t.true(json.equal([[0.5]], [[0.5]]));
    t.true(json.equal([[0.5, 0, 1]], [[0.5, 0, 1]]));
    t.true(json.equal([[0.5, 0, 1], [0, 0.5, 1]], [[0.5, 0, 1], [0, 0.5, 1]]));
    t.false(json.equal([[]], []));
    t.false(json.equal([[0]], [[]]));
    t.false(json.equal([[0, 1]], [[0]]));
    t.false(json.equal([[1]], [[0]]));
    t.false(json.equal([[0, 1, 0.5]], [[0, 0.5, 1]]));
    t.false(json.equal([[0.5, 0, 1], [0, 0.5, 1]], [[0.5, 0, 1]]));
    t.false(json.equal([[0.5, 0, 1], [0, 0.5, 1]], [[0, 0.5, 1], [0.5, 0, 1]]));
    t.end();
});
//# sourceMappingURL=equal.js.map