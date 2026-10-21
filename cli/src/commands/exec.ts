import path from 'node:path';

import { daemonClient } from '../daemon-process';
import { findWorkspaceRoot } from '../workspace-spec';

export async function execCommand(id: string, command: string, rootArg?: string) {
  const root = rootArg ? path.resolve(rootArg) : findWorkspaceRoot();
  const client = daemonClient(root);
  const result = await client.exec(id, command);
  process.stdout.write(`${result.result}\n`);
}
