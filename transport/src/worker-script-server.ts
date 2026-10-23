import type { Worker } from 'worker_threads';
import type {
  MuSocket,
  MuSocketServerState,
  MuSocketServerSpec,
} from '@box/mudb/socket/socket';
import type { ScriptServer } from '@feather/protocol/script-server';
import { Worker as NodeWorker } from 'worker_threads';
import { NodeWorkerSocketServer } from './server';

export interface WorkerScriptServerOptions {
  /** 编译后的 worker 入口（rollup 产物 worker-script-entry.js） */
  workerEntry: string;
  /** 传给 worker 的 workerData */
  workerData?: Record<string, unknown>;
  /**
   * 脚本 worker 的 V8 老生代上限（MB），对应 `SCRIPT_MEMORY_LIMIT` / `MapSpec.limits.memoryMb`。
   * 不传或非正数表示不限制。
   *
   * 注意：这是**单图**的上限，作用在 shell worker 上，不要给 shard worker 设
   * ——一个 shard 承载多图，撞上限会一次带走整批图。
   */
  memoryLimitMb?: number;
  /** 日志前缀；daemon 用 instance id 让 shard 共享 stdout 也能归属。 */
  label?: string;
}

/**
 * 用 worker_threads 替代 ivmp 子进程 + isolated-vm 的 ScriptServer 实现。
 *
 * 引擎侧调用顺序（ScriptHost）：
 *   new MuServer(scriptServer, undefined, true)
 *   muServer.start()
 *   await scriptServer.launch('', '')
 *
 * 所以这里只实现 MuSocketServer + launch；业务代码零改动。
 */
export class WorkerScriptServer implements ScriptServer {
  private _socketServer = new NodeWorkerSocketServer();
  private _workers = new Set<NodeWorker>();

  constructor(private _options: WorkerScriptServerOptions) {
    if (!_options.workerEntry) {
      throw new Error('WorkerScriptServer: workerEntry is required');
    }
  }

  public get clients(): MuSocket[] {
    return this._socketServer.clients;
  }

  public state(): MuSocketServerState {
    return this._socketServer.state();
  }

  public start(spec: MuSocketServerSpec) {
    this._socketServer.start(spec);
  }

  private _closing = false;

  public terminateWorkers() {
    for (const worker of this._workers) {
      try {
        worker.terminate();
      } catch (e) {}
    }
    this._workers.clear();
  }

  public close() {
    this._closing = true;
    this.terminateWorkers();
    this._socketServer.close();
  }

  public async launch(_script: unknown, _module: unknown): Promise<void> {
    const limitMb = this._options.memoryLimitMb;
    const bounded = typeof limitMb === 'number' && Number.isFinite(limitMb) && limitMb > 0;
    const worker = new NodeWorker(this._options.workerEntry, {
      workerData: this._options.workerData,
      // 单图内存上限：撞上限时只有这个 worker 被 V8 abort，daemon 和同 shard 其他图不受影响。
      resourceLimits: bounded ? { maxOldGenerationSizeMb: Math.floor(limitMb) } : undefined,
      // 让 worker 的 stdout/stderr 直接进主进程，shell 的 sysLog 才看得见
      stdout: true,
      stderr: true,
    });
    const prefix = this._options.label ? `[${this._options.label}] ` : '';
    const writePrefixed = (stream: NodeJS.WriteStream, chunk: Buffer | string) => {
      if (!prefix) { stream.write(chunk); return; }
      const text = String(chunk);
      for (const line of text.split('\n')) {
        if (line) stream.write(prefix + line + '\n');
      }
    };
    if (worker.stdout) worker.stdout.on('data', (d) => writePrefixed(process.stdout, d));
    if (worker.stderr) worker.stderr.on('data', (d) => writePrefixed(process.stderr, d));
    this._workers.add(worker);
    worker.once('exit', (code) => {
      if (code !== 0 && !this._closing) console.error('[WorkerScriptServer] worker exit', code);
      this._workers.delete(worker);
    });
    worker.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ERR_WORKER_OUT_OF_MEMORY') {
        console.error(
          `[WorkerScriptServer] script worker out of memory (limit ${bounded ? limitMb : 'none'}MB)`,
        );
        return;
      }
      console.error('[WorkerScriptServer] worker error:', err);
    });
    this._socketServer.attach(worker);
  }
}
