// Node worker_threads 版的 mudb socket 适配器
//
// 现有 vendor/mudb/socket/worker 是浏览器 Worker API（onmessage / postMessage），
// 这里做一个 worker_threads 版本，接口与 MuSocketServer / MuSocket 完全一致。
//
// 注意：消息用默认的结构化克隆（copy），不做 transfer。原因是 mudb 的
// createDispatch 发完包会 stream.destroy() 把 buffer 还池；如果 transfer 了
// ArrayBuffer，池里会留下 detached buffer。
'use strict';
const { MuSocketState, MuSocketServerState } = require('@box/mudb/socket/socket');

const noop = () => {};

class NodeWorkerSocketServer {
  constructor() {
    this._state = MuSocketServerState.INIT;
    this.clients = [];
    this._onconnection = noop;
    this._onclose = noop;
    this._pending = [];
  }

  state() {
    return this._state;
  }

  start(spec) {
    if (this._state === MuSocketServerState.RUNNING) {
      throw new Error('worker socket server already running');
    }
    if (this._state === MuSocketServerState.SHUTDOWN) {
      throw new Error('worker socket server already shut down');
    }
    this._state = MuSocketServerState.RUNNING;
    this._onconnection = spec.connection;
    this._onclose = spec.close || noop;
    const pending = this._pending.splice(0);
    for (const worker of pending) this._attach(worker);
    spec.ready();
  }

  attach(worker) {
    if (this._state === MuSocketServerState.RUNNING) {
      this._attach(worker);
    } else {
      this._pending.push(worker);
    }
  }

  _attach(worker) {
    let socket = null;
    worker.on('message', (data) => {
      if (socket) {
        socket._receive(data);
        return;
      }
      if (!data || typeof data.sessionId !== 'string') {
        console.error('[worker-poc] unexpected first message:', data);
        return;
      }
      socket = new NodeWorkerServerSocket(data.sessionId, worker);
      this.clients.push(socket);
      this._onconnection(socket);
    });
    worker.on('error', (err) => {
      console.error('[worker-poc] worker error:', err && err.stack ? err.stack : err);
    });
    worker.on('exit', (code) => {
      const intentional = socket && socket._state === MuSocketState.CLOSED;
      if (code !== 0 && !intentional) {
        console.error('[worker-poc] worker exited with code', code);
      }
      if (socket) socket._notifyClose();
    });
  }

  close() {
    if (this._state !== MuSocketServerState.RUNNING) {
      this._state = MuSocketServerState.SHUTDOWN;
      return;
    }
    this._state = MuSocketServerState.SHUTDOWN;
    for (const socket of this.clients.splice(0)) socket.close();
    this._onclose();
  }
}

class NodeWorkerServerSocket {
  constructor(sessionId, worker) {
    this.sessionId = sessionId;
    this._worker = worker;
    this._state = MuSocketState.INIT;
    this._message = noop;
    this._close = noop;
    this._closedNotified = false;
  }

  state() {
    return this._state;
  }

  open(spec) {
    if (this._state === MuSocketState.OPEN) throw new Error('socket already open');
    if (this._state === MuSocketState.CLOSED) throw new Error('socket already closed');
    this._state = MuSocketState.OPEN;
    this._message = spec.message;
    this._close = spec.close || noop;
    // 握手 ACK：worker 侧收到后进入消息模式
    this._worker.postMessage({ sessionId: this.sessionId });
    spec.ready();
  }

  _receive(data) {
    if (!data || typeof data !== 'object') return;
    if (typeof data.sessionId === 'string') return; // 重复的 hello/ack
    if (this._state !== MuSocketState.OPEN) return;
    this._message(data.message, !!data.unreliable);
  }

  send(message, unreliable) {
    if (this._state !== MuSocketState.OPEN) return;
    this._worker.postMessage({ message, unreliable: !!unreliable });
  }

  close() {
    if (this._state === MuSocketState.CLOSED) return;
    this._state = MuSocketState.CLOSED;
    try {
      this._worker.terminate();
    } catch (e) {}
    this._notifyClose();
  }

  _notifyClose() {
    if (this._closedNotified) return;
    this._closedNotified = true;
    this._close();
  }

  reliableBufferedAmount() {
    return 0;
  }

  unreliableBufferedAmount() {
    return 0;
  }
}

class NodeWorkerSocket {
  constructor(sessionId, port) {
    this.sessionId = sessionId;
    this._port = port;
    this._state = MuSocketState.INIT;
    this._message = noop;
    this._close = noop;
    this._ready = noop;
    this._handshakeDone = false;
    this._closedNotified = false;
    port.on('message', (data) => this._receive(data));
    port.on('close', () => this._notifyClose());
  }

  state() {
    return this._state;
  }

  open(spec) {
    if (this._state === MuSocketState.OPEN) throw new Error('socket already open');
    if (this._state === MuSocketState.CLOSED) throw new Error('socket already closed');
    this._state = MuSocketState.OPEN;
    this._ready = spec.ready;
    this._message = spec.message;
    this._close = spec.close || noop;
    // 先发 hello，等 server 的 ACK
    this._port.postMessage({ sessionId: this.sessionId });
  }

  _receive(data) {
    if (!this._handshakeDone) {
      if (!data || data.sessionId !== this.sessionId) {
        console.error('[worker-poc] bad handshake, expected session', this.sessionId, 'got', data);
        return;
      }
      this._handshakeDone = true;
      this._ready();
      return;
    }
    if (this._state !== MuSocketState.OPEN) return;
    this._message(data.message, !!data.unreliable);
  }

  send(message, unreliable) {
    if (this._state !== MuSocketState.OPEN) return;
    this._port.postMessage({ message, unreliable: !!unreliable });
  }

  close() {
    if (this._state === MuSocketState.CLOSED) return;
    this._state = MuSocketState.CLOSED;
    try {
      this._port.close();
    } catch (e) {}
    this._notifyClose();
  }

  _notifyClose() {
    if (this._closedNotified) return;
    this._closedNotified = true;
    this._close();
  }

  reliableBufferedAmount() {
    return 0;
  }

  unreliableBufferedAmount() {
    return 0;
  }
}

module.exports = { NodeWorkerSocketServer, NodeWorkerSocket };
