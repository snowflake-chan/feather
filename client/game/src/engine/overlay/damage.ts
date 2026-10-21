import {
  drawText3D,
  draw3DBloodStrip,
  drawStyleNumber,
  ENTITY_INFO_2D_OFFSET_Y,
  BLOOD_STRIP_2D_OFFSET_Y,
  BASE_2D_OFFSET_Y,
  updateVisibilityAndScale,
} from './overlays';
import { zipId } from '@box/utils/id';
import { GameClientState } from '../game-client-schema';
import { vec3 } from 'gl-matrix';
import { raycastEye } from '../utils/raycast-eye';
import { isShowPlayerName } from './player-overlay';

const TMP = vec3.create();

/**
 * 血量告急时的颜色
 */
const EMERGENCY_COLOR = '#FF0000';
/**
 * 血量健康时的颜色
 */
const HEALTHY_COLOR = '#00FFB1';
/**
 * 受伤时，用白色表示受伤前的血量
 */
const HURT_COLOR = '#FFFFFF';

export function drawHpOverlay(
  state: GameClientState,
  windowHeightScale: number,
) {
  zipId(
    (damage, box) => {
      const { showHealthBar, hp, maxHp } = damage;
      if (!showHealthBar || maxHp === hp) {
        return;
      }

      updateVisibilityAndScale(state, box);
      if (!box.overlayInfoVisibleScale) {
        return;
      }

      box.overlayOffsetY +=
        BLOOD_STRIP_2D_OFFSET_Y * box.overlayInfoVisibleScale;
      const percentage = hp / maxHp;
      const offsetY =
        (ENTITY_INFO_2D_OFFSET_Y +
          (BLOOD_STRIP_2D_OFFSET_Y * box.overlayInfoVisibleScale) / 2) *
        windowHeightScale;

      TMP[0] = box.px;
      TMP[1] = box.py + box.ry;
      TMP[2] = box.pz;
      draw3DBloodStrip(state, { percentage, barLen: 130, barWidth: 10 }, TMP, {
        zIndex: 2,
        color: percentage < 0.25 ? EMERGENCY_COLOR : HEALTHY_COLOR,
        offsetY,
        windowHeightScale,
        cameraDistanceScale: box.overlayInfoVisibleScale,
      });
      draw3DBloodStrip(
        state,
        { percentage: 1, barLen: 132, barWidth: 12 },
        TMP,
        {
          zIndex: 0,
          color: [0, 0, 0, 32 / 255],
          offsetY,
          windowHeightScale,
          cameraDistanceScale: box.overlayInfoVisibleScale,
        },
      );
    },
    state.replica.damage,
    state.renderBoxes,
  );
  zipId(
    (damage, box, player) => {
      const { showHealthBar, hp, maxHp } = damage;
      if (!showHealthBar || maxHp === hp || !isShowPlayerName(state, player)) {
        return;
      }

      updateVisibilityAndScale(state, box);
      if (!box.overlayInfoVisibleScale) {
        return;
      }

      box.playerChatBubbleOffsetY +=
        BASE_2D_OFFSET_Y * box.overlayInfoVisibleScale;
    },
    state.replica.damage,
    state.renderBoxes,
    state.replica.players,
  );
}

export function drawHurtFX(state: GameClientState, windowHeightScale: number) {
  const effects = state.effects.hurt;
  const effectIds: number[] = [];
  const effectAmounts: number[] = [];
  const effectVisible: boolean[] = [];
  for (let i = 0; i < effects.length; ++i) {
    const fx = effects[i];
    effectIds.push(fx.entityId);
    effectAmounts.push(fx.amount);

    vec3.copy(TMP, fx.position);

    if (raycastEye(state, TMP, true)) {
      effectVisible.push(true);
      drawStyleNumber(
        state,
        '' + fx.amount,
        vec3.fromValues(
          fx.position[0],
          fx.position[1] + 0.03 * fx.tick,
          fx.position[2],
        ),
        { windowHeightScale },
      );
    } else {
      effectVisible.push(false);
    }
  }
  zipId(
    (damage, box) => {
      if (!damage.showHealthBar) {
        return;
      }
      for (let i = 0; i < effectIds.length; i++) {
        if (effectIds[i] === box.id && effectVisible[i] === true) {
          const hp = damage.hp + effectAmounts[i];
          const maxHp = damage.maxHp;

          updateVisibilityAndScale(state, box);
          if (!box.overlayInfoVisibleScale) {
            return;
          }
          TMP[0] = box.px;
          TMP[1] = box.py + box.ry;
          TMP[2] = box.pz;
          draw3DBloodStrip(
            state,
            { percentage: hp / maxHp, barLen: 130, barWidth: 10 },
            TMP,
            {
              zIndex: 1,
              color: HURT_COLOR,
              offsetY:
                (ENTITY_INFO_2D_OFFSET_Y +
                  (BLOOD_STRIP_2D_OFFSET_Y * box.overlayInfoVisibleScale) / 2) *
                windowHeightScale,
              windowHeightScale,
              cameraDistanceScale: box.overlayInfoVisibleScale,
            },
          );
          effectIds.splice(i, 1);
          effectVisible.splice(i, 1);
          effectAmounts.splice(i, 1);
          break;
        }
      }
    },
    state.replica.damage,
    state.renderBoxes,
  );
}

export function drawDieFX(state: GameClientState) {
  const effects = state.effects.die;
  for (let i = 0; i < effects.length; ++i) {
    const fx = effects[i];
    drawText3D(
      state,
      'X _ X',
      vec3.fromValues(
        fx.position[0],
        fx.position[1] - 0.01 * fx.tick,
        fx.position[2],
      ),
      { color: '#f00' },
    );
  }
}

export function drawRespawnFX(state: GameClientState) {
  const effects = state.effects.respawn;
  for (let i = 0; i < effects.length; ++i) {
    const fx = effects[i];
    drawText3D(
      state,
      'o _ o',
      vec3.fromValues(
        fx.position[0],
        fx.position[1] - 0.01 * fx.tick,
        fx.position[2],
      ),
      { color: '#0f0' },
    );
  }
}
