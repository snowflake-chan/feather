import axios from 'axios';
import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { TeleportProtocol } from '@box/schema/teleport/teleport-protocol';
import type { TELEPORT_ERROR_STATUS } from '@box/schema/api/js/api';
import { getById } from '@box/utils/id';

import type { GameServerState } from '../game-server-schema';
import { TeleportScriptProtocol } from './teleport-script-protocol';

type AllocateResult = { playHash: string; serverId: string };

export class TeleportServer {
  public scriptProtocol: MuServerProtocol<typeof TeleportScriptProtocol>;
  public netProtocol: MuServerProtocol<typeof TeleportProtocol>;
  public state: GameServerState;

  constructor(spec: {
    server: MuServer;
    scriptServer: MuServer;
    state: GameServerState;
  }) {
    const { server, scriptServer, state } = spec;
    this.state = state;
    this.scriptProtocol = scriptServer.protocol(TeleportScriptProtocol);
    this.netProtocol = server.protocol(TeleportProtocol);

    this.scriptProtocol.configure({
      message: {
        teleport: async (client, { handle, mapId, playerIds, serverId }) => {
          if (!state.settings.teleportAccess) {
            client.message.teleportError({
              handle,
              error: this.formatError('ACCESS_DENIED'),
            });
            return;
          }

          const connections: GameServerState['connectionSet'] = [];
          const subjectIds: string[] = [];
          for (const playerId of playerIds) {
            const connection = getById(state.connectionSet, playerId);
            const playerInfo = getById(state.serverPlayers, playerId);
            const subjectId = connection?.sessionData.fingerPrint || '';
            if (!connection || !playerInfo || !playerInfo.userId || !subjectId) {
              client.message.teleportError({
                handle,
                error: this.formatError('PLAYER_OFFLINE'),
              });
              return;
            }
            connections.push(connection);
            subjectIds.push(subjectId);
          }

          try {
            const data = await this.allocate({
              sourceMapId:
                process.env.BOX_WORLD_PERMANENT_MAP_ID || state.settings.containerName,
              targetMapId: mapId,
              subjectIds,
              serverId,
              mode: state.settings.mode,
            });
            if (!data.playHash || !data.serverId) {
              throw new Error('传送服务返回的数据不完整');
            }

            for (const connection of connections) {
              const netClient = this.netProtocol.clients[connection.sessionId];
              if (!netClient) continue;
              if (state.settings.mode === 'edit') {
                netClient.message.editTeleport(data.playHash);
              } else {
                netClient.message.teleport(data);
              }
            }
            client.message.teleportDone({ handle, serverId: data.serverId });
            state.logger.log(
              `Teleport mapId: ${mapId}; serverId: ${data.serverId}`,
            );
          } catch (error) {
            const normalized = this.normalizeError(error);
            state.logger.log(
              `Teleport service failed: ${normalized.message}`,
            );
            client.message.teleportError({
              handle,
              error: this.formatError(normalized.key, normalized.message),
            });
          }
        },
      },
    });
  }

  private async allocate(body: {
    sourceMapId: string;
    targetMapId: string;
    subjectIds: string[];
    serverId: string;
    mode: string;
  }): Promise<AllocateResult> {
    const baseURL = process.env.BOX_TELEPORT_CONTROL_URL || '';
    const token = process.env.BOX_TELEPORT_INTERNAL_TOKEN || '';
    if (!baseURL || !token) {
      throw Object.assign(new Error('本地传送服务未配置'), {
        teleportKey: 'ACCESS_DENIED',
      });
    }
    const response = await axios.post<AllocateResult>(
      `${baseURL.replace(/\/$/, '')}/allocate`,
      body,
      {
        headers: { 'x-box-teleport-token': token },
        timeout: 120_000,
      },
    );
    return response.data;
  }

  private normalizeError(error: unknown): {
    key: TELEPORT_ERROR_STATUS;
    message?: string;
  } {
    const candidate = error as {
      teleportKey?: TELEPORT_ERROR_STATUS;
      message?: string;
      response?: { data?: { code?: string; message?: string } };
    };
    const code = candidate.response?.data?.code || '';
    const accessDenied = [
      'ACCESS_DENIED',
      'MAP_GROUP_MISMATCH',
      'ROOM_ACCESS_DENIED',
      'ROOM_TARGET_MISMATCH',
    ].includes(code);
    return {
      key: candidate.teleportKey || (accessDenied ? 'ACCESS_DENIED' : 'UNKNOWN'),
      message: candidate.response?.data?.message || candidate.message,
    };
  }

  private formatError(key: TELEPORT_ERROR_STATUS, msg?: string) {
    this.state.logger.log(`Teleport failed ${key}, msg: ${msg || ''}`);
    return { key, msg };
  }
}
