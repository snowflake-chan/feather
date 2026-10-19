import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { MuSessionId, MuSocketServer } from '@box/mudb/socket/socket';
import { MuWriteStream } from '@box/mudb/stream';
import { Logger } from '@box/utils/logger';
import { getById } from '@box/utils/id';
import { RigidBodyFlags } from '@box/schema/physics/physics-schema';
import { ScriptNetInputSchema } from '@box/schema/events/net-events';
import { ScriptSentEventSchema } from '@box/schema/events/script-events';
import {
  NetProtocolSchema,
  NetState,
  NetMessageType,
  NetInputEventSchema,
  PUBLIC_BUFFER_DIVISOR,
  ClientScriptSrcSchema,
} from '@box/schema/net/net-schema';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import { NetPublicSchema, NetPublic } from '@box/schema/net/net-schema';
import { GameServerState } from '../game-server-schema';
import {
  SERVER_REPLICA_PACKET_SIZE,
  MAX_PUBLIC_BUFFER_SIZE,
  SERVER_UNRELIABLE,
  SERVER_BUFFER_TICKS,
  SERVER_REWIND_TICKS,
  MAX_BUFFERED_BYTES,
} from './net-server-state';
import { PhysicsZoneIndex } from '@box/schema/physics/zone-index';
import { CloseType } from '@box/schema/types/game';
import { HotProject } from '@box/schema/project/hot-schema';
import { ClientKeyboardEventSchema } from '@box/schema/events/client-keyboard-event-schema';
import { PendingPlayerJoins } from '../player/pending-player-joins';
import {
  computeNetPublic,
  computeClientScriptModules,
  synchronizeClientSecrets,
  synchronizeNetClientInput,
  overrideClientPositionCorrections,
} from './net-state-operations';

// Preserve the existing import path for callers outside the transport module.
export { synchronizeNetClientInput } from './net-state-operations';

const MIN_RESYNC_TICK_INTERVAL = 16; // 1 second

/** 连接和协议消息收发；状态计算与编码在 net-state-operations 中维护。 */
export class NetServer {
  public protocol: MuServerProtocol<typeof NetProtocolSchema>;
  private _state: GameServerState;
  private _logger: Logger;
  private _hotProject: HotProject;

  private _socketServer: MuSocketServer;

  private _clientLastResyncTick: { [sessionId: string]: number } = {};
  private _pendingPlayerJoins = new PendingPlayerJoins();

  public updateBufferedAmount() {
    // TERRIBLE HACK
    const clients = this._socketServer.clients;
    for (let i = 0; i < clients.length; ++i) {
      const socket = clients[i];
      const connection = this._state.connections[socket.sessionId];
      if (!connection) {
        continue;
      }
      connection.net.bufferedAmount = socket.reliableBufferedAmount();
      connection.net.unreliableBufferedAmount =
        socket.unreliableBufferedAmount();
    }
  }

