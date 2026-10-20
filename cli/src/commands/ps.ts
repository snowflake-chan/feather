import { daemonClient } from '../daemon-process';
import { findWorkspaceRoot } from '../workspace-spec';

export async function psCommand(rootArg?: string) {
  const root = rootArg ? require('node:path').resolve(rootArg) : findWorkspaceRoot();
  const client = daemonClient(root);
  const maps = await client.listMaps();
  if (maps.length === 0) {
    process.stdout.write('no maps\n');
    return;
  }
  process.stdout.write('ID\tSTATE\tPORT\tSHARD\n');
  for (const map of maps) {
    process.stdout.write(`${map.id}\t${map.state}\t${map.port ?? '-'}\t${map.shardId || '-'}\n`);
  }
}
