// 验证：通用 MuStruct 与原生 MuStruct 的二进制输出逐字节一致
'use strict';
const R = require('@box/mudb/schema');
const { MuWriteStream, MuReadStream } = require('@box/mudb/stream');
const { MuStruct: Generic } = require('./generic-struct');

function build(S) {
  const Vec3 = new S.MuVector(new S.MuFloat32(), 3);
  const Mat4 = new S.MuVector(new S.MuFloat64(), 4);
  const Nested = new S.MuStruct({
    id: new S.MuUint32(),
    name: new S.MuUTF8(),
    pos: Vec3,
    tags: new S.MuArray(new S.MuUTF8(), 16, []),
    flag: new S.MuBoolean(),
  });
  const Big = new S.MuStruct({
    tick: new S.MuVarint(),
    delta: new S.MuRelativeVarint(0),
    q: new S.MuQuantizedFloat(0.01, 1.5),
    ascii: new S.MuASCII('abc'),
    fx: new S.MuFixedASCII('abc'),
    s: new S.MuUTF8('hello'),
    b: new S.MuBoolean(true),
    f32: new S.MuFloat32(1.5),
    f64: new S.MuFloat64(2.5),
    i8: new S.MuInt8(-3),
    i16: new S.MuInt16(-300),
    i32: new S.MuInt32(-70000),
    u8: new S.MuUint8(200),
    u16: new S.MuUint16(50000),
    u32: new S.MuUint32(4000000000),
    bytes: new S.MuBytes(new Uint8Array([1, 2, 3, 255])),
    date: new S.MuDate(new Date(1234567890)),
    json: new S.MuJSON({ a: [1, 2], b: { c: 'd' } }),
    nested: Nested,
    nestedArr: new S.MuArray(Nested, 8, []),
    dict: new S.MuDictionary(new S.MuVarint(), 16, {}),
    opt: new S.MuOption(new S.MuVarint(), undefined, true),
    union: new S.MuUnion({ a: new S.MuVarint(), b: new S.MuUTF8() }, 'a'),
    sorted: new S.MuSortedArray(new S.MuFloat32(), 8, (x, y) => x - y, [3, 1, 2]),
    mat: Mat4,
  });
  return Big;
}

function mkValue(schema, v) { return schema.clone(v); }
function dump(schema, v) {
  const w = new MuWriteStream(4096);
  const changed = schema.diff(schema.identity, v, w);
  return { bytes: Buffer.from(w.bytes()), changed };
}
const hex = (b) => b.toString('hex').slice(0, 120) + (b.length > 60 ? '…' : '');

const real = build(R);
const gen = build({ MuStruct: Generic, ...R });
// 用真实叶子类型构建 generic 的 spec：重建一次，保证叶子一致
function buildWithGeneric(SG, R) {
  const s = SG;
  const T = {
    MuStruct: s.MuStruct, MuArray: R.MuArray, MuDictionary: R.MuDictionary,
    MuSortedArray: R.MuSortedArray, MuUnion: R.MuUnion, MuOption: R.MuOption,
    MuVector: R.MuVector, MuBoolean: R.MuBoolean, MuInt8: R.MuInt8, MuInt16: R.MuInt16,
    MuInt32: R.MuInt32, MuUint8: R.MuUint8, MuUint16: R.MuUint16, MuUint32: R.MuUint32,
    MuFloat32: R.MuFloat32, MuFloat64: R.MuFloat64, MuVarint: R.MuVarint,
    MuRelativeVarint: R.MuRelativeVarint, MuQuantizedFloat: R.MuQuantizedFloat,
    MuUTF8: R.MuUTF8, MuASCII: R.MuASCII, MuFixedASCII: R.MuFixedASCII,
    MuVoid: R.MuVoid, MuBytes: R.MuBytes, MuDate: R.MuDate, MuJSON: R.MuJSON,
  };
  return build(T);
}
const real2 = build(R);
const gen2 = buildWithGeneric({ MuStruct: Generic }, R);

function sample(schema) {
  const v = schema.clone(schema.identity);
  v.tick = 42; v.delta = -7; v.q = 1.234; v.ascii = 'xyz'; v.fx = 'abc';
  v.s = '中文 hello'; v.b = false; v.f32 = -1.25; v.f64 = 1e300;
  v.i8 = -128; v.i16 = 12345; v.i32 = -2000000000;
  v.u8 = 255; v.u16 = 65535; v.u32 = 4294967295;
  v.bytes = new Uint8Array([9, 8, 7]); v.date = new Date(999999);
  v.json = { x: 1 };
  v.nested.id = 123; v.nested.name = 'n1'; v.nested.pos[0] = 1; v.nested.pos[1] = 2; v.nested.pos[2] = 3;
  v.nested.tags.push('t1'); v.nested.tags.push('t2'); v.nested.flag = true;
  const elemSchema = schema.muData.nestedArr.muData;
  for (let i = 0; i < 3; i++) {
    const n = elemSchema.alloc();
    n.id = i; n.name = 'arr' + i; n.pos[0] = i; n.tags.push('x');
    v.nestedArr.push(n);
  }
  v.dict.k1 = 1; v.dict.k2 = 2;
  v.union.type = 'b'; v.union.data = 'u';
  v.sorted.push(9);
  v.mat[0] = 1.5; v.mat[3] = 2.5;
  return v;
}

const va = sample(real2), vb = sample(gen2);
const a = dump(real2, va), b = dump(gen2, vb);
console.log(`原生: ${a.bytes.length} 字节 changed=${a.changed}`);
console.log(`通用: ${b.bytes.length} 字节 changed=${b.changed}`);
const same = a.bytes.equals(b.bytes);
console.log(`逐字节一致: ${same ? '✓' : '✗'}`);
if (!same) {
  for (let i = 0; i < Math.max(a.bytes.length, b.bytes.length); i++) {
    if (a.bytes[i] !== b.bytes[i]) { console.log(`  首个差异 @${i}: ${a.bytes[i]} vs ${b.bytes[i]}`); break; }
  }
  console.log(' real', hex(a.bytes)); console.log(' gen ', hex(b.bytes));
}

// 交叉 patch
function read(schema, bytes) {
  const r = new MuReadStream(bytes);
  r.readVarint && r.offset; // 顶层由协议写 id，这里没有
  return schema.patch(schema.identity, r);
}
const pa = read(real2, a.bytes);
const pb = read(gen2, b.bytes);
console.log(`通用 patch 结果 == 原生结果: ${real2.equal(pa, va) ? '✓' : '✗'}`);
console.log(`原生 patch 结果 == 通用 value: ${real2.equal(pa, pb) ? '✓' : '✗'}`);
console.log(`toJSON 一致: ${JSON.stringify(real2.toJSON(pa)) === JSON.stringify(gen2.toJSON(pb)) ? '✓' : '✗'}`);

// 未变化时 diff 应该不写字节
const w = new MuWriteStream(64);
const ch = gen2.diff(gen2.identity, gen2.identity, w);
console.log(`identity→identity: changed=${ch} bytes=${w.bytes().length} (期望 false/0)`);
