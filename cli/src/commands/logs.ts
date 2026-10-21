import path from 'node:path';

import { daemonClient } from '../daemon-process';
import { resolveDataRoot } from '../data-root';

export async function logsCommand(id: string, options: { follow?: boolean; tail?: number; root?: string } = {}) {
  const root = resolveDataRoot(options.root);
  const client = daemonClient(root);
  const query = new URLSearchParams();
  if (options.follow) query.set('follow', '1');
  if (options.tail) query.set('tail', String(options.tail));
  await client.stream(
    `/v1/maps/${encodeURIComponent(id)}/logs${query.size ? `?${query}` : ''}`,
    (line) => {
      try {
        const entry = JSON.parse(line) as { time: string; stream: string; message: string };
        process.stdout.write(`${entry.time} [${entry.stream}] ${entry.message}\n`);
      } catch {
        process.stdout.write(`${line}\n`);
      }
    },
  );
}
