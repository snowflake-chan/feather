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
import { prepareImport, type ImportOptions, type ImportResult } from './import';

const VERSION = '0.1.0';
const API_VERSION = 'v1';
const MAX_LOG_LINES = 2000;
const MAX_EVENTS = 2000;
/** 连续自动重启上限；超过就放弃，把错误留在 status 里等人处理 */
const MAX_RESTART_ATTEMPTS = 5;
/** 跑够这么久才算「站住了」，下一次崩溃才重新计数（防止起完就崩的毒图无限循环） */
const STABLE_RUN_MS = 60_000;
/** 退避上限 */
const MAX_RESTART_DELAY_MS = 30_000;

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
  /** 崩溃后的重启退避定时器；按 map id 去重，手动操作会取消 */
  private readonly _restartTimers = new Map<string, NodeJS.Timeout>();
  /** 连续重启次数；成功跑起来一次就清零，用来给毒图兜底 */
  private readonly _restartAttempts = new Map<string, number>();
  /** 正在由退避定时器拉起图的 id；用来区分「手动 start」和「自动重启」 */
  private readonly _restarting = new Set<string>();

  constructor(private readonly _options: CreateDaemonOptions) {
    this._options.dataDir = path.resolve(_options.dataDir || path.join(os.homedir(), '.feather'));
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

  public async importArchive(file: string, options: ImportOptions = {}): Promise<ImportResult> {
    const prepared = prepareImport(file, this._options.dataDir!, options);
    try {
      const conflicts = prepared.specs.filter((spec) => this._records.has(spec.id));
      if (conflicts.length > 0 && !options.replace) {
        throw new DaemonError('MAP_CONFLICT', `map already exists: ${conflicts.map((map) => map.id).join(', ')}`);
      }
      for (const spec of conflicts) {
        const state = this._records.get(spec.id)!.status.state;
        if (state === 'running' || state === 'starting' || state === 'stopping') {
          throw new DaemonError('MAP_BUSY', `map is busy: ${spec.id}`);
        }
      }
      for (const spec of conflicts) {
        await this.destroyMap(spec.id, { force: true });
      }
      for (const spec of prepared.specs) {
        prepared.install(spec);
        await this.createMap(spec);
      }
      return {
        maps: prepared.specs.map((spec) => ({
          id: spec.id,
          state: this._records.get(spec.id)!.status.state,
        })),
      };
    } finally {
      prepared.cleanup();
    }
  }

  public async updateMap(id: string, spec: MapSpec): Promise<MapStatus> {
    const record = this._requireMap(id);
    if (record.status.state === 'running' || record.status.state === 'starting') {
      throw new DaemonError('OPERATION_IN_PROGRESS', `map is busy: ${id}`);
    }
    if (spec.id !== id) {
      throw new DaemonError('INVALID_SPEC', `map id mismatch: ${spec.id} !== ${id}`);
    }
    record.spec = spec;
    record.status = {
      ...record.status,
      name: spec.name,
      state: 'created',
      error: undefined,
      restartPolicy: spec.restartPolicy,
      volume: spec.volume || spec.id,
      labels: spec.labels,
    };
    this._persist();
    this._event({ type: 'map.updated', mapId: id, time: now() });
    return { ...record.status };
  }

  public async startMap(id: string): Promise<Operation> {
    const record = this._requireMap(id);
    if (record.status.state === 'running') {
      return this._doneOperation('start', id);
    }
    if (record.busy) throw new DaemonError('OPERATION_IN_PROGRESS', `map busy: ${id}`);
    // 手动 start 清掉重启计数；自动重启不清，否则「起→崩→起」会无限循环。
    if (!this._restarting.has(id)) this._restartAttempts.delete(id);
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
      // 判 ready 而不是判 port：stop 超时后 port 会留着旧值，用它判会把一张
      // 已经死掉的图报成 running（幽灵 running），下次 stop 又会超时一次。
      if (!state?.ready || !state.port) {
        throw new Error(state?.error || `map ${id} did not start`);
      }
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
    // 用户主动停图，就不要在后台偷偷把它重启回来
    this._cancelRestart(id);
    record.busy = true;
    const operation = makeOperation('stop', id);
    this._operations.set(operation.id, operation);
    record.status.state = 'stopping';
    this._event({ type: 'map.stopping', mapId: id, time: now() });
    try {
      const shard = record.shardId ? this._shards.get(record.shardId) : undefined;
      if (shard) await shard.stopMap(id, opts.timeoutMs ?? 30_000);
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

  public async restartMap(id: string, opts: StopOptions = {}): Promise<Operation> {
    await this.stopMap(id, {
      timeoutMs: opts.timeoutMs ?? 60_000,
      force: opts.force,
    });
    return this.startMap(id);
  }

  public async destroyMap(id: string, opts: DestroyOptions = {}): Promise<void> {
    const record = this._records.get(id);
    if (!record) return;
    this._cancelRestart(id);
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
        'EVAL_DISABLED',
        'eval is disabled; start the daemon with --enable-eval',
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
    for (const timer of this._restartTimers.values()) clearTimeout(timer);
    this._restartTimers.clear();
    this._restartAttempts.clear();
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
   * shard 崩溃后按 `restartPolicy` 拉起图。
   *
   * 之前这个字段只被写进 status，没有任何地方读它——shard 一崩，图就永久停在
   * error。而 shard 是进程内线程，崩的概率并不低（一次未捕获异常就够）。
   *
   * 退避是必须的：坏包 / 坏脚本会「起→崩→起」循环，没有退避就是 CPU 打满。
   * 计数在两种情况下清零：跑够 `STABLE_RUN_MS` 之后又崩，或用户手动 start/stop。
   */
  private _scheduleRestart(id: string, exitCode: number) {
    if (this._closed) return;
    const record = this._records.get(id);
    if (!record) return;
    const policy = record.spec.restartPolicy ?? 'no';
    if (policy === 'no') return;
    // on-failure 只对非零退出码生效；always 无论如何都重启
    if (policy === 'on-failure' && exitCode === 0) return;

    const startedAt = record.status.startedAt ? Date.parse(record.status.startedAt) : 0;
    if (startedAt > 0 && Date.now() - startedAt >= STABLE_RUN_MS) {
      this._restartAttempts.delete(id);
    }

    const attempts = (this._restartAttempts.get(id) ?? 0) + 1;
    this._restartAttempts.set(id, attempts);
    if (attempts > MAX_RESTART_ATTEMPTS) {
      record.status.error =
        `shard exited ${exitCode}; gave up after ${MAX_RESTART_ATTEMPTS} restart attempts`;
      this._event({
        type: 'map.error',
        mapId: id,
        time: now(),
        data: { error: record.status.error, attempt: attempts },
      });
      return;
    }

    const delay = Math.min(1000 * 2 ** (attempts - 1), MAX_RESTART_DELAY_MS);
    const timer = setTimeout(() => {
      this._restartTimers.delete(id);
      if (this._closed) return;
      const current = this._records.get(id);
      // 退避期间用户可能已经手动 start / stop / destroy 过了
      if (!current || current.status.state !== 'error' || current.busy) return;
      this._restarting.add(id);
      void this.startMap(id)
        .catch(() => {
          // startMap 已经把错误写进 status，这里只负责别让 rejection 漏出去
        })
        .finally(() => this._restarting.delete(id));
    }, delay);
    timer.unref();
    this._restartTimers.set(id, timer);
    this._event({
      type: 'map.error',
      mapId: id,
      time: now(),
      data: { error: record.status.error, restartInMs: delay, attempt: attempts },
    });
  }

  /** 取消待执行的重启，并清掉计数（调用方都是「用户主动干预」） */
  private _cancelRestart(id: string) {
    const timer = this._restartTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this._restartTimers.delete(id);
    }
    this._restartAttempts.delete(id);
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
      dataRoot: this._options.dataDir!,
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
        const affected: string[] = [];
        for (const targetRecord of this._records.values()) {
          if (targetRecord.shardId !== sid) continue;
          const state = targetRecord.status.state;
          if (state !== 'running' && state !== 'starting') continue;
          targetRecord.status.state = 'error';
          targetRecord.status.error = `shard exited ${code}`;
          targetRecord.status.port = undefined;
          targetRecord.status.url = undefined;
          // shard 已经没了，别让记录继续指向一个不存在的 id
          targetRecord.shardId = undefined;
          targetRecord.status.shardId = undefined;
          affected.push(targetRecord.spec.id);
        }
        this._shards.delete(sid);
        for (const id of affected) this._scheduleRestart(id, code);
      },
    });
    this._shards.set(shardId, shard);
    try {
      await shard.start();
      const state = shard.maps.get(record.spec.id);
      if (!state?.ready || !state.port) {
        throw new Error(state?.error || `shard failed to start map ${record.spec.id}`);
      }
      return shard;
    } catch (error) {
      // 启动失败必须把 shard 摘掉：留着它既占核预算，又会被 _leastLoadedShard
      // 选中，让后续 addMap 打进一个已经死掉的 worker，白等 30s 超时。
      this._shards.delete(shardId);
      try {
        await shard.stopAll(5_000);
      } catch {
        // 已经退出了
      }
      throw error;
    }
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
                  state: 'stopped',
            runtime: 'worker',
            restartPolicy: spec.restartPolicy,
            // 与 createMap 保持一致：少了这个字段，daemon 重启后 volume 会变 undefined
            volume: spec.volume || spec.id,
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
