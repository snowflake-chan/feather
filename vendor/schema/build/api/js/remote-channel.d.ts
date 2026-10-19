import { GamePlayerEntity, GameEventChannel } from './api';
import { JSONValue } from '../common';
export type SendClientEventType = (entities: GamePlayerEntity | GamePlayerEntity[], clientEvent: JSONValue) => void;
export type ServerEvent = {
    tick: number;
    entity: GamePlayerEntity;
    args: JSONValue;
};
export declare class ServerRemoteChannel {
    sendClientEvent: SendClientEventType;
    broadcastClientEvent: (clientEvent: JSONValue) => void;
    onServerEvent: GameEventChannel<ServerEvent>;
    constructor(sendClientEvent: SendClientEventType, broadcastClientEvent: (clientEvent: JSONValue) => void, onServerEvent: GameEventChannel<ServerEvent>);
}
