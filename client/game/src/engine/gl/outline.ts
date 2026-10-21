import _REGL from 'regl';

import { REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import getTriangle from './triangle';

export default function (regl: _REGL.Regl, loader: REGLLoader) {
  const triangle = loader.require(getTriangle);

  const stateProp = safeProp<GameClientState>(regl);

  const setupOutline = <(props: GameClientState, body: () => void) => void>(
    loader.cache(
      'outline:setup',
      {
        framebuffer: stateProp('outline')('outlineFbo').prop,

        colorMask: [false, false, false, false],

        uniforms: {
          view: stateProp('camera')('view').prop,
          projection: stateProp('camera')('projection').prop,
          viewProj: stateProp('camera')('viewProjection').prop,
        },
      },
      false,
    )
  );

  const drawOutline = loader.cache(
    'outline',
    {
      frag: require('./glsl/outline_frag.glsl'),
      vert: require('./glsl/trivial_vert.glsl'),
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: <'add'>'add',
      },
      uniforms: {
        depthStencil: stateProp('outline')('outlineDepth').prop,
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
      state.outline.supported = regl.hasExtension('WEBGL_depth_texture');
      if (state.outline.supported) {
        if (!state.outline.outlineFbo) {
          state.outline.outlineDepth = regl.texture({
            shape: [state.camera.viewport[0], state.camera.viewport[1], 2],
            format: 'depth stencil',
            type: <any>'depth stencil',
          });
          state.outline.outlineFbo = regl.framebuffer({
            depthStencil: state.outline.outlineDepth,
          });
        } else {
          state.outline.outlineFbo.resize(
            state.camera.viewport[0],
            state.camera.viewport[1],
          );
        }
      } else {
        if (state.outline.outlineFbo) {
          state.outline.outlineFbo.destroy();
          state.outline.outlineFbo = null;
        }
        if (state.outline.outlineDepth) {
          state.outline.outlineDepth.destroy();
          state.outline.outlineDepth = null;
        }
      }
    },
    setup: (state: GameClientState, body: () => void) => {
      if (!state.outline.supported) {
        return;
      }
      regl.clear({
        depth: 1,
        framebuffer: state.outline.outlineFbo,
      });
      setupOutline(state, body);
    },
    draw: (state: GameClientState) => {
      drawOutline(state);
    },
  };
}
