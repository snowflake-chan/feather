import { resolveDataRoot } from '../data-root';
import { daemonClient } from '../daemon-process';

export async function execCommand(id: string, command: string, dataDir?: string) {
  const client = daemonClient(resolveDataRoot(dataDir));
  const result = await client.exec(id, command);
  process.stdout.write(`${result.result}\n`);
}
