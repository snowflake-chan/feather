import { REGLLoader, safeProp } from './regl';
import REGL from 'regl';
import { GameClientState } from '../game-client-schema';
import { vec3, vec2, vec4 } from 'gl-matrix';
import { alloc, free } from '../utils/pool';

const MAX_PARTICLES = 1e5;
const DENSITY_BASE = 0.01;
const MAX_LENGTH = 1000;

function getVelocity(out: vec3, dir: any, speed: number) {
  vec3.normalize(out, [dir.x, dir.y, dir.z]);
  vec3.scale(out, out, speed);
  return out;
}

export default (regl: REGL.Regl, loader: REGLLoader) => {
  const SYMBOLS = {
    COLOR_LUT: (state: GameClientState) =>
      state.postProcess.lutEnabled && !state.postProcess.enabled,
    HDR: (state: GameClientState) => state.postProcess.enabled,
  };

  let rainBuffer: REGL.Buffer | null = null;
  function restoreRainBuffer() {
    const rainData = new Float32Array(alloc(MAX_PARTICLES * 8 * 4));
    for (let i = 0; i < rainData.length; i += 8) {
      for (let j = 0; j < 3; ++j) {
        rainData[i + j] = rainData[i + j + 4] = Math.random() * MAX_LENGTH;
      }
      rainData[i + 3] = 0;
      rainData[i + 7] = Math.random() * MAX_LENGTH;
    }

    if (rainBuffer) {
      rainBuffer(rainData);
    } else {
      rainBuffer = regl.buffer(rainData);
    }
    free(rainData.buffer);
  }
  restoreRainBuffer();

  const stateProp = safeProp<GameClientState>(regl);

  const VELOCITY_VEC = vec3.create();
  const RAIN_LENGTH = vec2.create();
  const RAIN_COLOR = vec4.create();

  const drawRain = loader.cache(
    'rain-forward',
    {
      frag: require('./glsl/rain_frag.glsl'),
      vert: require('./glsl/rain_vert.glsl'),
      attributes: {
        position: {
          type: 'float',
          offset: 0,
          stride: 16,
          buffer: rainBuffer,
        },
      },

      uniforms: {
        time: (_, state: GameClientState) => state.clock.tick,
        velocity: (_, state: GameClientState) =>
          getVelocity(
            VELOCITY_VEC,
            state.environmentParams.rain.direction,
            state.environmentParams.rain.speed,
          ),
        positionRange: stateProp('voxel')('shape').prop,
        interference:
          stateProp('environmentParams')('rain')('interference').prop,
        rainLength: () => RAIN_LENGTH,
        color: () => RAIN_COLOR,
      },

      count: <any>(
        ((_, state: GameClientState) =>
          Math.min(
            MAX_PARTICLES,
            Math.round(
              state.voxel.shape[0] *
                state.voxel.shape[1] *
                state.voxel.shape[2] *
                state.environmentParams.rain.density *
                DENSITY_BASE,
            ),
          ))
      ),
      primitive: 'lines',
      elements: null,
      offset: 0,
    },
    true,
    SYMBOLS,
  );

  return {
    draw: (state: GameClientState) => {
      const n = Math.round(
        state.voxel.shape[0] *
          state.voxel.shape[1] *
          state.voxel.shape[2] *
          state.environmentParams.rain.density *
          DENSITY_BASE,
      );
      if (n > 0) {
        const color = state.environmentParams.rain.color;
        vec4.set(RAIN_COLOR, color.r, color.g, color.b, color.a);
        const size = state.environmentParams.rain.size;
        vec2.set(RAIN_LENGTH, size.w, Math.max(0.0001, size.h - size.w));
        drawRain(state)(state);
      }
    },

    restore: restoreRainBuffer,
  };
};
