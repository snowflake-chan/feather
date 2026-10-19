import { GamePlayerEntity } from './api';
export declare class GameRTCChannel {
    add: (entity: GamePlayerEntity) => Promise<void>;
    remove: (entity: GamePlayerEntity) => Promise<void>;
    unpublish: (entity: GamePlayerEntity) => Promise<void>;
    publishMicrophone: (entity: GamePlayerEntity) => Promise<void>;
    getPlayers: () => Promise<GamePlayerEntity[]>;
    destroy: () => Promise<void>;
    getVolume: (entity: GamePlayerEntity) => Promise<number>;
    setVolume: (entity: GamePlayerEntity, volume: number) => Promise<void>;
    getMicrophonePermission: (entity: GamePlayerEntity) => Promise<boolean>;
    constructor(add: (entity: GamePlayerEntity) => Promise<void>, remove: (entity: GamePlayerEntity) => Promise<void>, unpublish: (entity: GamePlayerEntity) => Promise<void>, publishMicrophone: (entity: GamePlayerEntity) => Promise<void>, getPlayers: () => Promise<GamePlayerEntity[]>, destroy: () => Promise<void>, getVolume: (entity: GamePlayerEntity) => Promise<number>, setVolume: (entity: GamePlayerEntity, volume: number) => Promise<void>, getMicrophonePermission: (entity: GamePlayerEntity) => Promise<boolean>);
}
export declare class GameRTC {
    createChannel: (channelId?: string) => Promise<GameRTCChannel>;
    constructor(createChannel: (channelId?: string) => Promise<GameRTCChannel>);
}
//# sourceMappingURL=rtc.d.ts.map