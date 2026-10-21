import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { GameClientState } from '../game-client-schema';
import { TeleportProtocol } from '@box/schema/teleport/teleport-protocol';
import { messenger } from 'src/messenger';
import { clientConfig } from 'src/config/client';
import { resolvePublicUrl } from 'src/utils/public-url';

export class TeleportClient {
  public protocol: MuClientProtocol<typeof TeleportProtocol>;
  public state: GameClientState;

  constructor(spec: {
    client: MuClient;
    state: GameClientState;
    connectGame: (hash: string, serverId?: string) => void;
  }) {
    this.protocol = spec.client.protocol(TeleportProtocol);
    this.state = spec.state;

    this.protocol.configure({
      message: {
        teleport: ({ playHash, serverId }) => {
          if (playHash) {
            spec.connectGame(playHash, serverId);
          }
        },
        editTeleport: (editHash) => {
          if (!editHash) return;
          if (clientConfig.isLocalGameServer) {
            messenger.jumpTo({
              url: resolvePublicUrl(`/e/${encodeURIComponent(editHash)}`),
            });
            return;
          }
          messenger.emitEvent('hashChange', {
            hash: editHash,
            isNewTab: false,
          });
        },
      },
    });
  }
}