  constructor(spec: {
    server: MuServer;
    state: GameServerState;
    connect: (id: MuSessionId) => Promise<boolean>;
    disconnect: (id: MuSessionId) => void;
    hotProject: HotProject;
  }) {
    this._socketServer = (<any>spec.server)._socketServer;
    this._state = spec.state;
    this._hotProject = spec.hotProject;
    this._state.net.zoneIndex = new PhysicsZoneIndex();
    const logger = (this._logger = this._state.logger.create('net'));

    this.protocol = spec.server.protocol(NetProtocolSchema);
    this.protocol.configure({
      message: {
        synchronize: (client) => {
          logger.info(`client ${client.sessionId} resetting state`);
          this._resetClient(client.sessionId);
        },
        acknowledge: (client, tick) => {
          if (tick % PUBLIC_BUFFER_DIVISOR !== 0) {
            this._logger.log(
              'invalid tick, is not divisible by buffer divisor',
            );
            return;
          }

          const sessionId = client.sessionId;
          const connection = this._state.connections[sessionId];
          if (!connection) {
            logger.warn(`ack packet from bad session id: ${client.sessionId}`);
            return;
          }

          // skip paused connection
          if (connection.net.statePaused) {
            logger.info(
              `ack packet from paused session id: ${client.sessionId}`,
            );
            return;
          }

          // 0 tick should reset client
          if (tick === 0) {
            connection.net.lastPublicAck = 0;
            return;
          }

          // skip if old tick
          if (tick < connection.net.maxAck) {
            return;
          }

          // check if tick is valid
          const sentNetPublic = this._state.net.sentNetPublic;
          for (let i = 0; i < sentNetPublic.length; ++i) {
            if (sentNetPublic[i].tick === tick) {
              connection.net.maxAck = tick;
              connection.net.lastPublicAck = tick;
              return;
            }
          }
        },
        unpause: (client, tick) => {
          const sessionId = client.sessionId;
          const connection = this._state.connections[sessionId];
          if (!connection) {
            logger.warn('ack packet from bad session id');
            return;
          }

          // clear ack buffers
          connection.net.statePaused = false;
          connection.net.lastPublicAck = 0;

          // check if tick is valid
          const sentNetPublic = this._state.net.sentNetPublic;
          for (let i = 0; i < sentNetPublic.length; ++i) {
            if (sentNetPublic[i].tick === tick) {
              connection.net.lastPublicAck = tick;
            }
          }
        },

        pause: (client) => {
          const sessionId = client.sessionId;
          const connection = this._state.connections[sessionId];
          if (!connection) {
            logger.warn('ack packet from bad session id');
            return;
          }

          // clear ack buffers
          connection.net.statePaused = true;
          connection.net.lastPublicAck = 0;
        },

        input: (client, nextInput) => {
          const sessionId = client.sessionId;

          // check if client is connected
          const connection = this._state.connections[sessionId];
          if (!connection) {
            logger.error(`input from invalid client ${sessionId}`);
            return;
          }

          // synchronize input
          const netConnection = connection.net;
          if (!netConnection.statePaused) {
            // synchronize input object
            if (
              !synchronizeNetClientInput(
                this._state,
                sessionId,
                nextInput,
                this._logger,
              )
            ) {
              netConnection.inputPauseCounter += 1;
            }

            // Buffer any new input events
            const eventTickLo = this._state.clock.tick - SERVER_REWIND_TICKS;
            const eventTickHi = this._state.clock.tick + SERVER_BUFFER_TICKS;
            for (let i = 0; i < nextInput.events.length; ++i) {
              const e = nextInput.events[i];
              if (eventTickLo < e.tick && e.tick <= eventTickHi) {
                const x = ScriptNetInputSchema.alloc();
                x.id = connection.id;
                NetInputEventSchema.assign(x, e);
                this._state.events.net.push(x);
              }
            }
          }
        },

        join: (client) => {
          const sessionId = client.sessionId;
          const connection = this._state.connections[sessionId];
          this._logger.log('join request from ' + sessionId);
          if (
            connection?.id ||
            this._state.events.join.indexOf(sessionId) >= 0
          ) {
            return;
          }
          if (this._pendingPlayerJoins.request(sessionId, Boolean(connection))) {
            this._state.events.join.push(sessionId);
          } else {
            this._logger.log(
              'waiting for session data before joining ' + sessionId,
            );
          }
        },
        sendKeyBoardEvent: (client, event) => {
          const conn = this._state.connections[client.sessionId];
          if (!conn) {
            return;
          }
          const x = ClientKeyboardEventSchema.alloc();
          ClientKeyboardEventSchema.assign(x, event);
          x.id = conn.id;
          this._state.events.keyboard.push(x);
        },
      },
      connect: (client) => {
        // `protocol.clients` already includes the client currently connecting,
        // so a strict `>` preserves exactly `playerLimit` slots.
        const playerCount = Object.keys(this.protocol.clients).length;
        if (playerCount > this._state.settings.playerLimit) {
          this._logger.warn(
            'server is full, rejecting connection from ' + client.sessionId,
          );
          client.message.exceedUserLimit(this._state.settings.playerLimit);
          // Reporting the error alone leaves the protocol client connected,
          // allowing it to appear in the world despite the configured limit.
          client.close();
          return;
        } else {
          client.message.exceedUserLimit(0);
        }

        // update connection status
        spec
          .connect(client.sessionId)
          .then((ok) => {
            if (!ok) {
              logger.info(`rejecting client ${client.sessionId}`);
              client.close();
            } else {
              if (
                this._pendingPlayerJoins.connectionReady(client.sessionId) &&
                !this._state.connections[client.sessionId]?.id &&
                this._state.events.join.indexOf(client.sessionId) < 0
              ) {
                this._logger.log(
                  'session data ready, resuming join ' + client.sessionId,
                );
                this._state.events.join.push(client.sessionId);
              }
              // 当客户端连接时传用户代码过去
              client.message.syncClientScriptModules(
                this.getClientScriptModules(),
              );
              this._resetClient(client.sessionId);
            }
          })
          .catch((e) => {
            logger.error(
              `error in client connection handler for ${client.sessionId}: ${e}`,
            );
            client.close();
          });
      },
      disconnect: (client) => {
        this._pendingPlayerJoins.disconnect(client.sessionId);
        logger.info(`client disconnected ${client.sessionId}`);
        spec.disconnect(client.sessionId);
      },
    });
  }

  private _sendPacketToClients(
    stream: MuWriteStream,
    base: NetPublic,
    target: NetPublic,
    clients: string[],
  ) {
    // first pass serialize stream
    stream.offset = 0;
    stream.writeVarint(
      (base.tick << NetMessageType.SHIFT) | NetMessageType.PUBLIC,
    );
    NetPublicSchema.diff(base, target, stream);

    // send raw message to all clients
    const head = stream.offset;
    for (let i = 0; i < clients.length; ++i) {
      const connection = this._state.connections[clients[i]];
      if (connection) {
        stream.offset = head;
        stream.writeVarint(connection.net.inputPauseCounter);
        this.protocol.clients[clients[i]].sendRaw(
          stream.bytes(),
          SERVER_UNRELIABLE,
        );
      }
    }
  }

