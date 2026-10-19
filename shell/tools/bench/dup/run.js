'use strict';
const path = require('path');
const { Worker } = require('worker_threads');
const ROOT = path.resolve(__dirname, '../../..');
process.env.POC_ROOT = ROOT;

const mode = process.argv[2] || 'single';
function forceGC() {
  for (let i = 0; i < 10; i++) global.gc && global.gc();
}
const mb = (b) => +(b / 1048576).toFixed(2);

if (mode === 'single-bare' || mode === 'single-protocol' || mode === 'single-shell') {
  forceGC();
  const base = process.memoryUsage();
  if (mode !== 'single-bare') require(ROOT + '/dist/script/script-protocol.js');
  const afterProtocol = process.memoryUsage();
  if (mode === 'single-shell') require(ROOT + '/dist/script/script-shell.js');
  forceGC();
  const after = process.memoryUsage();
  console.log(JSON.stringify({
    mode,
    protocolDelta: { heapUsed: mb(afterProtocol.heapUsed - base.heapUsed), rss: mb(afterProtocol.rss - base.rss) },
    shellDelta: { heapUsed: mb(after.heapUsed - afterProtocol.heapUsed), rss: mb(after.rss - afterProtocol.rss) },
    final: { heapUsed: mb(after.heapUsed), rss: mb(after.rss) },
  }));
  process.exit(0);
}

// worker modes: main preloads protocol (engine 侧), worker 里再加载一份
forceGC();
const mainBase = process.memoryUsage();
require(ROOT + '/dist/script/script-protocol.js');
forceGC();
const mainAfter = process.memoryUsage();
console.log(JSON.stringify({ phase: 'main-protocol', heapUsed: mb(mainAfter.heapUsed - mainBase.heapUsed), rss: mb(mainAfter.rss) }));

const workerMode = mode.replace('worker-', '');
const worker = new Worker(path.join(__dirname, 'worker.js'), { workerData: { mode: workerMode } });
worker.stdout.on('data', (d) => process.stdout.write('[worker] ' + d));
worker.stderr.on('data', (d) => process.stderr.write('[worker] ' + d));
worker.on('exit', () => {
  forceGC();
  const m = process.memoryUsage();
  console.log(JSON.stringify({ phase: 'final', mainHeapUsed: mb(m.heapUsed), rss: mb(m.rss) }));
  process.exit(0);
});
