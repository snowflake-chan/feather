'use strict';
const v8 = require('v8');
const { workerData } = require('worker_threads');
const ROOT = process.env.POC_ROOT;
function forceGC() {
  try {
    v8.setFlagsFromString('--expose_gc');
    const gc = require('vm').runInNewContext('gc');
    for (let i = 0; i < 5; i++) gc();
  } catch (e) {}
}
const mode = workerData.mode;
if (mode === 'protocol') require(ROOT + '/dist/script/script-protocol.js');
if (mode === 'shell') require(ROOT + '/dist/script/script-shell.js');
setTimeout(() => {
  forceGC();
  const hs = v8.getHeapStatistics();
  const m = process.memoryUsage();
  console.log(JSON.stringify({
    mode,
    isolateHeapUsed: +(hs.used_heap_size / 1048576).toFixed(2),
    isolateHeapTotal: +(hs.total_heap_size / 1048576).toFixed(2),
    processRss: +(m.rss / 1048576).toFixed(2),
  }));
  process.exit(0);
}, 2500);
