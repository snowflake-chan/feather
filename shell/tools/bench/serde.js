'use strict';
const v8 = require('v8');
const { MuStruct } = require('@box/mudb/schema/struct');
const { MuArray } = require('@box/mudb/schema/array');
const { MuUint32 } = require('@box/mudb/schema/uint32');
const { MuVarint } = require('@box/mudb/schema/varint');
const { MuBoolean } = require('@box/mudb/schema/boolean');
const { MuUTF8 } = require('@box/mudb/schema/utf8');
const { MuVector } = require('@box/mudb/schema/vector');
const { MuFloat32 } = require('@box/mudb/schema/float32');
const { MuWriteStream, MuReadStream } = require('@box/mudb/stream');

const N = 500;
const Entity = new MuStruct({
  id: new MuUint32(),
  pos: new MuVector(new MuFloat32(), 3),
  rot: new MuVector(new MuFloat32(), 4),
  vel: new MuVector(new MuFloat32(), 3),
  alive: new MuBoolean(),
  anim: new MuVarint(),
  name: new MuUTF8(''),
});
const Tick = new MuStruct({ tick: new MuVarint(), entities: new MuArray(Entity, Infinity, []) });

const state = Tick.alloc();
state.tick = 1;
for (let i = 0; i < N; i++) {
  const e = Entity.alloc();
  e.id = i; e.pos[0] = i * 0.1; e.rot[3] = 1; e.vel[1] = 1; e.alive = true; e.anim = i; e.name = 'e' + i;
  state.entities.push(e);
}
const plain = {
  tick: 1,
  entities: state.entities.map((e) => ({
    id: e.id, pos: Array.from(e.pos), rot: Array.from(e.rot), vel: Array.from(e.vel),
    alive: e.alive, anim: e.anim, name: e.name,
  })),
};

const ITER = 500;
function bench(label, fn, warm = 30) {
  for (let i = 0; i < warm; i++) fn();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < ITER; i++) fn();
  return Number(process.hrtime.bigint() - t0) / ITER / 1e6;
}
const out = [];
const jsonBytes = Buffer.byteLength(JSON.stringify(plain));
const jsonMs = bench('json', () => JSON.parse(JSON.stringify(plain)));
out.push(['JSON stringify+parse', jsonMs, jsonBytes]);
const v8Bytes = v8.serialize(plain).length;
const v8Ms = bench('v8', () => v8.deserialize(v8.serialize(plain)));
out.push(['v8.serialize+deserialize', v8Ms, v8Bytes]);
const scMs = bench('sc', () => structuredClone(plain));
out.push(['structuredClone', scMs, '-']);
const w = new MuWriteStream(1 << 20);
const mudbMs = bench('mudb', () => { w.offset = 0; Tick.diff(Tick.identity, state, w); const r = new MuReadStream(Buffer.from(w.bytes())); const x = Tick.patch(Tick.identity, r); Tick.free(x); });
out.push(['mudb diff+patch', mudbMs, w.bytes().length]);

console.log('500 entities (7 fields, 3 typed vectors)');
for (const [k, ms, bytes] of out) {
  console.log(`  ${k.padEnd(26)} ${ms.toFixed(3).padStart(7)} ms   ${typeof bytes === 'number' ? (bytes / 1024).toFixed(1) + ' KB' : bytes}`);
}
