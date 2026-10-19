import type { MessagePort } from 'worker_threads';
import {
  MuData,
  MuSocket,
  MuSocketSpec,
  MuSocketState,
} from '@box/mudb/socket/socket';

const noop = () => {};

interface Envelope {
  sessionId?: string;
  message?: MuData;
  unreliable?: boolean;
}

/** Worker 侧：把 parentPort / MessagePort 包成 MuSocket 客户端。 */
export class NodeWorkerSocket implements MuSocket {
  private _state = MuSocketState.INIT;
  private _message: (data: MuData, unreliable: boolean) => void = noop;
  private _close: () => void = noop;
  private _ready: () => void = noop;
  private _handshakeDone = false;
  private _closedNotified = false;

  constructor(
    public readonly sessionId: string,
    private _port: MessagePort,
  ) {
    this._port.on('message', (data: Envelope) => this.receive(data));
    this._port.on('close', () => this.notifyClose());
  }

  public state() {
    return this._state;
  }

  public open(spec: MuSocketSpec) {
    if (this._state === MuSocketState.OPEN) throw new Error('socket already open');
    if (this._state === MuSocketState.CLOSED) throw new Error('socket already closed');
    this._state = MuSocketState.OPEN;
    this._ready = spec.ready;
    this._message = spec.message;
    this._close = spec.close;
    this._port.postMessage({ sessionId: this.sessionId } as Envelope);
  }

  private receive(data: Envelope) {
    if (!this._handshakeDone) {
      if (!data || data.sessionId !== this.sessionId) {
        console.error('[worker-socket] bad handshake:', data);
        return;
      }
      this._handshakeDone = true;
      this._ready();
      return;
    }
    if (this._state !== MuSocketState.OPEN) return;
    this._message(data.message as MuData, !!data.unreliable);
  }

  public send(message: MuData, unreliable?: boolean) {
    if (this._state !== MuSocketState.OPEN) return;
    this._port.postMessage({ message, unreliable: !!unreliable } as Envelope);
  }

  public close() {
    if (this._state === MuSocketState.CLOSED) return;
    this._state = MuSocketState.CLOSED;
    try {
      this._port.close();
    } catch (e) {}
    this.notifyClose();
  }

  private notifyClose() {
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
