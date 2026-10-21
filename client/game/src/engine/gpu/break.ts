import { vec2, vec3 } from 'gl-matrix';
import type {
  IREWGPUGroup,
  IREWGPUBuffer,
  IndexBufferDescriptor,
  ReWGPU,
  DrawCommand,
} from '@box/rewgpu';
import type { GameClientState } from '../game-client-schema';
import type { BreakEffect } from '../effect/effect-schema';
import { CommonUniformEntries } from './interface';
import {
  F32,
  LIGHT_PROBE,
  VEC2F,
  VEC3F,
  createUniformPool,
  updateLightProbeStruct,
} from './uniform-pool';
import mainStruct from './wgsl/main-struct.wgsl';
import breakStruct from './wgsl/break-struct.wgsl';
import breakVert from './wgsl/break-vert.wgsl';
import breakFrag from './wgsl/break-frag.wgsl';
import shadowStruct from './wgsl/shadow-struct.wgsl';
import breakShadowStruct from './wgsl/break-shadow-struct.wgsl';
import shadowVert from './wgsl/break-shadow-vert.wgsl';
import sampleShadow from './wgsl/sample-shadow.wgsl';

import pbr from './wgsl/pbr.wgsl';
import postOut from './wgsl/post-out.wgsl';
import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import { testFrustumBox } from '../utils/frustum';
import { testChunkVisibility } from '../voxel/voxel-controller';
import { Frustum } from '@box/schema/utils/frustum-schema';

const INSTANCE_NUM = 30;

