import { setTimeout as delay } from 'node:timers/promises';
import v8 from 'node:v8';

import { getConfig } from '../config/server';
import { startServer } from '../src/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

function heapMb() {
  return Math.round(v8.getHeapStatistics().used_heap_size / 1024 / 1024);
}

function collect() {
  (globalThis as any).gc?.();
}

async function health(port: number) {
  const response = await fetch(`http://127.0.0.1:${port}/api/health-check`);
  return (await response.json()) as { storage?: string; status?: string };
}

async function main() {
  const workerEntry = process.env.SCRIPT_WORKER_ENTRY;
  if (!workerEntry) throw new Error('SCRIPT_WORKER_ENTRY is required');
  const config = await getConfig();
  const start = (port: number, storagePath: string) =>
    startServer(
      { ...config, port, storagePath, contentId: 0 },
      { scriptServer: new WorkerScriptServer({ workerEntry }) },
    );

  process.stdout.write(`heap before=${heapMb()}MB\n`);
  const a = await start(9988, '/tmp/feather-two-a');
  const b = await start(9989, '/tmp/feather-two-b');
  process.stdout.write(`heap both=${heapMb()}MB\n`);
  await delay(500);
  process.stdout.write(`a=${JSON.stringify(await health(9988))}\n`);
  process.stdout.write(`b=${JSON.stringify(await health(9989))}\n`);

  await a.game.close();
  collect();
  process.stdout.write(`heap after a=${heapMb()}MB\n`);
  await new Promise<void>((resolve) => a.httpServer.close(() => resolve()));
  await delay(500);
  process.stdout.write(`after a close: b=${JSON.stringify(await health(9989))}\n`);

  await b.game.close();
  collect();
  process.stdout.write(`heap after b=${heapMb()}MB\n`);
  await new Promise<void>((resolve) => b.httpServer.close(() => resolve()));
  process.stdout.write('both closed\n');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
