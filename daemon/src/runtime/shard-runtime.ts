import path from 'node:path';
import { Worker } from 'node:worker_threads';

import type { SharedArenaSpec } from 'feather-engine/content-arena';

import type { MapSpec, MapStats, ShardUsage } from '../contract';
import { ensureLocalConfig } from './local-config';
import { type CpuSnapshot, deriveCpuPercent, toShardUsage } from './shard-usage';

/** 两次 CPU 采样之间的最小窗口：太短的窗口会被启动抖动主导，出来一串离谱数字 */
const MIN_CPU_WINDOW_MS = 1000;

export interface ShardMapState {
  spec: MapSpec;
  port?: number;
  ready: boolean;
  error?: string;
  stats?: MapStats;
}

export interface ShardRuntimeOptions {
  shardId: string;
  workspaceRoot: string;
  maps: MapSpec[];
  /**
   * 跨 shard 共享的内容 arena。由 daemon 创建一次再分发给所有 shard，
   * 这样同一批 blob 在进程里只存一份。不传则各 isolate 用自己的 LRU。
   */
  contentArena?: SharedArenaSpec;
  onLog?: (shardId: string, stream: 'stdout' | 'stderr', message: string) => void;
  onMapReady?: (shardId: string, id: string, port: number) => void;
  onMapStopped?: (shardId: string, id: string) => void;
  onMapError?: (shardId: string, id: string, error: string) => void;
  onStats?: (shardId: string, id: string, stats: MapStats) => void;
  onExit?: (shardId: string, code: number) => void;
}

export class ShardRuntime {
  public readonly shardId: string;
  public readonly maps = new Map<string, ShardMapState>();
  public readonly startedAt = Date.now();
  private _worker?: Worker;
  private _ready?: Promise<void>;
  private _resolveReady?: () => void;
  private _rejectReady?: (error: Error) => void;
  private _cpuBaseline?: CpuSnapshot;
  private _usage?: ShardUsage;
  private _usageAt = 0;
  private readonly _mapReadyWaiters = new Map<string, { resolve: (port: number) => void; reject: (error: Error) => void }>();
  private readonly _mapStopWaiters = new Map<string, { resolve: () => void; reject: (error: Error) => void }>();
  private _execSeq = 0;
  private readonly _execWaiters = new Map<number, { resolve: (value: string) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }>();

  constructor(private readonly _options: ShardRuntimeOptions) {
    this.shardId = _options.shardId;
    for (const spec of _options.maps) {
      this.maps.set(spec.id, { spec, ready: false });
    }
  }

  public get worker(): Worker | undefined {
    return this._worker;
  }

  public start(): Promise<void> {
    if (this._ready) return this._ready;
    this._ready = new Promise<void>((resolve, reject) => {
      this._resolveReady = resolve;
      this._rejectReady = reject;
    });
    const localConfigPath = ensureLocalConfig(this._options.workspaceRoot, 9966);
    const entry = path.join(__dirname, 'engine-shard-worker-entry.js');
    this._worker = new Worker(entry, {
      workerData: {
        shardId: this.shardId,
        workspaceRoot: this._options.workspaceRoot,
        maps: this._options.maps,
        contentArena: this._options.contentArena,
      },
      env: {
        ...process.env,
        BOX_LOCAL_CONFIG_PATH: localConfigPath,
      },
      stdout: true,
      stderr: true,
    });
    this._worker.stdout?.on('data', (chunk) =>
      this._options.onLog?.(this.shardId, 'stdout', String(chunk)),
    );
    this._worker.stderr?.on('data', (chunk) =>
      this._options.onLog?.(this.shardId, 'stderr', String(chunk)),
    );
    this._worker.on('message', (message: any) => this._onMessage(message));
    this._worker.on('error', (error) => {
      this._rejectReady?.(error);
      for (const state of this.maps.values()) {
        state.error = error.message;
      }
    });
    this._worker.on('exit', (code) => {
      for (const waiter of this._execWaiters.values()) {
        clearTimeout(waiter.timer);
        waiter.reject(new Error(`shard ${this.shardId} exited ${code}`));
      }
      this._execWaiters.clear();
      this._options.onExit?.(this.shardId, code);
      if (code !== 0) this._rejectReady?.(new Error(`shard ${this.shardId} exited ${code}`));
    });
    // `new Worker()` 返回时线程还没真正跑起来，此时 cpuUsage() 会报
    // ERR_WORKER_NOT_RUNNING，所以要等 'online'。基线越早抓，第一次采样越准。
    this._worker.on('online', () => this._primeCpuBaseline());
    return this._ready;
  }

  /**
   * 采一次该 shard 的资源占用。
   *
   * 走的是 per-thread 口子（`worker.cpuUsage()` / `worker.getHeapStatistics()`），
   * 不是 `process.*` —— 后者在 worker 里读的是整个进程，多 shard 会串号。
   *
   * `minWindowMs` 内重复调用直接返回上次结果：CPU% 需要足够长的窗口才有意义，
   * 而调用方（HTTP 请求）可能连打。窗口越长越平滑，这是有意的。
   */
  public async sampleUsage(minWindowMs = MIN_CPU_WINDOW_MS): Promise<ShardUsage | undefined> {
    const worker = this._worker;
    if (!worker) return this._usage;
    const now = Date.now();
    if (this._usage && now - this._usageAt < minWindowMs) return this._usage;

    let heap: Awaited<ReturnType<Worker['getHeapStatistics']>>;
    let cpu: NodeJS.CpuUsage;
    try {
      [heap, cpu] = await Promise.all([worker.getHeapStatistics(), worker.cpuUsage()]);
    } catch {
      // worker 正在退出 / 已终止：给最后一次成功的样本，别抛
      return this._usage;
    }
    if (this._worker !== worker) return this._usage;

    const current: CpuSnapshot = { user: cpu.user, system: cpu.system, at: now };
    const cpuPercent = deriveCpuPercent(this._cpuBaseline, current);
    this._cpuBaseline = current;
    this._usage = toShardUsage(heap, cpuPercent, new Date(now).toISOString());
    // 缺 CPU 的样本（还没有基线）不进缓存，让下一次调用立刻重算，而不是把 undefined
    // 钉住一整个窗口。
    this._usageAt = cpuPercent === undefined ? 0 : now;
    return this._usage;
  }

