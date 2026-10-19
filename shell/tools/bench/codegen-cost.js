// 测量：mudb schema codegen 在 shell 加载成本中占多少
// 用法: node --expose-gc tools/bench/codegen-cost.js baseline|real|stub
'use strict';
const path = require('path');
const v8 = require('v8');
const ROOT = path.resolve(__dirname, '../..');
const mode = process.argv[2] || 'real';

// ---- codegen 探针：拦截 Function 构造，统计生成的源码体积 ----
const gen = { count: 0, sourceBytes: 0, perModule: {} };
const OrigFunction = Function;
function track(args) {
  const src = String(args[args.length - 1] || '');
  gen.count++;
  gen.sourceBytes += src.length;
  const line = (new Error().stack.split('\n')[2] || '').trim();
  gen.perModule[line] = (gen.perModule[line] || 0) + src.length;
}
const patchedFunction = function (...args) {
  track(args);
  return OrigFunction.apply(null, args);
};
patchedFunction.apply = function (self, args) {
  track(args);
  return OrigFunction.apply(null, args);
};

if (mode === 'stub') {
  const stub = require(path.join(__dirname, 'stub-schema.js'));
  for (const f of Object.keys(stub.__files)) {
    try {
      const t = require.resolve('@box/mudb/schema/' + f);
      require.cache[t] = { id: t, filename: t, loaded: true, exports: stub.__files[f] };
    } catch (e) {
      console.error('stub inject failed:', f, e.message);
    }
  }
}

global.Function = patchedFunction;

const MB = (b) => b / 1048576;
function snap() {
  for (let i = 0; i < 8; i++) global.gc && global.gc();
  const m = process.memoryUsage();
  const spaces = {};
  for (const s of v8.getHeapSpaceStatistics()) spaces[s.space_name] = s.space_used_size;
  return {
    rss: m.rss,
    heapUsed: m.heapUsed,
    heapTotal: m.heapTotal,
    external: m.external,
    code: spaces.code_space || 0,
  };
}

const before = snap();
const tStart = Date.now();
if (mode !== 'baseline') require(path.join(ROOT, 'dist/script/script-start.js'));
const loadMs = Date.now() - tStart;

setTimeout(() => {
  const after = snap();
  global.Function = OrigFunction;
  const d = {};
  for (const k of Object.keys(before)) d[k] = after[k] - before[k];
  console.log(JSON.stringify({
    mode,
    loadMs,
    before: Object.fromEntries(Object.entries(before).map(([k, v]) => [k, +MB(v).toFixed(2)])),
    after: Object.fromEntries(Object.entries(after).map(([k, v]) => [k, +MB(v).toFixed(2)])),
    delta: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, +MB(v).toFixed(2)])),
    codegen: {
      count: gen.count,
      sourceKB: +(gen.sourceBytes / 1024).toFixed(1),
      perModule: Object.fromEntries(
        Object.entries(gen.perModule)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([k, v]) => [k.replace(ROOT + '/', ''), +(v / 1024).toFixed(1)]),
      ),
    },
  }, null, 2));
  process.exit(0);
}, 1500);
