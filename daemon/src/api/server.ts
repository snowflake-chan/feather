import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import type { LogEntry, MapSpec } from '../contract';
import type { Daemon } from '../daemon';

export interface ApiServerOptions {
  socketPath?: string;
  tcp?: boolean;
  host?: string;
  port?: number;
  token?: string;
  onShutdown?: () => void;
}

export interface ApiServer {
  server: http.Server;
  socketPath?: string;
  port?: number;
  close(): Promise<void>;
}

function json(res: http.ServerResponse, status: number, value: unknown) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function error(res: http.ServerResponse, status: number, code: string, message: string) {
  json(res, status, { code, message, details: {} });
}

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error('request body too large');
    chunks.push(Buffer.from(chunk));
  }
  if (size === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function startApiServer(
  daemon: Daemon,
  options: ApiServerOptions,
): Promise<ApiServer> {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      if (url.pathname === '/_ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('OK');
      }
      if (options.tcp && options.token) {
        const auth = req.headers.authorization;
        const token = req.headers['x-feather-token'];
        if (auth !== `Bearer ${options.token}` && token !== options.token) {
          return error(res, 401, 'UNAUTHORIZED', 'invalid token');
        }
      }
      if (url.pathname === '/v1/version') return json(res, 200, await daemon.version());
      if (url.pathname === '/v1/info') return json(res, 200, await daemon.info());
      if (url.pathname === '/v1/maps' && req.method === 'GET') {
        return json(res, 200, await daemon.listMaps());
      }
      if (url.pathname === '/v1/maps' && req.method === 'POST') {
        const body = (await readJson(req)) as MapSpec;
        const status = await daemon.createMap(body);
        return json(res, 201, status);
      }
      if (url.pathname === '/v1/shards' && req.method === 'GET') {
        return json(res, 200, await daemon.listShards());
      }
      if (url.pathname === '/v1/events' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'application/x-ndjson',
          'Cache-Control': 'no-store',
        });
        res.flushHeaders?.();
        res.socket?.setNoDelay(true);
        for await (const event of daemon.events()) res.write(`${JSON.stringify(event)}\n`);
        return res.end();
      }
      if (url.pathname === '/v1/shutdown' && req.method === 'POST') {
        json(res, 202, { ok: true });
        setImmediate(() => {
          void daemon.close();
          options.onShutdown?.();
        });
        return;
      }
      const opMatch = url.pathname.match(/^\/v1\/operations\/([^/]+)$/);
      if (opMatch && req.method === 'GET') {
        const operation = daemon.getOperation(decodeURIComponent(opMatch[1]));
        if (!operation) return error(res, 404, 'OPERATION_NOT_FOUND', 'operation not found');
        return json(res, 200, operation);
      }
      const mapMatch = url.pathname.match(/^\/v1\/maps\/([^/]+)(?:\/(start|stop|restart|stats|logs|exec))?$/);
      if (mapMatch) {
        const id = decodeURIComponent(mapMatch[1]);
        const action = mapMatch[2];
        if (!action && req.method === 'GET') {
          const status = await daemon.getMap(id);
          return status
            ? json(res, 200, status)
            : error(res, 404, 'MAP_NOT_FOUND', `map not found: ${id}`);
        }
        if (!action && req.method === 'PUT') {
          const body = (await readJson(req)) as MapSpec;
          return json(res, 200, await daemon.updateMap(id, body));
        }
        if (!action && req.method === 'DELETE') {
          const force = url.searchParams.get('force') === '1';
          await daemon.destroyMap(id, { force });
          res.writeHead(204);
          return res.end();
        }
        if (action === 'start' && req.method === 'POST') {
          return json(res, 202, await daemon.startMap(id));
        }
        if (action === 'stop' && req.method === 'POST') {
          const timeoutMs = Number(url.searchParams.get('timeout') || 30) * 1000;
          return json(res, 202, await daemon.stopMap(id, {
            timeoutMs,
            force: url.searchParams.get('force') === '1',
          }));
        }
        if (action === 'restart' && req.method === 'POST') {
          return json(res, 202, await daemon.restartMap(id));
        }
        if (action === 'stats' && req.method === 'GET') {
          return json(res, 200, await daemon.stats(id));
        }
        if (action === 'exec' && req.method === 'POST') {
          const body = (await readJson(req)) as { command?: string; code?: string };
          const command = String(body.command ?? body.code ?? '');
          if (!command.trim()) return error(res, 422, 'INVALID_SPEC', 'missing command');
          const result = await daemon.exec(id, command);
          return json(res, 200, { result });
        }
        if (action === 'logs' && req.method === 'GET') {
          res.writeHead(200, {
            'Content-Type': 'application/x-ndjson',
            'Cache-Control': 'no-store',
          });
          res.flushHeaders?.();
          res.socket?.setNoDelay(true);
          const follow = url.searchParams.get('follow') === '1';
          const tail = Number(url.searchParams.get('tail') || 0) || undefined;
          let closed = false;
          res.on('close', () => {
            closed = true;
          });
          const iterator = daemon.logs(id, { follow, tail })[Symbol.asyncIterator]();
          while (!closed) {
            const next = await iterator.next();
            if (next.done) break;
            const entry: LogEntry = next.value;
            res.write(`${JSON.stringify(entry)}\n`);
          }
          return res.end();
        }
      }
      return error(res, 404, 'NOT_FOUND', `not found: ${req.method} ${url.pathname}`);
    } catch (e) {
      const code = (e as any)?.code;
      const status =
        code === 'MAP_NOT_FOUND' ? 404
          : code === 'EXEC_DISABLED' ? 403
            : code === 'MAP_CONFLICT' || code === 'OPERATION_IN_PROGRESS' || code === 'MAP_NOT_RUNNING' ? 409
              : code === 'INVALID_SPEC' ? 422
                : code === 'NOT_IMPLEMENTED' ? 501
                  : 500;
      return error(res, status, code || 'INTERNAL', e instanceof Error ? e.message : String(e));
    }
  });

  let actualPort: number | undefined;
  if (options.tcp) {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(options.port || 0, options.host || '127.0.0.1', () => resolve());
    });
    actualPort = (server.address() as AddressInfo).port;
  } else {
    const socketPath = options.socketPath;
    if (!socketPath) throw new Error('socketPath is required for UDS API');
    fs.mkdirSync(pathDir(socketPath), { recursive: true });
    try {
      fs.rmSync(socketPath, { force: true });
    } catch {
      // Best effort.
    }
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(socketPath, () => resolve());
    });
    try {
      fs.chmodSync(socketPath, 0o600);
    } catch {
      // Windows named pipes have no filesystem mode.
    }
  }

  return {
    server,
    socketPath: options.socketPath,
    port: actualPort,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      if (!options.tcp && options.socketPath) {
        try {
          fs.rmSync(options.socketPath, { force: true });
        } catch {
          // Best effort.
        }
      }
    },
  };
}

function pathDir(socketPath: string) {
  return socketPath.includes('/') || socketPath.includes('\\')
    ? socketPath.slice(0, Math.max(socketPath.lastIndexOf('/'), socketPath.lastIndexOf('\\')))
    : '.';
}
