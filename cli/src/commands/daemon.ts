import { spawn } from 'node:child_process';
import path from 'node:path';

import { daemonClient, daemonSocketPath, isDaemonUp } from '../daemon-process';
import { findWorkspaceRoot } from '../workspace-spec';

export async function daemonCommand(rootArg?: string) {
  const root = rootArg ? path.resolve(rootArg) : findWorkspaceRoot();
  const client = daemonClient(root);
  if (await isDaemonUp(client)) {
    process.stdout.write(`daemon already running: ${daemonSocketPath(root)}\n`);
    return;
  }
  const main = require.resolve('@feather/daemon/main');
  const child = spawn(process.execPath, [main, '--workspace', root, '--socket', daemonSocketPath(root)], {
    stdio: 'inherit',
  });
  await new Promise<void>((resolve, reject) => {
    child.once('exit', (code) => (code === 0 ? resolve() : reject(new Error(`daemon exited ${code}`))));
    child.once('error', reject);
  });
}
