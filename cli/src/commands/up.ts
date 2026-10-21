import fs from 'node:fs';
import path from 'node:path';

import { ApiError } from '../client';
import { resolveDataRoot } from '../data-root';
import { ensureDaemon } from '../daemon-process';
import { loadMaps } from '../workspace-spec';

export async function upCommand(
  options: { ids?: string[]; dataDir?: string; foreground?: boolean } = {},
) {
  const dataRoot = resolveDataRoot(options.dataDir);
  const mapsRoot = path.join(dataRoot, 'maps');
  const mapDirs = options.ids?.length
    ? options.ids.map((id) => path.join(mapsRoot, id))
    : fs
        .readdirSync(mapsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(mapsRoot, entry.name));
  const loaded = loadMaps(mapDirs, dataRoot);
  const client = await ensureDaemon(dataRoot, options.foreground);
  const existing = new Map((await client.listMaps()).map((map) => [map.id, map]));
  // Create every map first so daemon shard assignment sees the full set.
  for (const spec of loaded.maps) {
    if (!existing.has(spec.id)) {
      const status = await client.createMap(spec);
      existing.set(spec.id, status);
    }
  }
  for (const spec of loaded.maps) {
    const status = existing.get(spec.id)!;
    if (spec.autoStart !== false && status.state !== 'running') {
      await ensureRunning(client, spec.id);
    }
    const current = await client.getMap(spec.id);
    process.stdout.write(
      `${current.id}\t${current.state}\t${current.url || '-'}\tshard=${current.shardId || '-'}\n`,
    );
  }
  process.stdout.write(`data: ${dataRoot}\n`);
}

async function ensureRunning(client: import('../client').DaemonClient, id: string) {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      await client.startMap(id);
      return;
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'OPERATION_IN_PROGRESS') throw error;
      if (Date.now() > deadline) throw error;
      const map = await client.getMap(id);
      if (map.state === 'running') return;
      if (map.state === 'error') throw new Error(map.error || `map ${id} failed`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
