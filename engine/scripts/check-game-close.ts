import { setTimeout as delay } from 'node:timers/promises';

import { getConfig } from '../config/server';
import { startServer } from '../src/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

async function main() {
  const workerEntry = process.env.SCRIPT_WORKER_ENTRY;
  if (!workerEntry) throw new Error('SCRIPT_WORKER_ENTRY is required');
  const config = await getConfig();
  const scriptServer = new WorkerScriptServer({ workerEntry });
  const result = await startServer(config, { scriptServer });
  process.stdout.write(
    `started on ${JSON.stringify(result.httpServer.address())}\n`,
  );
  await delay(500);
  await result.game.close();
  await new Promise<void>((resolve) => result.httpServer.close(() => resolve()));
  process.stdout.write('game server closed\n');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
