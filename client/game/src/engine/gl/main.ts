import createREGL from 'regl';
import glSkybox from './skybox';
import glVoxel from './voxel';
import glShadow from './shadow';
import glPost from './postprocess';
import { glCursor } from './cursor';
import glMesh from './mesh';
import glPlayer from './player';
import glUI3D from './ui3d';
import glBreakEffect from './break';
import glSnow from './snow';
import glRain from './rain';
import glParticles from './particles';
import glOutline from './outline';
import glBakeShadow from './bake-shadow';

import { mat4 } from 'gl-matrix';
import { createREGLCache, REGLLoader, safeProp } from './regl';

import _REGL from 'regl';

import { GameClientState } from '../game-client-schema';
import { GLBakeShadowMap, GLShadowMap } from './schema/gl-shadow-schema';
import {
  allocGLMeshList,
  freeGLMeshList,
  allocGLTextureList,
  freeGLTextureList,
} from '../mesh/gl-controller/gl-mesh-controller';
import { destroyMesh } from '../mesh/renderable-schema';
import { glTexture } from './texture';
import { restoreVoxelWebGL } from '../voxel/voxel-controller';
import { EventBus } from '@box/utils/event';
import {
  drawModelsShadow,
  drawModelsForward,
  drawModelsTransparent,
} from './model';
import {
  compareMeshInstanceList,
  compareTransparentMeshInstanceList,
} from '../mesh/gl-controller/gl-mesh-schema';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import { drawSeedsForward, drawSeedsShadowForward } from './seed';
import { traverseUI3D } from '../ui3d/ui3d-controller';
import { UI3DElement } from '../ui3d/ui3d-schema';
import { restoreParticles } from '../particle/particle-client-controller';
import type { EngineProfiler } from '../profile/profiler';

