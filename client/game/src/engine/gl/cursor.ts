import { GameClientState } from '../game-client-schema';
import REGL from 'regl';
import { REGLLoader, safeProp } from './regl';

export function glCursor(regl: REGL.Regl, loader: REGLLoader) {
  const stateProp = safeProp<GameClientState>(regl);

  function brightness(context: any, state: GameClientState) {
    return (
      0.1 *
      (Math.cos(0.08 * context.tick) + 1.5) *
      (state.postProcess.enabled ? 1 / state.camera.currentExposure : 1)
    );
  }

  const cursor3D = loader.cache(
    'cursor3d',
    {
      frag: `
            precision highp float;
            varying float border;
            uniform float brightness;
            uniform vec2 buttonPressed;
            void main () {
                gl_FragColor = vec4(vec3(brightness * vec3(1. - buttonPressed.y, 1. - buttonPressed.x, 1.)), 0);
            }`,

      vert: `
            precision highp float;
            attribute vec2 weight;
            varying float border;
            uniform mat4 projection, view;
            uniform vec3 hitVoxel, hitNormal;
            void main () {
                vec3 absNormal = abs(hitNormal);
                vec3 satNormal = min(vec3(1.), max(vec3(0.), hitNormal));
                vec3 corner = weight.x * absNormal.zxy + weight.y * absNormal.yzx;
                vec3 center = hitVoxel + satNormal * 1.05 - 0.025 * absNormal;
                vec3 vert = center + corner;
                gl_Position = projection * view * vec4(vert, 1);
            }
            `,

      uniforms: {
        buttonPressed: stateProp('local')('buttonPressed').prop,
        hitVoxel: stateProp('local')('lookTarget').prop,
        hitNormal: stateProp('local')('lookNormal').prop,
        brightness,
      },

      attributes: {
        weight: [0, 0, 1, 0, 0, 1, 1, 1],
      },

      elements: [
        [0, 1, 2],
        [2, 1, 3],
      ],

      blend: {
        enable: true,
        func: {
          src: 1,
          dst: 1,
        },
        equation: 'add',
      },

      depth: {
        mask: false,
      },
    },
    true,
  );

  return {
    cursor3D: (state: GameClientState) => {
      if (state.secret.replica.enableCursor && state.local.isLooking) {
        cursor3D(state);
      }
    },
  };
}
