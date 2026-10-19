import { ExtraScriptAssets } from '@box/schema/project/hot-schema';
import { ReceivedScriptShareData } from '@box/schema/chat/chat-schema';

export function mapRemoteScriptToLocal(
  out: ExtraScriptAssets,
  remoteData: ReceivedScriptShareData,
) {
  remoteData.clientScripts.forEach((row, index) => {
    out[row.id] = {
      hash: row.hash || '',
      name: row.name,
      isClient: true,
      isShare: row.share,
      order: index + 1,
      lockedMapTitle: row.lockedMapTitle || '',
      lockedMapId: row.lockedMapId || 0,
      id: row.id,
    };
  });
  remoteData.serverScripts.forEach((row, index) => {
    out[row.id] = {
      hash: row.hash || '',
      name: row.name,
      isClient: false,
      isShare: row.share,
      order: index + 1,
      lockedMapTitle: row.lockedMapTitle || '',
      lockedMapId: row.lockedMapId || 0,
      id: row.id,
    };
  });
}
