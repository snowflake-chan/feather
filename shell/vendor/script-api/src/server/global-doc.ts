/**
 * @module Server
 */

import type { GameHttp } from './modules/http';
import type { GameRTC } from './modules/rtc';
import type { GameStorage } from './modules/storage';
import type { GameWorld } from './modules/world';

export * from './modules/entity';
export * from './modules/events';
export * from './modules/http';
export * from './modules/math';
export * from './modules/motion';
export * from './modules/navigator';
export * from './modules/player';
export * from './modules/rtc';
export * from './modules/storage';
export * from './modules/world';

/**
 * 代表存储服务的全局对象
 * @group 全局变量
 */
export declare const storage: GameStorage;

/**
 * 代表游戏世界的全局对象
 * @group 全局变量
 */
export declare const world: GameWorld;

/**
 * 此模块支持访问任意 HTTP 与 HTTPS 地址，并拒绝脚本协议等危险 URL
 * @internal
 */
export declare const http: GameHttp;

/**
 * RTC模块，用于语音通信
 * @internal
 */
export declare const rtc: GameRTC;
