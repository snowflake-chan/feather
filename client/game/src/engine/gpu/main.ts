import type { IREWGPUBuffer, RenderDescriptor, ReWGPU } from '@box/rewgpu';
import { GameClientState } from '../game-client-schema';
import mainStruct from './wgsl/main-struct.wgsl';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { gpuMesh } from './mesh';
import {
  allocGPUModelTextureList,
  freeGPUModelTextureList,
  allocGPUMeshListDict,
  freeGPUMeshListDict,
} from '../mesh/gpu-controller/gpu-mesh-controller';
import {
  drawModelsDictForward,
  drawModelsDictTransparent,
  drawModelsShadowDict,
} from './model';
import { UI3DElement } from '../ui3d/ui3d-schema';
import { traverseUI3D } from '../ui3d/ui3d-controller';
import { drawSeedsForward, drawSeedsShadowForward } from './seed';
import { gpuSkybox } from './skybox';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import { gpuTexture } from './texture';
import { gpuPlayer } from './player';
import {
  UniformStructF32,
  VEC3F,
  VEC4F,
  MAT4X4F32,
  F32,
  VEC2F,
} from './uniform-pool';
import { gpuVoxel } from './voxel';
import { gpuSnow } from './snow';
import { gpuRain } from './rain';
import { gpuParticles } from './particles';
import { gpuShadow } from './shadow';
import { gpuBreak } from './break';
import { gpuOutline } from './outline';
import { PostprocessRenderer } from './postprocess';
import type { EngineProfiler } from '../profile/profiler';
import { gpuBakeShadow } from './bake-shadow';
import {
  Vec3Schema,
  Vec4Schema,
  Vec2Schema,
  Mat4Schema,
} from '@box/schema/utils/math-schema';

