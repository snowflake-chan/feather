const { MuStruct } = require('@box/mudb/schema/struct');
const { MuArray } = require('@box/mudb/schema/array');
const { MuFloat64 } = require('@box/mudb/schema/float64');
const { MuVarint } = require('@box/mudb/schema/varint');
const { MuUint32 } = require('@box/mudb/schema/uint32');
const { MuBoolean } = require('@box/mudb/schema/boolean');
const { MuVector } = require('@box/mudb/schema/vector');
const { MuFloat32 } = require('@box/mudb/schema/float32');
const { MuWriteStream, MuReadStream } = require('@box/mudb/stream');

// 模拟：每 tick 500 个实体的位置/朝向更新
const EntitySchema = new MuStruct({
  id: new MuUint32(),
  pos: new MuVector(new MuFloat32(), 3),
  rot: new MuVector(new MuFloat32(), 4),
  vel: new MuVector(new MuFloat32(), 3),
  alive: new MuBoolean(),
  anim: new MuVarint(),
});
const TickSchema = new MuStruct({
  tick: new MuVarint(),
  entities: new MuArray(EntitySchema, Infinity, []),
});

const N = 500;
const prev = TickSchema.alloc();
const cur = TickSchema.alloc();
prev.tick = 1; cur.tick = 2;
for (let i = 0; i < N; i++) {
  const e1 = EntitySchema.alloc(), e2 = EntitySchema.alloc();
  e1.id = e2.id = i;
  e1.pos[0] = 0; e2.pos[0] = i * 0.1;
  e1.rot[3] = 1; e2.rot[3] = 1;
  e1.alive = true; e2.alive = true;
  prev.entities.push(e1); cur.entities.push(e2);
}

// mudb diff
const w = new MuWriteStream(1 << 20);
w.offset = 0; TickSchema.diff(prev, cur, w);
const mudbBytes = w.bytes().length;

const ITER = 2000;
for (let i = 0; i < 50; i++) { w.offset = 0; TickSchema.diff(prev, cur, w); }
let t0 = process.hrtime.bigint();
for (let i = 0; i < ITER; i++) { w.offset = 0; TickSchema.diff(prev, cur, w); }
const mudbNs = Number(process.hrtime.bigint() - t0) / ITER;

// JSON
const plain = { tick: 2, entities: cur.entities.map(e => ({ id: e.id, pos: Array.from(e.pos), rot: Array.from(e.rot), vel: Array.from(e.vel), alive: e.alive, anim: e.anim })) };
const jsonStr = JSON.stringify(plain);
for (let i = 0; i < 50; i++) JSON.parse(JSON.stringify(plain));
t0 = process.hrtime.bigint();
for (let i = 0; i < ITER; i++) { const s = JSON.stringify(plain); JSON.parse(s); }
const jsonNs = Number(process.hrtime.bigint() - t0) / ITER;

console.log(`=== 每 tick 500 实体更新 ===`);
console.log(`  mudb diff:        ${(mudbNs/1e6).toFixed(2)} ms,  ${(mudbBytes/1024).toFixed(1)} KB`);
console.log(`  JSON stringify+parse: ${(jsonNs/1e6).toFixed(2)} ms,  ${(jsonStr.length/1024).toFixed(1)} KB`);
console.log(`  JSON 慢 ${(jsonNs/mudbNs).toFixed(1)}x, 大 ${(jsonStr.length/mudbBytes).toFixed(1)}x`);
console.log();
console.log(`  每秒 20 tick 的成本:`);
console.log(`    mudb: ${(mudbNs*20/1e6).toFixed(1)} ms/s`);
console.log(`    JSON: ${(jsonNs*20/1e6).toFixed(1)} ms/s`);

// 补测：patch 侧成本
{
  const w2 = new MuWriteStream(1 << 20);
  w2.offset = 0; TickSchema.diff(prev, cur, w2);
  const bytes = w2.bytes().slice();
  const r = new (require('@box/mudb/stream').MuReadStream)(bytes);
  r.readVarint && r.offset;
  let t1 = process.hrtime.bigint();
  for (let i = 0; i < ITER; i++) {
    const rr = new (require('@box/mudb/stream').MuReadStream)(bytes);
    const out = TickSchema.patch(TickSchema.identity, rr);
    TickSchema.free(out);
  }
  const patchNs = Number(process.hrtime.bigint() - t1) / ITER;
  console.log(`  mudb patch:       ${(patchNs/1e6).toFixed(2)} ms`);
}
