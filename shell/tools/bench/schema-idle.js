'use strict';
const v8 = require('v8');
const MB = (b) => +(b / 1048576).toFixed(1);
const mode = process.argv[2] || 'engine';
const tick = process.argv.includes('tick');

const ENGINE_MODS = [
  '@box/schema/project/project-rda',
  '@box/schema/project/murda-tree',
  '@box/schema/project/murda-union',
  '@box/schema/physics/physics-schema',
  '@box/schema/net/net-schema',
  '@box/schema/keyframes/keyframe-schema',
  '@box/schema/keyframes/bindings/entity-animation',
  '@box/schema/keyframes/bindings/world-animation',
  '@box/schema/replica/game-replica',
  '@box/schema/events/net-events',
  '@box/schema/events/server-event-schema',
  '@box/schema/player/player-schema',
  '@box/schema/debugger-console/schema',
  '@box/schema/api/js/api',
];

function load() {
  if (mode === 'engine') {
    for (const m of ENGINE_MODS) {
      try { require(m); } catch (e) { console.error('skip', m, e.message.split('\n')[0].slice(0, 60)); }
    }
  } else {
    require(require('path').resolve(__dirname, '../../dist/script/script-protocol.js'));
  }
}

const base = process.memoryUsage();
load();
const marks = [500, 5000, 10000, 20000, 30000];
let i = 0;
const rows = [];
if (tick) setInterval(() => { const a = [{ x: Math.random() }]; if (a.length > 10) a.length = 0; }, 50);

function snap(label) {
  const m = process.memoryUsage();
  const sp = {};
  for (const s of v8.getHeapSpaceStatistics()) sp[s.space_name] = s.space_used_size;
  rows.push(`${label} rss=${MB(m.rss)} ht=${MB(m.heapTotal)} hu=${MB(m.heapUsed)} code=${MB(sp.code_space || 0)}`);
}
setTimeout(() => {
  const at = (ms, label) => setTimeout(() => {
    snap(label);
    if (++i < marks.length) return;
    if (global.gc) for (let k = 0; k < 10; k++) global.gc();
    snap('GC后');
    console.log(`[${mode}${tick ? '+tick' : ''}] base rss=${MB(base.rss)}`);
    for (const r of rows) console.log('  ' + r);
    process.exit(0);
  }, ms - (i === 0 ? 0 : marks[i - 1]));
  // simple sequential marks
  let acc = 0;
  const seq = (idx) => {
    if (idx >= marks.length) {
      if (global.gc) for (let k = 0; k < 10; k++) global.gc();
      snap('GC后');
      console.log(`[${mode}${tick ? '+tick' : ''}] base rss=${MB(base.rss)}`);
      for (const r of rows) console.log('  ' + r);
      process.exit(0);
    }
    const t = marks[idx] - acc;
    acc = marks[idx];
    setTimeout(() => { snap(marks[idx] / 1000 + 's'); seq(idx + 1); }, t);
  };
  seq(0);
}, 0);
