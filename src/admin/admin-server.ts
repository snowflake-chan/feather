import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { GameServer } from '../index';
import { AdminProtocol } from '@box/schema/admin/admin-gateway-protocol';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import {
  AdminCommandSchema,
  AdminUserSetSchema,
  AdminUserSchema,
  AdminEvent,
  AdminEventSchema,
} from '@box/schema/admin/admin-protocol';
import { Logger } from '@box/utils/logger';
import { getById } from '@box/utils/id';
import {
  PlayerFlags,
  PlayerDisplayFlags,
} from '@box/schema/player/player-schema';
import util from 'util';
import { BackendRPC } from '@box/schema/backend/rpc-interface';
import type { EditServerState } from '../edit/edit-server-schema';

export class GameAdminServer {
  public protocol: MuServerProtocol<typeof AdminProtocol>;
  public game: GameServer;
  public logger: Logger;
  public containerName: string;
  public contentId: number;
  public brpc: BackendRPC;
  private editState: EditServerState | undefined;

  private _isAdmin(sessionId: string) {
    const connection = this.game.state.connections[sessionId];
    if (!connection) {
      return false;
    }
    return connection.sessionData.isAdmin;
  }

  private _getConnection(id: number) {
    return getById(this.game.state.connectionSet, id);
  }

  private _sendEvent(sessionId: string, adminEvent: AdminEvent) {
    const client = this.protocol.clients[sessionId];
    if (client) {
      const stream = new MuWriteStream(1);
      AdminEventSchema.diff(AdminEventSchema.identity, adminEvent, stream);
      client.sendRaw(stream.bytes());
      stream.destroy();
    }
  }

