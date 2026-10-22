import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { startApiServer } from './api/server';
import { runFeatherdTool } from './cli';
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
  const tool = process.argv[2];
  if (tool === 'build' || tool === 'unpack') {
    await runFeatherdTool(process.argv.slice(2));
    return;
  }
  const dataRoot = path.resolve(
    arg('--data-root') ||
      process.env.FEATHER_DATA_ROOT ||
      process.env.FEATHER_DATA_DIR ||
      path.join(os.homedir(), '.feather'),
  );
  fs.mkdirSync(dataRoot, { recursive: true });
  const tcp = process.argv.includes('--tcp');
  const socketPath = path.resolve(
    arg('--socket') ||
      process.env.FEATHER_SOCKET ||
      path.join(os.homedir(), '.feather', 'daemon.sock'),
  );
  const token = arg('--token') || process.env.FEATHER_DAEMON_TOKEN;
  const enableEval =
    process.argv.includes('--enable-eval') ||
    (process.env.FEATHER_ENABLE_EVAL
      ? !['off', '0', 'false'].includes(process.env.FEATHER_ENABLE_EVAL.toLowerCase())
      : false);
  const daemon = await createDaemon({
    dataDir: dataRoot,
    socketPath,
    tcp,
    token,
    enableExec: enableEval,
  });
  const pidFile = path.join(dataRoot, 'daemon.pid');
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
  if (api.port) process.stdout.write(`featherd tcp ${api.port}\n`);
  else process.stdout.write(`featherd uds ${socketPath}\n`);
}

main().catch((error) => {
  const code = (error as { code?: string })?.code;
  const tool = process.argv[2] === 'build' || process.argv[2] === 'unpack';
  if (tool) {
    console.error(code ? `${code}: ${error instanceof Error ? error.message : String(error)}` : (error instanceof Error ? error.message : String(error)));
  } else {
    console.error(code ? `${code}: ${error instanceof Error ? error.message : String(error)}` : error);
  }
  process.exitCode = 1;
});
