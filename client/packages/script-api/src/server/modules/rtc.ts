/**
 * @module RTC
 * @internal
 */

import { GamePlayerEntity } from './player';

/**
 * 全局变量rtc
 */
export interface GameRTC {
  /**
   * 创建频道
   *
   * ```typescript
   * const ch = await rtc.createChannel();
   * world.onPlayerJoin(async ({entity}) => {
   *     await ch.add(entity);
   *     await ch.publishMicrophone(entity);
   * });
   * ```
   *
   * @param channelId 可选，频道的唯一标识，地图内跨服共用，不指定则生成UUID
   */
  createChannel(channelId?: string): Promise<GameRTCChannel>;
}

/**
 * RTC 频道，同频道内的用户可以通信
 * 本质上是用户往频道发布音轨，所有用户自动订阅，对于开发者来说这一层表现被封装了，
 * 以后可以考虑开放
 */
export interface GameRTCChannel {
  /**
   * 向频道内添加用户，一个用户允许同时进入多个频道
   * @param entity 玩家实体
   */
  add(entity: GamePlayerEntity): Promise<void>;
  /**
   * 从频道内移除用户
   * @param entity 玩家实体
   */
  remove(entity: GamePlayerEntity): Promise<void>;
  /**
   * 指定用户发布麦克风音轨到此频道中，用户可以同时在不同频道中发布麦克风音轨
   * @param entity 玩家实体
   */
  publishMicrophone(entity: GamePlayerEntity): Promise<void>;
  /**
   * 指定用户取消在此频道发布的音轨
   * @param entity 玩家实体
   */
  unpublish(entity: GamePlayerEntity): Promise<void>;
  /**
   * 获取当前频道内所有用户
   * @returns 当前频道内所有玩家实体数组
   */
  getPlayers(): Promise<GamePlayerEntity[]>;
  /**
   * 销毁频道
   */
  destroy(): Promise<void>;
  /**
   * 获取频道内接收到指定用户音轨时的播放音量
   * @param entity 玩家实体
   * @returns 返回用户音量设置
   */
  getVolume(entity: GamePlayerEntity): Promise<number>;
  /**
   * 设定此频道内接受到指定用户音轨时的播放音量
   * @param entity 玩家实体
   * @param volume 音量设置，按百分比设置，默认100
   */
  setVolume(entity: GamePlayerEntity, volume: number): Promise<void>;

  /**
   * 获取指定用户的麦克风权限状态
   * @returns 是否获取了麦克风状态
   */
  getMicrophonePermission(entity: GamePlayerEntity): Promise<boolean>;
}
