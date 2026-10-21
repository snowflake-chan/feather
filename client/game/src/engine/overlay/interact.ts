import { GameClientState } from '../game-client-schema';
import { indexEqRange } from '@box/utils/id';
import { InteractComponent } from '@box/schema/interact/interact-protocol';
import {
  BASE_2D_OFFSET_Y,
  drawText3D,
  ENTITY_INFO_2D_OFFSET_Y,
  INTERACT_2D_OFFSET_Y,
  INTERACT_ANIM_TIME,
} from './overlays';
import { vec3, vec4 } from 'gl-matrix';
import { InteractUIOverlaySchema, OverlaySchema } from './overlay-schema';
import { isMobile } from '../../utils/mobile';
import {
  OverlayInfoVisibleScaleEnum,
  RenderBox,
} from '@box/schema/render-box/schema';
import { raycastEye } from '../utils/raycast-eye';

const worldPos = vec4.create();
const clipPos = vec4.create();

function drawButton(
  state: GameClientState,
  position: vec3,
  selected: boolean,
  interacting: boolean,
) {
  const context2D = state.overlays.context;
  if (!context2D) {
    return;
  }
  worldPos[0] = position[0];
  worldPos[1] = position[1];
  worldPos[2] = position[2];
  worldPos[3] = 1;
  vec4.transformMat4(clipPos, worldPos, state.camera.viewProjection);
  if (
    -clipPos[3] < clipPos[0] &&
    clipPos[0] < clipPos[3] &&
    -clipPos[3] < clipPos[1] &&
    clipPos[1] < clipPos[3] &&
    -clipPos[3] < clipPos[2] &&
    clipPos[2] < clipPos[3]
  ) {
    const buttonOverlay = InteractUIOverlaySchema.alloc();
    // 按钮保持固定大小
    buttonOverlay.scale = 1;
    buttonOverlay.x =
      0.5 * context2D.canvas.width * (1 + clipPos[0] / clipPos[3]);
    buttonOverlay.y =
      0.5 * context2D.canvas.height * (1 - clipPos[1] / clipPos[3]);
    buttonOverlay.selected = selected;
    buttonOverlay.interacting = interacting;
    const entry = OverlaySchema.alloc();
    entry.type = 'interactUI';
    entry.data = buttonOverlay;
    state.overlays.overlays.push(entry);
  }
}

const TMP = vec3.create();

function drawInteractView(
  state: GameClientState,
  box: RenderBox,
  interact: InteractComponent,
  windowHeightScale: number,
  isSelected: boolean,
) {
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
  drawButton(
    state,
    TMP,
    isSelected,
    isSelected ? state.interact.interacting : false,
  );

  if (interact.hint) {
    // offsetY：绘制交互文案的位置
    let offsetY = box.overlayOffsetY + (INTERACT_2D_OFFSET_Y * scale) / 2;
    if (box.overlayOffsetY > ENTITY_INFO_2D_OFFSET_Y) {
      offsetY += BASE_2D_OFFSET_Y * scale;
    }
    // 预留给交互文案的空间
    box.overlayOffsetY = offsetY + (INTERACT_2D_OFFSET_Y * scale) / 2;

    TMP[0] = box.px;
    TMP[1] = box.py + box.ry;
    TMP[2] = box.pz;
    drawText3D(state, interact.hint, TMP, {
      color: interact.color,
      font: isSelected
        ? 'bold 14px Montserrat-Bold'
        : '14px Montserrat-Regular',
      cameraDistanceScale: box.overlayInfoVisibleScale,
      offsetY: offsetY * windowHeightScale,
      windowHeightScale,
    });
  }
}

export function drawInteract(state: GameClientState, scale: number) {
  const interactive = state.replica.interactive;
  const boxes = state.renderBoxes;
  const nearby = state.interact.nearbyInteractive;
  const current = state.interact.currentInteractive;
  let boxPtr = 0;
  let interactPtr = 0;
  for (let i = 0; i < nearby.length; ++i) {
    const id = nearby[i];
    const bIdx = indexEqRange(boxes, id, boxPtr, boxes.length - 1);
    const hIdx = indexEqRange(
      interactive,
      id,
      interactPtr,
      interactive.length - 1,
    );
    if (bIdx >= 0 && hIdx >= 0) {
      boxPtr = bIdx;
      interactPtr = hIdx;
      const interact = interactive[hIdx];
      const box = boxes[bIdx];
      drawInteractView(state, box, interact, scale, id === current);
    }
  }

  tickAnimation(state);
}

function tickAnimation(state: GameClientState) {
  // 没有可交互的按钮，停止动画
  if (!state.interact.nearbyInteractive.length) {
    state.overlays.interactAnimation.show = false;
    state.overlays.interactAnimation.id = 0;
    state.overlays.interactAnimation.phase = 0;
    state.overlays.interactAnimation.lastTime = 0;
    return;
  }

  state.overlays.interactAnimation.show = true;

  const animationId = state.overlays.interactAnimation.id;
  const current = state.interact.currentInteractive;
  // 如果当前选中的按钮变化，重置动画进度
  // 移动端所有可见按钮都会显示动效，点击时不重置其他按钮
  if (animationId !== current && !isMobile()) {
    state.overlays.interactAnimation.id = current;
    state.overlays.interactAnimation.phase = 0;
    state.overlays.interactAnimation.lastTime = Date.now();
    return;
  }

  const currentTime = Date.now();
  const delta = currentTime - state.overlays.interactAnimation.lastTime;
  const phase =
    (state.overlays.interactAnimation.phase + delta / INTERACT_ANIM_TIME) % 1;

  state.overlays.interactAnimation.phase = phase;
  state.overlays.interactAnimation.lastTime = currentTime;
}
