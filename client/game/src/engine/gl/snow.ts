import REGL from 'regl';
import { REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import { vec2, vec4 } from 'gl-matrix';
import { updateTexture } from './texture';
import { alloc, free } from '../utils/pool';

const DENSITY_BASE = 0.001;
const MAX_PARTICLES = 1e5;
const TICK_SCALE = 0.01;

export default (regl: REGL.Regl, loader: REGLLoader) => {
  const SYMBOLS = {
    COLOR_LUT: (state: GameClientState) =>
      state.postProcess.lutEnabled && !state.postProcess.enabled,
    HDR: (state: GameClientState) => state.postProcess.enabled,
  };

  let pointBuffer: REGL.Buffer | null = null;
  function restoreSnow() {
    const POINT_DATA = new Uint8Array(alloc(MAX_PARTICLES * 8));
    for (let i = 0; i < POINT_DATA.length; ++i) {
      POINT_DATA[i] = (Math.random() * 256) | 0;
    }
    if (!pointBuffer) {
      pointBuffer = regl.buffer(POINT_DATA);
    } else {
      pointBuffer(POINT_DATA);
    }
    free(POINT_DATA.buffer);
  }
  restoreSnow();

  function updateSnow(state: GameClientState) {
    const url = state.environmentParams.snow.texture;
    const magFilter = state.settings.lowQualityTextures ? 'nearest' : 'linear';
    const minFilter = state.settings.lowQualityTextures
      ? 'nearest'
      : 'linear mipmap linear';

    if (url) {
      state.sky.snowTexture.premultiplyAlpha = false;
      updateTexture(
        state.sky.snowTexture,
        state,
        64,
        [url],
        minFilter,
        magFilter,
        'clamp',
        'rgba',
      );
    }
  }

  const SNOW_SIZE = vec2.create();
  const SNOW_COLOR = vec4.create();

  const stateProp = safeProp<GameClientState>(regl);
  const drawSnow = loader.cache(
    'snow-forward',
    {
      vert: require('./glsl/snow_vert.glsl'),
      frag: require('./glsl/snow_frag.glsl'),
      attributes: {
        freqSeed: {
          buffer: pointBuffer,
          stride: 8,
          offset: 0,
          type: 'uint8',
          normalized: true,
        },
        phaseSeed: {
          buffer: pointBuffer,
          stride: 8,
          offset: 4,
          type: 'uint8',
          normalized: true,
        },
      },
      uniforms: {
        time: (_, state: GameClientState) => TICK_SCALE * state.clock.tick,
        positionRange: stateProp('voxel')('shape').prop,
        texture: stateProp('sky')('snowTexture')('texture').prop,
        fallSpeed: stateProp('environmentParams')('snow')('fallSpeed').prop,
        color: () => SNOW_COLOR,
        size: () => SNOW_SIZE,
        spinSpeed: stateProp('environmentParams')('snow')('spinSpeed').prop,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 'one minus src alpha',
        },
        equation: 'add',
      },
      depth: {
        enable: true,
        mask: false,
      },
      count: <any>(
        ((_, state: GameClientState) =>
          Math.min(
            MAX_PARTICLES,
            Math.round(
              20 *
                state.voxel.shape[0] *
                state.voxel.shape[1] *
                state.voxel.shape[2] *
                state.environmentParams.snow.density *
                DENSITY_BASE,
            ),
          ))
      ),
      primitive: 'points',
      elements: null,
      offset: 0,
    },
    true,
    SYMBOLS,
  );

  return {
    restore: restoreSnow,
    update: updateSnow,
    draw: (state: GameClientState) => {
      const n = Math.round(
        state.voxel.shape[0] *
          state.voxel.shape[1] *
          state.voxel.shape[2] *
          state.environmentParams.snow.density *
          DENSITY_BASE,
      );
      if (
        n > 0 &&
        state.environmentParams.snow.texture &&
        Math.max(
          state.environmentParams.snow.size.w,
          state.environmentParams.snow.size.h,
        )
      ) {
        const snow = state.environmentParams.snow;
        vec2.set(SNOW_SIZE, snow.size.w, snow.size.h);
        vec4.set(
          SNOW_COLOR,
          snow.color.r,
          snow.color.g,
          snow.color.b,
          snow.color.a,
        );
        drawSnow(state)(state);
      }
    },
  };
};
