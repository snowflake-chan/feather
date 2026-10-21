import { vec3 } from 'gl-matrix';
import type {
  ReWGPU,
  IREWGPUBuffer,
  IndexBufferDescriptor,
  IREWGPUGroup,
  PipelineDescriptor,
} from '@box/rewgpu';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { prepareVoxels, renderVoxelsShadow } from '../voxel/voxel-controller';
import { GameClientState } from '../game-client-schema';
import { FLUID_VERTEX_SIZE, VERTEX_SIZE } from '../voxel/voxel-mesher';
import struct from './wgsl/voxel-struct.wgsl';
import vert from './wgsl/voxel-vert.wgsl';
import frag from './wgsl/voxel-frag.wgsl';
import alphaFrag from './wgsl/voxel-alpha-frag.wgsl';
import fluidStruct from './wgsl/voxel-fluid-struct.wgsl';
import fluidVert from './wgsl/voxel-fluid-vert.wgsl';
import fluidFrag from './wgsl/voxel-fluid-frag.wgsl';
import shadowStruct from './wgsl/shadow-struct.wgsl';
import voxelShadowStruct from './wgsl/voxel-shadow-struct.wgsl';
import shadowVert from './wgsl/voxel-shadow-vert.wgsl';
import sampleShadow from './wgsl/sample-shadow.wgsl';
import sampleBakeShadow from './wgsl/sample-baked-shadows.wgsl';

import { VEC3F } from './uniform-pool';
import { initTexture, updateTexture } from './texture';

import pbr from './wgsl/pbr.wgsl';

import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import postOut from './wgsl/post-out.wgsl';
import oitStorePixels from './wgsl/oit-store-pixels.wgsl';
import { GPUVoxelGeom } from '../voxel/gpu-voxel/gpu-voxel-schema';
import { ENGINE_RES } from 'src/resource/engine';
import { Frustum } from '@box/schema/utils/frustum-schema';
import { BundleCache } from './render-bundle';

const MIP_LEVEL_COUNT = 10;

