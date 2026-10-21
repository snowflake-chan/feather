import http from 'node:http';
import type { DaemonInfo, MapSpec, MapStatus, MapStats, Operation } from '@feather/daemon/contract';

export interface ClientOptions {
  socketPath?: string;
  host?: string;
  port?: number;
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class DaemonClient {
  constructor(private readonly _options: ClientOptions) {}

  private _request<T>(method: string, pathname: string, body?: unknown): Promise<T> {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const options: http.RequestOptions = {
      method,
      path: pathname,
      headers: {
        ...(payload
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            }
          : {}),
        ...(this._options.token
          ? { Authorization: `Bearer ${this._options.token}` }
          : {}),
      },
    };
    if (this._options.socketPath) options.socketPath = this._options.socketPath;
    else {
      options.host = this._options.host || '127.0.0.1';
      options.port = this._options.port;
    }
    return new Promise<T>((resolve, reject) => {
      const req = http.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            let code = 'HTTP_ERROR';
            let message = text;
            try {
              const parsed = JSON.parse(text) as { code?: string; message?: string };
              code = parsed.code || code;
              message = parsed.message || message;
            } catch {
              // plain text
            }
            reject(new ApiError(res.statusCode || 0, code, message));
            return;
          }
          if (!text) {
            resolve(undefined as T);
            return;
          }
          try {
            resolve(JSON.parse(text) as T);
          } catch {
            resolve(text as T);
          }
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  ping() {
    return this._request<string>('GET', '/_ping');
  }
  info() {
    return this._request<DaemonInfo>('GET', '/v1/info');
  }
  listMaps() {
    return this._request<MapStatus[]>('GET', '/v1/maps');
  }
  getMap(id: string) {
    return this._request<MapStatus>('GET', `/v1/maps/${encodeURIComponent(id)}`);
  }
  createMap(spec: MapSpec) {
    return this._request<MapStatus>('POST', '/v1/maps', spec);
  }
  startMap(id: string) {
    return this._request<Operation>('POST', `/v1/maps/${encodeURIComponent(id)}/start`);
  }
  stopMap(id: string) {
    return this._request<Operation>('POST', `/v1/maps/${encodeURIComponent(id)}/stop`);
  }
  restartMap(id: string) {
    return this._request<Operation>('POST', `/v1/maps/${encodeURIComponent(id)}/restart`);
  }
  stats(id: string) {
    return this._request<MapStats>('GET', `/v1/maps/${encodeURIComponent(id)}/stats`);
  }
  exec(id: string, command: string) {
    return this._request<{ result: string }>(
      'POST',
      `/v1/maps/${encodeURIComponent(id)}/exec`,
      { command },
    );
  }
  shutdown() {
    return this._request<{ ok: boolean }>('POST', '/v1/shutdown');
  }

  stream(pathname: string, onLine: (line: string) => void, signal?: AbortSignal): Promise<void> {
    const options: http.RequestOptions = { method: 'GET', path: pathname };
    if (this._options.socketPath) options.socketPath = this._options.socketPath;
    else {
      options.host = this._options.host || '127.0.0.1';
      options.port = this._options.port;
    }
    return new Promise<void>((resolve, reject) => {
      const req = http.request(options, (res) => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          reject(new ApiError(res.statusCode || 0, 'HTTP_ERROR', `stream ${res.statusCode}`));
          res.resume();
          return;
        }
        let buffer = '';
        res.on('data', (chunk) => {
          buffer += String(chunk);
          for (;;) {
            const index = buffer.indexOf('\n');
            if (index < 0) break;
            const line = buffer.slice(0, index);
            buffer = buffer.slice(index + 1);
            if (line) onLine(line);
          }
        });
        res.on('end', resolve);
      });
      req.on('error', reject);
      signal?.addEventListener('abort', () => {
        req.destroy();
        resolve();
      }, { once: true });
      req.end();
    });
  }
}
