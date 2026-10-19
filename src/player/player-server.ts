import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { PlayerProtocolSchema } from '@box/schema/player/player-protocol';
import { PlayerEventSchema } from '@box/schema/events/player-event-schema';
import { setPlayerAvatarSkin } from './player-server-controller';
import { GameServerState } from '../game-server-schema';
import type { ModelServer } from '../mesh/server-model-controller';
import { createBuiltInSkin } from './built-in-skins';
import { PlayerSkinHashSchema } from '@box/schema/player/player-schema';

export class PlayerServer {
  public protocol: MuServerProtocol<typeof PlayerProtocolSchema>;
  private _state: GameServerState;
  private _modelServer: ModelServer;

  constructor(spec: {
    server: MuServer;
    state: GameServerState;
    modelServer: ModelServer;
  }) {
    this._state = spec.state;
    this._modelServer = spec.modelServer;

    this.protocol = spec.server.protocol(PlayerProtocolSchema);
    this.protocol.configure({
      message: {
        updateAvatarSkin: (client) => {
          const connection = this._state.connections[client.sessionId];
          if (!connection) {
            return;
          }
          setPlayerAvatarSkin(
            this._modelServer,
            this._state,
            connection.id,
            connection.sessionData.avatarSkin,
          );
        },
        selectBuiltInAvatarSkin: (client, skinId) => {
          const connection = this._state.connections[client.sessionId];
          const avatarSkin = createBuiltInSkin(skinId);
          if (!connection || !avatarSkin) {
            return;
          }
          PlayerSkinHashSchema.assign(connection.sessionData.avatarSkin, avatarSkin);
          PlayerSkinHashSchema.free(avatarSkin);
          setPlayerAvatarSkin(
            this._modelServer,
            this._state,
            connection.id,
            connection.sessionData.avatarSkin,
          );
        },
      },
    });
  }

  public playerJoin(ev: typeof PlayerEventSchema.identity) {
    this.protocol.broadcast.playerJoin(ev);
  }

  public playerLeave(ev: typeof PlayerEventSchema.identity) {
    this.protocol.broadcast.playerLeave(ev);
  }
}
