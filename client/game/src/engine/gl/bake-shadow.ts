import _REGL from 'regl';

import { REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import getTriangle from './triangle';
import {
  GLBakeShadowMap,
  GLBakeShadowMapSchema,
  ShadowState,
} from './schema/gl-shadow-schema';
import { BAKE_SIZE, computeBakedShadowViewAndCascade } from '../utils/shadow';

export default function (regl: _REGL.Regl, loader: REGLLoader) {
  const triangle = loader.require(getTriangle);

  const shadowProp = safeProp<GLBakeShadowMap>(regl);

  const setupBakeShadow = <
    (
      props: GLBakeShadowMap[],
      body: (bakeShadowMap: GLBakeShadowMap) => void,
    ) => void
  >loader.cache(
    'bakeShadow:setup',
    {
      framebuffer: shadowProp('fbo').prop,

      colorMask: [false, false, false, false],

      viewport: shadowProp('shadowViewport').prop,

      scissor: {
        enable: true,
        box: shadowProp('shadowViewport').prop,
      },

      context: {
        frustum: shadowProp('frustum').prop,
      },

      uniforms: {
        view: shadowProp('shadowViewMatrix').prop,
        projection: shadowProp('shadowProjMatrix').prop,
        viewProj: shadowProp('shadowViewProjMatrix').prop,
      },
    },
    false,
  );

  const stateProp = safeProp<GameClientState>(regl);

  const drawBakedShadow = loader.cache(
    'bakedShadow',
    {
      frag: require('./glsl/bake_shadow_frag.glsl'),
      vert: require('./glsl/trivial_vert.glsl'),
      uniforms: {
        depthStencil: stateProp('shadow')('bakeShadowMapTexture').prop,
        shape: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
      },
      attributes: {
        p: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',
    },
    true,
  );

  return {
    update: (state: GameClientState) => {
      state.shadow.enable = regl.hasExtension('WEBGL_depth_texture');
      if (state.shadow.enable) {
        if (!state.shadow.bakeShadowMap) {
          state.shadow.bakeShadowMapTexture = regl.texture({
            radius: BAKE_SIZE,
            format: 'depth stencil',
            type: <any>'depth stencil',
            min: 'linear',
            mag: 'linear',
          });
          state.shadow.bakeShadowMap = regl.framebuffer({
            color: regl.renderbuffer({
              radius: BAKE_SIZE,
            }),
            depthStencil: state.shadow.bakeShadowMapTexture,
          });
        } else {
          state.shadow.bakeShadowMap.resize(BAKE_SIZE, BAKE_SIZE);
        }

        computeBakedShadowViewAndCascade<GLBakeShadowMap>(
          state.shadow,
          state.environment.sunDirection,
          state.voxel.shape,
          GLBakeShadowMapSchema,
        );
      } else {
        if (state.shadow.bakeShadowMap) {
          const color = (<any>state.shadow.bakeShadowMap).color[0];
          state.shadow.bakeShadowMap.destroy();
          state.shadow.bakeShadowMap = null;
          color.destroy();
        }
        if (state.shadow.bakeShadowMapTexture) {
          state.shadow.bakeShadowMapTexture.destroy();
          state.shadow.bakeShadowMapTexture = null;
        }
      }

      for (let i = 0; i < state.shadow.bakeCascade.length; ++i) {
        state.shadow.bakeCascade[i].fbo = state.shadow.bakeShadowMap;
      }
    },
    setup: (
      state: ShadowState,
      block: (bakeShadowMap: GLBakeShadowMap) => void,
    ) => {
      if (!state.enable) {
        return;
      }
      regl.clear({
        depth: 1,
        framebuffer: state.bakeShadowMap,
      });
      setupBakeShadow(state.bakeCascade, block);
    },
    draw: (state: GameClientState) => {
      if (!state.dom.canvas) {
        return;
      }
      const cacheWidth = state.dom.canvas.width;
      const cacheHeight = state.dom.canvas.height;

      state.dom.canvas.width = BAKE_SIZE;
      state.dom.canvas.height = BAKE_SIZE;

      // 更新regl的viewPort数据
      regl.poll();

      drawBakedShadow(state);

      if (!state.dom.bakeCanvas) {
        state.dom.bakeCanvas = document.createElement('canvas');
        state.dom.bakeCanvas.width = BAKE_SIZE;
        state.dom.bakeCanvas.height = BAKE_SIZE;
      }

      const ctx = state.dom.bakeCanvas.getContext('2d');
      if (!ctx) {
        state.dom.canvas.width = cacheWidth;
        state.dom.canvas.height = cacheHeight;
        return;
      }
      ctx.drawImage(state.dom.canvas, 0, 0);

      state.dom.canvas.width = cacheWidth;
      state.dom.canvas.height = cacheHeight;
    },
  };
}
