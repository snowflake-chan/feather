/**
 * 实体动作相关
 *
 * ```js
 * const entity = world.createEntity();
 * const entityMotionControl = entity.motion; // MotionController
 * const motion = entityMotionControl.loadByName('FirstMotion'); // MotionHandler
 * motion.onFinish(() => {
 *  console.log('Motion End');
 * });
 * motion.play()
 *  .then(() => { console.log('Motion End with Promise')})
 *  .catch((err) => {
 *    console.log('Motion play error')
 *  })
 * ```
 * @module 动作
 */

import type { GameEntity } from './entity';
import { GameEventHandlerToken } from './events';

/**
 * 动作控制器
 */
export declare class GameMotionController {
  /**
   * @internal
   */
  private constructor();

  /**
   * 设置默认动作
   * - 没有其他动作在播放的情况下，默认动作会在游戏运行时自动循环播放
   * - 调用此函数时，如当前处于默认动作执行状态，则将打断旧默认动作，播放新的默认动作
   * - 动作名不存在时，此方法不产生任何效果，并抛出包含实体、模型与动作信息的错误
   *
   * @param motionName 需要设置的动作名，传入 undefined 表示不会播放默认动作
   *
   * @example
   *  const entity = world.createEntity();
   *  entity.motion.setDefaultMotionByName('FirstMotion');
   *  entity.motion.setDefaultMotionByName(''); // 报错，不存在对应动作
   *  entity.motion.setDefaultMotionByName(); // 设置默认动作为空，即不播放默认动作
   */
  setDefaultMotionByName(motionName: string | undefined): void;

  /**
   * 加载特定动作或动作序列，并返回对应的动作对象
   * - 加载使用模型动作名称作为依据，当尝试加载的动作名称没有对应动作时，会抛出包含实体、模型与动作信息的错误
   *
   * @param configs 特定动作配置
   * @returns 用于处理动作播放、中断等后续行为
   */
  loadByName(
    configs: 'string' | MotionConfig[] | MotionClipConfig,
  ): GameMotionHandler;

  /**
   * 暂停实体上的动作播放
   */
  pause(): void;
  /**
   * 恢复实体上的动作播放
   */
  resume(): void;
}

/**
 * 动作序列配置
 */
export interface MotionClipConfig {
  motions: (string | MotionConfig)[];
  /**
   * 循环次数
   * - 输入Infinity就是无限循环，此时会覆盖掉默认动作
   * - 能cancel或者播放新的动作覆盖
   * - 可选项，默认 1 次
   */
  iterations?: number;
}

/**
 * 动作配置
 */
export interface MotionConfig {
  /**
   * 动作名字
   */
  name: string;
  /**
   * 循环次数
   * - 输入Infinity就是无限循环，此时会覆盖掉默认动作
   * - 能cancel或者播放新的动作覆盖
   * - 可选项，默认 1 次
   */
  iterations?: number;
}

/**
 * 动作播放的 Handler，用于处理动作中断等行为
 */
export declare class GameMotionHandler {
  readonly entity: GameEntity;

  /**
   * @internal
   */
  constructor();

  /**
   * 播放当前实体动作
   * - 会打断当前动作，开始对应动作/序列动作的播放
   * - 当配置中包含的动作播放结束时，触发 MotionPlayHandler 的 Finish 事件。
   * - 播放过程中出现错误时，抛出包含实体、模型与动作信息的错误
   * @return 返回结束状态的 Promise
   * @example
   *  const entity = world.createEntity();
   *  const motion = entity.motion.loadByName('FirstMotion');
   *  try {
   *    await motion.play();
   *  } catch (e) {
   *    // 处理错误
   *  }
   *
   */
  play(): Promise<void>;
  /**
   * 响应结束状态的监听函数
   * @group Event
   */
  onFinish(handler: (event: GameMotionEvent) => void): GameEventHandlerToken;
  /**
   * 中断此动作播放，并触发 end 事件。
   */
  cancel(): void;
}

/**
 * @event
 */
export interface GameMotionEvent {
  cancelled: boolean;
}
