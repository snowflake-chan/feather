import { GamePlayerEntity, GameEventChannel } from './api';
import { JSONValue } from '../common';

export type SendClientEventType = (
  entities: GamePlayerEntity | GamePlayerEntity[],
  clientEvent: JSONValue,
) => void;

export type ServerEvent = {
  tick: number;
  entity: GamePlayerEntity;
  args: JSONValue;
};

export class ServerRemoteChannel {
  constructor(
    public sendClientEvent: SendClientEventType,
    public broadcastClientEvent: (clientEvent: JSONValue) => void,
    public onServerEvent: GameEventChannel<ServerEvent>,
  ) {}
}
