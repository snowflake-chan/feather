import { spawn } from 'node:child_process';

/**
 * Run a one-shot featherd tool (`featherd build`) as a child process.
 * The CLI does not parse workspaces or run the builder itself.
 */
export async function runFeatherdTool(args: string[]): Promise<number> {
  const main = require.resolve('@feather/daemon/main');
  const child = spawn(process.execPath, [main, ...args], { stdio: 'inherit' });
  return new Promise<number>((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
}
