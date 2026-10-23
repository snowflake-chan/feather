import os from 'node:os';
import path from 'node:path';

import { DaemonClient } from './client';
import { CliError } from './errors';

export function resolveSocketPath(explicit?: string): string {
  return path.resolve(
    explicit || process.env.FEATHER_SOCKET || path.join(os.homedir(), '.feather', 'daemon.sock'),
  );
}

export async function requireDaemon(socketPath?: string): Promise<DaemonClient> {
  const socket = resolveSocketPath(socketPath);
  const client = new DaemonClient({ socketPath: socket });
  try {
    await client.ping();
    return client;
  } catch {
    throw new CliError(
      'DAEMON_NOT_RUNNING',
      `daemon not running: ${socket}`,
      1,
      'start it with: featherd --data-root ~/.feather --socket <socket>',
    );
  }
}
