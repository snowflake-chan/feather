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
    contentId: id === 'a' ? 201 : 202,
  });
  const socketPath = path.join(workspace, '.feather', 'daemon.sock');
  const daemon = await createDaemon({ dataDir: path.join(workspace, '.feather'), socketPath });
  const api = await startApiServer(daemon, { socketPath });
  try {
    await daemon.defineMap(makeMap('a'));
    await daemon.defineMap(makeMap('b'));
    await request(socketPath, 'POST', '/v1/instances', { mapId: 'a', id: 'a' });
    await request(socketPath, 'POST', '/v1/instances', { mapId: 'b', id: 'b' });
    await request(socketPath, 'POST', '/v1/instances/a/start');
    await request(socketPath, 'POST', '/v1/instances/b/start');
    // 等一个 stats 采样窗口（shard 侧 1s 一次）
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const stats = await request(socketPath, 'GET', '/v1/instances/a/stats');
    process.stdout.write(`stats=${JSON.stringify(stats)}\n`);
    if (!(stats.tickRate > 0)) throw new Error(`tickRate missing: ${JSON.stringify(stats)}`);
    if (!(stats.tickDuration > 0)) throw new Error(`tickDuration missing: ${JSON.stringify(stats)}`);
    if (!(stats.tickDuration < 1000)) throw new Error(`tickDuration implausible: ${stats.tickDuration}`);
    // 资源指标必须是 shard 口径，不能还挂在 map 上
    if ('cpuPercent' in stats || 'heapUsedBytes' in stats || 'rssBytes' in stats) {
      throw new Error(`process-level metrics leaked into map stats: ${JSON.stringify(stats)}`);
    }
    if (!stats.shardId) throw new Error('map stats missing shardId');
    if (!stats.shard?.sampledAt) throw new Error(`map stats missing shard usage: ${JSON.stringify(stats)}`);

    const shards = await request(socketPath, 'GET', '/v1/shards');
    process.stdout.write(`shards=${JSON.stringify(shards)}\n`);
    if (!Array.isArray(shards) || shards.length === 0) throw new Error('no shards reported');
    const covered = shards.flatMap((s: any) => s.maps);
    if (covered.length !== 2 || !covered.includes('a') || !covered.includes('b')) {
      throw new Error(`shard->map mapping wrong: ${JSON.stringify(covered)}`);
    }
    for (const shard of shards) {
      if (!(shard.heapUsedBytes > 0)) throw new Error(`shard heap not sampled: ${JSON.stringify(shard)}`);
      if (!(shard.heapLimitBytes > 0)) throw new Error(`shard heap limit missing: ${JSON.stringify(shard)}`);
      if (!(shard.mapCount >= 1)) throw new Error(`shard mapCount wrong: ${JSON.stringify(shard)}`);
      // per-thread CPU：基线在 shard 启动时就抓了，等了 2.5s 一定算得出来
      if (!Number.isFinite(shard.cpuPercent) || shard.cpuPercent < 0) {
        throw new Error(`shard cpuPercent not sampled: ${JSON.stringify(shard)}`);
      }
    }
    const owning = shards.find((s: any) => s.maps.includes('a'));
    if (owning.shardId !== stats.shardId) {
      throw new Error(`stats.shardId=${stats.shardId} but a lives on ${owning.shardId}`);
    }
    const maps = await request(socketPath, 'GET', '/v1/instances');
    process.stdout.write(`maps=${JSON.stringify(maps.map((m: any) => [m.id, m.state, m.shardId]))}\n`);
    if (maps.length !== 2 || maps.some((m: any) => m.state !== 'running')) throw new Error('maps not running');
    await request(socketPath, 'POST', '/v1/instances/a/stop');
    const after = await request(socketPath, 'GET', '/v1/instances/b');
    if (after.state !== 'running') throw new Error('b not running after a stop');
    // 停完不能留旧端口：留着的话下一次 start 会读到它并报 running（幽灵 running）
    const stopped = await request(socketPath, 'GET', '/v1/instances/a');
    if (stopped.state !== 'stopped') throw new Error(`a not stopped: ${stopped.state}`);
    if (stopped.port !== undefined) {
      throw new Error(`a kept stale port after stop: ${stopped.port}`);
    }
    await request(socketPath, 'POST', '/v1/instances/a/start');
    const restarted = await request(socketPath, 'GET', '/v1/instances/a');
    if (restarted.state !== 'running' || !restarted.port) {
      throw new Error(`a did not restart cleanly: ${JSON.stringify(restarted)}`);
    }
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
