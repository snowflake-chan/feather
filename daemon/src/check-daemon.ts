import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

import { startApiServer } from './api/server';
import { createDaemon } from './daemon';
import type { MapSpec } from './contract';

function request(socketPath: string, method: string, pathname: string, body?: unknown): Promise<any> {
  const payload = body === undefined ? undefined : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath,
        method,
        path: pathname,
        headers: payload
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
          : undefined,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          if (!res.statusCode || res.statusCode >= 300) {
            reject(new Error(`${method} ${pathname} -> ${res.statusCode} ${text}`));
          } else {
            resolve(text ? JSON.parse(text) : undefined);
          }
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-daemon-'));
  const workerEntry = path.resolve(__dirname, '../../shell/tools/worker-entry/worker-entry.js');
  const blobs = process.env.BOX_BUNDLED_CONTENT_PATH;
  if (!blobs) throw new Error('BOX_BUNDLED_CONTENT_PATH is required');
  const makeMap = (id: string): MapSpec => ({
    id,
    name: id,
    scriptWorkerEntry: workerEntry,
    contentDir: blobs,
    port: 0,
    dataDir: path.join(workspace, '.feather', 'data', id),
    databaseUrl: `sqlite:///${path.join(workspace, '.feather', 'sqlite', `${id}.sqlite`)}`,
    dataStorageNamespace: id,
    groupNamespace: 'daemon-group',
    contentId: id === 'a' ? 201 : 202,
  });
  const socketPath = path.join(workspace, '.feather', 'daemon.sock');
  const daemon = await createDaemon({ workspaceRoot: workspace, dataDir: path.join(workspace, '.feather'), socketPath });
  const api = await startApiServer(daemon, { socketPath });
  try {
    await request(socketPath, 'POST', '/v1/maps', makeMap('a'));
    await request(socketPath, 'POST', '/v1/maps', makeMap('b'));
    await request(socketPath, 'POST', '/v1/maps/a/start');
    await request(socketPath, 'POST', '/v1/maps/b/start');
    const maps = await request(socketPath, 'GET', '/v1/maps');
    process.stdout.write(`maps=${JSON.stringify(maps.map((m: any) => [m.id, m.state, m.shardId]))}\n`);
    if (maps.length !== 2 || maps.some((m: any) => m.state !== 'running')) throw new Error('maps not running');
    await request(socketPath, 'POST', '/v1/maps/a/stop');
    const after = await request(socketPath, 'GET', '/v1/maps/b');
    if (after.state !== 'running') throw new Error('b not running after a stop');
    await request(socketPath, 'POST', '/v1/shutdown');
    await new Promise((resolve) => setTimeout(resolve, 500));
    process.stdout.write('daemon checks passed\n');
  } finally {
    await api.close().catch(() => {});
    await daemon.close().catch(() => {});
    fs.rmSync(workspace, { recursive: true, force: true });
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