  public synchronizePublic(netState: NetState) {
    // loop over all clients, group by last ack'd tick
    const clients = this.protocol.clients;
    const clientIds = Object.keys(clients);
    const clientBaseTicks: { [tick: number]: string[] } = {};

    for (let i = 0; i < clientIds.length; ++i) {
      const sessionId = clientIds[i];

      // if client is not yet connected, skip
      const connection = this._state.connections[sessionId];
      if (!connection) {
        continue;
      }

      // check if a position correction was applied to the player body.
      // if so then we need to override the client position correction list
      const body = getById(netState.bodies, connection.id);
      if (body && body.flags & RigidBodyFlags.LOCKED) {
        overrideClientPositionCorrections(this._state, connection.sessionId);
      }

      // skip paused clients or those whose unreliable buffer is full
      if (
        connection.net.statePaused ||
        connection.net.unreliableBufferedAmount > MAX_BUFFERED_BYTES
      ) {
        continue;
      }

      // update tick index
      const tick = connection.net.lastPublicAck;
      if (tick in clientBaseTicks) {
        clientBaseTicks[tick].push(sessionId);
      } else {
        clientBaseTicks[tick] = [sessionId];
      }

      // fix minTick calculation
      if (tick > 0) {
        const ping = (this._state.clock.tick - tick) * MS_PER_TICK;
        this._state.perf.minPing = Math.min(this._state.perf.minPing, ping);
        this._state.perf.maxPing = Math.max(this._state.perf.maxPing, ping);
        this._state.perf.avgPing += ping;
        this._state.perf.pingCount += 1;
      }
    }

    // compute netstate snapshot to broadcast to all clients
    const nextPublic = computeNetPublic(this._state, netState);
    const stream = new MuWriteStream(SERVER_REPLICA_PACKET_SIZE);

    // loop over all sent net public
    let ptr = 0;
    const sentPublic = this._state.net.sentNetPublic;
    for (let i = 0; i < sentPublic.length; ++i) {
      const prevPublic = sentPublic[i];
      if (prevPublic.tick in clientBaseTicks) {
        this._sendPacketToClients(
          stream,
          prevPublic,
          nextPublic,
          clientBaseTicks[prevPublic.tick],
        );
        delete clientBaseTicks[prevPublic.tick];
      }
      if (sentPublic.length - i >= MAX_PUBLIC_BUFFER_SIZE) {
        NetPublicSchema.free(prevPublic);
        continue;
      } else {
        sentPublic[ptr++] = prevPublic;
      }
    }
    sentPublic.length = ptr;

    if (nextPublic.tick % PUBLIC_BUFFER_DIVISOR === 0) {
      // special case: handle clients that need a resync
      const laggedClients: string[] = [];
      const dropKeys = Object.keys(clientBaseTicks);
      for (let j = 0; j < dropKeys.length; ++j) {
        const list = clientBaseTicks[dropKeys[j]];
        for (let k = 0; k < list.length; ++k) {
          laggedClients.push(list[k]);
        }
      }
      if (laggedClients.length > 0) {
        this._sendPacketToClients(
          stream,
          NetPublicSchema.identity,
          nextPublic,
          laggedClients.filter((client) => {
            if (
              nextPublic.tick - (this._clientLastResyncTick[client] || 0) <
              MIN_RESYNC_TICK_INTERVAL
            ) {
              return false;
            }
            this._clientLastResyncTick[client] = nextPublic.tick;
            return true;
          }),
        );
      }
    }

    // clean up
    if (nextPublic.tick % PUBLIC_BUFFER_DIVISOR === 0) {
      this._state.net.sentNetPublic.push(nextPublic);
    } else {
      NetPublicSchema.free(nextPublic);
    }
    stream.destroy();
  }

  private _resetClient(sessionId: string) {
    // check for valid connection
    const connection = this._state.connections[sessionId];
    if (!connection) {
      this._logger.info(
        `failed to reset client ${sessionId}. connection not initialized`,
      );
      return;
    }

    this._logger.log(`resetting client ${sessionId}`);

    // reset client's netConnection structures
    const netConnection = connection.net;
    netConnection.lastPublicAck = 0;
    netConnection.statePaused = true;
  }

  public synchronizeSecrets() {
    synchronizeClientSecrets(this._state, this.protocol.clients);
  }

  public kickSession(sessionId: string, reason: CloseType = CloseType.Server) {
    const client = this.protocol.clients[sessionId];
    if (client) {
      this._logger.log('kick ' + sessionId);
      client.message.kickSessionReason(reason);
      client.close();
    } else {
      this._logger.error('failed to kick invalid id ' + sessionId);
    }
  }

  public sendScriptEvents(events: typeof ScriptSentEventSchema.identity) {
    this.protocol.broadcast.scriptEvents(events, true);
  }

  // 发送客户端代码资源
  public sendClientScriptModules(
    modules: typeof ClientScriptSrcSchema.identity,
  ) {
    this.protocol.broadcast.syncClientScriptModules(modules);
  }

  public getClientScriptModules() {
    return computeClientScriptModules(this._state);
  }
}
