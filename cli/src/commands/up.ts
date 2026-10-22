import type { MapStatus } from '@feather/daemon/contract';
import { requireDaemon } from '../socket';

export async function upCommand(options: { ids: string[]; socket?: string }): Promise<MapStatus[]> {
  const client = await requireDaemon(options.socket);
  const maps = await client.listMaps();
  const ids = options.ids.length > 0 ? options.ids : maps.map((map) => map.id);
  const byId = new Map(maps.map((map) => [map.id, map]));
  for (const id of ids) {
    if (!byId.has(id)) {
      const error = new Error(`map not found: ${id}`) as Error & { code?: string };
      error.code = 'MAP_NOT_FOUND';
      throw error;
    }
  }
  for (const id of ids) {
    const current = byId.get(id)!;
    if (current.state === 'running' || current.state === 'starting') continue;
    await client.startMap(id);
  }
  return Promise.all(ids.map((id) => client.getMap(id)));
}

export function formatUp(maps: MapStatus[]): string {
  return maps
    .map((map) => `${map.id}\t${map.state}\t${map.url || '-'}\tshard=${map.shardId || '-'}`)
    .join('\n') + '\n';
}
