import { requireDaemon } from '../socket';

export async function rmCommand(id: string, options: { force?: boolean; socket?: string } = {}) {
  if (!id) throw new Error('missing map id');
  await (await requireDaemon(options.socket)).deleteMap(id, !!options.force);
}
