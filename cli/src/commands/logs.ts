import { requireDaemon } from '../socket';

export async function logsCommand(
  id: string,
  options: { follow?: boolean; tail?: number; socket?: string } = {},
) {
  if (!id) throw new Error('missing map id');
  const client = await requireDaemon(options.socket);
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
