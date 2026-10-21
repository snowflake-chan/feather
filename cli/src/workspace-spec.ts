import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';

import type { MapSpec } from '@feather/daemon/contract';

interface MapToml {
  id: string;
  name?: string;
  path: string;
  port?: number;
  auto_start?: boolean;
  data_dir?: string;
  database_url?: string;
  /** 逻辑 SQLite 卷名；默认 map id，显式同名共享同一个 .db */
  volume?: string;
  env?: Record<string, string>;
  mode?: 'play' | 'edit';
  /** 单图脚本 worker 的内存上限（MB）；不填则用全局 SCRIPT_MEMORY_LIMIT */
  memory_mb?: number;
  /** 单图玩家上限 */
  player_limit?: number;
}

interface WorkspaceToml {
  workspace?: { name?: string; data_dir?: string };
  storage?: { driver?: string; mode?: 'shared' | 'isolated'; group_namespace?: string; path?: string };
  runtime?: { script_worker_entry?: string };
  maps?: MapToml[];
}

export interface LoadedWorkspace {
  root: string;
  name: string;
  maps: MapSpec[];
}

export function findWorkspaceRoot(start = process.cwd()): string {
  let current = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(current, 'feather.toml'))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error('feather.toml not found; run inside a workspace');
    current = parent;
  }
}

function readManifest(mapDir: string): { permissionHash?: string; contentId?: number } {
  const file = path.join(mapDir, 'manifest.json');
  if (!fs.existsSync(file)) return {};
  const value = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    permissionHash?: string;
    contentId?: number;
  };
  return value;
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

export function loadWorkspace(root: string): LoadedWorkspace {
  const file = path.join(root, 'feather.toml');
  const parsed = parse(fs.readFileSync(file, 'utf8')) as unknown as WorkspaceToml;
  const workspaceName = parsed.workspace?.name || path.basename(root);
  const storage = parsed.storage || {};
  const groupNamespace = storage.group_namespace || workspaceName;
  const scriptWorkerEntry = parsed.runtime?.script_worker_entry
    ? path.resolve(root, parsed.runtime.script_worker_entry)
    : path.resolve(__dirname, '../../shell/tools/worker-entry/worker-entry.js');
  const maps: MapSpec[] = [];
  for (const entry of parsed.maps || []) {
    const mapDir = path.resolve(root, entry.path);
    const projectStatePath = path.join(mapDir, 'data', 'project-state.json');
    const contentDir = path.join(mapDir, 'data', 'blobs');
    if (!fs.existsSync(projectStatePath)) {
      throw new Error(`map ${entry.id}: missing ${projectStatePath}`);
    }
    if (!fs.existsSync(contentDir)) {
      throw new Error(`map ${entry.id}: missing ${contentDir}`);
    }
    const manifest = readManifest(mapDir);
    const id = entry.id;
    const volume = normalizeVolume(
      entry.volume,
      storage.mode === 'shared' && storage.group_namespace ? storage.group_namespace : id,
    );
    const databaseUrl = entry.database_url
      ? entry.database_url
      : sqliteUrl(
          storage.path
            ? path.resolve(root, storage.path, `${volume}.db`)
            : path.join(root, '.feather', 'volumes', `${volume}.db`),
        );
    maps.push({
      id,
      name: entry.name,
      workspaceId: workspaceName,
      projectHash: manifest.permissionHash,
      projectStatePath,
      contentDir,
      port: entry.port ?? 0,
      scriptWorkerEntry,
      dataDir: path.resolve(root, entry.data_dir || path.join('.feather', 'data', id)),
      mode: entry.mode || 'play',
      method: 'local',
      databaseUrl,
      volume,
      groupNamespace:
        entry.volume?.trim()
          ? volume
          : storage.mode === 'shared'
            ? groupNamespace
            : id,
      dataStorageNamespace: id,
      contentId: manifest.contentId ?? 0,
      env: entry.env,
      limits: {
        memoryMb: entry.memory_mb,
        players: entry.player_limit,
      },
      autoStart: entry.auto_start !== false,
      labels: { workspace: workspaceName },
    });
  }
  return { root, name: workspaceName, maps };
}
