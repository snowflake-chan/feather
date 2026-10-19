/* -------------------------------------------------------------------------- */
/*                                实现 DOM 的类型定义                           */
/* -------------------------------------------------------------------------- */
import type { EventEmitter } from './events';

export declare const FormData: typeof globalThis.FormData;
export declare const Math: globalThis.Math;
export declare const Date: typeof globalThis.Date;

export type ClientConsole = Pick<
  Console,
  'log' | 'error' | 'assert' | 'info' | 'warn' | 'clear'
>;
export declare const console: ClientConsole;

/**
 * 用于延迟执行函数的计时器，delayMs毫秒后异步执行回调函数callback。
 * 该函数自身是同步的，返回用于清除此计时器的ID，可在 clearTimeout 中使用。
 * @param callback - 要延迟执行的回调函数。
 * @param delayMs - 延迟的毫秒数。
 * @returns 用于清除计时器的ID。
 */
export declare function setTimeout(callback: Function, delayMs: number): number;

/**
 * 用于清除传入ID对应的 setTimeout 计时器。
 * @param id - 要清除的计时器的ID。
 */
export declare function clearTimeout(id: number): void;

/**
 * 用于定时执行函数的计时器，每 delayMs 毫秒后异步执行回调函数 callback。
 * 该函数自身是同步的，返回用于清除此计时器的ID，可在 clearInterval 中使用。
 * @param callback - 要定时执行的回调函数。
 * @param delayMs - 间隔的毫秒数。
 * @returns 用于清除计时器的ID。
 */
export declare function setInterval(
  callback: Function,
  delayMs: number,
): number;

/**
 * 用于清除传入ID对应的 setInterval 计时器。
 * @param id - 要清除的计时器的ID。
 */
export declare function clearInterval(id: number): void;

export enum MediaErrorCode {
  MEDIA_ERR_ABORTED = 1,
  MEDIA_ERR_NETWORK = 2,
  MEDIA_ERR_DECODE = 3,
  MEDIA_ERR_SRC_NOT_SUPPORTED = 4,
}

/**
 * 客户端脚本音频用于构建error对象（不是浏览器自己的MediaError）
 * see: https://developer.mozilla.org/en-US/docs/Web/API/MediaError
 */
export class MediaError {
  constructor(public code: MediaErrorCode, public message: string) {}
}

export interface AudioEvent {
  target: Audio;
}

export type AudioEventMap = {
  ended: AudioEvent;
  loadeddata: AudioEvent;
  error: AudioEvent;
};

export declare class Audio extends EventEmitter<AudioEventMap> {
  src: string;
  volume: number;
  error: MediaError | null;
  load(): void;
  play(): Promise<void>;
  pause(): void;
}
