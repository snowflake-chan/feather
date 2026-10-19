// Worker 侧入口：parentPort 包成 MuSocket，交给 shell
'use strict';
const path = require('path');
const { parentPort, workerData } = require('worker_threads');
const { randomUUID } = require('crypto');
const { NodeWorkerSocket } = require('./adapter');

const sessionId = randomUUID();
const socket = new NodeWorkerSocket(sessionId, parentPort);

// shell 构造函数第三参是 sysLog；script-start 只传两个参数，出错路径会 undefined 崩。
// 这里显式给一个，日志直接写到 worker stderr。
const sysLog = (level, object, message, ...args) => {
  const parts = [];
  if (object !== undefined) {
    parts.push(object instanceof Error ? object.stack : String(object));
  }
  if (message !== undefined) parts.push(String(message));
  for (const a of args) parts.push(String(a));
  console.error(`[shell:${level}] ${parts.join(' ')}`);
};

const { ScriptShell } = require(path.resolve(__dirname, '../../dist/script/script-shell'));

new ScriptShell(socket, true, sysLog);

console.error('[worker-poc] ScriptShell constructed, session', sessionId);

if (process.env.POC_MEM) {
  setTimeout(() => {
    try {
      const v8 = require('v8');
      v8.setFlagsFromString('--expose_gc');
      const gc = require('vm').runInNewContext('gc');
      for (let i = 0; i < 5; i++) gc();
    } catch (e) {}
    const m = process.memoryUsage();
    const hs = require('v8').getHeapStatistics();
    const mb = (b) => (b / 1048576).toFixed(1);
    console.error(
      `[worker-poc] isolate heapUsed=${mb(hs.used_heap_size)} heapTotal=${mb(hs.total_heap_size)} | process-wide rss=${mb(m.rss)} heapUsed=${mb(m.heapUsed)}`,
    );
  }, 3000);
}
