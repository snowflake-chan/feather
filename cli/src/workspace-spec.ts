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

function mergeLegacyBlobs(mapDir: string, dataRoot: string) {
  const source = path.join(mapDir, 'content', 'blobs');
  if (!fs.existsSync(source)) return;
  const target = path.join(dataRoot, 'blobs');
  fs.mkdirSync(target, { recursive: true });
  for (const name of fs.readdirSync(source)) {
    const to = path.join(target, name);
    if (!fs.existsSync(to)) fs.copyFileSync(path.join(source, name), to);
  }
  // 迁移完成后删掉 map 内的旧副本，避免同一 blob 存两份。
  fs.rmSync(source, { recursive: true, force: true });
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
  mergeLegacyBlobs(mapDir, dataRoot);
  const contentDir = path.join(dataRoot, 'blobs');
  if (!fs.existsSync(projectStatePath)) {
    throw new Error(`map ${id}: missing ${projectStatePath}`);
  }
  if (!fs.existsSync(contentDir)) {
    throw new Error(`map ${id}: missing ${contentDir}`);
  }
  let projectHash = '';
  try {
    const state = JSON.parse(fs.readFileSync(projectStatePath, 'utf8')) as {
      permissionHash?: unknown;
    };
    if (typeof state.permissionHash === 'string') projectHash = state.permissionHash;
  } catch {
    // Let the engine report malformed project-state with its own error.
  }

  const volume = normalizeVolume(manifest.storage?.volume, id);
  const runtime = manifest.runtime || {};
  const databaseRoot = path.join(dataRoot, 'volumes');
  return {
    id,
    name: manifest.map.name,
    projectStatePath,
    contentDir,
    projectHash,
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
    dataStorageNamespace: id,
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
