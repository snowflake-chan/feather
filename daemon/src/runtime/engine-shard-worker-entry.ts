import { parentPort, workerData } from 'node:worker_threads';

import { installSharedContentArena } from 'feather-engine/content-arena';
import { getConfig } from 'feather-engine/config';
import { installProcessErrorHandlers, startServer } from 'feather-engine/entry';
import { WorkerScriptServer } from '@feather/transport/worker-script-server';

import type { MapSpec } from '../contract';
import { buildMapConfig, resolveMapPaths } from './config';
import { collectStats } from './stats';

interface ShardWorkerData {
  shardId: string;
  workspaceRoot: string;
  maps: MapSpec[];
  contentArena?: { data: SharedArrayBuffer; index: SharedArrayBuffer; control: SharedArrayBuffer };
}

interface MapHandle {
  spec: MapSpec;
  result: Awaited<ReturnType<typeof startServer>>;
  startedAt: number;
  previousTime: number;
  previousTick: number;
  previousTickTimeSum: number;
  previousTickCounter: number;
}

const port = parentPort;
if (!port) throw new Error('engine shard worker requires parentPort');
const messagePort: NonNullable<typeof parentPort> = port;

const data = workerData as ShardWorkerData;
const handles = new Map<string, MapHandle>();

/** 单图 close 的上限。daemon 侧默认 30s 超时，这里留足余量但不能没有上限。 */
const CLOSE_DEADLINE_MS = 8_000;

/**
 * 必须在任何图启动之前装。
 *
 * worker 线程里一次未捕获的 rejection 会直接把整个线程打死（实测 exit code 1），
 * 而一个 shard 承载多张图 —— 一行 fire-and-forget 就能一次带走整批。
 * 上游是在 `startServer` 里装的，feather 把 startServer 改成可多图调用后移到了
 * 进程组合根，daemon 路径没有 launch.ts，所以这里必须自己装一次。
 *
 * 代价：装了就吞异常。daemon 是 supervisor，死了所有图一起死，吞掉比崩掉划算；
 * 但日志必须够响，否则会变成「图还在但行为不对」的静默故障。
 */
installProcessErrorHandlers({
  error: (error, message) => {
    const detail =
      error instanceof Error ? error.stack || error.message : String(error);
    console.error(`[shard ${data.shardId}] ${message ?? 'error'}: ${detail}`);
  },
});

/**
 * 必须在启动任何图之前装：`CachingContentServer` 在构造时取默认缓存。
 * 装上之后，本 shard 的所有图（以及其它 shard）读的是同一份 blob 字节。
 */
const contentArena = data.contentArena
  ? installSharedContentArena(data.contentArena)
  : undefined;

function send(message: unknown) {
  messagePort.postMessage(message);
}

async function startMap(spec: MapSpec) {
  let scriptServer: WorkerScriptServer | undefined;
  try {
    const base = await getConfig();
    const config = buildMapConfig(base, spec, data.workspaceRoot);
    const paths = resolveMapPaths(data.workspaceRoot, spec);
    if (!spec.scriptWorkerEntry) throw new Error(`missing scriptWorkerEntry for ${spec.id}`);
    scriptServer = new WorkerScriptServer({
      workerEntry: spec.scriptWorkerEntry,
      // 单图上限；shard 本身不设限，否则会一次带走同 shard 的所有图。
      memoryLimitMb: config.SCRIPT_MEMORY_LIMIT,
    });
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
      previousTime: now,
      previousTick: Number(result.game.state?.clock?.tick ?? 0),
      previousTickTimeSum: Number(result.game.state?.perf?.avgTickTime ?? 0),
      previousTickCounter: Number(result.game.state?.perf?.tickCounter ?? 0),
    });
    send({ type: 'mapReady', id: spec.id, port: actualPort });
  } catch (error) {
    // 启动到一半失败时，脚本 worker 可能已经起来了。不关它就会吊着这个 shard
    // 的事件循环，而且下次 start 会在同一个 shard 里再起一个。
    try {
      scriptServer?.close();
    } catch {
      // Best effort.
    }
    send({
      type: 'mapError',
      id: spec.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** 只等这么久，到点就当它关完了。 */
function deadline(ms: number) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    timer.unref();
  });
}

async function stopMap(id: string) {
  const handle = handles.get(id);
  if (!handle) {
    send({ type: 'mapStopped', id });
    return;
  }
  handles.delete(id);
  // 关图不能无限等：卡住的是用户脚本或某条没断的 RPC，而 daemon 那边 30s 就超时。
  // 一旦超时，daemon 会认为这张图还活着（旧端口），下一次 start 会报 running 但图已经没了。
  // 所以这里给 close 也设一个上限，保证 ack 一定会发出去。
  try {
    await Promise.race([
      handle.result.game.close(),
      deadline(CLOSE_DEADLINE_MS).then(() => {
        console.error(
          `[shard ${data.shardId}] map ${id} close exceeded ${CLOSE_DEADLINE_MS}ms; acking anyway`,
        );
      }),
    ]);
  } catch (error) {
    send({
      type: 'mapError',
      id,
      error: `close: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  const httpServer = handle.result.httpServer as typeof handle.result.httpServer & {
    closeAllConnections?: () => void;
    closeIdleConnections?: () => void;
  };
  // A connected player keeps an HTTP keep-alive socket open. Node's
  // httpServer.close() then waits forever for that connection, so the daemon
  // never receives mapStopped and restart times out on the first attempt.
  try {
    httpServer.closeAllConnections?.();
    httpServer.closeIdleConnections?.();
    // closeAllConnections() does not destroy sockets upgraded to WebSocket.
    // Those are the exact sockets kept alive by a connected player.
    const connections = (httpServer as any)._connections;
    if (connections && typeof connections.forEach === 'function') {
      for (const socket of connections) {
        try {
          socket.destroy();
        } catch {
          // already gone
        }
      }
    }
  } catch {
    // Best effort; close() below still runs.
  }
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 1000);
    timer.unref();
    try {
      httpServer.close(() => {
        clearTimeout(timer);
        resolve();
      });
    } catch {
      clearTimeout(timer);
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
  send({ type: 'ready', shardId: data.shardId, contentArena: contentArena?.stats() });

  const statsTimer = setInterval(() => {
    for (const [id, handle] of handles) {
      const collected = collectStats({
        game: handle.result.game,
        startedAt: handle.startedAt,
        previousTime: handle.previousTime,
        previousTick: handle.previousTick,
        previousTickTimeSum: handle.previousTickTimeSum,
        previousTickCounter: handle.previousTickCounter,
      });
      handle.previousTime = collected.previousTime;
      handle.previousTick = collected.previousTick;
      handle.previousTickTimeSum = collected.previousTickTimeSum;
      handle.previousTickCounter = collected.previousTickCounter;
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
    if (message?.type === 'exec') {
      const id = String(message.id);
      const requestId = Number(message.requestId);
      const handle = handles.get(id);
      if (!handle) {
        send({ type: 'execResult', id, requestId, error: `map is not running: ${id}` });
        return;
      }
      let finished = false;
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        send({ type: 'execResult', id, requestId, error: `exec timeout: ${id}` });
      }, 10_000);
      timer.unref();
      handle.result.game.script
        .scriptEval(String(message.command ?? ''))
        .then((result) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          send({ type: 'execResult', id, requestId, result });
        })
        .catch((error) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          send({
            type: 'execResult',
            id,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          });
        });
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
