import { resolveDataRoot } from '../data-root';
import { daemonClient } from '../daemon-process';

export async function psCommand(dataDir?: string) {
  const client = daemonClient(resolveDataRoot(dataDir));
  const maps = await client.listMaps();
  if (maps.length === 0) {
    process.stdout.write('no maps\n');
    return;
  }
  process.stdout.write('ID\tSTATE\tPORT\tSHARD\tVOLUME\n');
  for (const map of maps) {
    process.stdout.write(
      `${map.id}\t${map.state}\t${map.port ?? '-'}\t${map.shardId || '-'}\t${map.volume || '-'}\n`,
    );
  }
}
