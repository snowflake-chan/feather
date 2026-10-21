import { zipId } from '@box/utils/id';
import { PlayerDisplayFlags } from '@box/schema/player/player-schema';
import type { GameClientState } from '../game-client-schema';
import { createRenderPlayerFn } from '../player/player-render';
import type { GPUMeshInstanceListDict } from '../mesh/gpu-controller/gpu-mesh-schema';
import { testChunkVisibility } from '../voxel/voxel-controller';
import { testFrustumBox } from '../utils/frustum';
import { Frustum } from '@box/schema/utils/frustum-schema';
import { drawName, drawPlayerOverlay } from '../overlay/player-overlay';

export function gpuPlayer() {
  const { renderPlayer } = createRenderPlayerFn('gpu');

  function renderPlayerForward(
    opaquePass: GPUMeshInstanceListDict,
    transparentPass: GPUMeshInstanceListDict,
    state: GameClientState,
  ) {
    zipId(
      (animation, player, box) => {
        if (player.id === state.camera.fpsID) {
          return;
        }
        const frustum = state.camera.frustum;
        const result = renderPlayer(
          state,
          frustum,
          animation,
          player,
          box,
          opaquePass,
          transparentPass,
        );

        result && drawPlayerOverlay(state, box, player);
      },
      state.animations,
      state.replica.players,
      state.renderBoxes,
    );

    // special case: for invisible players we need to render any HUD overlays
    zipId(
      (player, box) => {
        if (
          player.id === state.camera.fpsID ||
          !(player.flags & PlayerDisplayFlags.INVISIBLE) ||
          !(player.flags & PlayerDisplayFlags.SHOW_NAME)
        ) {
          return;
        }
        const lox = box.px - box.rx;
        const loy = box.py - box.ry;
        const loz = box.pz - box.rz;
        const hix = box.px + box.rx;
        const hiy = box.py + box.ry;
        const hiz = box.pz + box.rz;
        if (
          testChunkVisibility(state, lox, loy, loz, hix, hiy, hiz) &&
          testFrustumBox(state.camera.frustum, lox, loy, loz, hix, hiy, hiz)
        ) {
          drawName(state, box, player);
        }
      },
      state.replica.players,
      state.renderBoxes,
    );
  }

  function renderPlayerShadow(
    pass: GPUMeshInstanceListDict,
    state: GameClientState,
    shadowFrustum: Frustum,
  ) {
    zipId(
      (animation, player, box) => {
        renderPlayer(state, shadowFrustum, animation, player, box, pass);
      },
      state.animations,
      state.replica.players,
      state.renderBoxes,
    );
  }

  function renderPlayerOutline(
    pass: GPUMeshInstanceListDict,
    state: GameClientState,
  ) {
    const { hoveringPlayerId } = state.interact;
    const animation = state.animations.find((i) => i.id === hoveringPlayerId);
    const player = state.replica.players.find((i) => i.id === hoveringPlayerId);
    const box = state.renderBoxes.find((i) => i.id === hoveringPlayerId);

    if (!animation || !player || !box) {
      return;
    }
    const frustum = state.camera.frustum;
    renderPlayer(state, frustum, animation, player, box, pass);
  }

  return {
    forward: renderPlayerForward,
    shadow: renderPlayerShadow,
    outline: renderPlayerOutline,
  };
}
