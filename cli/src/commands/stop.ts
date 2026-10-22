import type { Operation } from '@feather/daemon/contract';
import { requireDaemon } from '../socket';

export async function stopCommand(ids: string[], socket?: string): Promise<Operation[]> {
  if (ids.length === 0) throw new Error('missing map id');
  const client = await requireDaemon(socket);
  const operations: Operation[] = [];
  for (const id of ids) operations.push(await client.stopMap(id));
  return operations;
}

export function formatOperations(operations: Operation[]): string {
  return operations.map((operation) => `${operation.mapId}\t${operation.state}`).join('\n') + '\n';
}