export function gpuVoxel(
  rewgpu: ReWGPU,
  commonUniformLayout: CommonUniformLayout,
) {
  /**
   * 非透明和透明的pipeline共用的struct
   */
  const structs = `${commonUniformLayout.structCode}
    ${pbr}

    ${fog}
    ${toneMapping}
    ${postOut}

    ${sampleShadow}
    ${sampleBakeShadow}
    ${struct}
    `;

  const uniformGroupLayout = rewgpu.createBindGroupLayout({
    label: 'voxels:uniformGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: 'uniform',
          hasDynamicOffset: true,
        },
      },
    ],
  });

  const commonGroupLayout = rewgpu.createBindGroupLayout({
    label: 'voxels:forward:commonGroup:layout',
    entries: commonUniformLayout.commonGroupLayoutEntries.concat([
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: 'float',
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {},
      },
      {
        binding: 3,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: 'float',
        },
      },
      {
        binding: 4,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: 'read-only-storage',
        },
      },
    ]),
  });
  const textureGroupLayout = rewgpu.createBindGroupLayout({
    label: 'voxels:textureGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
    ],
  });

  const alphaGroupLayout = rewgpu.createBindGroupLayout({
    label: 'voxels:transparentForward:commonGroup:layout',
    entries: commonUniformLayout.oitGroupLayoutEntries.concat([
      {
        binding: 8,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: 'float',
        },
      },
      {
        binding: 9,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {},
      },
      {
        binding: 10,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: 'float',
        },
      },
      {
        binding: 11,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: 'read-only-storage',
        },
      },
    ]),
  });

  const fluidTextureGroupLayout = rewgpu.createBindGroupLayout({
    label: 'voxels:fluidTextureGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
    ],
  });

  const pipelineLayout = rewgpu.createPipelineLayout({
    label: 'voxels:forward:layout',
    bindGroupLayouts: [
      commonGroupLayout,
      textureGroupLayout,
      uniformGroupLayout,
    ],
  });

  const pipelineDescriptor: PipelineDescriptor = {
    layout: pipelineLayout,
    label: 'voxels:forward',
    struct: `
    ${structs}
    @group(0) @binding(1) var shadowMap : texture_2d<f32>;
    @group(0) @binding(2) var<uniform> shadowData : ShadowData;

    @group(0) @binding(3) var bakeShadowMap : texture_2d<f32>;
    @group(0) @binding(4) var<storage, read> bakeData : array<BakeShadow>;
    `,
    frag: {
      content: frag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: VERTEX_SIZE * 1,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'unorm8x4',
            },
            {
              shaderLocation: 1,
              offset: 4,
              format: 'unorm8x4',
            },
            {
              shaderLocation: 2,
              offset: 8,
              format: 'unorm8x4',
            },
            {
              shaderLocation: 3,
              offset: 12,
              format: 'unorm8x4',
            },
          ],
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  };
  const pipeline = rewgpu.createPipeline(pipelineDescriptor);

  pipelineDescriptor.layout = rewgpu.createPipelineLayout({
    label: 'voxels:transparentForward:layout',
    bindGroupLayouts: [
      alphaGroupLayout,
      textureGroupLayout,
      uniformGroupLayout,
    ],
  });
  pipelineDescriptor.label = 'voxels:alphaForward';
  pipelineDescriptor.struct = `
    ${structs}
    @group(0) @binding(8) var shadowMap : texture_2d<f32>;
    @group(0) @binding(9) var<uniform> shadowData : ShadowData;

    @group(0) @binding(10) var bakeShadowMap : texture_2d<f32>;
    @group(0) @binding(11) var<storage, read> bakeData : array<BakeShadow>;
    ${oitStorePixels}
    `;
  pipelineDescriptor.frag = {
    content: alphaFrag,
    entryPoint: 'fragMain',
  };
  const alphaPipeline = rewgpu.createPipeline(pipelineDescriptor);

  const fluidPipeline = rewgpu.createPipeline({
    layout: rewgpu.createPipelineLayout({
      label: 'voxels:transparentForward:layout',
      bindGroupLayouts: [
        commonUniformLayout.oitGroupLayout,
        fluidTextureGroupLayout,
        uniformGroupLayout,
      ],
    }),
    label: 'voxels:fluid',
    struct: `
    ${commonUniformLayout.structCode}

    ${fog}
    ${toneMapping}
    ${postOut}

    ${oitStorePixels}

    ${fluidStruct}
    `,
    frag: {
      content: fluidFrag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: fluidVert,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: FLUID_VERTEX_SIZE * 1,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'unorm8x4',
            },
            {
              shaderLocation: 1,
              offset: 4,
              format: 'unorm8x4',
            },
          ],
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const uniformType = {
    chunkId: VEC3F,
  };
  const bundleCache = new BundleCache(
    rewgpu,
    uniformGroupLayout,
    uniformType,
    2,
  );
  const alphaBundleCache = new BundleCache(
    rewgpu,
    uniformGroupLayout,
    uniformType,
    2,
  );
  const fluidBundleCache = new BundleCache(
    rewgpu,
    uniformGroupLayout,
    uniformType,
    2,
  );
  const shadowBundleCache = new BundleCache(
    rewgpu,
    uniformGroupLayout,
    uniformType,
    1,
    [],
  );

  const commandDescriptor = {
    pipeline,
    count: 0,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
    indexBuffer: <IndexBufferDescriptor | undefined>undefined,
  };

  const alphaCommandDescriptor = {
    pipeline: alphaPipeline,
    count: 0,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
    indexBuffer: <IndexBufferDescriptor | undefined>undefined,
  };

  const fluidCommandDescriptor = {
    pipeline: fluidPipeline,
    count: 0,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
    indexBuffer: <IndexBufferDescriptor | undefined>undefined,
  };

  let shadowCommandDescriptor: typeof commandDescriptor | undefined;

  function initCommonGroup(
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) {
    if (
      !state.gpu.emptyShadowTexture ||
      !state.gpu.emptyBuffer ||
      !state.gpu.emptyBakedShadowTexture ||
      !state.gpu.emptyBakedBuffer
    ) {
      return;
    }
    state.gpu.voxel.commonGroup?.destroy();
    state.gpu.voxel.commonGroup = rewgpu.group({
      label: 'voxels:commonGroup',
      entries: commonUniformEntries.entries.concat([
        {
          binding: 1,
          resource:
            state.gpuShadow.shadowMapTarget || state.gpu.emptyShadowTexture,
        },
        {
          binding: 2,
          resource: state.gpuShadow.shadowDataBuffer || state.gpu.emptyBuffer,
        },
        {
          binding: 3,
          resource:
            state.gpuShadow.bakedShadowTexture ||
            state.gpu.emptyBakedShadowTexture,
        },
        {
          binding: 4,
          resource:
            state.gpuShadow.bakedShadowData || state.gpu.emptyBakedBuffer,
        },
      ]),
      layout: commonGroupLayout,
    });

    state.gpu.voxel.commonTransparentGroup?.destroy();
    state.gpu.voxel.commonTransparentGroup = rewgpu.group({
      label: 'voxels:commonTransparentGroup',
      entries: commonUniformEntries.getOITEntries(state).concat([
        {
          binding: 8,
          resource:
            state.gpuShadow.shadowMapTarget || state.gpu.emptyShadowTexture,
        },
        {
          binding: 9,
          resource: state.gpuShadow.shadowDataBuffer || state.gpu.emptyBuffer,
        },
        {
          binding: 10,
          resource:
            state.gpuShadow.bakedShadowTexture ||
            state.gpu.emptyBakedShadowTexture,
        },
        {
          binding: 11,
          resource:
            state.gpuShadow.bakedShadowData || state.gpu.emptyBakedBuffer,
        },
      ]),
      layout: alphaGroupLayout,
    });

    state.gpu.voxel.fluidCommonGroup?.destroy();
    state.gpu.voxel.fluidCommonGroup = rewgpu.group({
      label: 'voxels:fluidCommonGroup',
      entries: commonUniformEntries.getOITEntries(state),
      layout: commonUniformLayout.oitGroupLayout,
    });
  }

  function initVoxelTexture(
    state: GameClientState,
    radius: number,
    mipLevelCount: number,
  ) {
    if (!state.gpu.sampler || !state.gpu.linearRepeatSampler) {
      return;
    }
    state.gpuVoxelMesh.radius = radius;
    state.gpuVoxelMesh.mipLevelCount = mipLevelCount;

    commandDescriptor.groups[1]?.destroy();
    alphaCommandDescriptor.groups[1]?.destroy();
    fluidCommandDescriptor.groups[1]?.destroy();

    const colorAtlas = initTexture(
      state.gpuVoxelMesh.colorAtlasTexture,
      rewgpu,
      radius,
      mipLevelCount,
    );
    const materialAtlas = initTexture(
      state.gpuVoxelMesh.materialAtlasTexture,
      rewgpu,
      radius,
      mipLevelCount,
    );

    const voxelTextureGroup = rewgpu.group({
      label: 'voxels:textureGroup',
      layout: textureGroupLayout,
      entries: [
        {
          binding: 0,
          resource: state.gpu.sampler,
        },
        {
          binding: 1,
          resource: colorAtlas,
        },
        {
          binding: 2,
          resource: materialAtlas,
        },
      ],
    });
    commandDescriptor.groups[1] = voxelTextureGroup;

    const voxelAlphaTextureGroup = rewgpu.group({
      label: 'voxels:alphaTextureGroup',
      layout: textureGroupLayout,
      entries: [
        {
          binding: 0,
          resource: state.gpu.sampler,
        },
        {
          binding: 1,
          resource: colorAtlas,
        },
        {
          binding: 2,
          resource: materialAtlas,
        },
      ],
    });
    alphaCommandDescriptor.groups[1] = voxelAlphaTextureGroup;

    const voxelFluidTextureGroup = rewgpu.group({
      label: 'voxels:fluidTextureGroup',
      layout: fluidTextureGroupLayout,
      entries: [
        {
          binding: 0,
          resource: state.gpu.linearRepeatSampler,
        },
        {
          binding: 1,
          resource: initTexture(
            state.gpuVoxelMesh.waterBumpTexture,
            rewgpu,
            512,
          ),
        },
      ],
    });
    fluidCommandDescriptor.groups[1] = voxelFluidTextureGroup;
  }

  function init(
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) {
    initCommonGroup(state, commonUniformEntries);

    initVoxelTexture(state, state.blockInfo.atlasRadius << 4, 1);
    if (
      !state.gpuShadow.shadowViewProjectionLayout ||
      !state.gpuShadow.shadowViewProjectionGroup
    ) {
      return;
    }

    const shadowLayout = rewgpu.createPipelineLayout({
      label: 'voxels:shadow:layout',
      bindGroupLayouts: [
        state.gpuShadow.shadowViewProjectionLayout,
        uniformGroupLayout,
      ],
    });

    const shadowPipeline = rewgpu.createPipeline({
      label: 'voxels:shadow',
      layout: shadowLayout,
      struct: `
      ${shadowStruct}
      ${voxelShadowStruct}
      `,
      vert: {
        content: shadowVert,
        entryPoint: 'vertMain',
        buffers: [
          {
            arrayStride: VERTEX_SIZE * 1,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: 'unorm8x4',
              },
            ],
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back',
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      },
    });

    shadowCommandDescriptor = {
      pipeline: shadowPipeline,
      count: 0,
      vertBuffers: [],
      groups: [state.gpuShadow.shadowViewProjectionGroup],
      indexBuffer: undefined,
    };
  }

  function update(
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) {
    if (
      state.gpu.targetSizeDirty ||
      state.gpuShadow.shadowMapDirty ||
      state.gpuShadow.bakedShadowMapDirty
    ) {
      initCommonGroup(state, commonUniformEntries);
      state.gpuVoxelMesh.chunksDirty = true;
    }
    let radius = state.blockInfo.atlasRadius << 4;
    let mipLevelCount = 1;

    const useMipmap = !state.settings.lowQualityTextures;
    if (useMipmap) {
      radius = 1 << (MIP_LEVEL_COUNT - 1);
      mipLevelCount = MIP_LEVEL_COUNT;
    }

    // 贴图尺寸变化和mipLevel切换，需要重新初始化texture
    if (
      state.gpuVoxelMesh.radius !== radius ||
      state.gpuVoxelMesh.mipLevelCount !== mipLevelCount
    ) {
      initVoxelTexture(state, radius, mipLevelCount);
      state.gpuVoxelMesh.chunksDirty = true;
    }

    if (state.gpuVoxelMesh.chunksDirty) {
      bundleCache.clearBundleCache();
      alphaBundleCache.clearBundleCache();
      fluidBundleCache.clearBundleCache();
      shadowBundleCache.clearBundleCache();
    }

    if (
      !state.blockInfo.colorAtlas.length ||
      !state.blockInfo.materialAtlas.length
    ) {
      return;
    }

    updateTexture(
      state.gpuVoxelMesh.colorAtlasTexture,
      state,
      useMipmap ? state.blockInfo.colorAtlas : [state.blockInfo.colorAtlas[0]],
    );
    updateTexture(
      state.gpuVoxelMesh.materialAtlasTexture,
      state,
      useMipmap
        ? state.blockInfo.materialAtlas
        : [state.blockInfo.materialAtlas[0]],
    );
    updateTexture(state.gpuVoxelMesh.waterBumpTexture, state, [
      ENGINE_RES.water,
    ]);
  }

  function renderChunks(
    passEncoder: GPURenderPassEncoder,
    key: string,
    chunks: GPUVoxelGeom[],
    descriptor: typeof commandDescriptor,
    bundleCache: BundleCache<typeof uniformType>,
  ) {
    if (!chunks.length) {
      return;
    }
    const cache = bundleCache.getBundleCache(
      key,
      chunks.length,
      descriptor,
      undefined,
      (props, idx) => {
        const { vertBuffer, indexBufferDescriptor, count } = chunks[idx];
        if (!vertBuffer) {
          return;
        }
        props.count = count;
        props.indexBuffer = indexBufferDescriptor || undefined;

        if (props.vertBuffers) {
          props.vertBuffers[0] = vertBuffer;
        }
      },
    );
    if (!cache) {
      return;
    }

    for (let i = 0; i < chunks.length; i++) {
      const { index } = chunks[i];
      vec3.copy(cache.uniformStructs[i].chunkId, index);
    }
    bundleCache.updateUniform(cache.uniforms);
    passEncoder.executeBundles([cache.bundle]);
  }

  function renderVoxelsForward(
    state: GameClientState,
    passEncoder: GPURenderPassEncoder,
  ) {
    if (!state.gpu.voxel.commonGroup) {
      return;
    }
    commandDescriptor.groups[0] = state.gpu.voxel.commonGroup;

    // parallaxChunks为离摄像机较近的地形块，在原本的pbr方案中需要做视差贴图
    // 现在没有pbr了，两组chunks数据合并一起渲染即可
    const {
      parallaxChunks,
      noParallaxChunks,
      parallaxChunksKey,
      noParallaxChunksKey,
    } = state.gpuVoxelMesh;

    renderChunks(
      passEncoder,
      `${parallaxChunksKey}${noParallaxChunksKey}`,
      parallaxChunks.concat(noParallaxChunks),
      commandDescriptor,
      bundleCache,
    );
  }

  function alphaPass(
    state: GameClientState,
    passEncoder: GPURenderPassEncoder,
  ) {
    if (
      !state.gpu.voxel.commonTransparentGroup ||
      !state.gpu.voxel.fluidCommonGroup
    ) {
      return;
    }
    alphaCommandDescriptor.groups[0] = state.gpu.voxel.commonTransparentGroup;
    fluidCommandDescriptor.groups[0] = state.gpu.voxel.fluidCommonGroup;

    const {
      alphaParallaxChunks,
      alphaNoParallaxChunks,
      fluidChunks,
      alphaParallaxChunksKey,
      alphaNoParallaxChunksKey,
      fluidChunksKey,
    } = state.gpuVoxelMesh;

    renderChunks(
      passEncoder,
      `${alphaParallaxChunksKey}${alphaNoParallaxChunksKey}`,
      alphaParallaxChunks.concat(alphaNoParallaxChunks),
      alphaCommandDescriptor,
      alphaBundleCache,
    );

    renderChunks(
      passEncoder,
      fluidChunksKey,
      fluidChunks,
      fluidCommandDescriptor,
      fluidBundleCache,
    );
  }

  function shadow(
    state: GameClientState,
    passEncoder: GPURenderPassEncoder,
    shadowFrustum: Frustum,
    idx: number,
  ) {
    if (!shadowCommandDescriptor) {
      return;
    }
    renderVoxelsShadow(state.environment, state.gpuVoxelMesh, shadowFrustum);
    const { shadowChunks, shadowChunksKey } = state.gpuVoxelMesh;

    renderChunks(
      passEncoder,
      `${idx}${shadowChunksKey}`,
      shadowChunks,
      shadowCommandDescriptor,
      shadowBundleCache,
    );
  }

  return {
    init,
    update,
    setup: prepareVoxels,
    forward: renderVoxelsForward,
    hasAlpha: (state: GameClientState) => {
      const { alphaParallaxChunks, alphaNoParallaxChunks, fluidChunks } =
        state.gpuVoxelMesh;

      return (
        !!alphaParallaxChunks.length ||
        !!alphaNoParallaxChunks.length ||
        !!fluidChunks.length
      );
    },
    alpha: alphaPass,
    shadow,
    clear: () => {
      bundleCache.clearPool();
      alphaBundleCache.clearPool();
      fluidBundleCache.clearPool();
      shadowBundleCache.clearPool();
    },
  };
}
