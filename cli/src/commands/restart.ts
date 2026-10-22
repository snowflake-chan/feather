import type { Operation } from '@feather/daemon/contract';
import { requireDaemon } from '../socket';

export async function restartCommand(ids: string[], socket?: string): Promise<Operation[]> {
  if (ids.length === 0) throw new Error('missing map id');
  const client = await requireDaemon(socket);
  const operations: Operation[] = [];
  for (const id of ids) operations.push(await client.restartMap(id));
  return operations;
}
