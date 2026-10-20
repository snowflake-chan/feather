import path from 'node:path';
import { Worker } from 'node:worker_threads';

import type { MapSpec, MapStats } from '../contract';
import { ensureLocalConfig } from './local-config';

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
  private _worker?: Worker;
  private _ready?: Promise<void>;
  private _resolveReady?: () => void;
  private _rejectReady?: (error: Error) => void;
  private readonly _mapReadyWaiters = new Map<string, { resolve: (port: number) => void; reject: (error: Error) => void }>();
  private readonly _mapStopWaiters = new Map<string, { resolve: () => void; reject: (error: Error) => void }>();

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
      this._options.onExit?.(this.shardId, code);
      if (code !== 0) this._rejectReady?.(new Error(`shard ${this.shardId} exited ${code}`));
    });
    return this._ready;
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
      case 'shardError':
        this._rejectReady?.(new Error(String(message.error)));
        break;
    }
  }
}
