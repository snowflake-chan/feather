import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { DaemonClient } from './client';

export function daemonSocketPath(workspaceRoot: string) {
  return path.join(workspaceRoot, '.feather', 'daemon.sock');
}

export function daemonClient(workspaceRoot: string) {
  return new DaemonClient({ socketPath: daemonSocketPath(workspaceRoot) });
}

export async function isDaemonUp(client: DaemonClient) {
  try {
    return (await client.ping()) === 'OK';
  } catch {
    return false;
  }
}

export async function ensureDaemon(workspaceRoot: string, foreground = false): Promise<DaemonClient> {
  const socketPath = daemonSocketPath(workspaceRoot);
  const client = new DaemonClient({ socketPath });
  if (await isDaemonUp(client)) return client;
  const dataDir = path.join(workspaceRoot, '.feather');
  fs.mkdirSync(path.join(dataDir, 'logs'), { recursive: true });
  const daemonMain = require.resolve('@feather/daemon/main');
  if (foreground) {
    const child = spawn(process.execPath, [daemonMain, '--workspace', workspaceRoot, '--socket', socketPath], {
      stdio: 'inherit',
    });
    await waitForDaemon(client, 15_000);
    child.unref();
    return client;
  }
  const logPath = path.join(dataDir, 'logs', 'daemon.log');
  const logFd = fs.openSync(logPath, 'a');
  try {
    const child = spawn(
      process.execPath,
      [daemonMain, '--workspace', workspaceRoot, '--socket', socketPath],
      {
        detached: true,
        stdio: ['ignore', logFd, logFd],
      },
    );
    child.unref();
  } finally {
    fs.closeSync(logFd);
  }
  await waitForDaemon(client, 15_000);
  return client;
}

async function waitForDaemon(client: DaemonClient, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isDaemonUp(client)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('daemon did not become ready');
}
