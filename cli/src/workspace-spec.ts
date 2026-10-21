import fs from 'node:fs';
import path from 'node:path';

import type { MapSpec } from '@feather/daemon/contract';

import { FmapManifest, readFmapManifest } from './fmap';

export interface LoadedMaps {
  maps: MapSpec[];
}

function sqliteUrl(file: string) {
  return `sqlite:///${path.resolve(file)}`;
}

const VOLUME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function normalizeVolume(value: string | undefined, fallback: string): string {
  const name = (value ?? '').trim() || fallback;
  if (!VOLUME_RE.test(name) || name.includes('..')) {
    throw new Error(`invalid volume name: ${JSON.stringify(name)}`);
  }
  return name;
}

function assertContentPath(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`content path escapes package: ${relative}`);
  }
  return resolved;
}

function loadOne(mapDir: string, dataRoot: string): MapSpec {
  const manifest: FmapManifest = readFmapManifest(mapDir);
  const id = manifest.map.id;
  const projectStatePath = assertContentPath(mapDir, manifest.content.state);
  const contentDir = assertContentPath(mapDir, manifest.content.blobs);
  if (!fs.existsSync(projectStatePath)) {
    throw new Error(`map ${id}: missing ${projectStatePath}`);
  }
  if (!fs.existsSync(contentDir)) {
    throw new Error(`map ${id}: missing ${contentDir}`);
  }

  const volume = normalizeVolume(manifest.storage?.volume, id);
  const runtime = manifest.runtime || {};
  const databaseRoot = path.join(dataRoot, 'volumes');
  return {
    id,
    name: manifest.map.name,
    workspaceId: id,
    projectStatePath,
    contentDir,
    port: runtime.port ?? 0,
    scriptWorkerEntry: path.resolve(
      __dirname,
      '../../shell/tools/worker-entry/worker-entry.js',
    ),
    dataDir: path.join(dataRoot, 'maps', id, 'data'),
    mode: 'play',
    method: 'local',
    databaseUrl: sqliteUrl(path.join(databaseRoot, `${volume}.db`)),
    volume,
    groupNamespace: volume,
    dataStorageNamespace: id,
    env: undefined,
    limits: {
      memoryMb: runtime.memoryMb ?? undefined,
      players: runtime.playerLimit ?? undefined,
    },
    labels: {
      version: manifest.map.version || '',
      source: manifest.source?.kind || '',
    },
  };
}

export function loadMaps(mapDirs: string[], dataRoot: string): LoadedMaps {
  if (mapDirs.length === 0) throw new Error('no map directories provided');
  const byId = new Map<string, MapSpec>();
  for (const dir of mapDirs) {
    const map = loadOne(path.resolve(dir), dataRoot);
    if (byId.has(map.id)) throw new Error(`duplicate map id: ${map.id}`);
    byId.set(map.id, map);
  }
  return { maps: [...byId.values()] };
}
