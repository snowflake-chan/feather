import { setTimeout as delay } from 'node:timers/promises';
import v8 from 'node:v8';

import { getConfig } from '../config/server';
import { startServer } from '../src/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

async function main() {
  const config = await getConfig();
  let scriptServer: WorkerScriptServer | null = new WorkerScriptServer({
    workerEntry: process.env.SCRIPT_WORKER_ENTRY!,
  });
  let result: Awaited<ReturnType<typeof startServer>> | null =
    await startServer(config, { scriptServer });
  let http: typeof result.httpServer | null = result.httpServer;
  await result.game.close();
  await new Promise<void>((resolve) => http!.close(() => resolve()));
  result = null;
  http = null;

  const gc = (globalThis as any).gc;
  process.stdout.write(`gc=${typeof gc}\n`);
  for (let i = 0; i < 5; ++i) {
    await delay(150);
    gc?.({ type: 'major', execution: 'sync' });
    process.stdout.write(
      `heap[${i}]=${Math.round(v8.getHeapStatistics().used_heap_size / 1024 / 1024)}MB\n`,
    );
  }
  const file = v8.writeHeapSnapshot('/tmp/feather.heapsnapshot');
  process.stdout.write(`snapshot=${file}\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
