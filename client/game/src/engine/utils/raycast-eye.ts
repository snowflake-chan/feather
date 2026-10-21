import { vec3 } from 'gl-matrix';
import type { GameClientState } from '../game-client-schema';
import {
  raycast,
  VoxelRaycastHitResult,
} from '@box/schema/voxel/voxel-raycast';

export const CUTOFF_FAR = 60;
export const CUTOFF_NEAR = 30;
const _direction = vec3.create();
const _hitResult = new VoxelRaycastHitResult();

/**
 * 某位置与摄像机位置的射线检测
 * 如果超过最大视距(cutoffFar)或者被「非水形的地形」遮挡，返回undefined
 * 否则返回摄像机位置与某位置的距离，以及是否在小视距(cutoffNear)范围内
 * @param state
 * @param position 某位置
 * @param cutoffFar 默认60
 * @param cutoffNear 默认30
 * @param ignoreTransparent 是否忽略透明地形 默认不忽略
 * @returns
 */
export function raycastEye(
  state: GameClientState,
  position: vec3,
  ignoreTransparent: boolean = false,
  cutoffFar: number = CUTOFF_FAR,
  cutoffNear: number = CUTOFF_NEAR,
) {
  const eye = state.camera.eye;
  vec3.sub(_direction, position, eye);
  const r2 = vec3.sqrLen(_direction);

  // if too far away, skip it
  if (r2 <= 0.01 || cutoffFar * cutoffFar < r2) {
    return;
  }

  // check if it is visible
  const r = Math.sqrt(r2);
  vec3.scale(_direction, _direction, 1 / r);
  if (
    raycast(
      _hitResult,
      state.blockIndex,
      state.voxel,
      eye,
      _direction,
      r,
      true,
      ignoreTransparent,
    )
  ) {
    return;
  }
  return {
    isNear: r < cutoffNear,
    dist: r,
  };
}
