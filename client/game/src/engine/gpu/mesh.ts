import type {
  ReWGPU,
  IREWGPUBuffer,
  IndexBufferDescriptor,
  IREWGPUGroup,
  PipelineDescriptor,
} from '@box/rewgpu';
import { mat4 } from 'gl-matrix';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { GameClientState } from '../game-client-schema';
import struct from './wgsl/model-struct.wgsl';
import vert from './wgsl/model-vert.wgsl';
import frag from './wgsl/model-frag.wgsl';
import alphaFrag from './wgsl/model-alpha-frag.wgsl';
import modelOutlineStruct from './wgsl/model-outline-struct.wgsl';
import modelOutlineVert from './wgsl/model-outline-vert.wgsl';
import shadowStruct from './wgsl/shadow-struct.wgsl';
import modelShadowStruct from './wgsl/model-shadow-struct.wgsl';
import modelShadowVert from './wgsl/model-shadow-vert.wgsl';
import sampleShadow from './wgsl/sample-shadow.wgsl';
import sampleBakeShadow from './wgsl/sample-baked-shadows.wgsl';

import { GPUMeshInstanceListDict } from '../mesh/gpu-controller/gpu-mesh-schema';
import {
  LIGHT_PROBE,
  MAT3X3F32,
  MAT4X4F32,
  VEC3F,
  VEC4F,
  updateLightProbeStruct,
  UniformStructF32,
  mat3x3fromMat3,
  F32,
} from './uniform-pool';

import pbr from './wgsl/pbr.wgsl';

import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import postOut from './wgsl/post-out.wgsl';
import oitStorePixels from './wgsl/oit-store-pixels.wgsl';
import { BundleCache } from './render-bundle';

enum PipelineKey {
  VOXELS = 0,
  GLTF = 1,
}
type PipelinesDict = Record<number, GPURenderPipeline>;

