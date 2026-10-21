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
  dataDir?: string;
  mode?: 'play' | 'edit';
  method?: 'local';
  databaseUrl?: string;
  /** SQLite 逻辑卷名。默认等于 map id；显式同名会共享同一个 .db。 */
  volume?: string;
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
  volume?: string;
  labels?: Record<string, string>;
}

/**
 * shard 级资源快照。
 *
 * engine 允许一个 shard 打包多图，所以 CPU / 堆这类资源天然只有 shard 口径，
 * 摊不到单张图上——同 shard 的图读到的是同一份数。
 */
export interface ShardUsage {
  /** 该 worker 线程的 CPU 占用，单位 %（单核满载 = 100，塞了多图可超过 100） */
  cpuPercent?: number;
  /** 该 isolate 的 V8 堆已用量 */
  heapUsedBytes?: number;
  /** 该 isolate 的 V8 堆总量 */
  heapTotalBytes?: number;
  /** 该 isolate 的堆上限（`--max-old-space-size` 生效后的值） */
  heapLimitBytes?: number;
  /** 该 isolate 的 external + malloced 内存 */
  externalBytes?: number;
  /** 采样时刻（ISO 8601） */
  sampledAt: string;
}

/** `/v1/shards` 的返回项 */
export interface ShardStats extends ShardUsage {
  shardId: string;
  /** 该 shard 承载的图 id */
  maps: string[];
  mapCount: number;
  /**
   * 进程级 RSS。worker 线程共享同一地址空间，RSS 没有 per-thread 口径，
   * 所以每个 shard 报的都是同一个数，只能当「整个 daemon 占多少」看。
   */
  rssBytes: number;
  /** 该 shard 已存活时长（ms） */
  uptime: number;
}

/**
 * 单图的运行时指标。
 *
 * 注意这里**只有图自身能测的东西**：tick / 玩家 / 帧率 / 帧耗时。
 * 内存和 CPU 不放这里——它们属于 shard（见 `shard` 字段），一张图摊不出来。
 *
 * 单位约定（全 daemon 契约统一）：
 * - 时间默认 ms，不加后缀：`uptime`、`tickDuration`、`maxTickDuration`
 * - 字节必须带后缀：`heapUsedBytes`、`rssBytes`（裸数字不会默认理解成字节）
 * - 百分比带 `Percent`，频率带 `Rate`
 */
export interface MapStats {
  tick: number;
  players: number;
  /** 该图已运行时长（ms） */
  uptime: number;
  /** 实测 TPS（每秒实际完成的帧数）。标称 15.625（1000/64），掉到标称以下说明已经跟不上 */
  tickRate: number;
  /**
   * 上一采样窗口内每帧的平均**计算耗时**（ms），对应 MC 的 MSPT。
   * 注意不是 `1000 / tickRate`——那是帧周期（含等待）。空闲图耗时远小于周期。
   */
  tickDuration?: number;
  /** 启动以来最慢的一帧的计算耗时（ms） */
  maxTickDuration?: number;
  /** 该图所在 shard */
  shardId?: string;
  /** 所在 shard 的资源快照；同 shard 的图拿到的是同一份数 */
  shard?: ShardUsage;
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
  /** daemon 已运行时长（ms） */
  uptime: number;
  /**
   * 跨 shard 共享的内容 arena 占用。
   *
   * 这块内存在 V8 堆外，`heapUsed` / `rssBytes` 都反映不出它的构成，
   * 所以单独报一份。关掉 arena 时字段缺省。
   */
  contentArena?: ContentArenaInfo;
  dataDir?: string;
  socketPath?: string;
}

/** 共享内容 arena 的占用快照，口径是进程级（不是每 shard） */
export interface ContentArenaInfo {
  /** 已分配的 payload 字节 */
  usedBytes: number;
  /** payload 区总容量 */
  capacityBytes: number;
  /** 已发布的索引条目数 */
  entries: number;
  /** 索引表容量 */
  entryCapacity: number;
  /** 因为空间不足被拒绝缓存的次数；持续增长说明 arena 该调大了 */
  rejected: number;
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
  listShards(): Promise<ShardStats[]>;
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
  /** 显式开启地图 shell 的 eval；默认关闭，属于高危能力。 */
  enableExec?: boolean;
}

/**
 * D2 实现：先单图 in-process，再演进到多图/多进程。
 * 当前只预留类型，不提供运行时。
 */
export type CreateDaemon = (
  options: CreateDaemonOptions,
) => Promise<DaemonHandle>;