function glMain(regl: _REGL.Regl, loader: REGLLoader) {
  const skybox = loader.require(glSkybox);
  const voxels = loader.require(glVoxel);
  const shadow = loader.require(glShadow);
  const post = loader.require(glPost);
  const cursor = loader.require(glCursor);
  const mesh = loader.require(glMesh);
  const player = loader.require(glPlayer);
  const ui3d = loader.require(glUI3D);
  const breakEffect = loader.require(glBreakEffect);
  const snow = loader.require(glSnow);
  const rain = loader.require(glRain);
  const particles = loader.require(glParticles);
  const texture = loader.require(glTexture);
  const outline = loader.require(glOutline);
  const bakeShadow = loader.require(glBakeShadow);
  const stateProp = safeProp<GameClientState>(regl);
  const modelMatrix = mat4.identity(mat4.create());

  const shadowUniforms: { [prop: string]: any } = {};
  for (let i = 0; i < 4; ++i) {
    shadowUniforms[`shadowData.projection[${i}]`] = stateProp('shadow')(
      'cascade',
    )(i)('shadowViewProjMatrix').prop;
    shadowUniforms[`shadowData.bounds[${i}]`] =
      stateProp('shadow')('cascade')(i)('shaderBounds').prop;
    shadowUniforms[`shadowData.normal[${i}]`] =
      stateProp('shadow')('cascade')(i)('shadowNormalMatrix').prop;
  }

  // pass extension handlers
  const onPrePass = new EventBus<void>();
  const onShadowPass = new EventBus<GLShadowMap>();
  const onForwardPass = new EventBus<void>();
  const onAlphaPass = new EventBus<void>();
  const onPostPass = new EventBus<void>();

  const setup = <(props: GameClientState, body: () => void) => void>(
    loader.cache(
      'main:setup',
      {
        framebuffer: stateProp('postProcess')('fbo').prop,

        context: {
          model: modelMatrix,

          particleVAO: stateProp('glParticles')('particleVAO').prop,

          state: stateProp.prop,
          postprocess: stateProp('postProcess')('enabled').prop,
          shadows: stateProp('shadow')('cascade').prop,
          now: stateProp('clock')('tick').prop,
        },

        uniforms: {
          'now': (context, state: GameClientState) =>
            (state.clock.tick * MS_PER_TICK) / 1000,

          'model': modelMatrix,

          'eye': stateProp('camera')('eye').prop,
          'view': stateProp('camera')('view').prop,
          'projection': stateProp('camera')('projection').prop,
          'viewProj': stateProp('camera')('viewProjection').prop,
          'invView': stateProp('camera')('invView').prop,
          'invProjection': stateProp('camera')('invProjection').prop,
          'invViewProj': stateProp('camera')('invViewProjection').prop,

          'lodBias': stateProp('settings')('lodBias').prop,
          'underwater': stateProp('camera')('underwater').prop,

          'timeOfDay': stateProp('environment')('timeOfDay').prop,
          'light.direction': stateProp('environment')('sunDirection').prop,
          'light.color': stateProp('environment')('sunColor').prop,
          'light.skyLeft': stateProp('environment')('skyLeft').prop,
          'light.skyRight': stateProp('environment')('skyRight').prop,
          'light.skyTop': stateProp('environment')('skyTop').prop,
          'light.skyBottom': stateProp('environment')('skyBottom').prop,
          'light.skyFront': stateProp('environment')('skyFront').prop,
          'light.skyBack': stateProp('environment')('skyBack').prop,
          'light.globalLight': stateProp('environment')('globalLight').prop,

          'skyEnv': stateProp('sky')('envMap').prop,
          'nightSampler': stateProp('sky')('nightSampler')('texture').prop,
          'noiseSampler': stateProp('sky')('noiseSampler')('texture').prop,
          'cloudSamplerCube': stateProp('sky')('cloudSamplerCube')('cube').prop,

          'post.gamma': stateProp('environment')('gamma').prop,
          'post.exposure': stateProp('camera')('currentExposure').prop,
          'post.fogParams': stateProp('environment')('fogParams').prop,
          'post.fogParams2': stateProp('environment')('fogParams2').prop,
          'post.fogParams3': stateProp('environment')('fogParams3').prop,
          'lut': stateProp('postProcess')('lut').prop,

          'lunarPhase':
            stateProp('environmentParams')('sky')('lunarPhase').prop,

          'invExposure': (_, state: GameClientState) =>
            1 / state.camera.currentExposure,

          'viewport': stateProp('camera')('viewport').prop,
          'zNear': stateProp('camera')('zNear').prop,
          'zFar': stateProp('camera')('zFar').prop,

          'viewScale': (context, state: GameClientState) => {
            return (
              Math.min(state.camera.viewport[0], state.camera.viewport[1]) / 16
            );
          },

          'colorAtlasTexture':
            stateProp('voxelMesh')('colorAtlasTexture')('texture').prop,
          'materialAtlasTexture': stateProp('voxelMesh')(
            'materialAtlasTexture',
          )('texture').prop,
          'bumpAtlasTexture':
            stateProp('voxelMesh')('bumpAtlasTexture')('texture').prop,
          'waterBumpTexture':
            stateProp('voxelMesh')('waterBumpTexture')('texture').prop,

          // height texture
          'voxelHeight': stateProp('voxelMesh')('terrainHeightTex').prop,

          'shadowMap': stateProp('shadow')('shadowMapTexture').prop,
          'shadowData.resolution':
            stateProp('settings')('shadowResolution').prop,
          'shadowData.cascadeSplits': stateProp('shadow')('cascadeSplits').prop,
          ...shadowUniforms,

          'bakedShadowTexture':
            stateProp('shadow')('bakedShadowTexture')('texture').prop,
          'bakedDataTexture': stateProp('shadow')('bakedDataTexture').prop,
          'bakedChunkShift': stateProp('shadow')('bakeChunkShift').prop,
          'bakedZRatio': stateProp('shadow')('bakedZRatio').prop,
          'chunkDimX': stateProp('shadow')('chunkDimX').prop,
          'chunkDimY': stateProp('shadow')('chunkDimY').prop,
          'chunkDimZ': stateProp('shadow')('chunkDimZ').prop,
        },
      },
      true,
    )
  );

  function init(state: GameClientState) {
    // load all textures here
    post.init(state);
    skybox.init(state);
  }

  function draw(state: GameClientState, profiler: EngineProfiler) {
    if (state.postProcess.enabled) {
      regl.clear({
        depth: 1,
        stencil: 0,
      });
    }

    // update buffers
    skybox.update(state);
    voxels.update(state);
    post.update(state);
    shadow.update(state);
    snow.update(state);
    outline.update(state);

    setup(state, () => {
      const opaqueSeeds: UI3DElement[] = [];
      const transparentSeeds: UI3DElement[] = [];
      const normalUI3d: UI3DElement[] = [];
      traverseUI3D(state, opaqueSeeds, transparentSeeds, normalUI3d);

      regl.clear({
        depth: 1,
        stencil: 0,
      });
      onPrePass.notify();
      // render environment map
      skybox.environment(state);

      // render shadow map using LoDs calculated in above
      shadow.setup(state.shadow, (shadowMap: GLShadowMap) => {
        !state.shadow.enableBakedShadow &&
          voxels.shadow(state, shadowMap.frustum);

        ++state.modelInfo.passId;
        const shadowPass = allocGLMeshList();

        // accumulate objects to be rendered in shadow pass
        !state.hidePlayers && player.shadow(shadowPass, state, shadowMap);
        drawModelsShadow(shadowPass, state, shadowMap.frustum);

        // call any user code for the shadow pass
        onShadowPass.notify(shadowMap);

        // render the shadow mesh list
        shadowPass.sort(compareMeshInstanceList);
        mesh.shadow(state, shadowPass);
        freeGLMeshList(shadowPass);

        breakEffect.shadow(state, shadowMap);
      });

      // setup voxel pass
      voxels.setup(state);

      // render forward voxel pass
      voxels.forward(state);

      // entity and player pass
      ++state.modelInfo.passId;
      const opaqueModels = allocGLMeshList();
      const transparentModels = allocGLMeshList();
      const textureModels = allocGLTextureList();

      !state.hidePlayers &&
        player.forward(opaqueModels, transparentModels, state);

      // render all opaque objects
      drawModelsForward(opaqueModels, textureModels, state);
      if (profiler.viewProfilingEnabled) {
        profiler.profileViewOpaqueModels(opaqueModels);
      }
      if (!state.replica.running) {
        drawSeedsForward(opaqueModels, state, opaqueSeeds, textureModels);
      }

      // call user generated code
      onForwardPass.notify();

      // render the pass
      // 不透明物体从前往后排序，避免被遮挡物体的片元着色器进行无意义的上色
      opaqueModels.sort(compareMeshInstanceList);
      mesh.forward(state, opaqueModels);
      texture.forward(state, textureModels);
      freeGLMeshList(opaqueModels);
      freeGLTextureList(textureModels);

      // special effects
      breakEffect.forward(state);

      // particles
      particles.draw(state);

      // skybox
      skybox.sky(state)();

      // render transparent models
      drawModelsTransparent(transparentModels, state);
      if (profiler.viewProfilingEnabled) {
        profiler.profileViewTransparentModels(transparentModels);
      }
      if (!state.replica.running) {
        drawSeedsForward(transparentModels, state, transparentSeeds);
      }

      // model alpha sort
      // 透明物体从后往前排序
      // 透明物体中所有的颜色都有存在的意义，不会被完全遮挡。按照从后往前顺序排序渲染出来的透明颜色更加准确
      transparentModels.sort(compareTransparentMeshInstanceList);

      // run special per-alpha pass commands
      onAlphaPass.notify();

      // alpha pass. draw all transparent voxels objects
      // 由于model需要开启深度写入(mask为true)做单个物体的prePass
      // 需要先渲染透明地形再渲染透明实体，地形才不会被实体遮挡
      voxels.alpha(state);

      // model alpha pass
      mesh.transparentForward(state, transparentModels);
      freeGLMeshList(transparentModels);

      // draw cursor
      if (!state.hideUI) {
        cursor.cursor3D(state);
      }

      // draw weather effects
      rain.draw(state);
      snow.draw(state);

      // ui3d
      if (!state.hideUI) {
        ui3d.forward(state, normalUI3d);
      }

      // compute bloom
      if (state.postProcess.blurEnabled) {
        post.bloom(state);
      }

      // update scattering buffer
      post.scatter(state);
    });

    post.draw(state);

    outline.setup(state, () => {
      const outlineModels = allocGLMeshList();

      !state.hidePlayers && player.outline(outlineModels, state);

      outlineModels.sort(compareMeshInstanceList);
      mesh.prePass(state, outlineModels);

      freeGLMeshList(outlineModels);
    });
    outline.draw(state);

    onPostPass.notify();
  }

  function drawBakedShadow(state: GameClientState) {
    // update buffers
    voxels.update(state);
    bakeShadow.update(state);

    setup(state, () => {
      const opaqueSeeds: UI3DElement[] = [];
      const transparentSeeds: UI3DElement[] = [];
      const normalUI3d: UI3DElement[] = [];
      traverseUI3D(state, opaqueSeeds, transparentSeeds, normalUI3d);

      regl.clear({
        depth: 1,
        stencil: 0,
      });

      // render shadow map using LoDs calculated in above
      bakeShadow.setup(state.shadow, (bakeShadowMap: GLBakeShadowMap) => {
        voxels.shadow(state, bakeShadowMap.frustum);

        ++state.modelInfo.passId;
        const shadowPass = allocGLMeshList();

        // accumulate objects to be rendered in shadow pass
        drawModelsShadow(shadowPass, state, bakeShadowMap.frustum, true);
        if (!state.replica.running) {
          drawSeedsShadowForward(
            shadowPass,
            state,
            opaqueSeeds,
            bakeShadowMap.frustum,
            true,
          );
        }

        // render the shadow mesh list
        shadowPass.sort(compareMeshInstanceList);
        mesh.shadow(state, shadowPass);
        freeGLMeshList(shadowPass);
      });
    });

    bakeShadow.draw(state);
  }

  function restoreContext(state: GameClientState) {
    restoreVoxelWebGL(state);
    restoreParticles(state);
    voxels.restore(state);
    skybox.restore(state);
    rain.restore();
    snow.restore();
  }

  function lostContext(state: GameClientState) {
    post.lost(state);
    destroyMesh(state);
  }

  return {
    init,
    draw: (state: GameClientState, profiler: EngineProfiler) => {
      if (state.dom.bakeShadow) {
        drawBakedShadow(state);
        state.dom.bakeShadow = false;
        return;
      }
      draw(state, profiler);
    },
    restore: restoreContext,
    lost: lostContext,

    // render hooks
    onPrePass,
    onShadowPass,
    onAlphaPass,
    onForwardPass,
    onPostPass,
  };
}

