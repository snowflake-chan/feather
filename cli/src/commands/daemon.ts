import { spawn } from 'node:child_process';

import { resolveDataRoot } from '../data-root';
import { resolveSocketPath } from '../socket';

export async function daemonCommand(options: {
  dataRoot?: string;
  socket?: string;
  enableEval?: boolean;
} = {}) {
  const dataRoot = resolveDataRoot(options.dataRoot);
  const socket = resolveSocketPath(options.socket);
  const main = require.resolve('@feather/daemon/main');
  const args = [main, '--data-root', dataRoot, '--socket', socket];
  if (options.enableEval) args.push('--enable-eval');
  const child = spawn(process.execPath, args, { stdio: 'inherit' });
  await new Promise<void>((resolve, reject) => {
    child.once('exit', (code) => (code === 0 ? resolve() : reject(new Error(`daemon exited ${code}`))));
    child.once('error', reject);
  });
}
