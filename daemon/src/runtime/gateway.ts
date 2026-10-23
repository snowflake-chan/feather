import net from 'node:net';

export interface InstanceGatewayOptions {
  instanceId: string;
  /** 0 = allocate a port */
  port: number;
  host?: string;
  /** Start runtime if needed; resolves with internal runtime port. */
  ensureRuntime: () => Promise<number>;
  /** Called when no active connections for idleMs. */
  onIdle?: () => void | Promise<void>;
  idleMs?: number;
}

/**
 * Per-instance public TCP listener.
 *
 * The listener exists while the instance is registered, even if its runtime is
 * dormant. The first connection wakes the runtime; stop keeps the listener;
 * seal closes it.
 */
export class InstanceGateway {
  public port?: number;
  private _server?: net.Server;
  private _sealed = false;
  private _closed = false;
  private _active = 0;
  private _idleTimer?: NodeJS.Timeout;
  private _startPromise?: Promise<number>;
  private readonly _sockets = new Set<net.Socket>();

  constructor(private readonly _options: InstanceGatewayOptions) {}

  public async open(): Promise<number> {
    if (this._server) return this.port!;
    this._sealed = false;
    this._closed = false;
    const server = net.createServer((client) => this._onConnection(client));
    this._server = server;
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(this._options.port, this._options.host || '127.0.0.1', () => resolve());
    });
    this.port = (server.address() as net.AddressInfo).port;
    return this.port;
  }

  public async seal(): Promise<void> {
    this._sealed = true;
    for (const socket of this._sockets) socket.destroy();
    this._sockets.clear();
    await this._closeServer();
  }

  public async close(): Promise<void> {
    this._closed = true;
    this._sealed = true;
    if (this._idleTimer) clearTimeout(this._idleTimer);
    for (const socket of this._sockets) socket.destroy();
    this._sockets.clear();
    await this._closeServer();
  }

  public get activeConnections(): number {
    return this._active;
  }

  private async _closeServer() {
    const server = this._server;
    this._server = undefined;
    if (!server) return;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  private async _ensureRuntime(): Promise<number> {
    if (!this._startPromise) {
      this._startPromise = this._options.ensureRuntime().finally(() => {
        this._startPromise = undefined;
      });
    }
    return this._startPromise;
  }

  private _scheduleIdle() {
    if (!this._options.onIdle) return;
    if (this._idleTimer) clearTimeout(this._idleTimer);
    const idleMs = this._options.idleMs ?? 5 * 60_000;
    this._idleTimer = setTimeout(() => {
      if (this._active > 0 || this._sealed || this._closed) return;
      void this._options.onIdle?.();
    }, idleMs);
    this._idleTimer.unref?.();
  }

  private _onConnection(client: net.Socket) {
    if (this._sealed || this._closed) {
      client.destroy();
      return;
    }
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this._active++;
    this._sockets.add(client);
    client.pause();
    client.setNoDelay(true);
    const cleanup = () => {
      this._sockets.delete(client);
      this._active = Math.max(0, this._active - 1);
      if (this._active === 0) this._scheduleIdle();
    };
    client.once('close', cleanup);
    client.once('error', cleanup);
    void (async () => {
      try {
        const runtimePort = await this._ensureRuntime();
        if (this._sealed || this._closed || client.destroyed) return client.destroy();
        const upstream = net.connect({ port: runtimePort, host: '127.0.0.1' });
        upstream.setNoDelay(true);
        await new Promise<void>((resolve, reject) => {
          upstream.once('connect', resolve);
          upstream.once('error', reject);
        });
        if (this._sealed || this._closed) {
          upstream.destroy();
          client.destroy();
          return;
        }
        client.pipe(upstream).pipe(client);
        client.resume();
        upstream.once('close', () => client.destroy());
        client.once('close', () => upstream.destroy());
      } catch {
        client.destroy();
      }
    })();
  }
}
