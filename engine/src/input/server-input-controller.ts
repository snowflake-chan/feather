import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { GameServerState } from '../game-server-schema';
import { getById } from '@box/utils/id';
import { InputProtocolSchema } from '@box/schema/input/input-protocol';

export class InputServer {
  public protocol: MuServerProtocol<typeof InputProtocolSchema>;
  public state: GameServerState;

  constructor(spec: { server: MuServer; state: GameServerState }) {
    this.protocol = spec.server.protocol(InputProtocolSchema);
    this.state = spec.state;

    this.protocol.configure({
      message: {},
    });
  }

  private getClient(playerId: number) {
    const conn = getById(this.state.connectionSet, playerId);
    if (conn) {
      return this.protocol.clients[conn.sessionId];
    }
    return undefined;
  }

  public setCameraPitch(playerId: number, value: number) {
    const client = this.getClient(playerId);
    if (client) {
      client.message.setCameraPitch(value);
    }
  }

  public setCameraYaw(playerId: number, value: number) {
    const client = this.getClient(playerId);
    if (client) {
      client.message.setCameraYaw(value);
    }
  }
}
