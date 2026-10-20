import fs from 'node:fs';
import path from 'node:path';

import { startApiServer } from './api/server';
import { createDaemon } from './daemon';

function arg(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const workspaceRoot = path.resolve(arg('--workspace') || process.cwd());
  const dataDir = path.join(workspaceRoot, '.feather');
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
  });
  const pidFile = path.join(dataDir, 'daemon.pid');
  fs.writeFileSync(pidFile, `${process.pid}\n`);
  // Restore autoStart maps before the API becomes ready, so `feather up`
  // doesn't race with daemon boot. CLI `up` is idempotent.
  for (const map of await daemon.listMaps()) {
    if (map.autoStart && map.state !== 'running') {
      try {
        await daemon.startMap(map.id);
      } catch (error) {
        process.stderr.write(
          `autoStart ${map.id} failed: ${error instanceof Error ? error.message : String(error)}\n`,
        );
      }
    }
  }
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