  private _primeCpuBaseline() {
    const worker = this._worker;
    if (!worker) return;
    worker
      .cpuUsage()
      .then((usage) => {
        if (this._worker !== worker) return;
        this._cpuBaseline = { user: usage.user, system: usage.system, at: Date.now() };
      })
      .catch(() => {
        // worker 还没起来就退了，下次采样会自己补基线
      });
  }

  public async addMap(spec: MapSpec, timeoutMs = 30_000): Promise<number> {
    if (!this._worker) throw new Error('shard not started');
    if (!this.maps.has(spec.id)) {
      this.maps.set(spec.id, { spec, ready: false });
    }
    const port = new Promise<number>((resolve, reject) => {
      this._mapReadyWaiters.set(spec.id, { resolve, reject });
      setTimeout(() => {
        this._mapReadyWaiters.delete(spec.id);
        reject(new Error(`start map timeout: ${spec.id}`));
      }, timeoutMs).unref();
    });
    this._worker.postMessage({ type: 'addMap', spec });
    return port;
  }

  public async stopMap(id: string, timeoutMs = 10_000): Promise<void> {
    const state = this.maps.get(id);
    if (!state) return;
    if (!this._worker) throw new Error('shard not started');
    const stopped = new Promise<void>((resolve, reject) => {
      this._mapStopWaiters.set(id, { resolve, reject });
      setTimeout(() => {
        this._mapStopWaiters.delete(id);
        reject(new Error(`stop map timeout: ${id}`));
      }, timeoutMs).unref();
    });
    this._worker.postMessage({ type: 'stopMap', id });
    await stopped;
    state.ready = false;
    this.maps.delete(id);
  }

  public async exec(id: string, command: string, timeoutMs = 10_000): Promise<string> {
    if (!this._worker) throw new Error('shard not started');
    if (!this.maps.get(id)?.ready) throw new Error(`map is not ready: ${id}`);
    const requestId = ++this._execSeq;
    const result = new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this._execWaiters.delete(requestId);
        reject(new Error(`exec timeout: ${id}`));
      }, timeoutMs);
      timer.unref();
      this._execWaiters.set(requestId, { resolve, reject, timer });
    });
    this._worker.postMessage({ type: 'exec', id, requestId, command });
    return result;
  }

  public async stopAll(timeoutMs = 15_000): Promise<void> {
    if (!this._worker) return;
    const worker = this._worker;
    this._worker = undefined;
    const exited = new Promise<void>((resolve) => worker.once('exit', () => resolve()));
    worker.postMessage({ type: 'shutdown' });
    const timer = setTimeout(() => void worker.terminate(), timeoutMs);
    timer.unref();
    await exited;
    clearTimeout(timer);
  }

  public terminate(): Promise<number> {
    return this._worker ? this._worker.terminate() : Promise.resolve(0);
  }

  private _onMessage(message: any) {
    switch (message?.type) {
      case 'ready':
        this._resolveReady?.();
        break;
      case 'mapReady': {
        const state = this.maps.get(String(message.id));
        if (state) {
          state.ready = true;
          state.port = Number(message.port);
        }
        const waiter = this._mapReadyWaiters.get(String(message.id));
        if (waiter) {
          this._mapReadyWaiters.delete(String(message.id));
          waiter.resolve(Number(message.port));
        }
        this._options.onMapReady?.(this.shardId, String(message.id), Number(message.port));
        break;
      }
      case 'mapStopped': {
        const state = this.maps.get(String(message.id));
        if (state) state.ready = false;
        const waiter = this._mapStopWaiters.get(String(message.id));
        if (waiter) {
          this._mapStopWaiters.delete(String(message.id));
          waiter.resolve();
        }
        this._options.onMapStopped?.(this.shardId, String(message.id));
        break;
      }
      case 'mapError': {
        const state = this.maps.get(String(message.id));
        if (state) state.error = String(message.error);
        const waiter = this._mapReadyWaiters.get(String(message.id));
        if (waiter) {
          this._mapReadyWaiters.delete(String(message.id));
          waiter.reject(new Error(String(message.error)));
        }
        this._options.onMapError?.(this.shardId, String(message.id), String(message.error));
        break;
      }
      case 'stats': {
        const state = this.maps.get(String(message.id));
        if (state) state.stats = message.stats as MapStats;
        this._options.onStats?.(this.shardId, String(message.id), message.stats as MapStats);
        break;
      }
      case 'execResult': {
        const waiter = this._execWaiters.get(Number(message.requestId));
        if (!waiter) break;
        this._execWaiters.delete(Number(message.requestId));
        clearTimeout(waiter.timer);
        if (message.error) waiter.reject(new Error(String(message.error)));
        else waiter.resolve(String(message.result ?? ''));
        break;
      }
      case 'shardError':
        this._rejectReady?.(new Error(String(message.error)));
        break;
    }
  }
}
