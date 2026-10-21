import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { readSharedArenaUsage, type SharedArenaSpec } from 'feather-engine/content-arena';

import type {
  CreateDaemonOptions,
  DaemonEvent,
  DaemonHandle,
  DaemonInfo,
  DestroyOptions,
  LogEntry,
  LogOptions,
  MapSpec,
  MapStats,
  MapStatus,
  Operation,
  ShardStats,
  StopOptions,
} from './contract';
import { resolveShardBudget, shouldCreateShard } from './runtime/shard-policy';
import { createContentArenaSpec } from './runtime/content-arena';
import { NOMINAL_TICK_RATE } from './runtime/stats';
import { ShardRuntime } from './runtime/shard-runtime';

const VERSION = '0.1.0';
const API_VERSION = 'v1';
const MAX_LOG_LINES = 2000;
const MAX_EVENTS = 2000;

interface MapRecord {
  spec: MapSpec;
  status: MapStatus;
  stats?: MapStats;
  shardId?: string;
  busy?: boolean;
}

function now() {
  return new Date().toISOString();
}

function makeOperation(kind: Operation['kind'], mapId: string): Operation {
  return {
    id: crypto.randomUUID(),
    mapId,
    kind,
    state: 'running',
    createdAt: now(),
  };
}

export class Daemon implements DaemonHandle {
  private readonly _startedAt = Date.now();
  private readonly _records = new Map<string, MapRecord>();
  private readonly _shards = new Map<string, ShardRuntime>();
  private readonly _operations = new Map<string, Operation>();
  private readonly _events: DaemonEvent[] = [];
  private readonly _shardLogs = new Map<string, LogEntry[]>();
  private readonly _stateFile: string;
  private _shardSeq = 0;
  private _closed = false;
  /** 懒创建：没有图要跑就不必占这块地址空间 */
  private _contentArena?: SharedArenaSpec;
  private _contentArenaResolved = false;

  constructor(private readonly _options: CreateDaemonOptions) {
    const workspaceRoot = path.resolve(_options.workspaceRoot || process.cwd());
    this._options.workspaceRoot = workspaceRoot;
    this._options.dataDir = _options.dataDir || path.join(workspaceRoot, '.feather');
    fs.mkdirSync(this._options.dataDir, { recursive: true });
    fs.mkdirSync(path.join(this._options.dataDir, 'logs'), { recursive: true });
    fs.mkdirSync(path.join(this._options.dataDir, 'sqlite'), { recursive: true });
    this._stateFile = path.join(this._options.dataDir, 'state.json');
    this._loadState();
  }

  public async ping() {
    return { ok: true as const, version: VERSION };
  }

  public async version() {
    return { version: VERSION, apiVersion: API_VERSION };
  }

  public async info(): Promise<DaemonInfo> {
    const arena = this._resolveContentArena();
    return {
      version: VERSION,
      apiVersion: API_VERSION,
      runtime: 'node',
      maps: this._records.size,
      shards: this._shards.size,
      cores: os.availableParallelism(),
      uptime: Date.now() - this._startedAt,
      // 只在真的启用时报，关掉 arena 时字段缺省，免得报一堆 0 让人以为坏了。
      contentArena: arena ? readSharedArenaUsage(arena) : undefined,
      dataDir: this._options.dataDir,
      socketPath: this._options.socketPath,
    };
  }

  public async listMaps(): Promise<MapStatus[]> {
    return Array.from(this._records.values()).map((record) => ({ ...record.status }));
  }

  public async getMap(id: string): Promise<MapStatus | undefined> {
    const record = this._records.get(id);
    return record ? { ...record.status } : undefined;
  }

  public async createMap(spec: MapSpec): Promise<MapStatus> {
    if (!spec?.id || !/^[A-Za-z0-9._-]+$/.test(spec.id)) {
      throw new DaemonError('INVALID_SPEC', `invalid map id: ${spec?.id || ''}`);
    }
    if (this._records.has(spec.id)) {
      throw new DaemonError('MAP_CONFLICT', `map already exists: ${spec.id}`);
    }
    const status: MapStatus = {
      id: spec.id,
      name: spec.name,
      workspaceId: spec.workspaceId,
      state: 'created',
      runtime: 'worker',
      restartPolicy: spec.restartPolicy,
      volume: spec.volume || spec.id,
      labels: spec.labels,
    };
    this._records.set(spec.id, { spec, status });
    this._persist();
    this._event({ type: 'map.created', mapId: spec.id, time: now() });
    return { ...status };
  }

