import { MuClientProtocol, MuClient } from '@box/mudb/client';
import { PublishProtocol } from '@box/schema/publish/publish-schema';
import { ClientStateType } from '../edit-schema';

export class PublishClient {
  private _protocol: MuClientProtocol<typeof PublishProtocol>;
  private _state: ClientStateType;

  constructor(spec: { client: MuClient; state: ClientStateType }) {
    const protocol = (this._protocol = spec.client.protocol(PublishProtocol));
    const state = (this._state = spec.state);
    const publishState = state.publish;

    protocol.configure({
      message: {
        init: ({ gameId }) => {
          state.publish.gameId = gameId;
        },

        rpcResponse: ({ token, result, error }) => {
          const handler = publishState.pendingRPC[token];
          if (handler) {
            delete publishState.pendingRPC[token];
            if (error) {
              handler.reject && handler.reject(error);
            } else {
              handler.resolve && handler.resolve(result);
            }
          }
        },
      },
    });
  }

  private _registerCallback(
    resolve: (hash: string) => void,
    reject: (error: string) => void,
  ) {
    const token = this._state.publish.rpcCounter++;
    this._state.publish.pendingRPC[token] = { resolve, reject };
    return token;
  }

  public saveGame = (saveAs?: string) => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.saveGame({
        token: this._registerCallback(resolve, reject),
        saveAs: saveAs || '',
      });
    });
  };
}