export function gpuMain(rewgpu: ReWGPU) {
  const { data, struct } = new UniformStructF32({
    eye: VEC3F,
    view: MAT4X4F32,
    projection: MAT4X4F32,
    viewProjection: MAT4X4F32,
    invView: MAT4X4F32,
    invProjection: MAT4X4F32,
    invViewProjection: MAT4X4F32,
    viewport: VEC2F,
    timeOfDay: F32,
    now: F32,

    direction: VEC3F,
    color: VEC3F,
    skyLeft: VEC3F,
    skyRight: VEC3F,
    skyTop: VEC3F,
    skyBottom: VEC3F,
    skyFront: VEC3F,
    skyBack: VEC3F,
    globalLight: F32,

    gamma: F32,
    exposure: F32,
    fogParams: VEC4F,
    fogParams2: VEC4F,
    fogParams3: VEC4F,

    invExposure: F32,

    atlasRadius: F32,

    oitNodesBufferSize: F32,
  });

  const commonGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {},
    },
  ];

  const oitGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {},
    },
    {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {
        sampleType: 'depth',
      },
    },
    {
      binding: 2,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'storage',
      },
    },
    {
      binding: 3,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'storage',
      },
    },
    {
      binding: 4,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'storage',
      },
    },
    {
      binding: 5,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'storage',
      },
    },
    {
      binding: 6,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'storage',
      },
    },
    {
      binding: 7,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {
        type: 'storage',
      },
    },
  ];

  const commonUniformLayout: CommonUniformLayout = {
    structCode: mainStruct,
    commonGroupLayoutEntries,
    commonGroupLayout: rewgpu.createBindGroupLayout({
      label: 'commonGroup:layout',
      entries: commonGroupLayoutEntries,
    }),
    oitGroupLayoutEntries: oitGroupLayoutEntries,
    oitGroupLayout: rewgpu.createBindGroupLayout({
      label: 'oitGroup:layout',
      entries: oitGroupLayoutEntries,
    }),
  };

  const mesh = gpuMesh(rewgpu, commonUniformLayout);
  const texture = gpuTexture(rewgpu, commonUniformLayout);
  const skybox = gpuSkybox(rewgpu, commonUniformLayout);
  const player = gpuPlayer();
  const voxels = gpuVoxel(rewgpu, commonUniformLayout);
  const bakeShadow = gpuBakeShadow(rewgpu);
  const shadow = gpuShadow(rewgpu);
  const rain = gpuRain(rewgpu, commonUniformLayout);
  const snow = gpuSnow(rewgpu, commonUniformLayout);
  const particles = gpuParticles(rewgpu, commonUniformLayout);
  const outline = gpuOutline(rewgpu);
  const postprocess = new PostprocessRenderer(rewgpu);
  const breakEffect = gpuBreak(rewgpu);

  /**
   * 记录每帧绘制时，创建的GPU资源
   * 在rusty_box环境中，每帧绘制结束后主动清理这类资源
   */
  const gpuResources: object[] = [];

  let commonUniformEntries: CommonUniformEntries | undefined;

  // 会跟随clear销毁的资源类的：texture, buffer, group, sampler
  // 在teleport后需要重新init
  // 都放在这里初始化
  function init(state: GameClientState) {
    // 空的深度图，当阴影未开启时，使用该空图片
    state.gpu.emptyShadowTexture = rewgpu.texture({
      size: [1],
      format: 'r16float',
      usage: GPUTextureUsage.TEXTURE_BINDING,
    });
    state.gpu.emptyBuffer = rewgpu.buffer({
      size: 1,
      usage: GPUBufferUsage.UNIFORM,
    });

    state.gpu.emptyBakedShadowTexture = rewgpu.texture({
      size: [1, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING,
    });
    state.gpu.emptyBakedBuffer = rewgpu.buffer({
      size: 128,
      usage: GPUBufferUsage.STORAGE,
    });

    state.gpu.emptyTexture = rewgpu.texture({
      size: [1],
      format: rewgpu.config.presentationFormat,
      usage: GPUTextureUsage.TEXTURE_BINDING,
    });
    const uniformBuffer = rewgpu.buffer({
      label: 'commonUniformBuffer',
      data,
      size: data.byteLength,
      usage: GPUBufferUsage.UNIFORM,
      isDynamic: true,
    });

    commonUniformEntries = {
      entries: [
        {
          binding: 0,
          resource: uniformBuffer,
        },
      ],
      getOITEntries: (state) => {
        if (
          !state.gpu.depth ||
          !state.gpu.oitStaticNodeBuffer0 ||
          !state.gpu.oitOffsetBuffer0 ||
          !state.gpu.oitStaticNodeBuffer1 ||
          !state.gpu.oitOffsetBuffer1 ||
          !state.gpu.oitStaticNodeBuffer2 ||
          !state.gpu.oitOffsetBuffer2
        ) {
          return [];
        }
        return [
          {
            binding: 0,
            resource: uniformBuffer,
          },
          {
            binding: 1,
            resource: state.gpu.depth,
          },
          {
            binding: 2,
            resource: state.gpu.oitStaticNodeBuffer0,
          },
          {
            binding: 3,
            resource: state.gpu.oitOffsetBuffer0,
          },
          {
            binding: 4,
            resource: state.gpu.oitStaticNodeBuffer1,
          },
          {
            binding: 5,
            resource: state.gpu.oitOffsetBuffer1,
          },
          {
            binding: 6,
            resource: state.gpu.oitStaticNodeBuffer2,
          },
          {
            binding: 7,
            resource: state.gpu.oitOffsetBuffer2,
          },
        ];
      },
    };

    // initialize sampler
    state.gpu.sampler = rewgpu.sampler();
    state.gpu.linearSampler = rewgpu.sampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });
    state.gpu.linearRepeatSampler = rewgpu.sampler({
      magFilter: 'linear',
      minFilter: 'linear',
      addressModeU: 'repeat',
      addressModeV: 'repeat',
    });

    // 将原本的数据释放，直接替换引用
    Vec3Schema.free(state.camera.eye);
    Mat4Schema.free(state.camera.view);
    Mat4Schema.free(state.camera.projection);
    Mat4Schema.free(state.camera.viewProjection);
    Mat4Schema.free(state.camera.invView);
    Mat4Schema.free(state.camera.invProjection);
    Mat4Schema.free(state.camera.invViewProjection);
    Vec2Schema.free(state.camera.viewport);
    state.camera.eye = struct.eye;
    state.camera.view = struct.view;
    state.camera.projection = struct.projection;
    state.camera.viewProjection = struct.viewProjection;
    state.camera.invView = struct.invView;
    state.camera.invProjection = struct.invProjection;
    state.camera.invViewProjection = struct.invViewProjection;
    state.camera.viewport = struct.viewport;

    struct.timeOfDay[0] = state.environment.timeOfDay;
    struct.now[0] = (state.clock.tick * MS_PER_TICK) / 1000;

    Vec3Schema.free(state.environment.sunDirection);
    Vec3Schema.free(state.environment.sunColor);
    Vec3Schema.free(state.environment.skyLeft);
    Vec3Schema.free(state.environment.skyRight);
    Vec3Schema.free(state.environment.skyTop);
    Vec3Schema.free(state.environment.skyBottom);
    Vec3Schema.free(state.environment.skyFront);
    Vec3Schema.free(state.environment.skyBack);
    state.environment.sunDirection = struct.direction;
    state.environment.sunColor = struct.color;
    state.environment.skyLeft = struct.skyLeft;
    state.environment.skyRight = struct.skyRight;
    state.environment.skyTop = struct.skyTop;
    state.environment.skyBottom = struct.skyBottom;
    state.environment.skyFront = struct.skyFront;
    state.environment.skyBack = struct.skyBack;
    struct.globalLight[0] = state.environment.globalLight;

    struct.gamma[0] = state.environment.gamma;
    struct.exposure[0] = state.camera.currentExposure;
    Vec4Schema.free(state.environment.fogParams);
    Vec4Schema.free(state.environment.fogParams2);
    Vec4Schema.free(state.environment.fogParams3);
    state.environment.fogParams = struct.fogParams;
    state.environment.fogParams2 = struct.fogParams2;
    state.environment.fogParams3 = struct.fogParams3;

    struct.invExposure[0] = 1 / state.camera.currentExposure;

    struct.atlasRadius[0] = state.blockInfo.atlasRadius << 4;

    struct.oitNodesBufferSize[0] = state.gpu.oitNodesBufferSize;

    bakeShadow.init(state);
    shadow.init(state);
    mesh.init(state, commonUniformEntries);
    texture.init(state, commonUniformEntries);
    skybox.init(state, commonUniformEntries);
    voxels.init(state, commonUniformEntries);
    rain.init(commonUniformEntries);
    breakEffect.init(state);
    snow.init(state, commonUniformEntries);
    particles.init(state, commonUniformEntries);
    postprocess.init(state, uniformBuffer);
  }

  function draw(state: GameClientState, profiler: EngineProfiler) {
    if (
      !commonUniformEntries ||
      !state.gpu.depth?.texture ||
      !state.gpu.target?.texture ||
      !state.gpu.transparentDepth?.texture ||
      !state.gpu.transparentTarget?.texture
    ) {
      return;
    }
    struct.timeOfDay[0] = state.environment.timeOfDay;
    struct.now[0] = (state.clock.tick * MS_PER_TICK) / 1000;
    struct.globalLight[0] = state.environment.globalLight;
    struct.gamma[0] = state.environment.gamma;
    struct.exposure[0] = state.camera.currentExposure;
    struct.invExposure[0] = 1 / state.camera.currentExposure;
    struct.atlasRadius[0] = state.blockInfo.atlasRadius << 4;
    struct.oitNodesBufferSize[0] = state.gpu.oitNodesBufferSize;

    // update buffers
    state.dom.bakeShadow && bakeShadow.update(state);
    shadow.update(state);
    mesh.update(state, commonUniformEntries);
    skybox.update(state);
    voxels.update(state, commonUniformEntries);
    rain.update(state);
    snow.update(state, commonUniformEntries);
    breakEffect.update(state, commonUniformEntries);
    particles.update(state);
    outline.update(state);
    // 由于包含了最后一画，无论是否开启后期效果，postprocess模块的update都不能被跳过
    postprocess.update();

    const opaqueSeeds: UI3DElement[] = [];
    const transparentSeeds: UI3DElement[] = [];
    const normalUI3d: UI3DElement[] = [];
    traverseUI3D(state, opaqueSeeds, transparentSeeds, normalUI3d);

    state.dom.bakeShadow &&
      bakeShadow.setup(state, (r, frustum, idx) => {
        voxels.shadow(state, r, frustum, idx);

        const shadowPassDict = allocGPUMeshListDict();
        const shadowPassMotionDict = allocGPUMeshListDict();

        // accumulate objects to be rendered in shadow pass
        drawModelsShadowDict(
          shadowPassDict,
          shadowPassMotionDict,
          state,
          frustum,
          true,
        );

        if (!state.replica.running) {
          drawSeedsShadowForward(
            shadowPassDict,
            shadowPassMotionDict,
            state,
            opaqueSeeds.concat(transparentSeeds),
            frustum,
            true,
          );
        }

        // render the shadow mesh list
        mesh.shadowDict(state, r, shadowPassDict, shadowPassMotionDict, idx);

        freeGPUMeshListDict(shadowPassDict);
        freeGPUMeshListDict(shadowPassMotionDict);
      });

    shadow.setup(gpuResources, state.gpuShadow, (r, frustum, idx) => {
      !state.gpuShadow.enableBakedShadow &&
        voxels.shadow(state, r, frustum, idx);

      const shadowPassDict = allocGPUMeshListDict();
      const shadowPassMotionDict = allocGPUMeshListDict();

      // accumulate objects to be rendered in shadow pass
      !state.hidePlayers && player.shadow(shadowPassDict, state, frustum);
      drawModelsShadowDict(
        shadowPassDict,
        shadowPassMotionDict,
        state,
        frustum,
      );

      // TODO: notify是edit模式需要考虑的
      // // call any user code for the shadow pass
      // onShadowPass.notify(shadowMap);

      // render the shadow mesh list
      mesh.shadowDict(state, r, shadowPassDict, shadowPassMotionDict, idx);

      freeGPUMeshListDict(shadowPassDict);
      freeGPUMeshListDict(shadowPassMotionDict);

      breakEffect.shadow(state, r, frustum, idx);
    });

    const targetView = state.gpu.target.texture.createView({
      label: 'target:view',
    });
    const depthView = state.gpu.depth.texture.createView({
      label: 'depth:view',
    });

    gpuResources.push(targetView, depthView);

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: targetView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    };

    const opaqueModelsDict = allocGPUMeshListDict();
    const opaqueModelsMotionDict = allocGPUMeshListDict();
    const transparentModelsDict = allocGPUMeshListDict();
    const transparentModelsMotionDict = allocGPUMeshListDict();
    const textureModels = allocGPUModelTextureList();

    // setup voxel pass
    voxels.setup(state);

    /**
     * 在player.forward时，存入玩家的透明/非透明皮肤
     */
    !state.hidePlayers &&
      player.forward(opaqueModelsDict, transparentModelsDict, state);

    drawModelsDictForward(
      opaqueModelsDict,
      opaqueModelsMotionDict,
      textureModels,
      state,
    );

    if (!state.replica.running) {
      drawSeedsForward(
        opaqueModelsDict,
        opaqueModelsMotionDict,
        state,
        opaqueSeeds,
        textureModels,
      );
    }

    // render transparent models
    drawModelsDictTransparent(
      transparentModelsDict,
      transparentModelsMotionDict,
      state,
    );
    if (!state.replica.running) {
      drawSeedsForward(
        transparentModelsDict,
        transparentModelsMotionDict,
        state,
        transparentSeeds,
      );
    }

    if (profiler.viewProfilingEnabled) {
      profiler.performProfileGpu(opaqueModelsDict, transparentModelsDict);
    }

    // 先渲染不透明物体到target
    const renderContexts = rewgpu.render(renderPassDescriptor, (r) => {
      // debug.draw(r);

      // render forward voxel pass
      voxels.forward(state, r);

      mesh.forwardDict(state, r, opaqueModelsDict, opaqueModelsMotionDict);
      texture.forward(state, r, textureModels);

      // special effects
      breakEffect.forward(state, r);

      // particles
      particles.draw(state, r);

      // skybox
      skybox.sky(r);

      // draw weather effects
      rain.draw(state, r);
    });

    // 渲染透明物体

    const renderMultiDes: RenderDescriptor[] = [];

    const hasAlphaModels =
      Object.keys(transparentModelsDict).some(
        (k) => transparentModelsDict[k].length,
      ) ||
      Object.keys(transparentModelsMotionDict).some(
        (k) => transparentModelsMotionDict[k].length,
      );
    const hasSnow = snow.hasSnow(state);
    state.gpu.useOIT = voxels.hasAlpha(state) || hasAlphaModels || hasSnow;

    if (state.gpu.useOIT) {
      const transparentTargetView =
        state.gpu.transparentTarget.texture.createView({
          label: 'transparentTarget:view',
        });
      const transparentDepthView =
        state.gpu.transparentDepth.texture.createView({
          label: 'transparentDepth:view',
        });

      gpuResources.push(transparentTargetView, transparentDepthView);

      renderMultiDes.push({
        renderPassDescriptor: {
          colorAttachments: [
            {
              view: transparentTargetView,
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
          depthStencilAttachment: {
            view: transparentDepthView,
            depthClearValue: 1,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
          },
        },
        draw: (r) => {
          // TODO: notify是edit模式需要考虑的
          // run special per-alpha pass commands
          // onAlphaPass.notify();

          // alpha pass. draw all transparent voxels objects
          voxels.alpha(state, r);

          // model alpha pass
          mesh.transparentForwardDict(
            state,
            r,
            transparentModelsDict,
            transparentModelsMotionDict,
          );

          // draw weather effects
          hasSnow && snow.draw(state, r);
        },
      });
    }

    // outline
    if (state.gpuOutline.outlineDepth?.texture) {
      const textureView = state.gpuOutline.outlineDepth.texture.createView({
        label: 'outlineDepth:view',
      });
      gpuResources.push(textureView);

      renderMultiDes.push({
        renderPassDescriptor: {
          colorAttachments: [],
          depthStencilAttachment: {
            view: textureView,
            depthClearValue: 1,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
          },
        },
        draw: (r) => {
          const outlineModelsDict = allocGPUMeshListDict();
          !state.hidePlayers && player.outline(outlineModelsDict, state);
          mesh.outlineDict(state, r, outlineModelsDict);
          freeGPUMeshListDict(outlineModelsDict);
        },
      });
    }

    renderContexts.push(...rewgpu.renderMulti(renderMultiDes));

    freeGPUMeshListDict(opaqueModelsDict);
    freeGPUMeshListDict(opaqueModelsMotionDict);
    freeGPUMeshListDict(transparentModelsDict);
    freeGPUMeshListDict(transparentModelsMotionDict);
    freeGPUModelTextureList(textureModels);
    // 最终绘制到context上
    const encoder = rewgpu.config.device.createCommandEncoder({
      label: 'main',
    });

    const postProcessPasses = postprocess.record(encoder);

    if (postProcessPasses) {
      gpuResources.push(...postProcessPasses);
    }

    const cmdBuffer = encoder.finish();

    gpuResources.push(encoder, cmdBuffer);

    rewgpu.config.device.queue.submit([cmdBuffer]);

    state.gpu.targetSizeDirty = false;
    state.gpuVoxelMesh.terrainTexDirty = false;
    state.gpuVoxelMesh.chunksDirty = false;
    state.gpuShadow.shadowMapDirty = false;
    state.gpuShadow.bakedShadowMapDirty = false;
    state.dom.bakeShadow = false;

    renderContexts.forEach(({ commandEncoder, passEncoder, commandBuffer }) => {
      gpuResources.push(commandEncoder, passEncoder, commandBuffer);
    });

    rewgpu.canvas.present?.();

    window.cleanupResources?.(gpuResources);

    gpuResources.length = 0;
  }

  return {
    init,
    draw,
    clear: (state: GameClientState) => {
      // 在gpu数据clear之后，整个state会被free
      // 为避免重复利用的struct数据被释放到mudb的对象池中
      // 在clear方法中给state数据重新赋值
      state.camera.eye = Vec3Schema.alloc();
      state.camera.view = Mat4Schema.alloc();
      state.camera.projection = Mat4Schema.alloc();
      state.camera.viewProjection = Mat4Schema.alloc();
      state.camera.invView = Mat4Schema.alloc();
      state.camera.invProjection = Mat4Schema.alloc();
      state.camera.invViewProjection = Mat4Schema.alloc();
      state.camera.viewport = Vec2Schema.alloc();

      state.environment.sunDirection = Vec3Schema.alloc();
      state.environment.sunColor = Vec3Schema.alloc();
      state.environment.skyLeft = Vec3Schema.alloc();
      state.environment.skyRight = Vec3Schema.alloc();
      state.environment.skyTop = Vec3Schema.alloc();
      state.environment.skyBottom = Vec3Schema.alloc();
      state.environment.skyFront = Vec3Schema.alloc();
      state.environment.skyBack = Vec3Schema.alloc();

      state.environment.fogParams = Vec4Schema.alloc();
      state.environment.fogParams2 = Vec4Schema.alloc();
      state.environment.fogParams3 = Vec4Schema.alloc();

      shadow.clear(state);
      mesh.clear();
      texture.clear();
      voxels.clear();
      particles.clear();
      breakEffect.clear();
      postprocess.destroy(state);
    },
  };
}
