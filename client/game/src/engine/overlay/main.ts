import type { GameClientState } from '../game-client-schema';
import type { GameUIClient } from '../game-ui';
import type { GUIClient } from '../gui/gui-client';
import { drawHpOverlay, drawHurtFX } from './damage';
import type { MobileGamepad } from '../gamepad';
import type { GameDialog } from '../game-dialog';
import { drawInteract } from './interact';
import { loadStickerPackList } from './overlay-schema';
import {
  clearOverlay,
  drawBubble,
  ENTITY_INFO_2D_OFFSET_Y,
  getHeightScale,
  initDamageNumbers,
  initImages,
  renderOverlays,
} from './overlays';
import { drawFloatChat } from './float-chat';
import { drawEntityName } from './entity-name';

export function initOverlay(spec: {
  state: GameClientState;
  context2D: CanvasRenderingContext2D;
  gui: GUIClient;
  gameUI: GameUIClient;
  gamepad?: MobileGamepad;
  gameDialog: GameDialog;
}) {
  const { state, context2D, gui, gameUI, gamepad, gameDialog } = spec;

  state.overlays.context = context2D;

  /**
   * 可以不用救gui了
   */
  if (!process.env.RUSTY) {
    gui.setContext(context2D);
  }
  gameUI.setContext(context2D);

  loadStickerPackList(state);
  initDamageNumbers(state);
  initImages(state);

  const draw = (state: GameClientState) => {
    const scale = getHeightScale(context2D);
    clearOverlay(state);
    state.renderBoxes.map((b) => {
      b.overlayOffsetY = ENTITY_INFO_2D_OFFSET_Y;
      b.playerChatBubbleOffsetY = 0;
      b.overlayInfoVisibleScale = undefined;
    });
    // draw 2D overlays
    renderOverlays(state);
    if (!state.hideUI) {
      drawHpOverlay(state, scale);
      drawHurtFX(state, scale);
      drawInteract(state, scale);
      drawEntityName(state, scale);
      drawCrosshair(state);
    }
    drawBubble(state, scale);

    gui.draw();
    gameUI.render();

    gamepad?.render();

    gameDialog.render();
    drawFloatChat(state);
  };

  return { draw };
}

export function drawCrosshair(state: GameClientState) {
  const context2D = state.overlays.context;
  if (!context2D) {
    return;
  }
  if (state.ready) {
    const { width, height } = context2D.canvas;
    context2D.setTransform(1, 0, 0, 1, 0, 0);

    const length = 1;
    const separation = state.camera.crosshairSeparation;
    const scale = 0.01 * Math.min(width, height);

    const cx = width / 2;
    const cy = height / 2;
    const r0 = scale * separation;
    const r1 = scale * (separation + length);

    context2D.strokeStyle = '#fff';
    context2D.lineWidth = Math.max(1, window.devicePixelRatio);
    context2D.beginPath();
    context2D.moveTo(cx - r0, cy);
    context2D.lineTo(cx - r1, cy);
    context2D.moveTo(cx + r0, cy);
    context2D.lineTo(cx + r1, cy);
    context2D.moveTo(cx, cy - r0);
    context2D.lineTo(cx, cy - r1);
    context2D.moveTo(cx, cy + r0);
    context2D.lineTo(cx, cy + r1);
    context2D.stroke();
    context2D.closePath();
  }
}