type GLMain = typeof glMain;

export type GLMainReturnValue = ReturnType<GLMain>;

export type CreateGameREGL = (canvas: HTMLCanvasElement) => {
  regl: createREGL.Regl;
  reglLoader: REGLLoader;
  glMainReturnValue: GLMainReturnValue;
};

/**
 * Create both regl container and regl loader,
 * and load main webgl render procedure.
 */
export const createGameREGL: CreateGameREGL = (canvas: HTMLCanvasElement) => {
  // create regl container
  const regl = createREGL({
    extensions: [],
    optionalExtensions: [
      'OES_element_index_uint',
      'OES_vertex_array_object',
      'OES_standard_derivatives',
      'WEBGL_color_buffer_float',
      'EXT_color_buffer_half_float',
      'OES_texture_float',
      'OES_texture_float_linear',
      'OES_texture_half_float',
      'OES_texture_half_float_linear',
      'WEBGL_depth_texture',
      'EXT_shader_texture_lod',
    ],
    attributes: {
      depth: true,
      // if we set preserveDrawingBuffer to false, webgl will make a black screen shot
      preserveDrawingBuffer: true,
      alpha: false,
      premultipliedAlpha: true,
      antialias: false,
      // some Android phones will show a white screen if set it to true
      desynchronized: false,
      powerPreference: 'low-power',
    },
    canvas,
    profile: false,
  });

  const reglLoader = createREGLCache(regl, false);

  const glMainReturnValue = reglLoader.require(glMain);

  return { regl, reglLoader, glMainReturnValue };
};
