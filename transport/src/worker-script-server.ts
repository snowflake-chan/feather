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

  public close() {
    for (const worker of this._workers) {
      try {
        worker.terminate();
      } catch (e) {}
    }
    this._workers.clear();
    this._socketServer.close();
  }

  public async launch(_script: unknown, _module: unknown): Promise<void> {
    const worker = new NodeWorker(this._options.workerEntry, {
      workerData: this._options.workerData,
      // 让 worker 的 stdout/stderr 直接进主进程，shell 的 sysLog 才看得见
      stdout: true,
      stderr: true,
    });
    if (worker.stdout) worker.stdout.on('data', (d) => process.stdout.write(d));
    if (worker.stderr) worker.stderr.on('data', (d) => process.stderr.write(d));
    this._workers.add(worker);
    worker.once('exit', (code) => {
      if (code !== 0) console.error('[WorkerScriptServer] worker exit', code);
      this._workers.delete(worker);
    });
    worker.on('error', (err) => {
      console.error('[WorkerScriptServer] worker error:', err);
    });
    this._socketServer.attach(worker);
  }
}
