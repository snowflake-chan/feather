import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { getConfig } from '../config/server';
import { startServer } from '../src/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

async function skin(port: number) {
  const response = await fetch(`http://127.0.0.1:${port}/api/project-skin-previews`);
  return (await response.json()) as Record<string, string>;
}

async function main() {
  const workerEntry = process.env.SCRIPT_WORKER_ENTRY;
  if (!workerEntry) throw new Error('SCRIPT_WORKER_ENTRY is required');
  const base = await getConfig();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-map-context-'));
  const dirA = path.join(root, 'a');
  const dirB = path.join(root, 'b');
  fs.mkdirSync(path.join(dirA, 'blobs'), { recursive: true });
  fs.mkdirSync(path.join(dirB, 'blobs'), { recursive: true });
  const stateA = path.join(root, 'a.json');
  const stateB = path.join(root, 'b.json');
  fs.writeFileSync(stateA, JSON.stringify({ formatVersion: 1, skinPreviews: { a: 'hash-a' } }));
  fs.writeFileSync(stateB, JSON.stringify({ formatVersion: 1, skinPreviews: { b: 'hash-b' } }));

  const start = (port: number, dir: string, statePath: string, name: string) =>
    startServer(
      {
        ...base,
        port,
        storagePath: dir,
        containerName: name,
        contentId: 0,
        databaseUrl: `sqlite:///${path.join(root, `${name}.sqlite`)}`,
        dataStorageNamespace: name,
        groupStorageNamespace: 'shared-group',
      },
      {
        scriptServer: new WorkerScriptServer({ workerEntry }),
        paths: {
          projectStatePath: statePath,
          bundledContentPath: process.env.BOX_BUNDLED_CONTENT_PATH,
          storagePath: dir,
          containerName: name,
        },
      },
    );

  const a = await start(9971, dirA, stateA, 'map-a');
  const b = await start(9972, dirB, stateB, 'map-b');
  await delay(300);

  const skinA = await skin(9971);
  const skinB = await skin(9972);
  process.stdout.write(`a=${JSON.stringify(skinA)}\n`);
  process.stdout.write(`b=${JSON.stringify(skinB)}\n`);
  if (skinA.a !== 'hash-a' || skinA.b !== undefined) throw new Error('map A context leaked');
  if (skinB.b !== 'hash-b' || skinB.a !== undefined) throw new Error('map B context leaked');

  await a.game.close();
  await new Promise<void>((resolve) => a.httpServer.close(() => resolve()));
  await delay(100);
  const skinBAfter = await skin(9972);
  process.stdout.write(`b-after-a-close=${JSON.stringify(skinBAfter)}\n`);
  if (skinBAfter.b !== 'hash-b') throw new Error('map B lost context after A close');

  await b.game.close();
  await new Promise<void>((resolve) => b.httpServer.close(() => resolve()));
  fs.rmSync(root, { recursive: true, force: true });
  process.stdout.write('map context checks passed\n');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
