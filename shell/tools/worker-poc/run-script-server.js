// 集成测试：完全按引擎 ScriptHost 的顺序来
//   new MuServer(scriptServer, undefined, true)
//   muServer.start()
//   await scriptServer.launch('', '')
// 验证 launch 之后 shell 能连上、协议能往返。
'use strict';
const path = require('path');
const { MuServer } = require('@box/mudb/server');
const { ScriptProtocol } = require(path.resolve(__dirname, '../../dist/script/script-protocol'));
const { WorkerScriptServer } = require('./worker-script-server');

const TIMEOUT_MS = Number(process.env.POC_TIMEOUT_MS || 15000);

async function main() {
  const scriptServer = new WorkerScriptServer({
    workerEntry: path.join(__dirname, 'worker.js'),
  });

  const muServer = new MuServer(scriptServer, undefined, true);
  const protocol = muServer.protocol(ScriptProtocol);

  let resolvePump;
  let rejectPump;
  const pumped = new Promise((resolve, reject) => {
    resolvePump = resolve;
    rejectPump = reject;
  });
  const message = {};
  for (const name of Object.keys(ScriptProtocol.server)) message[name] = () => {};
  message.pump = () => resolvePump(true);

  protocol.configure({
    message,
    connect: (client) => {
      console.log('[engine] script shell connected:', client.sessionId);
      client.message.poll();
    },
    disconnect: () => console.log('[engine] script shell disconnected'),
  });

  muServer.start({ ready: () => console.log('[engine] muServer ready') });

  const t0 = process.hrtime.bigint();
  await scriptServer.launch('', '');

  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timeout after ' + TIMEOUT_MS + 'ms')), TIMEOUT_MS);
  });

  try {
    await Promise.race([pumped, timeout]);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    console.log(`[poc] PASS: WorkerScriptServer launch + protocol round-trip (${ms.toFixed(1)} ms)`);
  } catch (err) {
    console.error('[poc] FAIL:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    scriptServer.close();
    setTimeout(() => process.exit(process.exitCode || 0), 200);
  }
}

main().catch((err) => {
  console.error('[poc] FAIL (top-level):', err && err.stack ? err.stack : err);
  process.exit(1);
});
