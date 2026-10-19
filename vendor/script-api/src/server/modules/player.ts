/**
 * @module Players
 */

import { GameEntity } from './entity';
import { GameEventHandlerToken } from './events';
import { GameVector3 } from './math';
import { PlayerNavigator } from './navigator';
import type { GameInputEvent } from './world';

/**
 * 实体的一种，比 GameEntity 多了一个控制玩家的组件
 */
export declare class GamePlayerEntity extends GameEntity {
  protected constructor();
  /**
   
   * @group Components
   */
  readonly player: GamePlayer;
}

/**
 * 玩家组件，实体中负责控制玩家行为的组件，仅在玩家实体中存在
 * 针对玩家的所有行为都会挂在这里
 */
export declare class GamePlayer {
  /**
   * @internal
   */
  private constructor();

  /**
   * 将玩家传送到另一个游戏
   *
   * ```typescript
   * const door = world.querySelector('#door');
   * door.enableInteract = true;
   * door.interactHint = `Go to XXX`;
   * door.interactRadius = 3;
   * door.onInteract(async ({entity}) => {
   *    entity.player.transportToGame('CONTENT_ID')
   *});
   * ```
   *
   * @param contentID 目的地游戏的 Content ID
   */
  transportToGame(contentID: string): void;

  browser: PlayerNavigator;
  /**
   
   * Camera behavior mode.
   *  + `"FPS"` - First person camera
   *  + `"FOLLOW"` - Third person follow camera (default)
   *  + `"FIXED"` - Third person fixed camera
   *  + `"RELATIVE"` - Third person camera relative to player position
   * @group Camera
   */
  cameraMode: GameCameraMode;

  /**
   
   * In FPS or FOLLOW mode, the entity which the player's camera follows
   * @group Camera
   */
  cameraEntity: GameEntity | null;

  /**
   
   * Target point for the camera in FIXED mode
   * @group Camera
   */
  cameraTarget: GameVector3;
  /**
   
   * Up vector for camera in FIXED mode
   * @group Camera
   */
  cameraUp: GameVector3;
  /**
   
   * Eye position of camera in FIXED mode
   * @group Camera
   */
  cameraPosition: GameVector3;

  /**
   * [-PI/2, PI/2]
   * @group Camera
   */
  readonly cameraPitch: number;
  /**
   * [0, 2PI)
   * @group Camera
   */
  readonly cameraYaw: number;
  /**
   * 由于使用Uint8存值（性能考量），精度为 PI / 255
   * @param pitch [-PI/2, PI/2] 超出范围以 PI 为周期取值
   * @group Camera
   */
  setCameraPitch(pitch: number): void;
  /**
   * 由于使用Uint8存值（性能考量），精度为 2PI / 256（可能会出现差1度但存进去变成同一个值的情况）
   * @param yaw [0, 2PI) 超出范围以 2PI 为周期取值
   * @group Camera
   */
  setCameraYaw(yaw: number): void;

  /**
   * Called whenever player presses a button
   * @group Input
   */
  public onPress(
    handler: (event: GameInputEvent) => void,
  ): GameEventHandlerToken;

  /**
   
   * Called whenever a player releases a buttin
   * @group Input
   */
  public onRelease(
    handler: (event: GameInputEvent) => void,
  ): GameEventHandlerToken;
}

export declare enum GameCameraMode {
  FOLLOW = 'follow',
  FPS = 'fps',
  FIXED = 'fixed',
  RELATIVE = 'relative',
}
