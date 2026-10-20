import path from 'node:path';

import { daemonClient } from '../daemon-process';
import { findWorkspaceRoot } from '../workspace-spec';

export async function stopCommand(id: string, rootArg?: string) {
  const root = rootArg ? path.resolve(rootArg) : findWorkspaceRoot();
  const client = daemonClient(root);
  const operation = await client.stopMap(id);
  process.stdout.write(`${operation.mapId}\t${operation.state}\n`);
}
