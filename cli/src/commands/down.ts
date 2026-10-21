import fs from 'node:fs';
import path from 'node:path';

import { resolveDataRoot } from '../data-root';
import { daemonClient, daemonSocketPath } from '../daemon-process';

export async function downCommand(dataDir?: string) {
  const root = resolveDataRoot(dataDir);
  const client = daemonClient(root);
  try {
    const maps = await client.listMaps();
    for (const map of maps) {
      if (map.state === 'running' || map.state === 'starting') {
        await client.stopMap(map.id).catch(() => undefined);
      }
    }
    await client.shutdown().catch(() => undefined);
  } catch {
    // daemon may already be gone
  }
  const socket = daemonSocketPath(root);
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline && fs.existsSync(socket)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (fs.existsSync(socket)) {
    const pidFile = path.join(root, 'daemon.pid');
    if (fs.existsSync(pidFile)) {
      const pid = Number(fs.readFileSync(pidFile, 'utf8').trim());
      if (pid > 0) {
        try {
          process.kill(pid, 'SIGTERM');
        } catch {
          // already gone
        }
      }
    }
  }
  process.stdout.write(`daemon down: ${root}\n`);
}
