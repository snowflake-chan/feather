import fs from 'node:fs';
import path from 'node:path';

import { startApiServer } from './api/server';
import { createDaemon } from './daemon';

function arg(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/**
 * daemon 是 supervisor：它一崩，所有 shard 和所有图一起没。
 * 所以这里跟 engine 一样选择「记日志但不退出」——把崩溃降级成一次可见的故障，
 * 而不是整个 workspace 的静默消失。
 */
function installProcessErrorHandlers() {
  const report = (kind: string, error: unknown) => {
    const detail =
      error instanceof Error ? error.stack || error.message : String(error);
    console.error(`[daemon] ${kind}: ${detail}`);
  };
  process.on('unhandledRejection', (reason) => report('Unhandled rejection', reason));
  process.on('uncaughtException', (error) => report('Uncaught error', error));
}

async function main() {
  installProcessErrorHandlers();
  const workspaceRoot = path.resolve(arg('--workspace') || process.cwd());
  const dataDir = path.resolve(arg('--data-dir') || path.join(workspaceRoot, '.feather'));
  fs.mkdirSync(dataDir, { recursive: true });
  const tcp = process.argv.includes('--tcp');
  const socketPath = arg('--socket') || path.join(dataDir, 'daemon.sock');
  const token = arg('--token') || process.env.FEATHER_DAEMON_TOKEN;
  const daemon = await createDaemon({
    workspaceRoot,
    dataDir,
    socketPath,
    tcp,
    token,
    enableExec:
      process.argv.includes('--enable-exec') ||
      (process.env.FEATHER_ENABLE_EXEC
        ? !['off', '0', 'false'].includes(
            process.env.FEATHER_ENABLE_EXEC.toLowerCase(),
          )
        : !tcp),
  });
  const pidFile = path.join(dataDir, 'daemon.pid');
  fs.writeFileSync(pidFile, `${process.pid}\n`);
  let api: Awaited<ReturnType<typeof startApiServer>> | undefined;
  const shutdown = async () => {
    await api?.close().catch(() => {});
    await daemon.close().catch(() => {});
    fs.rmSync(pidFile, { force: true });
    process.exit(0);
  };
  api = await startApiServer(daemon, {
    socketPath,
    tcp,
    host: arg('--host') || '127.0.0.1',
    port: arg('--port') ? Number(arg('--port')) : 0,
    token,
    onShutdown: () => void shutdown(),
  });
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
  if (api.port) process.stdout.write(`feather-daemon tcp ${api.port}\n`);
  else process.stdout.write(`feather-daemon uds ${socketPath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