export function gpuMesh(
  rewgpu: ReWGPU,
  commonUniformLayout: CommonUniformLayout,
) {
  const nodesGroupLayout = rewgpu.createBindGroupLayout({
    label: 'mesh:nodesGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: 'read-only-storage',
        },
      },
    ],
  });

  const nodesTextureGroupLayout = rewgpu.createBindGroupLayout({
    label: 'mesh:nodesTextureGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      {
        binding: 3,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
    ],
  });

  const modelGroupLayout = rewgpu.createBindGroupLayout({
    label: 'mesh:modelGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {
          type: 'uniform',
          hasDynamicOffset: true,
        },
      },
    ],
  });

  const commonGroupLayout = rewgpu.createBindGroupLayout({
    label: 'mesh:forward:commonGroup:layout',
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

  const alphaGroupLayout = rewgpu.createBindGroupLayout({
    label: 'mesh:transparentForward:commonGroup:layout',
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

  const pipelineLayout = rewgpu.createPipelineLayout({
    label: 'mesh:forward:layout',
    bindGroupLayouts: [
      commonGroupLayout,
      modelGroupLayout,
      nodesTextureGroupLayout,
    ],
  });

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

  const overrideConstants = {
    IS_GLTF: PipelineKey.VOXELS,
  };

  const pipelineDescriptor: PipelineDescriptor = {
    label: 'mesh:forward',
    layout: pipelineLayout,
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
      constants: overrideConstants,
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: 4 * 1,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'unorm8x4',
            },
          ],
        },
        {
          arrayStride: 1 * 4,
          attributes: [
            {
              shaderLocation: 1,
              offset: 0,
              format: 'uint32',
            },
          ],
        },
        {
          arrayStride: 2 * 4,
          attributes: [
            {
              shaderLocation: 2,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
        {
          arrayStride: 3 * 4,
          attributes: [
            {
              shaderLocation: 3,
              offset: 0,
              format: 'float32x3',
            },
          ],
        },
        {
          arrayStride: 4 * 4,
          attributes: [
            {
              shaderLocation: 4,
              offset: 0,
              format: 'float32x4',
            },
          ],
        },
      ],
      constants: overrideConstants,
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

  overrideConstants.IS_GLTF = PipelineKey.GLTF;
  const gltfPipeline = rewgpu.createPipeline(pipelineDescriptor);

  const pipelinesDict: PipelinesDict = {
    [PipelineKey.VOXELS]: pipeline,
    [PipelineKey.GLTF]: gltfPipeline,
  };

  pipelineDescriptor.label = 'mesh:transparentForward';
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
  pipelineDescriptor.layout = rewgpu.createPipelineLayout({
    label: 'mesh:transparentForward:layout',
    bindGroupLayouts: [
      alphaGroupLayout,
      modelGroupLayout,
      nodesTextureGroupLayout,
    ],
  });
  overrideConstants.IS_GLTF = PipelineKey.VOXELS;
  const alphaPipeline = rewgpu.createPipeline(pipelineDescriptor);

  overrideConstants.IS_GLTF = PipelineKey.GLTF;
  const gltfAlphaPipeline = rewgpu.createPipeline(pipelineDescriptor);

  const alphaPipelinesDict: PipelinesDict = {
    [PipelineKey.VOXELS]: alphaPipeline,
    [PipelineKey.GLTF]: gltfAlphaPipeline,
  };

  const shadowOutlinePipelineDes: PipelineDescriptor = {
    struct: modelOutlineStruct,
    vert: {
      entryPoint: 'vertMain',
      content: modelOutlineVert,
      buffers: [
        {
          arrayStride: 4 * 1,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'unorm8x4',
            },
          ],
        },
        {
          arrayStride: 1 * 4,
          attributes: [
            {
              shaderLocation: 1,
              offset: 0,
              format: 'uint32',
            },
          ],
        },
        {
          arrayStride: 4 * 4,
          attributes: [
            {
              shaderLocation: 2,
              offset: 0,
              format: 'float32x4',
            },
          ],
        },
      ],
      constants: overrideConstants,
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

  const outlineCommonLayout = rewgpu.createBindGroupLayout({
    label: 'mesh:outline:commonGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {},
      },
    ],
  });
  const outlineBufferData = new UniformStructF32({
    viewProj: MAT4X4F32,
  });

  shadowOutlinePipelineDes.label = 'mesh:outlineForward';
  shadowOutlinePipelineDes.layout = rewgpu.createPipelineLayout({
    label: 'mesh:outlineForward:layout',
    bindGroupLayouts: [outlineCommonLayout, modelGroupLayout, nodesGroupLayout],
  });

  overrideConstants.IS_GLTF = PipelineKey.VOXELS;
  const outlinePipeline = rewgpu.createPipeline(shadowOutlinePipelineDes);

  overrideConstants.IS_GLTF = PipelineKey.GLTF;
  const gltfOutlinePipeline = rewgpu.createPipeline(shadowOutlinePipelineDes);

  const outlinePipelinesDict: PipelinesDict = {
    [PipelineKey.VOXELS]: outlinePipeline,
    [PipelineKey.GLTF]: gltfOutlinePipeline,
  };

  const uniformType = {
    matrix: MAT4X4F32,
    normalMat: MAT3X3F32,
    lo: VEC3F,
    hi: VEC3F,
    ambientLight: LIGHT_PROBE,
    colorMod: VEC4F,
    pbrMod: VEC3F,
  };
  const matrixUniformType = {
    matrix: MAT4X4F32,
  };

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

  const outlineCommandDescriptor = {
    pipeline: outlinePipeline,
    count: 0,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
    indexBuffer: <IndexBufferDescriptor | undefined>undefined,
  };

  const bundleCache = new BundleCache(rewgpu, modelGroupLayout, uniformType, 1);
  const bundleCacheMotion = new BundleCache(
    rewgpu,
    modelGroupLayout,
    uniformType,
    1,
  );
  const alphaBundleCache = new BundleCache(
    rewgpu,
    modelGroupLayout,
    uniformType,
    1,
  );
  const alphaBundleCacheMotion = new BundleCache(
    rewgpu,
    modelGroupLayout,
    uniformType,
    1,
  );

  const shadowBundleCache = new BundleCache(
    rewgpu,
    modelGroupLayout,
    matrixUniformType,
    1,
    [],
  );
  const shadowBundleCacheMotion = new BundleCache(
    rewgpu,
    modelGroupLayout,
    matrixUniformType,
    1,
    [],
  );

  const outlineBundleCache = new BundleCache(
    rewgpu,
    modelGroupLayout,
    matrixUniformType,
    1,
    [],
  );

  const renderMeshDict = (
    state: GameClientState,
    passEncoder: GPURenderPassEncoder,
    pass: GPUMeshInstanceListDict,
    descriptor: typeof commandDescriptor,
    pipelines: PipelinesDict,
    bundleCache: BundleCache<typeof uniformType>,
    motion: boolean = false,
  ) => {
    const hashes = Object.keys(pass);
    const bundles: GPURenderBundle[] = [];

    for (let i = 0; i < hashes.length; i++) {
      const hash = hashes[i];
      const meshes = pass[hash];

      if (!meshes.length) {
        continue;
      }
      const part = meshes[0].part;
      const {
        meshBuffer,
        idxBuffer,
        uvBuffer,
        count,
        indexBufferDescriptor,
        lox,
        loy,
        loz,
        hix,
        hiy,
        hiz,
        staticMatrixBuffer,
        staticAlphaBuffer,
        texture,
        nodesTextureGroup,
        normalsBuffer,
        isGLTF,
        positionsBuffer,
      } = part;

      if (
        !meshBuffer ||
        !idxBuffer ||
        !uvBuffer ||
        !indexBufferDescriptor ||
        !texture ||
        !nodesTextureGroup ||
        !normalsBuffer ||
        !positionsBuffer
      ) {
        continue;
      }

      descriptor.count = count;
      descriptor.indexBuffer = indexBufferDescriptor;

      descriptor.pipeline = pipelines[Number(isGLTF)];

      descriptor.vertBuffers[0] = meshBuffer;
      descriptor.vertBuffers[1] = idxBuffer;
      descriptor.vertBuffers[2] = uvBuffer;
      descriptor.vertBuffers[3] = normalsBuffer;
      descriptor.vertBuffers[4] = positionsBuffer;

      descriptor.groups[2] = nodesTextureGroup;

      const matrixSize = staticMatrixBuffer?.buffer?.size || 4;
      const alphaSize = staticAlphaBuffer?.buffer?.size || 4;

      const cache = bundleCache.getBundleCache(
        hash,
        meshes.length,
        descriptor,
        motion
          ? {
              groupIndex: 2,
              layout: nodesTextureGroupLayout,
              buffersDes: [
                {
                  size: matrixSize,
                  usage: GPUBufferUsage.STORAGE,
                },
                {
                  size: alphaSize,
                  usage: GPUBufferUsage.STORAGE,
                },
              ],
              resources: [state.gpu.sampler!, texture],
            }
          : undefined,
      );
      if (!cache) {
        continue;
      }

      for (let j = 0; j < meshes.length; j++) {
        const {
          matrixData,
          alphaData,
          model,
          normalMatrix,
          ambient,
          red,
          green,
          blue,
          alpha,
          metalness,
          shininess,
          emissive,
        } = meshes[j];

        // 更新动画数据
        if (matrixData && alphaData && cache.extraBuffers) {
          cache.extraBuffers[j].buffers[0].update(
            matrixData,
            0,
            0,
            matrixSize / Float32Array.BYTES_PER_ELEMENT,
          );
          cache.extraBuffers[j].buffers[1].update(
            alphaData,
            0,
            0,
            alphaSize / Float32Array.BYTES_PER_ELEMENT,
          );
        }

        const { matrix, normalMat, lo, hi, ambientLight, colorMod, pbrMod } =
          cache.uniformStructs[j];
        mat4.copy(matrix, model);

        mat3x3fromMat3(normalMat, normalMatrix);

        lo.set([lox, loy, loz]);
        hi.set([hix, hiy, hiz]);
        updateLightProbeStruct(ambientLight, ambient);
        colorMod.set([red, green, blue, alpha]);
        pbrMod.set([metalness, shininess, emissive]);
      }
      // 更新uniform
      bundleCache.updateUniform(cache.uniforms);
      bundles.push(cache.bundle);
    }
    passEncoder.executeBundles(bundles);
  };

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
    state.gpu.mesh.commonGroup?.destroy();
    state.gpu.mesh.commonGroup = rewgpu.group({
      label: 'mesh:commonGroup',
      layout: commonGroupLayout,
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
    });

    state.gpu.mesh.commonTransparentGroup?.destroy();
    state.gpu.mesh.commonTransparentGroup = rewgpu.group({
      label: 'mesh:commonTransparentGroup',
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
  }

  let shadowCommandDescriptor: typeof commandDescriptor | undefined;
  let shadowPipelinesDict: PipelinesDict | undefined;
  const initShadowPipeline = (state: GameClientState) => {
    if (
      !state.gpuShadow.shadowViewProjectionLayout ||
      !state.gpuShadow.shadowViewProjectionGroup
    ) {
      return;
    }

    shadowOutlinePipelineDes.label = 'mesh:shadowForward';
    shadowOutlinePipelineDes.struct = `${shadowStruct} ${modelShadowStruct}`;
    shadowOutlinePipelineDes.vert.content = modelShadowVert;
    shadowOutlinePipelineDes.layout = rewgpu.createPipelineLayout({
      label: 'mesh:shadowForward:layout',
      bindGroupLayouts: [
        state.gpuShadow.shadowViewProjectionLayout,
        modelGroupLayout,
        nodesGroupLayout,
      ],
    });
    overrideConstants.IS_GLTF = PipelineKey.VOXELS;
    const shadowPipeline = rewgpu.createPipeline(shadowOutlinePipelineDes);

    overrideConstants.IS_GLTF = PipelineKey.GLTF;
    const gltfShadowPipeline = rewgpu.createPipeline(shadowOutlinePipelineDes);

    shadowPipelinesDict = {
      [PipelineKey.VOXELS]: shadowPipeline,
      [PipelineKey.GLTF]: gltfShadowPipeline,
    };

    shadowCommandDescriptor = {
      pipeline: shadowPipeline,
      count: 0,
      vertBuffers: [],
      groups: [state.gpuShadow.shadowViewProjectionGroup],
      indexBuffer: undefined,
    };
  };

  const renderDepthDict = (
    passEncoder: GPURenderPassEncoder,
    pass: GPUMeshInstanceListDict,
    descriptor: typeof commandDescriptor,
    pipelines: PipelinesDict,
    bundleCache: BundleCache<typeof matrixUniformType>,
    keyPrefix: string = '',
    motion: boolean = false,
  ) => {
    const hashes = Object.keys(pass);
    const bundles: GPURenderBundle[] = [];

    for (let i = 0; i < hashes.length; i++) {
      const hash = hashes[i];
      const meshes = pass[hash];

      if (!meshes.length) {
        continue;
      }

      const {
        staticNodesGroup,
        staticMatrixBuffer,
        staticAlphaBuffer,
        meshBuffer,
        idxBuffer,
        positionsBuffer,
        count,
        indexBufferDescriptor,
        isGLTF,
      } = meshes[0].part;
      if (
        !meshBuffer ||
        !idxBuffer ||
        !indexBufferDescriptor ||
        !staticNodesGroup ||
        !positionsBuffer
      ) {
        continue;
      }

      descriptor.count = count;
      descriptor.indexBuffer = indexBufferDescriptor;

      descriptor.pipeline = pipelines[Number(isGLTF)];

      descriptor.vertBuffers[0] = meshBuffer;
      descriptor.vertBuffers[1] = idxBuffer;
      descriptor.vertBuffers[2] = positionsBuffer;

      descriptor.groups[2] = staticNodesGroup;

      const matrixSize = staticMatrixBuffer?.buffer?.size || 4;
      const alphaSize = staticAlphaBuffer?.buffer?.size || 4;

      const cache = bundleCache.getBundleCache(
        `${keyPrefix}${hash}`,
        meshes.length,
        descriptor,
        motion
          ? {
              groupIndex: 2,
              layout: nodesGroupLayout,
              buffersDes: [
                {
                  size: matrixSize,
                  usage: GPUBufferUsage.STORAGE,
                },
                {
                  size: alphaSize,
                  usage: GPUBufferUsage.STORAGE,
                },
              ],
            }
          : undefined,
      );
      if (!cache) {
        continue;
      }

      for (let j = 0; j < meshes.length; j++) {
        const { model, matrixData, alphaData } = meshes[j];
        // 更新动画数据
        if (matrixData && alphaData && cache.extraBuffers) {
          cache.extraBuffers[j].buffers[0].update(
            matrixData,
            0,
            0,
            matrixSize / Float32Array.BYTES_PER_ELEMENT,
          );
          cache.extraBuffers[j].buffers[1].update(
            alphaData,
            0,
            0,
            alphaSize / Float32Array.BYTES_PER_ELEMENT,
          );
        }
        const { matrix } = cache.uniformStructs[j];
        mat4.copy(matrix, model);
      }

      // 更新uniform
      bundleCache.updateUniform(cache.uniforms);
      bundles.push(cache.bundle);
    }
    passEncoder.executeBundles(bundles);
  };

  let outlineBuffer: IREWGPUBuffer | undefined;

  return {
    init: (
      state: GameClientState,
      commonUniformEntries: CommonUniformEntries,
    ) => {
      initCommonGroup(state, commonUniformEntries);

      state.gpu.mesh.nodesGroupLayout = nodesGroupLayout;
      state.gpu.mesh.nodesTextureGroupLayout = nodesTextureGroupLayout;

      initShadowPipeline(state);

      outlineBuffer = rewgpu.buffer({
        data: outlineBufferData.data,
        size: outlineBufferData.data.byteLength,
        usage: GPUBufferUsage.UNIFORM,
      });
      const outlineCommonGroup = rewgpu.group({
        label: 'mesh:outline:commonGroup',
        layout: outlineCommonLayout,
        entries: [
          {
            binding: 0,
            resource: outlineBuffer,
          },
        ],
      });

      outlineCommandDescriptor.groups[0] = outlineCommonGroup;
    },
    update: (
      state: GameClientState,
      commonUniformEntries: CommonUniformEntries,
    ) => {
      if (
        state.gpu.targetSizeDirty ||
        state.gpuShadow.shadowMapDirty ||
        state.gpuShadow.bakedShadowMapDirty
      ) {
        initCommonGroup(state, commonUniformEntries);
        bundleCache.clearBundleCache();
        bundleCacheMotion.clearBundleCache();
        alphaBundleCache.clearBundleCache();
        alphaBundleCacheMotion.clearBundleCache();
      }
    },
    forwardDict: (
      state: GameClientState,
      passEncoder: GPURenderPassEncoder,
      pass: GPUMeshInstanceListDict,
      motionPass: GPUMeshInstanceListDict,
    ) => {
      if (!state.gpu.mesh.commonGroup) {
        return;
      }
      commandDescriptor.groups[0] = state.gpu.mesh.commonGroup;
      renderMeshDict(
        state,
        passEncoder,
        pass,
        commandDescriptor,
        pipelinesDict,
        bundleCache,
      );
      renderMeshDict(
        state,
        passEncoder,
        motionPass,
        commandDescriptor,
        pipelinesDict,
        bundleCacheMotion,
        true,
      );
    },
    transparentForwardDict: (
      state: GameClientState,
      passEncoder: GPURenderPassEncoder,
      pass: GPUMeshInstanceListDict,
      motionPass: GPUMeshInstanceListDict,
    ) => {
      if (!state.gpu.mesh.commonTransparentGroup) {
        return;
      }
      alphaCommandDescriptor.groups[0] = state.gpu.mesh.commonTransparentGroup;
      renderMeshDict(
        state,
        passEncoder,
        pass,
        alphaCommandDescriptor,
        alphaPipelinesDict,
        alphaBundleCache,
      );
      renderMeshDict(
        state,
        passEncoder,
        motionPass,
        alphaCommandDescriptor,
        alphaPipelinesDict,
        alphaBundleCacheMotion,
        true,
      );
    },
    shadowDict: (
      state: GameClientState,
      passEncoder: GPURenderPassEncoder,
      pass: GPUMeshInstanceListDict,
      motionPass: GPUMeshInstanceListDict,
      idx: number,
    ) => {
      if (!shadowCommandDescriptor || !shadowPipelinesDict) {
        return;
      }

      renderDepthDict(
        passEncoder,
        pass,
        shadowCommandDescriptor,
        shadowPipelinesDict,
        shadowBundleCache,
        `${idx}`,
      );
      renderDepthDict(
        passEncoder,
        motionPass,
        shadowCommandDescriptor,
        shadowPipelinesDict,
        shadowBundleCacheMotion,
        `${idx}`,
        true,
      );
    },
    outlineDict: (
      state: GameClientState,
      passEncoder: GPURenderPassEncoder,
      pass: GPUMeshInstanceListDict,
    ) => {
      if (!outlineBuffer || !Object.keys(pass).length) {
        return;
      }
      mat4.copy(outlineBufferData.struct.viewProj, state.camera.viewProjection);
      outlineBuffer.update(outlineBufferData.data);
      renderDepthDict(
        passEncoder,
        pass,
        outlineCommandDescriptor,
        outlinePipelinesDict,
        outlineBundleCache,
      );
    },
    clear: () => {
      bundleCache.clearPool();
      bundleCacheMotion.clearPool();
      alphaBundleCache.clearPool();
      alphaBundleCacheMotion.clearPool();
      shadowBundleCache.clearPool();
      shadowBundleCacheMotion.clearPool();
      outlineBundleCache.clearPool();
    },
  };
}
