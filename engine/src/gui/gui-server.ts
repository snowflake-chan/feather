import { MuServerProtocol, MuServer, MuRemoteClient } from '@box/mudb/server';
import { GUIProtocol } from '@box/schema/gui/gui-protocol';
import { GameConnectionState, GameServerState } from '../game-server-schema';
import { GUIScriptProtocol } from './gui-script-protocol';
import { getById } from '@box/utils/id';
import { GUIReplyRouter } from './gui-reply-router';

export class GUIServer {
  public scriptProtocol: MuServerProtocol<typeof GUIScriptProtocol>;
  public netProtocol: MuServerProtocol<typeof GUIProtocol>;
  public state: GameServerState;
  private replies = new GUIReplyRouter();

  constructor(spec: {
    state: GameServerState;
    server: MuServer;
    scriptServer: MuServer;
  }) {
    this.state = spec.state;
    this.netProtocol = spec.server.protocol(GUIProtocol);
    this.netProtocol.configure({
      message: {
        return: (client, data) => {
          this.replies.reply(client, data.handle, true, data.value);
        },
        throw: (client, data) => {
          this.replies.reply(client, data.handle, false, data.message);
        },
        sendMessage: (client, data) => {
          const conn = this.state.connections[client.sessionId];
          if (conn?.id && conn.state === GameConnectionState.CONNECTED) {
            this.scriptProtocol.broadcast.sendMessage({
              ...data,
              id: conn.id,
            });
          }
        },
      },
    });
    this.scriptProtocol = spec.scriptServer.protocol(GUIScriptProtocol);
    this.scriptProtocol.configure({
      message: {
        init: (client, data) => {
          try {
            this.sendRequest(client, data, 'init');
          } catch (err) {
            client.message.throw({
              handle: data.handle,
              message: err.message,
            });
          }
        },
        append: (client, data) => {
          try {
            this.sendRequest(client, data, 'append');
          } catch (err) {
            client.message.throw({
              handle: data.handle,
              message: err.message,
            });
          }
        },
        show: (client, data) => {
          try {
            this.sendRequest(client, data, 'show');
          } catch (err) {
            client.message.throw({
              handle: data.handle,
              message: err.message,
            });
          }
        },
        remove: (client, data) => {
          try {
            this.sendRequest(client, data, 'remove');
          } catch (err) {
            client.message.throw({
              handle: data.handle,
              message: err.message,
            });
          }
        },
        getAttribute: (client, data) => {
          try {
            this.sendRequest(client, data, 'getAttribute');
          } catch (err) {
            client.message.throw({
              handle: data.handle,
              message: err.message,
            });
          }
        },
        setAttribute: (client, data) => {
          try {
            this.sendRequest(client, data, 'setAttribute');
          } catch (err) {
            client.message.throw({
              handle: data.handle,
              message: err.message,
            });
          }
        },
      },
    });
  }

  private getClient(id: number) {
    const conn = getById(this.state.connectionSet, id);
    if (!conn) {
      throw new Error(`cannot found player by entity uid ${id}`);
    }
    const client = this.netProtocol.clients[conn.sessionId];
    if (!client) {
      throw new Error(`cannot found client by entity uid ${id}`);
    }
    return client;
  }
  private sendRequest(script: MuRemoteClient<any>, data: { id: number; handle: number }, method: string) {
    const targetId = data.id;
    const player = this.getClient(targetId);
    const connection = this.state.connections[player.sessionId];
    const principal = connection?.sessionData?.user?.id;
    const wire = this.replies.reserve(player, script, data.handle, () =>
      this.netProtocol.clients[player.sessionId] === player &&
      this.scriptProtocol.clients[script.sessionId] === script &&
      this.state.connections[player.sessionId] === connection &&
      connection?.id === targetId && connection?.sessionData?.user?.id === principal);
    try { player.message[method]({ ...data, handle: wire }); }
    catch (error) { this.replies.cancel(wire); throw error; }
  }

  public async reset() {
    this.replies.reset();
    this.netProtocol.broadcast.reset();
  }
}
