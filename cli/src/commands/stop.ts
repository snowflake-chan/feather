import { resolveDataRoot } from '../data-root';
import { daemonClient } from '../daemon-process';

export async function stopCommand(id: string, dataDir?: string) {
  const client = daemonClient(resolveDataRoot(dataDir));
  const operation = await client.stopMap(id);
  process.stdout.write(`${operation.mapId}\t${operation.state}\n`);
}