  constructor(spec: {
    server: MuServer;
    game: GameServer;
    containerName: string;
    contentId: number;
    brpc: BackendRPC;
    editState?: EditServerState;
  }) {
    this.containerName = spec.containerName;
    this.contentId = spec.contentId;
    this.game = spec.game;
    this.brpc = spec.brpc;
    this.logger = this.game.state.logger.create('admin');
    this.editState = spec.editState;
    const protocol = (this.protocol = spec.server.protocol(AdminProtocol));
    protocol.configure({
      message: {
        closeWebsocket: (client) => {
          if (!this._isAdmin(client.sessionId)) {
            this.logger.log(
              'invalid admin access from client ' + client.sessionId,
            );
            return;
          }
          this.game.webSocket.close();
        },
        logCurrentStore: async (client) => {
          if (!this._isAdmin(client.sessionId)) {
            this.logger.log(
              'invalid admin access from client ' + client.sessionId,
            );
            return;
          }

          if (this.editState) {
            const hash = await this.editState.buildSystem.storeJSON(
              this.editState.replica.projectStore,
            );
            this.logger.log(
              `SHARE_STATE: store current project store, hash is ${hash}`,
            );
          }
        },
      },
      raw: (client, data) => {
        if (!this._isAdmin(client.sessionId) || typeof data === 'string') {
          this.logger.log(
            'invalid admin access from client ' + client.sessionId,
          );
          return;
        }
        const stream = new MuReadStream(data);
        const message = AdminCommandSchema.patch(
          AdminCommandSchema.identity,
          stream,
        );
        switch (message.type) {
          case 'ban':
            this.logger.log('ban ' + message.data);
            {
              const conn = this._getConnection(message.data as number);
              if (conn) {
                if (conn.sessionData.user.id) {
                  this.game.state.banned[conn.sessionData.user.id] = true;
                }
                this.game.net.kickSession(conn.sessionId);
              }
            }
            break;
          case 'banIp':
            this.logger.log('ban ip ' + message.data);
            {
              this.game.state.bannedIP[<string>message.data] = true;
            }
            break;
          case 'alert':
            this.logger.log('alert ' + JSON.stringify(message.data));
            {
              const payload = <{ userId: number; message: string }>message.data;
              const conn = this._getConnection(payload.userId);
              if (conn) {
                this.protocol.clients[conn.sessionId].message.alert(
                  payload.message,
                );
              }
            }
            break;
          case 'redirect':
            this.logger.log('redirect ' + JSON.stringify(message.data));
            {
              const payload = <{ userId: number; href: string }>message.data;
              const conn = this._getConnection(payload.userId);
              if (conn) {
                this.protocol.clients[conn.sessionId].message.redirect(
                  payload.href,
                );
              }
            }
            break;
          case 'kick':
            this.logger.log('kick ' + message.data);
            {
              const conn = this._getConnection(message.data as number);
              if (conn) {
                this.game.net.kickSession(conn.sessionId);
              }
            }
            break;
          case 'ghost':
            this.logger.log('enter ghost mode for ' + client.sessionId);
            const ghost = !!message.data;
            const connection = this.game.state.connections[client.sessionId];
            if (connection) {
              const id = connection.id;
              this.game.onTick.next(() => {
                const player = getById(this.game.state.players, id);
                if (player) {
                  player.flags &= ~PlayerFlags.SPECTATOR;
                  if (ghost) {
                    player.flags |= PlayerFlags.SPECTATOR;
                  }
                }
                const display = getById(this.game.state.replica.players, id);
                if (display) {
                  if (ghost) {
                    display.flags |= PlayerDisplayFlags.INVISIBLE;
                    display.flags &= ~PlayerDisplayFlags.SHOW_NAME;
                  } else {
                    display.flags &= ~PlayerDisplayFlags.INVISIBLE;
                    display.flags |= PlayerDisplayFlags.SHOW_NAME;
                  }
                }
                // const serverPlayer = getById(this.game.state.serverPlayers, id);
                // if (serverPlayer) {
                //     if (ghost) {
                //         serverPlayer.camera.type = 'FPS';
                //         serverPlayer.camera.data = { id };
                //     }
                // }
              });
            }
            break;
          case 'pollUsers':
            this.logger.log('poll user request from ' + client.sessionId);
            const users = AdminUserSetSchema.alloc();
            this.game.state.connectionSet.forEach((conn) => {
              const user = AdminUserSchema.alloc();
              user.entityId = conn.id;
              user.userId = conn.sessionData.user.id;
              user.name = conn.sessionData.name;
              user.ipAddress = conn.sessionData.ipAddress;
              users.push(user);
            });
            this._sendEvent(client.sessionId, {
              type: 'users',
              data: users,
            });
            AdminUserSetSchema.free(users);
            break;
          case 'scriptEval':
            this.logger.log('eval script request from ' + client.sessionId);
            this.logger.log('scriptExpr = ' + message.data);
            this.game.script
              .scriptEval('' + message.data)
              .then((result) => {
                this._sendEvent(client.sessionId, {
                  type: 'log',
                  data: result,
                });
              })
              .catch((e) => {
                this._sendEvent(client.sessionId, {
                  type: 'log',
                  data: 'ERROR: ' + e,
                });
                this.logger.error('script eval error');
                this.logger.error(e);
              });
            break;
          case 'serverEval':
            this.logger.log('eval server command from ' + client.sessionId);
            this.logger.log('expr = ' + message.data);
            try {
              const f = new Function(
                'game',
                'return (' + <string>message.data + ');',
              );
              const res = f.call(null, this.game);
              this._sendEvent(client.sessionId, {
                type: 'log',
                data: util.inspect(res),
              });
            } catch (e) {
              this._sendEvent(client.sessionId, {
                type: 'log',
                data: 'ERROR: ' + e,
              });
              this.logger.error('script eval error');
              this.logger.error(e);
            }
            break;
          case 'stopScripts':
            this.logger.log('stop script from ' + client.sessionId);
            this.game.script.stop().catch((err) => {
              this.logger.error('error stopping user scripts: ' + err.stack);
            });
            break;
          case 'reloadProject':
            this.logger.log('reload project from ' + client.sessionId);
            this.game
              .synchronizeProject(this.game.state.project, {
                skipVoxels: false,
                play: true,
              })
              .catch((e) => {
                this._sendEvent(client.sessionId, {
                  type: 'log',
                  data: 'ERROR: ' + e,
                });
                this.logger.error('reload project error');
                this.logger.error(e);
              });
            break;
          case 'exitProcess':
            this.logger.log('exit process called from ' + client.sessionId);
            process.exit(0);
            break;
          case 'restartContainer':
            this.logger.log('restart requested from ' + client.sessionId);
            process.exit(0);
            break;
          case 'updateHash':
            this.logger.warn('updateHash is not supported by the local engine');
            break;
        }
      },
    });
  }
}
