import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';

import type { MapSpec } from '@feather/daemon/contract';

interface MapFileToml {
  schema_version?: number;
  map?: {
    id?: string;
    name?: string;
    port?: number;
    data_dir?: string;
    mode?: 'play' | 'edit';
    memory_mb?: number;
    player_limit?: number;
    env?: Record<string, string>;
  };
  storage?: {
    /** 逻辑 SQLite 卷名；默认 map id，显式同名共享同一个 .db */
    volume?: string;
    path?: string;
    database_url?: string;
    group_namespace?: string;
  };
  runtime?: { script_worker_entry?: string };
}

export interface LoadedMaps {
  maps: MapSpec[];
}

function readManifest(mapDir: string): { permissionHash?: string; contentId?: number } {
  const file = path.join(mapDir, 'manifest.json');
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8')) as {
    permissionHash?: string;
    contentId?: number;
  };
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

function readToml<T>(file: string): T {
  return parse(fs.readFileSync(file, 'utf8')) as unknown as T;
}

function loadMap(mapDir: string, dataRoot: string): MapSpec {
  const mapFile = path.join(mapDir, 'feather.toml');
  if (!fs.existsSync(mapFile)) {
    throw new Error(`map config not found: ${mapFile}`);
  }
  const parsed = readToml<MapFileToml>(mapFile);
  const id = String(parsed.map?.id || '').trim();
  if (!id) throw new Error(`missing [map].id: ${mapFile}`);

  const projectStatePath = path.join(mapDir, 'data', 'project-state.json');
  const contentDir = path.join(mapDir, 'data', 'blobs');
  if (!fs.existsSync(projectStatePath)) {
    throw new Error(`map ${id}: missing ${projectStatePath}`);
  }
  if (!fs.existsSync(contentDir)) {
    throw new Error(`map ${id}: missing ${contentDir}`);
  }

  const manifest = readManifest(mapDir);
  const storage = parsed.storage || {};
  const volume = normalizeVolume(storage.volume, id);
  const databaseRoot = storage.path
    ? path.resolve(mapDir, storage.path)
    : path.join(dataRoot, 'volumes');
  const databaseUrl = storage.database_url
    ? storage.database_url
    : sqliteUrl(path.join(databaseRoot, `${volume}.db`));
  const scriptWorkerEntry = parsed.runtime?.script_worker_entry
    ? path.resolve(mapDir, parsed.runtime.script_worker_entry)
    : path.resolve(__dirname, '../../shell/tools/worker-entry/worker-entry.js');

  return {
    id,
    name: parsed.map?.name,
    workspaceId: id,
    projectHash: manifest.permissionHash,
    projectStatePath,
    contentDir,
    port: parsed.map?.port ?? 0,
    scriptWorkerEntry,
    dataDir: parsed.map?.data_dir
      ? path.resolve(mapDir, parsed.map.data_dir)
      : path.join(dataRoot, 'maps', id, 'data'),
    mode: parsed.map?.mode || 'play',
    method: 'local',
    databaseUrl,
    volume,
    groupNamespace: storage.volume?.trim() ? volume : (storage.group_namespace || id),
    dataStorageNamespace: id,
    contentId: manifest.contentId ?? 0,
    env: parsed.map?.env,
    limits: {
      memoryMb: parsed.map?.memory_mb,
      players: parsed.map?.player_limit,
    },
    autoStart: true,
    labels: { map: id },
  };
}

export function loadMaps(mapDirs: string[], dataRoot: string): LoadedMaps {
  if (mapDirs.length === 0) throw new Error('no map directories provided');
  const byId = new Map<string, MapSpec>();
  for (const dir of mapDirs) {
    const map = loadMap(path.resolve(dir), dataRoot);
    if (byId.has(map.id)) throw new Error(`duplicate map id: ${map.id}`);
    byId.set(map.id, map);
  }
  return { maps: [...byId.values()] };
}
