import type { Worker } from 'worker_threads';
import {
  MuData,
  MuSocket,
  MuSocketServer,
  MuSocketServerSpec,
  MuSocketServerState,
  MuSocketSpec,
  MuSocketState,
} from '@box/mudb/socket/socket';

const noop = () => {};

interface Envelope {
  sessionId?: string;
  message?: MuData;
  unreliable?: boolean;
}

/**
 * Node worker_threads 版的 MuSocketServer。
 *
 * 与 vendor/mudb/socket/worker 的浏览器版协议一致：
 *   worker --hello{sessionId}--> server --ack{sessionId}--> worker
 * 之后双方收发 { message, unreliable }。
 *
 * 消息使用结构化克隆（copy），不做 transfer：mudb 的 createDispatch 发完包会
 * stream.destroy() 把 buffer 还池，transfer 会留下 detached buffer。
 */
export class NodeWorkerSocketServer implements MuSocketServer {
  public clients: MuSocket[] = [];
  private _state = MuSocketServerState.INIT;
  private _onconnection: (socket: MuSocket) => void = noop;
  private _onclose: () => void = noop;
  private _pending: Worker[] = [];

  public state() {
    return this._state;
  }

  public start(spec: MuSocketServerSpec) {
    if (this._state === MuSocketServerState.RUNNING) {
      throw new Error('worker socket server already running');
    }
    if (this._state === MuSocketServerState.SHUTDOWN) {
      throw new Error('worker socket server already shut down');
    }
    this._state = MuSocketServerState.RUNNING;
    this._onconnection = spec.connection;
    this._onclose = spec.close;
    const pending = this._pending.splice(0);
    for (const worker of pending) this._attach(worker);
    spec.ready();
  }

  public attach(worker: Worker) {
    if (this._state === MuSocketServerState.RUNNING) {
      this._attach(worker);
    } else {
      this._pending.push(worker);
    }
  }

  private _attach(worker: Worker) {
    let socket: NodeWorkerServerSocket | null = null;
    worker.on('message', (data: Envelope) => {
      if (socket) {
        socket.receive(data);
        return;
      }
      if (!data || typeof data.sessionId !== 'string') {
        console.error('[worker-socket] unexpected first message:', data);
        return;
      }
      socket = new NodeWorkerServerSocket(data.sessionId, worker);
      this.clients.push(socket);
      this._onconnection(socket);
    });
    worker.on('error', (err) => {
      console.error('[worker-socket] worker error:', err);
    });
    worker.on('exit', (code) => {
      const intentional = socket && socket.state() === MuSocketState.CLOSED;
      if (code !== 0 && !intentional) {
        console.error('[worker-socket] worker exited with code', code);
      }
      if (socket) socket.notifyClose();
    });
  }

  public close() {
    if (this._state !== MuSocketServerState.RUNNING) {
      this._state = MuSocketServerState.SHUTDOWN;
      return;
    }
    this._state = MuSocketServerState.SHUTDOWN;
    for (const socket of this.clients.splice(0)) socket.close();
    this._onclose();
  }
}

class NodeWorkerServerSocket implements MuSocket {
  private _state = MuSocketState.INIT;
  private _message: (data: MuData, unreliable: boolean) => void = noop;
  private _close: () => void = noop;
  private _closedNotified = false;

  constructor(
    public readonly sessionId: string,
    private _worker: Worker,
  ) {}

  public state() {
    return this._state;
  }

  public open(spec: MuSocketSpec) {
    if (this._state === MuSocketState.OPEN) throw new Error('socket already open');
    if (this._state === MuSocketState.CLOSED) throw new Error('socket already closed');
    this._state = MuSocketState.OPEN;
    this._message = spec.message;
    this._close = spec.close;
    this._worker.postMessage({ sessionId: this.sessionId } as Envelope);
    spec.ready();
  }

  public receive(data: Envelope) {
    if (!data || typeof data !== 'object') return;
    if (typeof data.sessionId === 'string') return;
    if (this._state !== MuSocketState.OPEN) return;
    this._message(data.message as MuData, !!data.unreliable);
  }

  public send(message: MuData, unreliable?: boolean) {
    if (this._state !== MuSocketState.OPEN) return;
    this._worker.postMessage({ message, unreliable: !!unreliable } as Envelope);
  }

  public close() {
    if (this._state === MuSocketState.CLOSED) return;
    this._state = MuSocketState.CLOSED;
    try {
      this._worker.terminate();
    } catch (e) {}
    this.notifyClose();
  }

  public notifyClose() {
    if (this._closedNotified) return;
    this._closedNotified = true;
    this._close();
  }

  public reliableBufferedAmount() {
    return 0;
  }

  public unreliableBufferedAmount() {
    return 0;
  }
}