  public async startMap(id: string): Promise<Operation> {
    const record = this._requireMap(id);
    if (record.status.state === 'running') {
      return this._doneOperation('start', id);
    }
    if (record.busy) throw new DaemonError('OPERATION_IN_PROGRESS', `map busy: ${id}`);
    record.busy = true;
    const operation = makeOperation('start', id);
    this._operations.set(operation.id, operation);
    record.status.state = 'starting';
    record.status.error = undefined;
    this._event({ type: 'map.starting', mapId: id, time: now() });
    try {
      const shard = await this._ensureShard(record);
      record.shardId = shard.shardId;
      record.status.shardId = shard.shardId;
      const state = shard.maps.get(id);
      if (!state?.port) throw new Error(state?.error || `map ${id} did not start`);
      record.status.state = 'running';
      record.status.port = state.port;
      record.status.url = `http://127.0.0.1:${state.port}`;
      record.status.startedAt = now();
      operation.state = 'done';
      operation.finishedAt = now();
      this._event({ type: 'map.running', mapId: id, time: now(), data: { port: state.port } });
      this._persist();
      return operation;
    } catch (error) {
      record.status.state = 'error';
      record.status.error = error instanceof Error ? error.message : String(error);
      operation.state = 'error';
      operation.error = record.status.error;
      operation.finishedAt = now();
      this._event({ type: 'map.error', mapId: id, time: now(), data: { error: operation.error } });
      throw error;
    } finally {
      record.busy = false;
    }
  }

  public async stopMap(id: string, opts: StopOptions = {}): Promise<Operation> {
    const record = this._requireMap(id);
    if (record.status.state === 'stopped' || record.status.state === 'created') {
      return this._doneOperation('stop', id);
    }
    if (record.busy) throw new DaemonError('OPERATION_IN_PROGRESS', `map busy: ${id}`);
    record.busy = true;
    const operation = makeOperation('stop', id);
    this._operations.set(operation.id, operation);
    record.status.state = 'stopping';
    this._event({ type: 'map.stopping', mapId: id, time: now() });
    try {
      const shard = record.shardId ? this._shards.get(record.shardId) : undefined;
      if (shard) await shard.stopMap(id, opts.timeoutMs ?? 10_000);
      record.status.state = 'stopped';
      record.status.port = undefined;
      record.status.url = undefined;
      operation.state = 'done';
      operation.finishedAt = now();
      this._event({ type: 'map.stopped', mapId: id, time: now() });
      this._persist();
      if (shard && shard.maps.size === 0) {
        await shard.stopAll();
        this._shards.delete(shard.shardId);
      }
      return operation;
    } catch (error) {
      record.status.state = 'error';
      record.status.error = error instanceof Error ? error.message : String(error);
      operation.state = 'error';
      operation.error = record.status.error;
      operation.finishedAt = now();
      this._event({ type: 'map.error', mapId: id, time: now(), data: { error: operation.error } });
      throw error;
    } finally {
      record.busy = false;
    }
  }

  public async restartMap(id: string): Promise<Operation> {
    await this.stopMap(id);
    return this.startMap(id);
  }

  public async destroyMap(id: string, opts: DestroyOptions = {}): Promise<void> {
    const record = this._records.get(id);
    if (!record) return;
    await this.stopMap(id, { force: opts.force });
    const shard = record.shardId ? this._shards.get(record.shardId) : undefined;
    this._records.delete(id);
    this._persist();
    this._event({ type: 'map.destroyed', mapId: id, time: now() });
    if (shard && shard.maps.size === 0) {
      await shard.stopAll();
      this._shards.delete(shard.shardId);
    }
  }

  public async stats(id: string): Promise<MapStats> {
    const record = this._requireMap(id);
    const shardId = record.shardId;
    const shard = shardId ? this._shards.get(shardId) : undefined;
    const usage = shard ? await shard.sampleUsage() : undefined;
    // 还没采到样本：报标称值，别报 0（会让人以为已经挂了）
    const base: MapStats = record.stats
      ? { ...record.stats }
      : { tick: 0, players: 0, uptime: 0, tickRate: NOMINAL_TICK_RATE };
    return { ...base, shardId, shard: usage };
  }