export function gpuBreak(rewgpu: ReWGPU) {
  const attributeData: number[] = [];
  const elementData: number[] = [];

  let vertexCount = 0;
  for (let instanceId = 0; instanceId < INSTANCE_NUM; ++instanceId) {
    for (let faceId = 0; faceId < 6; ++faceId) {
      const base = vertexCount;
      elementData.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
      for (let du = -1; du <= 1; du += 2) {
        for (let dv = -1; dv <= 1; dv += 2) {
          attributeData.push(du, dv, faceId, instanceId);
          vertexCount += 1;
        }
      }
    }
  }

  const attributeBuffer = new Int8Array(attributeData);
  const elementBuffer = new Uint16Array(elementData);

  const commonGroupLayout = rewgpu.createBindGroupLayout({
    label: 'break:commonGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {},
      },
      // sampler
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      // colorAtlasTexture
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
      // materialAtlasTexture
      {
        binding: 3,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
      // shadowMap
      {
        binding: 4,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: 'float',
        },
      },
      // shadowBuffer
      {
        binding: 5,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {},
      },
    ],
  });

  const groupLayout = rewgpu.createBindGroupLayout({
    label: 'break:forward:group:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {},
      },
    ],
  });

  const pipelineLayout = rewgpu.createPipelineLayout({
    label: 'break:forward:layout',
    bindGroupLayouts: [commonGroupLayout, groupLayout],
  });

  const pipeline = rewgpu.createPipeline({
    label: 'break:forward',
    layout: pipelineLayout,
    struct: `
      ${mainStruct}
      ${pbr}
      ${fog}
      ${postOut}
      ${toneMapping}
      ${sampleShadow}
      ${breakStruct}`,
    vert: {
      content: breakVert,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'snorm8x4',
            },
          ],
        },
      ],
    },
    frag: {
      content: breakFrag,
      entryPoint: 'fragMain',
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

  const commandDescriptor = {
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
    indexBuffer: <IndexBufferDescriptor | undefined>undefined,
    pipeline,
    count: vertexCount,
  };

  const command = rewgpu.createCommand(commandDescriptor);

  const pool = createUniformPool(rewgpu, groupLayout, {
    animTick: F32,
    rand: VEC2F,
    pos: VEC3F,
    texCoordXPos: VEC2F,
    texCoordXNeg: VEC2F,
    texCoordYPos: VEC2F,
    texCoordYNeg: VEC2F,
    texCoordZPos: VEC2F,
    texCoordZNeg: VEC2F,
    probe: LIGHT_PROBE,
  });

  const breakEffectList: BreakEffect[] = [];

  const drawBreak = (
    passEncoder: GPURenderPassEncoder,
    list: BreakEffect[],
    descriptor: typeof commandDescriptor,
    draw: DrawCommand,
  ) => {
    const uniforms = pool.allocUniform(list.length);

    list.forEach((effect, idx) => {
      const uniform = uniforms[idx];

      uniform.struct.animTick[0] = effect.animTick;
      vec2.copy(uniform.struct.rand, effect.rand);
      vec3.copy(uniform.struct.pos, effect.position);
      vec2.copy(uniform.struct.texCoordXPos, effect.texCoordXPos);
      vec2.copy(uniform.struct.texCoordXNeg, effect.texCoordXNeg);
      vec2.copy(uniform.struct.texCoordYPos, effect.texCoordYPos);
      vec2.copy(uniform.struct.texCoordYNeg, effect.texCoordYNeg);
      vec2.copy(uniform.struct.texCoordZPos, effect.texCoordZPos);
      vec2.copy(uniform.struct.texCoordZNeg, effect.texCoordZNeg);
      updateLightProbeStruct(uniform.struct.probe, effect.probe);

      descriptor.groups[1] = uniform.group;

      draw(passEncoder);
    });

    pool.updateUniform(uniforms);
    pool.freeUniform(uniforms);
  };

  let shadowCommandDescriptor: typeof commandDescriptor | undefined;
  let shadowCommand: DrawCommand;
  const init = (state: GameClientState) => {
    const vertBuffer = rewgpu.buffer({
      data: attributeBuffer,
      size: attributeBuffer.byteLength,
      usage: GPUBufferUsage.VERTEX,
    });

    const indexDescriptor: IndexBufferDescriptor = {
      reBuffer: rewgpu.buffer({
        data: elementBuffer,
        size: elementBuffer.byteLength,
        usage: GPUBufferUsage.INDEX,
      }),
      indexFormat: 'uint16',
    };

    commandDescriptor.vertBuffers[0] = vertBuffer;
    commandDescriptor.indexBuffer = indexDescriptor;

    if (
      !state.gpuShadow.shadowViewProjectionLayout ||
      !state.gpuShadow.shadowViewProjectionGroup
    ) {
      return;
    }

    const shadowLayout = rewgpu.createPipelineLayout({
      label: 'break:shadow:layout',
      bindGroupLayouts: [
        state.gpuShadow.shadowViewProjectionLayout,
        groupLayout,
      ],
    });

    const shadowPipeline = rewgpu.createPipeline({
      label: 'break:shadow',
      layout: shadowLayout,
      struct: `
      ${shadowStruct}
      ${breakShadowStruct}
      `,
      vert: {
        content: shadowVert,
        entryPoint: 'vertMain',
        buffers: [
          {
            arrayStride: 4,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: 'snorm8x4',
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
      vertBuffers: [vertBuffer],
      groups: [state.gpuShadow.shadowViewProjectionGroup],
      indexBuffer: indexDescriptor,
      pipeline: shadowPipeline,
      count: vertexCount,
    };

    shadowCommand = rewgpu.createCommand(shadowCommandDescriptor);
  };

  let colorAtlasRadius = -1;
  let materialAtlasRadius = -1;

  const update = (
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) => {
    const { colorAtlasTexture, materialAtlasTexture } = state.gpuVoxelMesh;

    if (
      !colorAtlasTexture.texture ||
      !materialAtlasTexture.texture ||
      !state.gpu.sampler ||
      !state.gpu.emptyShadowTexture ||
      !state.gpu.emptyBuffer
    ) {
      return;
    }

    const textureDirty =
      colorAtlasRadius !== colorAtlasTexture.radius ||
      materialAtlasRadius !== materialAtlasTexture.radius;

    // 地形材质更新，或者阴影深度图更新，需要更新group
    if (textureDirty || state.gpuShadow.shadowMapDirty) {
      commandDescriptor.groups[0]?.destroy();

      const commonGroup = rewgpu.group({
        layout: commonGroupLayout,
        entries: [
          commonUniformEntries.entries[0],
          {
            binding: 1,
            resource: state.gpu.sampler,
          },
          {
            binding: 2,
            resource: colorAtlasTexture.texture,
          },
          {
            binding: 3,
            resource: materialAtlasTexture.texture,
          },
          {
            binding: 4,
            resource:
              state.gpuShadow.shadowMapTarget || state.gpu.emptyShadowTexture,
          },
          {
            binding: 5,
            resource: state.gpuShadow.shadowDataBuffer || state.gpu.emptyBuffer,
          },
        ],
      });

      commandDescriptor.groups[0] = commonGroup;

      colorAtlasRadius = colorAtlasTexture.radius;
      materialAtlasRadius = materialAtlasTexture.radius;
    }
  };

  const shadow = (
    state: GameClientState,
    passEncoder: GPURenderPassEncoder,
    shadowMapFrustum: Frustum,
    idx: number,
  ) => {
    if (
      !shadowCommandDescriptor ||
      !shadowCommand ||
      !state.effects.break.length
    ) {
      return;
    }

    breakEffectList.length = 0;
    for (let i = 0; i < state.effects.break.length; ++i) {
      const b = state.effects.break[i];
      const probe = b.probe;
      if (
        testFrustumBox(
          shadowMapFrustum,
          probe.lox,
          probe.loy,
          probe.loz,
          probe.hix,
          probe.hiy,
          probe.hiz,
        )
      ) {
        breakEffectList.push(b);
      }
    }
    if (breakEffectList.length > 0) {
      drawBreak(
        passEncoder,
        breakEffectList,
        shadowCommandDescriptor,
        shadowCommand,
      );
    }
  };

  const forward = (
    state: GameClientState,
    passEncoder: GPURenderPassEncoder,
  ) => {
    if (state.effects.break.length === 0 || !commandDescriptor.groups[0]) {
      return;
    }

    breakEffectList.length = 0;

    for (let i = 0; i < state.effects.break.length; ++i) {
      const b = state.effects.break[i];
      const probe = b.probe;
      if (
        testChunkVisibility(
          state,
          probe.lox,
          probe.loy,
          probe.loz,
          probe.hix,
          probe.hiy,
          probe.hiz,
        ) &&
        testFrustumBox(
          state.camera.frustum,
          probe.lox,
          probe.loy,
          probe.loz,
          probe.hix,
          probe.hiy,
          probe.hiz,
        )
      ) {
        breakEffectList.push(b);
      }

      if (breakEffectList.length > 0) {
        drawBreak(passEncoder, breakEffectList, commandDescriptor, command);
      }
    }
  };

  return {
    init,
    update,
    shadow,
    forward,
    clear: () => {
      pool.destroy();
    },
  };
}
