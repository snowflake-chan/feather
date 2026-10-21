import { GLMeshInstanceList } from '../mesh/gl-controller/gl-mesh-schema';
import { GameClientState } from '../game-client-schema';
import { zipId } from '@box/utils/id';
import { testFrustumBox } from '../utils/frustum';
import { GLShadowMap } from './schema/gl-shadow-schema';
import { PlayerDisplayFlags } from '@box/schema/player/player-schema';
import { testChunkVisibility } from '../voxel/voxel-controller';
import { createRenderPlayerFn } from '../player/player-render';
import { drawName, drawPlayerOverlay } from '../overlay/player-overlay';

export default function () {
  const { renderPlayer } = createRenderPlayerFn('gl');

  function renderPlayerForward(
    opaquePass: GLMeshInstanceList,
    transparentPass: GLMeshInstanceList,
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

        if (result) {
          drawPlayerOverlay(state, box, player);
        }
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
    pass: GLMeshInstanceList,
    state: GameClientState,
    shadow: GLShadowMap,
  ) {
    zipId(
      (animation, player, box) => {
        const frustum = shadow.frustum;
        renderPlayer(state, frustum, animation, player, box, pass);
      },
      state.animations,
      state.replica.players,
      state.renderBoxes,
    );
  }

  function renderPlayerOutline(
    pass: GLMeshInstanceList,
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
