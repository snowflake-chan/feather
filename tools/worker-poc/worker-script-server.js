// 生产形态的 ScriptServer 实现：
//   interface ScriptServer extends MuSocketServer {
//     launch(script, module): Promise<void>
//     onIsolateException?: EventBus<ParsedError>
//   }
//
// 引擎侧的用法（ScriptHost）：
//   this.muServer = new MuServer(this.scriptServer, undefined, true)   // 构造时
//   this.muServer.start()                                             // 构造时
//   await this.scriptServer.launch('', '')                            // ScriptHost.start()
//
// 所以这里只做两件事：转发 MuSocketServer 的 start/close/state/clients，
// launch 时创建一个 worker_threads Worker，并把它接进 socket server。
'use strict';
const { Worker } = require('worker_threads');
const { NodeWorkerSocketServer } = require('./adapter');

class WorkerScriptServer {
  constructor(options) {
    if (!options || !options.workerEntry) {
      throw new Error('WorkerScriptServer: workerEntry is required');
    }
    this._workerEntry = options.workerEntry;
    this._workerData = options.workerData;
    this._socketServer = new NodeWorkerSocketServer();
    this._workers = new Set();
  }

  get clients() {
    return this._socketServer.clients;
  }

  state() {
    return this._socketServer.state();
  }

  start(spec) {
    this._socketServer.start(spec);
  }

  close() {
    this._socketServer.close();
    for (const worker of this._workers) {
      try {
        worker.terminate();
      } catch (e) {}
    }
    this._workers.clear();
  }

  async launch(_script, _module) {
    const worker = new Worker(this._workerEntry, {
      workerData: this._workerData,
    });
    this._workers.add(worker);
    worker.once('exit', () => this._workers.delete(worker));
    worker.on('error', (err) => {
      console.error('[WorkerScriptServer] worker error:', err && err.stack ? err.stack : err);
    });
    this._socketServer.attach(worker);
    return worker;
  }
}

module.exports = { WorkerScriptServer };
