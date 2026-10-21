import fs from 'node:fs';
import path from 'node:path';

import type { EngineConfig } from 'feather-engine/contract';
import type { EngineMapPaths } from 'feather-engine/entry';

import type { MapSpec } from '../contract';

export function resolveMapPaths(workspaceRoot: string, spec: MapSpec): EngineMapPaths {
  const dataDir = spec.dataDir || path.join(workspaceRoot, '.feather', 'data', spec.id);
  fs.mkdirSync(dataDir, { recursive: true });
  const groupState = path.join(workspaceRoot, '.feather', 'group-state.json');
  const groupContent = path.join(workspaceRoot, '.feather', 'group-content');
  return {
    projectStatePath: spec.projectStatePath,
    groupProjectStatePath: fs.existsSync(groupState) ? groupState : undefined,
    bundledContentPath: spec.contentDir,
    groupContentPath: fs.existsSync(groupContent) ? groupContent : undefined,
    derivedStoragePath: path.join(workspaceRoot, '.feather', 'storage'),
    storagePath: dataDir,
    containerName: spec.id,
  };
}

/**
 * 单图脚本内存上限（MB）。
 * `MapSpec.limits.memoryMb` 覆盖全局 `SCRIPT_MEMORY_LIMIT`；都没有则返回 undefined（不限制）。
 */
export function resolveScriptMemoryLimitMb(
  spec: MapSpec,
  base: EngineConfig,
): number | undefined {
  const value = spec.limits?.memoryMb ?? base.SCRIPT_MEMORY_LIMIT;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.floor(value);
}

const VOLUME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

/** volume 同时是 group 的物理边界；禁止路径分隔符和 `..`。 */
export function normalizeVolumeName(value: string | undefined, fallback: string): string {
  const name = (value ?? '').trim() || fallback;
  if (!VOLUME_RE.test(name) || name.includes('..')) {
    throw new Error(`invalid volume name: ${JSON.stringify(name)}`);
  }
  return name;
}

export function resolveVolumeDatabasePath(workspaceRoot: string, volume: string): string {
  return path.join(workspaceRoot, '.feather', 'volumes', `${volume}.db`);
}

export function buildMapConfig(
  base: EngineConfig,
  spec: MapSpec,
  workspaceRoot: string,
): EngineConfig {
  const paths = resolveMapPaths(workspaceRoot, spec);
  const volume = normalizeVolumeName(spec.volume, spec.id);
  const sqlitePath = resolveVolumeDatabasePath(workspaceRoot, volume);
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  return {
    ...base,
    port: spec.port ?? 0,
    method: spec.method ?? 'local',
    mode: spec.mode ?? 'play',
    hash: spec.projectHash ?? '',
    contentId: spec.contentId ?? 0,
    containerName: spec.id,
    storagePath: paths.storagePath!,
    databaseUrl: spec.databaseUrl ?? `sqlite:///${sqlitePath}`,
    dataStorageDriver: 'sqlite',
    dataStorageNamespace: spec.dataStorageNamespace ?? spec.id,
    groupStorageNamespace: spec.groupNamespace ?? volume,
    playerLimit: spec.limits?.players ?? base.playerLimit,
    SCRIPT_MEMORY_LIMIT: resolveScriptMemoryLimitMb(spec, base),
  };
}
