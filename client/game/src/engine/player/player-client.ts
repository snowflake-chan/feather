import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { PlayerProtocolSchema } from '@box/schema/player/player-protocol';
import { PlayerSkinHashSchema } from '@box/schema/player/player-schema';
import { GameClientState } from '../game-client-schema';
import { PlayerEventSchema } from '@box/schema/events/player-event-schema';
import { messenger } from 'src/messenger';

export class PlayerClient {
  public state: GameClientState;
  public protocol: MuClientProtocol<typeof PlayerProtocolSchema>;

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this.state = spec.state;
    this.protocol = spec.client.protocol(PlayerProtocolSchema);
    this.protocol.configure({
      message: {
        playerJoin: (ev) => {
          this.state.events.playerJoin.push(PlayerEventSchema.clone(ev));
        },
        playerLeave: (ev) => {
          this.state.events.playerLeave.push(PlayerEventSchema.clone(ev));
        },
        openUserProfileDialog: (ev) => {
          messenger.messageTool.emitEvent('openUserProfile', {
            userId: Number(ev.userId),
          });
        },
      },
    });
  }

  public updateAvatarSkin = () => {
    this.protocol.server.message.updateAvatarSkin();
  };

  public selectBuiltInAvatarSkin = (skinId: string) => {
    this.protocol.server.message.selectBuiltInAvatarSkin(skinId);
  };
}
