/**
 * 崩溃重启校验：`MapSpec.restartPolicy` 到底有没有生效。
 *
 * 之前这个字段只被写进 status，没有任何地方读它——shard 一崩（一次未捕获异常
 * 就够），图就永久停在 error。这个脚本用 `worker.terminate()` 人为制造一次
 * shard 崩溃，然后看 daemon 会不会按策略把图拉回来。
 *
 * 需要 `BOX_BUNDLED_CONTENT_PATH`（和 check-daemon 一样，跑真图）。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createDaemon } from './daemon';
import type { MapSpec } from './contract';

const POLL_MS = 500;
/** 真图启动要几十秒，崩溃后还要等退避，预算给足 */
const RESTART_BUDGET_MS = 120_000;

async function waitUntil(
  predicate: () => Promise<boolean>,
  timeoutMs: number,
  label: string,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new Error(`timeout waiting for ${label}`);
}

async function main() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-restart-'));
  const blobs = process.env.BOX_BUNDLED_CONTENT_PATH;
  if (!blobs) throw new Error('BOX_BUNDLED_CONTENT_PATH is required');
  const workerEntry = path.resolve(__dirname, '../../shell/tools/worker-entry/worker-entry.js');
  const spec: MapSpec = {
    id: 'restart',
    name: 'restart',
    scriptWorkerEntry: workerEntry,
    contentDir: blobs,
    port: 0,
    restartPolicy: 'always',
    dataDir: path.join(workspace, '.feather', 'data', 'restart'),
    databaseUrl: `sqlite:///${path.join(workspace, '.feather', 'sqlite', 'restart.sqlite')}`,
    dataStorageNamespace: 'restart',
    contentId: 203,
  };

  const daemon = await createDaemon({
    dataDir: path.join(workspace, '.feather'),
    socketPath: path.join(workspace, '.feather', 'daemon.sock'),
  });

  try {
    await daemon.createMap(spec);
    await daemon.startMap(spec.id);
    const first = await daemon.getMap(spec.id);
    if (first?.state !== 'running' || !first.port) {
      throw new Error(`map did not start: ${JSON.stringify(first)}`);
    }
    process.stdout.write(`[restart] started on port ${first.port}\n`);

    // 人为制造 shard 崩溃：等价于引擎里一次未捕获异常打死 worker 线程
    const internals = daemon as unknown as {
      _shards: Map<string, { terminate(): Promise<number> }>;
    };
    const shard = Array.from(internals._shards.values())[0];
    if (!shard) throw new Error('no shard to terminate');
    await shard.terminate();
    process.stdout.write('[restart] shard terminated\n');

    // onExit 可能在 terminate() 兑现之后才跑完，所以这里是等而不是断言
    await waitUntil(
      async () => (await daemon.getMap(spec.id))?.state !== 'running',
      10_000,
      'map to be marked as crashed',
    );

    await waitUntil(
      async () => {
        const status = await daemon.getMap(spec.id);
        return status?.state === 'running' && Boolean(status.port);
      },
      RESTART_BUDGET_MS,
      'map to be restarted by restartPolicy',
    );

    const recovered = await daemon.getMap(spec.id);
    process.stdout.write(`[restart] recovered on port ${recovered?.port}\n`);
    if (!recovered?.shardId) throw new Error('recovered map has no shardId');
    process.stdout.write('restart policy checks passed\n');
  } finally {
    await daemon.close().catch(() => {});
    fs.rmSync(workspace, { recursive: true, force: true });
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
