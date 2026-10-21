import { REGL, REGLLoader, safeProp } from 'src/engine/gl/regl';
import { MuStruct } from '@box/mudb/schema';
import { Mat4Schema } from '@box/schema/utils/math-schema';
import { zipId } from '@box/utils/id';
import { PlayerDisplayFlags } from '@box/schema/player/player-schema';
import { ClientStateType } from '../edit-schema';
import { mat4 } from 'gl-matrix';
import { GameClientState } from 'src/engine/game-client-schema';
import { updateTexture, restoreTexture } from 'src/engine/gl/texture';
import { EDITOR_RES } from '../../../resource/editor';
import { REGLTexture2DSchema } from 'src/engine/utils/regl-schema';
const HackingEffectSchema = new MuStruct({
  model: Mat4Schema,
  texture: REGLTexture2DSchema,
});
type HackingEffect = typeof HackingEffectSchema.identity;

export default function (regl: REGL, loader: REGLLoader) {
  const hackingEffects: HackingEffect[] = [];

  const hackingProp = safeProp<HackingEffect>(regl);

  const SYMBOLS = {
    COLOR_LUT: (state: GameClientState) => state.postProcess.lutEnabled,
    HDR: (state: GameClientState) => state.postProcess.enabled,
    SAFE: (state: GameClientState) => state.settings.safeShaders,
  };

  const drawHacking = loader.cache(
    'hacking-effect',
    {
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      frag: require('src/engine/gl/glsl/hacking-frag.glsl'),
      vert: require('src/engine/gl/glsl/hacking-vert.glsl'),
      uniforms: {
        model: hackingProp('model').prop,
        hackingSampler: hackingProp('texture').prop,
        offset: [0, 0.7, 0],
        iTime: (context) => context.tick / 10,
      },
      attributes: {
        meshPosition: [
          [1, -1, 1],
          [1, 1, 1],
          [-1, 1, 1],
          [-1, 1, 1],
          [1, -1, 1],
          [-1, -1, 1],
        ],
        uv: [
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      },
      cull: {
        enable: false,
      },
      primitive: 'triangles',
      count: 6,
    },
    true,
    SYMBOLS,
  );

  function restoreHacking(state: ClientStateType) {
    restoreTexture(state.hackingTexture);
  }

  function setupHacking(state: ClientStateType, gameState: GameClientState) {
    updateTexture(
      state.hackingTexture,
      gameState,
      512,
      [EDITOR_RES.hacking],
      'mipmap',
      'linear',
      'clamp',
      'rgba',
    );
    for (let i = 0; i < hackingEffects.length; ++i) {
      HackingEffectSchema.free(hackingEffects[i]);
    }
    hackingEffects.length = 0;
    zipId(
      (animation, player) => {
        if ((player.flags & PlayerDisplayFlags.HACKING) === 0) {
          return;
        }
        const effect = HackingEffectSchema.alloc();
        effect.texture = state.hackingTexture.texture;
        mat4.copy(effect.model, animation.configuration.head);
        hackingEffects.push(effect);
      },
      gameState.animations,
      gameState.replica.players,
    );
  }

  function hackingForward(state: ClientStateType) {
    if (hackingEffects.length === 0) {
      return;
    }
  }

  function hackingAlphaPre(state: ClientStateType) {
    if (hackingEffects.length === 0) {
      return;
    }
  }

  function hackingAlpha(gameState: GameClientState) {
    if (hackingEffects.length === 0) {
      return;
    }
    drawHacking(gameState)(hackingEffects);
  }

  return {
    setup: setupHacking,
    restore: restoreHacking,
    forward: hackingForward,
    alphaPre: hackingAlphaPre,
    alpha: hackingAlpha,
  };
}
