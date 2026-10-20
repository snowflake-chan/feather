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
    const isolated = storage.mode === 'isolated';
    const databaseUrl = entry.database_url
      ? entry.database_url
      : sqliteUrl(
          storage.path
            ? path.resolve(root, storage.path, `${isolated ? id : groupNamespace}.sqlite`)
            : path.join(root, '.feather', 'sqlite', `${isolated ? id : groupNamespace}.sqlite`),
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
      groupNamespace,
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