  /**
   * 按 shard 报资源占用。
   *
   * 这是唯一有意义的资源口径：engine 一个 shard 可以打包多图，CPU / 堆摊不到单图上。
   * `rssBytes` 是例外——线程共享地址空间，RSS 只有进程口径，每个 shard 报的都一样。
   */
  public async listShards(): Promise<ShardStats[]> {
    const rssBytes = process.memoryUsage().rss;
    return Promise.all(
      Array.from(this._shards.values()).map(async (shard): Promise<ShardStats> => {
        const usage = await shard.sampleUsage();
        return {
          shardId: shard.shardId,
          maps: Array.from(shard.maps.keys()),
          mapCount: shard.maps.size,
          rssBytes,
          uptime: Date.now() - shard.startedAt,
          cpuPercent: usage?.cpuPercent,
          heapUsedBytes: usage?.heapUsedBytes,
          heapTotalBytes: usage?.heapTotalBytes,
          heapLimitBytes: usage?.heapLimitBytes,
          externalBytes: usage?.externalBytes,
          sampledAt: usage?.sampledAt ?? new Date().toISOString(),
        };
      }),
    );
  }

  public async *logs(id: string, opts: LogOptions = {}): AsyncIterable<LogEntry> {
    const record = this._requireMap(id);
    const shardId = record.shardId;
    const store = shardId ? this._shardLogs.get(shardId) || [] : [];
    const tail = opts.tail && opts.tail > 0 ? store.slice(-opts.tail) : store;
    for (const entry of tail) yield { ...entry };
    if (!opts.follow) return;
    let cursor = store.length;
    while (!this._closed) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const current = shardId ? this._shardLogs.get(shardId) || [] : [];
      for (; cursor < current.length; ++cursor) yield { ...current[cursor] };
    }
  }

  public async *events(opts: { since?: string } = {}): AsyncIterable<DaemonEvent> {
    const since = opts.since ? Date.parse(opts.since) : 0;
    const initial = this._events.filter((event) => Date.parse(event.time) > since);
    for (const event of initial) yield { ...event };
  }

  public getOperation(id: string): Operation | undefined {
    return this._operations.get(id);
  }

  public async exec(id: string, command: string): Promise<unknown> {
    if (!this._options.enableExec) {
      throw new DaemonError(
        'EXEC_DISABLED',
        'exec is disabled; start the daemon with FEATHER_ENABLE_EXEC=1',
      );
    }
    const record = this._requireMap(id);
    if (record.status.state !== 'running') {
      throw new DaemonError('MAP_NOT_RUNNING', `map is not running: ${id}`);
    }
    const shard = record.status.shardId
      ? this._shards.get(record.status.shardId)
      : undefined;
    if (!shard) {
      throw new DaemonError('SHARD_NOT_FOUND', `shard not found for map: ${id}`);
    }
    return shard.exec(id, command);
  }

  public async close(): Promise<void> {
    if (this._closed) return;
    this._closed = true;
    for (const record of this._records.values()) {
      if (record.status.state === 'running') {
        try {
          await this.stopMap(record.spec.id, { timeoutMs: 5_000, force: true });
        } catch {
          // Best effort during shutdown.
        }
      }
    }
    for (const shard of this._shards.values()) {
      try {
        await shard.stopAll();
      } catch {
        // Best effort.
      }
    }
    this._shards.clear();
    this._persist();
    this._event({ type: 'daemon.shutdown', time: now() });
  }

  private async _ensureShard(record: MapRecord): Promise<ShardRuntime> {
    if (record.shardId) {
      const existing = this._shards.get(record.shardId);
      if (existing) {
        if (!existing.maps.has(record.spec.id)) await existing.addMap(record.spec);
        return existing;
      }
    }
    // 核预算没用完 → 一图一 shard；用完了 → 塞进最闲的 shard。
    const budget = resolveShardBudget(
      os.availableParallelism(),
      process.env.FEATHER_MAX_SHARDS,
    );
    if (!shouldCreateShard(this._activeMapCount(), this._shards.size, budget)) {
      const existing = this._leastLoadedShard();
      if (existing) {
        record.shardId = existing.shardId;
        record.status.shardId = existing.shardId;
        await existing.addMap(record.spec);
        return existing;
      }
    }
    return this._createShard(record);
  }

  /** 只数 running/starting 的图；created/stopped 的图不该占核预算。 */
  private _activeMapCount(): number {
    let count = 0;
    for (const record of this._records.values()) {
      if (record.status.state === 'running' || record.status.state === 'starting') count++;
    }
    return count;
  }

  private _leastLoadedShard(): ShardRuntime | undefined {
    return Array.from(this._shards.values()).sort((a, b) => a.maps.size - b.maps.size)[0];
  }

  /**
   * 整个 daemon 只建一个 arena，所有 shard 共用。
   *
   * 关键点：必须共享，否则每个 shard 各建一个就退回到「各存一份」，
   * 白花内存还看不出区别。`undefined` 是合法结果（被 env 关掉），
   * 所以要单独记一个 resolved 标志。
   */
  private _resolveContentArena(): SharedArenaSpec | undefined {
    if (!this._contentArenaResolved) {
      this._contentArena = createContentArenaSpec();
      this._contentArenaResolved = true;
    }
    return this._contentArena;
  }

  private async _createShard(record: MapRecord): Promise<ShardRuntime> {
    // 单调递增的序号：shard 回收后不能复用旧 id，否则会覆盖仍然存活的 shard。
    const shardId = `shard-${this._shardSeq++}`;
    const shard = new ShardRuntime({
      shardId,
      workspaceRoot: this._options.workspaceRoot!,
      maps: [record.spec],
      contentArena: this._resolveContentArena(),
      onMapReady: (sid, id, port) => {
        const targetRecord = this._records.get(id);
        if (!targetRecord) return;
        targetRecord.shardId = sid;
        targetRecord.status.shardId = sid;
        targetRecord.status.port = port;
        targetRecord.status.url = `http://127.0.0.1:${port}`;
      },
      onMapStopped: (_sid, id) => {
        const targetRecord = this._records.get(id);
        if (targetRecord) targetRecord.status.port = undefined;
      },
      onMapError: (_sid, id, error) => {
        const targetRecord = this._records.get(id);
        if (targetRecord) {
          targetRecord.status.state = 'error';
          targetRecord.status.error = error;
        }
      },
      onStats: (_sid, id, stats) => {
        const targetRecord = this._records.get(id);
        if (targetRecord) targetRecord.stats = stats;
      },
      onLog: (sid, stream, message) => this._appendShardLog(sid, stream, message),
      onExit: (sid, code) => {
        for (const targetRecord of this._records.values()) {
          if (targetRecord.shardId === sid && targetRecord.status.state === 'running') {
            targetRecord.status.state = 'error';
            targetRecord.status.error = `shard exited ${code}`;
          }
        }
        this._shards.delete(sid);
      },
    });
    this._shards.set(shardId, shard);
    await shard.start();
    const state = shard.maps.get(record.spec.id);
    if (!state?.port) throw new Error(state?.error || `shard failed to start map ${record.spec.id}`);
    return shard;
  }

  private _appendShardLog(shardId: string, stream: 'stdout' | 'stderr', message: string) {
    let store = this._shardLogs.get(shardId);
    if (!store) {
      store = [];
      this._shardLogs.set(shardId, store);
    }
    for (const line of message.split('\n')) {
      if (!line) continue;
      store.push({ time: now(), stream, message: line });
    }
    if (store.length > MAX_LOG_LINES) store.splice(0, store.length - MAX_LOG_LINES);
  }

  private _event(event: DaemonEvent) {
    this._events.push(event);
    if (this._events.length > MAX_EVENTS) this._events.splice(0, this._events.length - MAX_EVENTS);
  }

  private _requireMap(id: string): MapRecord {
    const record = this._records.get(id);
    if (!record) throw new DaemonError('MAP_NOT_FOUND', `map not found: ${id}`);
    return record;
  }

  private _doneOperation(kind: Operation['kind'], mapId: string): Operation {
    const operation = makeOperation(kind, mapId);
    operation.state = 'done';
    operation.finishedAt = now();
    this._operations.set(operation.id, operation);
    return operation;
  }

  private _loadState() {
    if (!fs.existsSync(this._stateFile)) return;
    try {
      const parsed = JSON.parse(fs.readFileSync(this._stateFile, 'utf8')) as {
        maps?: MapSpec[];
      };
      for (const spec of parsed.maps || []) {
        this._records.set(spec.id, {
          spec,
          status: {
            id: spec.id,
            name: spec.name,
            workspaceId: spec.workspaceId,
            state: 'stopped',
            runtime: 'worker',
            restartPolicy: spec.restartPolicy,
                  labels: spec.labels,
          },
        });
      }
    } catch {
      // A corrupt state file must not prevent the daemon from starting.
    }
  }

  private _persist() {
    if (!this._options.dataDir) return;
    const file = this._stateFile;
    const temporary = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(
      temporary,
      `${JSON.stringify({ maps: Array.from(this._records.values()).map((r) => r.spec) }, null, 2)}\n`,
      'utf8',
    );
    fs.renameSync(temporary, file);
  }
}

export class DaemonError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

export async function createDaemon(options: CreateDaemonOptions = {}): Promise<Daemon> {
  return new Daemon(options);
}
