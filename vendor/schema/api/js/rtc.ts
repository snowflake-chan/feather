import { GamePlayerEntity } from './api';

export class GameRTCChannel {
  constructor(
    public add: (entity: GamePlayerEntity) => Promise<void>,
    public remove: (entity: GamePlayerEntity) => Promise<void>,
    public unpublish: (entity: GamePlayerEntity) => Promise<void>,
    public publishMicrophone: (entity: GamePlayerEntity) => Promise<void>,
    public getPlayers: () => Promise<GamePlayerEntity[]>,
    public destroy: () => Promise<void>,
    public getVolume: (entity: GamePlayerEntity) => Promise<number>,
    public setVolume: (
      entity: GamePlayerEntity,
      volume: number,
    ) => Promise<void>,
    public getMicrophonePermission: (
      entity: GamePlayerEntity,
    ) => Promise<boolean>,
  ) {}
}

export class GameRTC {
  constructor(
    public createChannel: (channelId?: string) => Promise<GameRTCChannel>,
  ) {}
}
