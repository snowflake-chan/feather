import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { getConfig } from '../config/server';
import { startServer } from '../src/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

async function main() {
  // 默认指向仓库里的 shell worker，省掉一个必须手工传的环境变量。
  const workerEntry =
    process.env.SCRIPT_WORKER_ENTRY ||
    path.resolve(__dirname, '../../shell/tools/worker-entry/worker-entry.js');
  // 这个脚本里 `while (true) {}` 在模块顶层，属于「第一帧之前就卡住」，
  // 走的是 init grace 那条路。生产默认 120s，校验里压到 2s。
  process.env.SCRIPT_INIT_GRACE_MS = '2000';
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-timeout-'));
  const script = path.join(root, 'infinite.js');
  fs.writeFileSync(script, 'while (true) {}\n');
  const base = await getConfig();
  const scriptServer = new WorkerScriptServer({ workerEntry });
  const result = await startServer(
    {
      ...base,
      // 不设 local 的话 `createDefaultProject` 会把默认工程写进 IPFS/OSS，
      // 这个校验就变成「需要外部内容服务才能跑」。local 模式下 store 落到
      // 派生存储（paths.derivedStoragePath），整条链路自包含。
      method: 'local',
      port: 0,
      script,
      scriptTimeout: 2000,
      storagePath: path.join(root, 'storage'),
      dataStorageNamespace: 'timeout',
      groupStorageNamespace: 'timeout-group',
      databaseUrl: `sqlite:///${path.join(root, 'timeout.sqlite')}`,
    },
    {
      scriptServer,
      paths: {
        projectStatePath: path.join(root, 'project-state.json'),
        bundledContentPath: process.env.BOX_BUNDLED_CONTENT_PATH,
        derivedStoragePath: path.join(root, 'derived'),
        storagePath: path.join(root, 'storage'),
        containerName: 'timeout',
      },
    },
  );
  let crashes = 0;
  result.game.script.onScriptCrash.sub(() => {
    crashes++;
    const workers = (result.game.script.scriptServer as any)._workers?.size;
    process.stdout.write(`script crash #${crashes}, workers=${workers}\n`);
  });
  // crash 之后 play-server 会先广播 3 秒倒计时，再重同步并重新 launch，
  // 所以等 worker 回来的预算要给够。
  const deadline = Date.now() + 30_000;
  while (crashes < 1 && Date.now() < deadline) await delay(100);
  let workers = 0;
  while (Date.now() < deadline) {
    workers = (result.game.script.scriptServer as any)._workers?.size ?? 0;
    if (workers > 0) break;
    await delay(100);
  }
  process.stdout.write(`crashes=${crashes}, workers=${workers}\n`);
  if (crashes < 1) throw new Error('script timeout did not trigger onScriptCrash');
  if (workers < 1) throw new Error('script worker was not restarted');
  await result.game.close();
  await new Promise<void>((resolve) => result.httpServer.close(() => resolve()));
  fs.rmSync(root, { recursive: true, force: true });
  process.stdout.write('script timeout checks passed\n');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
