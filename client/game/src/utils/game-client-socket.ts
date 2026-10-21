import {
  MuData,
  MuSocket,
  MuSocketSpec,
  MuSocketState,
} from '@box/mudb/socket/socket';

// wraps MuSocket to defer socket construction
export class GameClientSocket implements MuSocket {
  private _openCalled = false;
  private _closeCalled = false;

  // underlying socket implementation
  public socket: MuSocket | null = null;

  // socket methods
  public sessionId = 'BOX3';
  public send: (data: MuData, unreliable?: boolean) => void = () => {};

  constructor(public defer: Promise<MuSocket>) {}

  public state() {
    if (this._closeCalled) {
      return MuSocketState.CLOSED;
    }
    if (this._openCalled) {
      if (this.socket) {
        const s = this.socket.state();
        if (s !== MuSocketState.INIT) {
          return s;
        }
      }
      return MuSocketState.OPEN;
    }
    return MuSocketState.INIT;
  }

  public open(spec: MuSocketSpec) {
    if (this._openCalled) {
      return;
    }
    this._openCalled = true;
    this.defer.then(
      (socket) => {
        // reject socket
        if (this._closeCalled) {
          socket.close();
          spec.close();
          return;
        }

        // call socket open
        this.socket = socket;
        this.socket.open(spec);
        this.send = (data, unreliable) => socket.send(data, unreliable);
      },
      () => {
        // check close
        this.close();
        spec.close();
      },
    );
  }

  public close() {
    this._closeCalled = true;
    if (this.socket) {
      this.socket.close();
    }
    this.socket = null;
    this.send = () => {};
  }

  public reliableBufferedAmount() {
    if (this.socket) {
      return this.socket.reliableBufferedAmount();
    }
    return Infinity;
  }

  public unreliableBufferedAmount() {
    if (this.socket) {
      return this.socket.unreliableBufferedAmount();
    }
    return Infinity;
  }
}
