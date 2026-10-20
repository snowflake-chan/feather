import type { EngineStatus } from 'feather-engine/contract';

export type MapState =
  | 'created'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error'
  | 'destroyed';

export type RestartPolicy = 'no' | 'on-failure' | 'always';

export interface MapLimits {
  players?: number;
  memoryMb?: number;
}

/** 创建/加载一张地图所需的最小描述 */
export interface MapSpec {
  id: string;
  name?: string;
  workspaceId?: string;
  projectHash?: string;
  projectStatePath?: string;
  contentDir?: string;
  localConfigPath?: string;
  port?: number;
  scriptWorkerEntry?: string;
  env?: Record<string, string>;
  limits?: MapLimits;
  restartPolicy?: RestartPolicy;
  autoStart?: boolean;
  dataDir?: string;
  mode?: 'play' | 'edit';
  method?: 'local';
  databaseUrl?: string;
  groupNamespace?: string;
  dataStorageNamespace?: string;
  contentId?: number;
  labels?: Record<string, string>;
}

export interface MapStatus {
  id: string;
  name?: string;
  workspaceId?: string;
  state: MapState;
  runtime: 'worker';
  shardId?: string;
  port?: number;
  url?: string;
  pid?: number;
  startedAt?: string;
  engine?: EngineStatus;
  error?: string;
  restartPolicy?: RestartPolicy;
  autoStart?: boolean;
  labels?: Record<string, string>;
}

export interface MapStats {
  tick: number;
  players: number;
  uptimeMs: number;
  tickRate: number;
  rssBytes?: number;
  heapUsedBytes?: number;
  cpuPercent?: number;
}

export interface LogEntry {
  time: string;
  stream: 'stdout' | 'stderr' | 'engine' | 'script';
  message: string;
}

export type DaemonEventType =
  | 'daemon.ready'
  | 'daemon.shutdown'
  | 'map.created'
  | 'map.starting'
  | 'map.running'
  | 'map.stopping'
  | 'map.stopped'
  | 'map.error'
  | 'map.destroyed';

export interface DaemonEvent {
  type: DaemonEventType;
  mapId?: string;
  time: string;
  data?: Record<string, unknown>;
}

export interface Operation {
  id: string;
  mapId: string;
  kind: 'start' | 'stop' | 'restart' | 'destroy';
  state: 'pending' | 'running' | 'done' | 'error';
  createdAt: string;
  finishedAt?: string;
  error?: string;
}

export interface DaemonInfo {
  version: string;
  apiVersion: string;
  runtime: string;
  maps: number;
  shards: number;
  cores: number;
  uptimeMs: number;
  dataDir?: string;
  socketPath?: string;
}

export interface StopOptions {
  /** 优雅停止的超时；超时后可 force */
  timeoutMs?: number;
  force?: boolean;
}

export interface DestroyOptions {
  force?: boolean;
}

export interface LogOptions {
  follow?: boolean;
  since?: string;
  tail?: number;
}

export interface EventOptions {
  since?: string;
}

/**
 * supervisor 的门面。
 * daemon 管理 MapSpec/MapStatus，不处理玩家 session。
 */
export interface DaemonHandle {
  ping(): Promise<{ ok: true; version: string }>;
  version(): Promise<{ version: string; apiVersion: string }>;
  info(): Promise<DaemonInfo>;

  listMaps(): Promise<MapStatus[]>;
  getMap(id: string): Promise<MapStatus | undefined>;
  createMap(spec: MapSpec): Promise<MapStatus>;
  startMap(id: string): Promise<Operation>;
  stopMap(id: string, opts?: StopOptions): Promise<Operation>;
  restartMap(id: string): Promise<Operation>;
  destroyMap(id: string, opts?: DestroyOptions): Promise<void>;

  stats(id: string): Promise<MapStats>;
  logs(id: string, opts?: LogOptions): AsyncIterable<LogEntry>;
  events(opts?: EventOptions): AsyncIterable<DaemonEvent>;

  exec(id: string, command: string, args?: unknown): Promise<unknown>;
  close(): Promise<void>;
}

export interface CreateDaemonOptions {
  /** workspace 根目录；daemon 默认 socket/data 都在 <workspace>/.feather */
  workspaceRoot?: string;
  /** 默认 <workspace>/.feather/daemon.sock */
  socketPath?: string;
  /** 显式开启 TCP 时才用 */
  host?: string;
  port?: number;
  dataDir?: string;
  token?: string;
  tcp?: boolean;
}

/**
 * D2 实现：先单图 in-process，再演进到多图/多进程。
 * 当前只预留类型，不提供运行时。
 */
export type CreateDaemon = (
  options: CreateDaemonOptions,
) => Promise<DaemonHandle>;
