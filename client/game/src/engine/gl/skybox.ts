import { REGL, REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import { updateTexture, restoreTexture } from './texture';
import { ENGINE_RES } from '../../resource/engine';
import getTriangle from './triangle';

const SKY_ENV_RESOLUTION = 256;

export default function (regl: REGL, loader: REGLLoader) {
  const triangle = loader.require(getTriangle);
  const stateProp = safeProp<GameClientState>(regl);

  function update(state: GameClientState) {
    updateTexture(
      state.sky.nightSampler,
      state,
      256,
      [ENGINE_RES.sky.stars],
      'linear',
      'linear',
      'repeat',
      'rgba',
    );
    updateTexture(
      state.sky.noiseSampler,
      state,
      256,
      [ENGINE_RES.sky.perlin],
      'linear',
      'linear',
      'repeat',
      'rgba',
    );
    updateTexture(
      state.sky.cloudSamplerCube,
      state,
      256,
      [
        ENGINE_RES.sky.cloud_px,
        ENGINE_RES.sky.cloud_nx,
        ENGINE_RES.sky.cloud_py,
        ENGINE_RES.sky.cloud_ny,
        ENGINE_RES.sky.cloud_pz,
        ENGINE_RES.sky.cloud_nz,
      ],
      'linear',
      'linear',
      'clamp',
      'rgba',
      true,
    );
  }

  function init(state: GameClientState) {
    const type = loader.floatBuffer.type;
    const filter = loader.floatBuffer.filter;

    state.sky.envMap = regl.framebuffer({
      color: regl.texture({
        width: SKY_ENV_RESOLUTION * 2,
        height: SKY_ENV_RESOLUTION,
        type,
        min: filter,
        mag: filter,
        format: 'rgba',
      }),
      depthStencil: false,
    });
  }

  function restore(state: GameClientState) {
    restoreTexture(state.sky.nightSampler);
    restoreTexture(state.sky.noiseSampler);
    restoreTexture(state.sky.cloudSamplerCube);
  }

  const SKYPROPS = {
    UINT8_COLOR: () => loader.floatBuffer.type === 'uint8',
    HD_SKY: (state: GameClientState) =>
      loader.floatBuffer.type === 'uint8' || state.settings.hdSky,
    COLOR_LUT: (state: GameClientState) =>
      state.postProcess.lutEnabled && !state.postProcess.enabled,
    HDR: (state: GameClientState) => state.postProcess.enabled,
  };

  const skyBase = {
    frag: require('./glsl/sky_frag.glsl'),
    vert: require('./glsl/sky_vert.glsl'),
    attributes: {
      position: 0,
    },
    vao: triangle,
    count: 3,
    offset: 0,
    primitive: <'triangles'>'triangles',
  };

  const renderSky = loader.cache<GameClientState, {}>(
    'sky:render-forward',
    skyBase,
    true,
    SKYPROPS,
  );

  const _renderEnvironment = loader.cache<GameClientState, GameClientState>(
    'sky:envmap',
    {
      frag: require('./glsl/sky_reflect_frag.glsl'),
      vert: require('./glsl/sky_vert.glsl'),
      attributes: {
        position: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',
      framebuffer: stateProp('sky')('envMap').prop,
    },
    true,
    SKYPROPS,
  );

  function renderEnvironment(state: GameClientState) {
    _renderEnvironment(state)(state);
  }

  return {
    init,
    update,
    restore,
    environment: renderEnvironment,
    sky: renderSky,
  };
}
