import type { MapStatus } from '@feather/daemon/contract';
import { requireDaemon } from '../socket';

export async function psCommand(socket?: string): Promise<MapStatus[]> {
  return (await requireDaemon(socket)).listMaps();
}

export function formatPs(maps: MapStatus[]): string {
  if (maps.length === 0) return 'no maps\n';
  const lines = ['ID\tSTATE\tPORT\tSHARD\tVOLUME'];
  for (const map of maps) {
    lines.push(`${map.id}\t${map.state}\t${map.port ?? '-'}\t${map.shardId || '-'}\t${map.volume || map.id}`);
  }
  return `${lines.join('\n')}\n`;
}
