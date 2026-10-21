import { vec3 } from 'gl-matrix';
import {
  PlayerDisplayFlags,
  type PlayerDisplay,
} from '@box/schema/player/player-schema';
import type { GameClientState } from '../game-client-schema';
import { CUTOFF_NEAR, raycastEye } from '../utils/raycast-eye';
import {
  BASE_2D_OFFSET_Y,
  ENTITY_INFO_2D_OFFSET_Y,
  INDICATOR_Y_OFFSET,
  PLAYER_NAME_2D_OFFSET_Y,
  drawPlayerIndicator,
  drawText3D,
  getHeightScale,
} from './overlays';
import {
  OverlayInfoVisibleScaleEnum,
  RenderBox,
} from '@box/schema/render-box/schema';

const TMP = vec3.create();

export function drawPlayerOverlay(
  state: GameClientState,
  box: RenderBox,
  player: PlayerDisplay,
) {
  const showIndictor =
    player.flags & PlayerDisplayFlags.SHOW_INDICATOR &&
    state.secret.userId === player.userId;

  // draw player name
  if (player.flags & PlayerDisplayFlags.SHOW_NAME && !showIndictor) {
    drawName(state, box, player);
  }

  // draw player indicator
  if (showIndictor) {
    drawIndicator(state, box);
  }
}

export function drawName(
  state: GameClientState,
  box: RenderBox,
  player: PlayerDisplay,
) {
  const context2D = state.overlays.context;
  if (!context2D) {
    return;
  }
  TMP[0] = box.anchorX;
  TMP[1] = box.anchorY;
  TMP[2] = box.anchorZ;
  const result = raycastEye(state, TMP, true, Infinity);
  const scale = result
    ? result.isNear
      ? OverlayInfoVisibleScaleEnum.NearScale
      : OverlayInfoVisibleScaleEnum.FarScale
    : OverlayInfoVisibleScaleEnum.Invisible;
  if (!scale) {
    return;
  }

  const windowHeightScale = getHeightScale(context2D);
  let offsetY = box.overlayOffsetY + (PLAYER_NAME_2D_OFFSET_Y * scale) / 2;
  if (box.overlayOffsetY > ENTITY_INFO_2D_OFFSET_Y) {
    offsetY += BASE_2D_OFFSET_Y * scale;
  }
  offsetY *= windowHeightScale;
  // draw name
  TMP[0] = box.px;
  TMP[1] = box.py + box.ry;
  TMP[2] = box.pz;
  drawText3D(state, player.name, TMP, {
    color: player.color,
    font: '20px Sans-Serif',
    cameraDistanceScale: scale,
    offsetY,
    windowHeightScale,
  });
}

// 修改size会随着距离线性变化
function drawIndicator(state: GameClientState, box: RenderBox) {
  TMP[0] = box.px;
  TMP[1] = box.py + box.ry + INDICATOR_Y_OFFSET;
  TMP[2] = box.pz;

  const result = raycastEye(state, TMP);

  if (!result) {
    return;
  }

  const size = (CUTOFF_NEAR / result.dist) * 1.2;

  drawPlayerIndicator(state, TMP, {
    size: size > 1.75 ? size : 1.75,
  });
}

export const isShowPlayerName = (
  state: GameClientState,
  player: PlayerDisplay,
) => {
  const showIndictor =
    player.flags & PlayerDisplayFlags.SHOW_INDICATOR &&
    state.secret.userId === player.userId;
  const showInvisiblePlayerName = player.flags & PlayerDisplayFlags.INVISIBLE;
  // draw player name
  if (
    player.id !== state.camera.fpsID &&
    player.flags & PlayerDisplayFlags.SHOW_NAME &&
    (showInvisiblePlayerName || !showIndictor)
  ) {
    return true;
  }
  return false;
};
