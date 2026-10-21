import { indexEqRange, getById, zipId } from '@box/utils/id';
import { GameClientState } from '../game-client-schema';
import {
  BASE_2D_OFFSET_Y,
  drawText3D,
  ENTITY_INFO_2D_OFFSET_Y,
  ENTITY_NAME_2D_OFFSET_Y,
  updateVisibilityAndScale,
} from './overlays';
import { vec3 } from 'gl-matrix';
import { raycastEye } from '../utils/raycast-eye';
import { OverlayInfoVisibleScaleEnum } from '@box/schema/render-box/schema';

export function tickEntityName(state: GameClientState) {
  const nearbyEntityName = state.nearbyEntityName;
  nearbyEntityName.length = 0;

  const id = state.secret.id;
  const box = getById(state.renderBoxes, id);
  if (!box) {
    return;
  }

  zipId(
    (entityName, targetBox) => {
      if (targetBox.id !== id) {
        const d = Math.sqrt(
          Math.pow(targetBox.px - box.px, 2) +
            Math.pow(targetBox.py - box.py, 2) +
            Math.pow(targetBox.pz - box.pz, 2),
        );
        if (d < entityName.radius) {
          nearbyEntityName.push(targetBox.id);
        }
      }
    },
    state.replica.entityName,
    state.renderBoxes,
  );
}
const TMP = vec3.create();

export function drawEntityName(
  gameState: GameClientState,
  windowHeightScale: number,
) {
  const context2D = gameState.overlays.context;
  if (!context2D) {
    return;
  }
  const entityName = gameState.replica.entityName;
  const models = gameState.replica.models;
  const boxes = gameState.renderBoxes;
  let entityNamePtr = 0;
  let modelPtr = 0;
  let boxPtr = 0;

  const nearby = gameState.nearbyEntityName;
  for (let i = 0; i < nearby.length; ++i) {
    const id = nearby[i];
    const bIdx = indexEqRange(boxes, id, boxPtr, boxes.length - 1);
    const eIdx = indexEqRange(
      entityName,
      id,
      entityNamePtr,
      entityName.length - 1,
    );
    if (bIdx < 0 || eIdx < 0) {
      continue;
    }

    let name = '';
    if (entityName[eIdx].name) {
      name = entityName[eIdx].name;
    } else {
      const mIdx = indexEqRange(models, id, modelPtr, models.length - 1);
      if (mIdx >= 0) {
        modelPtr = mIdx;
        name = models[mIdx].name;
      }
    }

    boxPtr = bIdx;
    entityNamePtr = eIdx;

    const box = boxes[bIdx];

    TMP[0] = box.anchorX;
    TMP[1] = box.anchorY;
    TMP[2] = box.anchorZ;
    const result = raycastEye(gameState, TMP, true, Infinity);
    const scale = result
      ? result.isNear
        ? OverlayInfoVisibleScaleEnum.NearScale
        : OverlayInfoVisibleScaleEnum.FarScale
      : OverlayInfoVisibleScaleEnum.Invisible;
    if (!scale) {
      continue;
    }

    let offsetY = box.overlayOffsetY + (ENTITY_NAME_2D_OFFSET_Y * scale) / 2;
    if (box.overlayOffsetY > ENTITY_INFO_2D_OFFSET_Y) {
      offsetY += BASE_2D_OFFSET_Y * scale;
    }
    box.overlayOffsetY = (ENTITY_NAME_2D_OFFSET_Y * scale) / 2 + offsetY;
    offsetY *= windowHeightScale;

    TMP[0] = box.px;
    TMP[1] = box.py + box.ry;
    TMP[2] = box.pz;
    drawText3D(gameState, name, TMP, {
      color: entityName[eIdx].color,
      font: 'Bold 16px Montserrat-Bold',
      offsetY,
      windowHeightScale,
      cameraDistanceScale: box.overlayInfoVisibleScale,
    });
  }
}
