import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { ShardRuntime } from './runtime/shard-runtime';
import type { MapSpec } from './contract';

async function health(port: number) {
  const response = await fetch(`http://127.0.0.1:${port}/api/health-check`);
  return (await response.json()) as { status: string; runtime: string; storage: string };
}

async function main() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-shard-'));
  const workerEntry = path.resolve(__dirname, '../../shell/tools/worker-entry/worker-entry.js');
  const blobs = process.env.BOX_BUNDLED_CONTENT_PATH;
  if (!blobs) throw new Error('BOX_BUNDLED_CONTENT_PATH is required');

  const makeMap = (id: string, skin: string): MapSpec => {
    const statePath = path.join(workspace, `${id}.project-state.json`);
    fs.writeFileSync(statePath, JSON.stringify({ formatVersion: 1, skinPreviews: { [skin]: `hash-${skin}` } }));
    return {
      id,
      name: id,
      scriptWorkerEntry: workerEntry,
      projectStatePath: statePath,
      contentDir: blobs,
      port: 0,
      dataDir: path.join(workspace, '.feather', 'data', id),
      databaseUrl: `sqlite:///${path.join(workspace, '.feather', 'sqlite', `${id}.sqlite`)}`,
      dataStorageNamespace: id,
      groupNamespace: 'shard-group',
      contentId: id === 'a' ? 101 : 102,
    };
  };

  const logs: string[] = [];
  const shard = new ShardRuntime({
    shardId: 'shard-0',
    workspaceRoot: workspace,
    maps: [makeMap('a', 'skin-a'), makeMap('b', 'skin-b')],
    onLog: (_s, stream, message) => logs.push(`${stream}:${message.trim()}`),
    onMapReady: (_s, id, port) => logs.push(`ready:${id}:${port}`),
    onMapError: (_s, id, error) => logs.push(`error:${id}:${error}`),
  });

  await shard.start();
  const a = shard.maps.get('a');
  const b = shard.maps.get('b');
  if (!a?.port || !b?.port) {
    process.stdout.write(`a=${JSON.stringify(a)}\nb=${JSON.stringify(b)}\nlogs=${JSON.stringify(logs.slice(-20))}\n`);
    throw new Error('maps did not report ports');
  }
  await delay(300);
  process.stdout.write(`a=${JSON.stringify(await health(a.port))}\n`);
  process.stdout.write(`b=${JSON.stringify(await health(b.port))}\n`);

  await shard.stopMap('a');
  await delay(200);
  const afterA = await health(b.port);
  process.stdout.write(`b-after-a=${JSON.stringify(afterA)}\n`);
  if (afterA.runtime !== 'ready') throw new Error('map B not healthy after A stop');

  await shard.stopAll();
  process.stdout.write(`shard stopped; log lines=${logs.length}\n`);
  fs.rmSync(workspace, { recursive: true, force: true });
  process.stdout.write('shard checks passed\n');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
