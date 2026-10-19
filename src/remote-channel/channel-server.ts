import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { RemoteChannelProtocol } from '@box/schema/remote-channel/channel-protocol';
import { RemoteChannelEventSchema } from '@box/schema/events/remote-channel-event-schema';
import { getById } from '@box/utils/id';

import { RemoteChannelScriptProtocol } from './channel-script-protocol';
import { GameConnectionState, GameServerState } from '../game-server-schema';
import { Logger } from '@box/utils/logger';

export const SERVER_REWIND_TICKS = 4;
export const SERVER_BUFFER_TICKS = 16;

export class RemoteChannelServer {
  public scriptProtocol: MuServerProtocol<typeof RemoteChannelScriptProtocol>;
  public netProtocol: MuServerProtocol<typeof RemoteChannelProtocol>;
  public state: GameServerState;
  public _logger: Logger;

  constructor(spec: {
    server: MuServer;
    scriptServer: MuServer;
    state: GameServerState;
  }) {
    const { server, scriptServer, state } = spec;

    this.state = state;
    const logger = (this._logger = state.logger.create('remote channel'));
    this.scriptProtocol = scriptServer.protocol(RemoteChannelScriptProtocol);
    this.netProtocol = server.protocol(RemoteChannelProtocol);

    this.scriptProtocol.configure({
      message: {
        sendEventToClients: (client, data) => {
          const ids = data.entityIds;
          for (let i = 0; i < ids.length; i++) {
            const conn = getById(state.connectionSet, ids[i]);
            if (conn) {
              const netClient = this.netProtocol.clients[conn.sessionId];
              if (netClient) {
                netClient.message.sendClientEvent({
                  tick: state.clock.tick,
                  args: data.args,
                });
              }
            }
          }
        },
        broadcastEvent: (client, data) => {
          this.netProtocol.broadcast.sendClientEvent({
            tick: state.clock.tick,
            args: data,
          });
        },
      },
    });

    this.netProtocol.configure({
      message: {
        sendServerEvent: (client, nextEvent) => {
          const sessionId = client.sessionId;

          // check if client is connected
          const connection = this.state.connections[sessionId];
          if (!connection?.id || connection.state !== GameConnectionState.CONNECTED) {
            logger.error(`remote event from invalid client ${sessionId}`);
            return;
          }

          // synchronize input
          const netConnection = connection.net;
          if (!netConnection.statePaused) {
            const x = RemoteChannelEventSchema.alloc();
            RemoteChannelEventSchema.assign(x, {
              id: connection.id,
              ...nextEvent,
            });
            this.state.script.curTickEvent.events.remoteChannelEvents.push(x);
          }
        },
      },
    });
  }
}
