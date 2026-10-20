import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { getConfig } from '../config/server';
import { startServer } from '../src/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

async function main() {
  const workerEntry = process.env.SCRIPT_WORKER_ENTRY;
  if (!workerEntry) throw new Error('SCRIPT_WORKER_ENTRY is required');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-timeout-'));
  const script = path.join(root, 'infinite.js');
  fs.writeFileSync(script, 'while (true) {}\n');
  const base = await getConfig();
  const scriptServer = new WorkerScriptServer({ workerEntry });
  const result = await startServer(
    {
      ...base,
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
  const deadline = Date.now() + 8_000;
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
