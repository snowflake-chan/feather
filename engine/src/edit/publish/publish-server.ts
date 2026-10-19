import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { PublishProtocol } from '@box/schema/publish/publish-schema';
import { EditServerState } from '../edit-server-schema';
import { EditReplicaServer } from '../replica/replica-server';
import { Logger } from '@box/utils/logger';

const THUMBNAILSIZE = 512;

export class PublishServer {
  private _protocol: MuServerProtocol<typeof PublishProtocol>;
  private _state: EditServerState;
  private _replica: EditReplicaServer;
  private _logger: Logger;

  constructor(spec: {
    server: MuServer;
    state: EditServerState;
    replica: EditReplicaServer;
    gameId: number;
  }) {
    const protocol = (this._protocol = spec.server.protocol(PublishProtocol));
    const state = (this._state = spec.state);
    const replica = (this._replica = spec.replica);
    this._logger = state.logger.create('publish');

    state.publish.gameId = spec.gameId;

    protocol.configure({
      message: {
        saveGame: (client, { token, saveAs }) => {
          this._logger.info(`save called by client ${client.sessionId}`);
          const connection =
            this._state.game.state.connections[client.sessionId];

          if (!connection) return;
          this.saveGame(saveAs, connection.sessionData.user.id)
            .then((result) => {
              if (result) {
                client.message.rpcResponse({
                  token,
                  result,
                  error: '',
                });
              } else {
                client.message.rpcResponse({
                  token,
                  result: '',
                  error: 'error saving game',
                });
              }
            })
            .catch((e) => {
              client.message.rpcResponse({
                token,
                result: '',
                error: '' + e,
              });
            });
        },
      },

      connect: (client) => {
        client.message.init({
          gameId: this._state.publish.gameId,
        });
      },
    });
  }

  public async saveGame(saveAs: string, userId: string) {
    return await this._replica.saveProject(parseInt(userId));
  }
}
