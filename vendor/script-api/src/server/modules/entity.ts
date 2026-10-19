/**
 * @module 实体
 */
import type { GameMotionController } from './motion';
import type { GameVector3 } from './math';

/**
 * 代表游戏内的实体
 */
export declare class GameEntity {
  /**
   * @internal
   */
  protected constructor();

  /**
   * 控制 Entity 动作
   * @group Components
   */
  motion: GameMotionController;

  /**
   * @group Physics
   */
  position: GameVector3;
}
