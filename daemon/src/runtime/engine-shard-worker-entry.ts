import { parentPort, workerData } from 'node:worker_threads';

import { getConfig } from 'feather-engine/config';
import { startServer } from 'feather-engine/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

import type { MapSpec } from '../contract';
import { buildMapConfig, resolveMapPaths } from './config';
import { collectStats } from './stats';

interface ShardWorkerData {
  shardId: string;
  workspaceRoot: string;
  maps: MapSpec[];
}

interface MapHandle {
  spec: MapSpec;
  result: Awaited<ReturnType<typeof startServer>>;
  startedAt: number;
  previousCpu: NodeJS.CpuUsage;
  previousTime: number;
}

const port = parentPort;
if (!port) throw new Error('engine shard worker requires parentPort');
const messagePort: NonNullable<typeof parentPort> = port;

const data = workerData as ShardWorkerData;
const handles = new Map<string, MapHandle>();

function send(message: unknown) {
  messagePort.postMessage(message);
}

async function startMap(spec: MapSpec) {
  try {
    const base = await getConfig();
    const config = buildMapConfig(base, spec, data.workspaceRoot);
    const paths = resolveMapPaths(data.workspaceRoot, spec);
    if (!spec.scriptWorkerEntry) throw new Error(`missing scriptWorkerEntry for ${spec.id}`);
    const scriptServer = new WorkerScriptServer({ workerEntry: spec.scriptWorkerEntry });
    const result = await startServer(config, { scriptServer, paths });
    if (!result.httpServer.listening) {
      await new Promise<void>((resolve, reject) => {
        result.httpServer.once('listening', () => resolve());
        result.httpServer.once('error', (error) => reject(error));
      });
    }
    const address = result.httpServer.address();
    const actualPort = typeof address === 'object' && address ? address.port : config.port;
    const now = Date.now();
    handles.set(spec.id, {
      spec,
      result,
      startedAt: now,
      previousCpu: process.cpuUsage(),
      previousTime: now,
    });
    send({ type: 'mapReady', id: spec.id, port: actualPort });
  } catch (error) {
    send({
      type: 'mapError',
      id: spec.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function stopMap(id: string) {
  const handle = handles.get(id);
  if (!handle) {
    send({ type: 'mapStopped', id });
    return;
  }
  handles.delete(id);
  try {
    await handle.result.game.close();
  } catch (error) {
    send({
      type: 'mapError',
      id,
      error: `close: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  await new Promise<void>((resolve) => {
    try {
      handle.result.httpServer.close(() => resolve());
    } catch {
      resolve();
    }
  });
  try {
    handle.result.scriptServer.close();
  } catch {
    // GameServer.close already tears down the script host.
  }
  send({ type: 'mapStopped', id });
}

async function main() {
  for (const spec of data.maps) {
    await startMap(spec);
  }
  send({ type: 'ready', shardId: data.shardId });

  const statsTimer = setInterval(() => {
    for (const [id, handle] of handles) {
      const collected = collectStats({
        game: handle.result.game,
        startedAt: handle.startedAt,
        previousCpu: handle.previousCpu,
        previousTime: handle.previousTime,
      });
      handle.previousCpu = collected.previousCpu;
      handle.previousTime = collected.previousTime;
      send({ type: 'stats', id, stats: collected.stats });
    }
  }, 1000);
  statsTimer.unref();

  messagePort.on('message', (message: any) => {
    if (message?.type === 'stopMap') {
      void stopMap(String(message.id));
      return;
    }
    if (message?.type === 'addMap') {
      void startMap(message.spec as MapSpec);
      return;
    }
    if (message?.type === 'shutdown') {
      void (async () => {
        for (const id of Array.from(handles.keys())) await stopMap(id);
        send({ type: 'stopped', shardId: data.shardId });
        process.exit(0);
      })();
    }
  });
}

main().catch((error) => {
  send({
    type: 'shardError',
    shardId: data.shardId,
    error: error instanceof Error ? error.stack || error.message : String(error),
  });
  process.exit(1);
});
