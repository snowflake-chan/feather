/**
 * 不属于任何模块的全局变量和函数。
 * @module Client
 */

export * from './modules/dom';
export * from './modules/events';
export * from './modules/http';
export * from './modules/input';
export * from './modules/math';
export * from './modules/media';
export * from './modules/navigator';
export * from './modules/pointer-lock';
export * from './modules/remote';
export * from './modules/screen';
export * from './modules/ui';
export * from './modules/world';

/**
 * 延迟指定毫秒后返回一个resolve的Promise对象。
 * @param ms - 延迟的毫秒数。
 * @returns 一个Promise，在指定的毫秒数后resolve。
 * @example
 *
 * // 返回Promise，有两种基本用法
 * // #1
 *
 * sleep(1000).then(() => {
 *   console.log('这句话将在一秒后输出。')
 * })
 *
 * // #2
 *
 * (async () => {
 *     await sleep(1000);
 *     console.log('这句话将在一秒后输出。')
 * })();
 */
export declare function sleep(ms: number): Promise<void>;

/**
 * 仅在 Webview 中 callback 生效
 */
export declare function call(
  key: string,
  value: any,
  callback?: () => void,
): any;
export declare function callAsync(key: string, value: any): Promise<any>;
