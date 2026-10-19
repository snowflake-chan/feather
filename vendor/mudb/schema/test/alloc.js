"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const index_1 = require("../index");
test('primitive.alloc()', (t) => {
    t.comment('equals primitive.identity');
    const bool = new index_1.MuBoolean(true);
    t.equal(bool.alloc(), true);
    const utf8 = new index_1.MuUTF8('Iñtërnâtiônàlizætiøn☃💩');
    t.equal(utf8.alloc(), 'Iñtërnâtiônàlizætiøn☃💩');
    const float32 = new index_1.MuFloat32(0.5);
    t.equal(float32.alloc(), 0.5);
    t.end();
});
test('nonPrimitive.alloc()', (t) => {
    const array = new index_1.MuArray(new index_1.MuFloat32(), Infinity);
    const sortedArray = new index_1.MuSortedArray(new index_1.MuFloat32(), Infinity);
    const union = new index_1.MuUnion({ f: new index_1.MuFloat32() }, 'f');
    const dictionary = new index_1.MuDictionary(new index_1.MuFloat32(), Infinity);
    const vector = new index_1.MuVector(new index_1.MuFloat32(), 5);
    const json = new index_1.MuJSON();
    const date = new index_1.MuDate();
    t.deepEqual(array.alloc(), []);
    t.deepEqual(sortedArray.alloc(), []);
    t.deepEqual(union.alloc(), { type: 'f', data: 0 });
    t.deepEqual(dictionary.alloc(), {});
    t.deepEqual(vector.alloc(), new Float32Array(vector.dimension));
    t.deepEqual(json.alloc(), {});
    t.true(date.alloc() instanceof Date);
    t.end();
});
test('struct.alloc()', (t) => {
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
    t.deepEqual(struct.alloc(), {
        struct: {
            ascii: '',
            fixed: ' ',
            utf8: '',
            bool: false,
            float32: 0,
            float64: 0,
            int8: 0,
            int16: 0,
            int32: 0,
            uint8: 0,
            uint16: 0,
            uint32: 0,
            varint: 0,
            rvarint: 0,
            array: [],
            sorted: [],
            dict: {},
            vector: new Float32Array(3),
            union: {
                type: '',
                data: undefined,
            },
        },
    });
    t.end();
});
//# sourceMappingURL=alloc.js.map