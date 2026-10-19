// PoC 入口：起 engine harness + shell worker，验证一次 engine->shell->engine 往返
'use strict';
const path = require('path');
const { Worker } = require('worker_threads');
const { createHarness } = require('./host');

const TIMEOUT_MS = Number(process.env.POC_TIMEOUT_MS || 15000);

async function main() {
  const harness = createHarness();
  await harness.started;
  console.log('[poc] engine harness ready');

  let done = false;
  const t0 = process.hrtime.bigint();
  const worker = new Worker(path.join(__dirname, 'worker.js'));
  worker.stdout.on('data', (d) => process.stdout.write('[worker] ' + d));
  worker.stderr.on('data', (d) => process.stderr.write('[worker] ' + d));

  const workerError = new Promise((_, reject) => {
    worker.on('error', (err) => reject(err));
    worker.on('exit', (code) => {
      if (!done && code !== 0) reject(new Error('worker exited with code ' + code));
    });
  });

  harness.socketServer.attach(worker);

  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timeout after ' + TIMEOUT_MS + 'ms')), TIMEOUT_MS);
  });

  try {
    await Promise.race([harness.pumped, workerError, timeout]);
    done = true;
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    console.log('[poc] PASS: shell worker handshake + poll/pump round-trip (' + ms.toFixed(1) + ' ms)');
    if (!harness.isConnected()) throw new Error('not connected');
    if (process.env.POC_MEM) {
      await new Promise((resolve) => setTimeout(resolve, 3400));
    }
  } catch (err) {
    done = true;
    console.error('[poc] FAIL:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    worker.terminate();
    try {
      harness.muServer.destroy();
    } catch (e) {}
    // 给 terminate 一点时间，确认没有残留句柄
    setTimeout(() => process.exit(process.exitCode || 0), 200);
  }
}

main().catch((err) => {
  console.error('[poc] FAIL (top-level):', err && err.stack ? err.stack : err);
  process.exit(1);
});
