import { requireDaemon } from '../socket';

export async function evalCommand(id: string, code: string, socket?: string) {
  if (!id) throw new Error('missing map id');
  if (!code.trim()) throw new Error('missing code');
  const result = await (await requireDaemon(socket)).eval(id, code);
  return result.result;
}
