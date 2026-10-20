import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { getConfig } from '../config/server';
import { startServer } from '../src/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

/**
 * 验证单图脚本内存上限：
 * 1. `memoryLimitMb` 真的透传到 worker 的 resourceLimits
 * 2. 撞上限时只有这个 worker 死，进程（daemon / 同 shard 其他图）活着
 */
const LIMIT_MB = 128;

async function main() {
  const workerEntry = process.env.SCRIPT_WORKER_ENTRY;
  if (!workerEntry) throw new Error('SCRIPT_WORKER_ENTRY is required');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-mem-'));
  const script = path.join(root, 'hog.js');
  // 每轮约 1.6MB 的 packed array，128MB 上限内几十轮就会撞墙
  fs.writeFileSync(
    script,
    'const hold = [];\nwhile (true) { hold.push(new Array(200000).fill(1)); }\n',
  );

  const base = await getConfig();
  const scriptServer = new WorkerScriptServer({ workerEntry, memoryLimitMb: LIMIT_MB });
  const result = await startServer(
    {
      ...base,
      port: 0,
      method: 'local',
      mode: 'play',
      script,
      // 关掉超时路径，确保测的是 OOM 而不是 tick timeout
      scriptTimeout: 600_000,
      storagePath: path.join(root, 'storage'),
      dataStorageNamespace: 'memory',
      groupStorageNamespace: 'memory-group',
      databaseUrl: `sqlite:///${path.join(root, 'memory.sqlite')}`,
    },
    {
      scriptServer,
      paths: {
        projectStatePath: path.join(root, 'project-state.json'),
        bundledContentPath: process.env.BOX_BUNDLED_CONTENT_PATH,
        storagePath: path.join(root, 'storage'),
        containerName: 'memory',
      },
    },
  );

  const workers = () => (scriptServer as any)._workers as Set<any>;
  const deadline = Date.now() + 10_000;
  while (workers().size === 0 && Date.now() < deadline) await delay(50);

  const first = [...workers()][0];
  if (!first) throw new Error('script worker was not launched');

  const applied = first.resourceLimits?.maxOldGenerationSizeMb;
  process.stdout.write(`resourceLimits.maxOldGenerationSizeMb=${applied}\n`);
  if (applied !== LIMIT_MB) {
    throw new Error(`memory limit not forwarded: expected ${LIMIT_MB}, got ${applied}`);
  }

  let exited = false;
  first.once('exit', () => {
    exited = true;
  });
  while (!exited && Date.now() < deadline + 20_000) await delay(100);
  process.stdout.write(`worker exited=${exited}, remaining workers=${workers().size}\n`);
  if (!exited) throw new Error('script worker did not die at its memory limit');
  process.stdout.write('process survived the worker OOM\n');

  await result.game.close();
  await new Promise<void>((resolve) => result.httpServer.close(() => resolve()));
  fs.rmSync(root, { recursive: true, force: true });
  process.stdout.write('script memory limit checks passed\n');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
