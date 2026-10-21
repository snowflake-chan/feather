import type { IREWGPUBuffer, IREWGPUGroup, ReWGPU } from '@box/rewgpu';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { GameClientState } from '../game-client-schema';
import { initTexture, updateTexture } from './texture';
import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import postOut from './wgsl/post-out.wgsl';
import struct from './wgsl/snow-struct.wgsl';
import oitStorePixels from './wgsl/oit-store-pixels.wgsl';
import vert from './wgsl/snow-vert.wgsl';
import frag from './wgsl/snow-frag.wgsl';
import {
  F32,
  MAT4X4F32,
  UniformStructF32,
  VEC2F,
  VEC3F,
  VEC4F,
} from './uniform-pool';

const DENSITY_BASE = 0.001;
const MAX_PARTICLES = 1e5;
const TICK_SCALE = 0.01;

export function gpuSnow(
  rewgpu: ReWGPU,
  commonUniformLayout: CommonUniformLayout,
) {
  const pipeline = rewgpu.createPipeline({
    label: 'snow-forward',
    struct: `
    ${commonUniformLayout.structCode}

    ${fog}
    ${toneMapping}
    ${postOut}

    ${oitStorePixels}

    ${struct}
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
          arrayStride: 8 * 1,
          stepMode: 'instance',
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
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const pointData = new Uint8Array(MAX_PARTICLES * 8);
  for (let i = 0; i < pointData.length; ++i) {
    pointData[i] = (Math.random() * 256) | 0;
  }

  const commandDescriptor = {
    pipeline,
    count: 6,
    instanceCount: 1,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
  };
  const command = rewgpu.createCommand(commandDescriptor);

  const snowUniform = new UniformStructF32({
    time: F32,
    positionRange: VEC3F,
    fallSpeed: F32,
    spinSpeed: F32,
    color: VEC4F,
    size: VEC2F,
    matrix: MAT4X4F32,
  });

  function initCommonGroup(
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) {
    commandDescriptor.groups[0]?.destroy();
    commandDescriptor.groups[0] = rewgpu.group({
      label: 'snow:commonGroup',
      entries: commonUniformEntries.getOITEntries(state),
      layout: pipeline.getBindGroupLayout(0),
    });
  }

  let snowUniformBuffer: IREWGPUBuffer | undefined;
  function init(
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) {
    initCommonGroup(state, commonUniformEntries);
    if (!state.gpu.sampler) {
      return;
    }

    const pointBuffer = rewgpu.buffer({
      size: pointData.byteLength,
      data: pointData,
      usage: GPUBufferUsage.VERTEX,
    });
    commandDescriptor.vertBuffers[0] = pointBuffer;

    snowUniformBuffer = rewgpu.buffer({
      label: 'snowUniformBuffer',
      data: snowUniform.data,
      size: snowUniform.data.byteLength,
      usage: GPUBufferUsage.UNIFORM,
    });
    const snowGroup = rewgpu.group({
      label: 'snow:group',
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: snowUniformBuffer,
        },
        {
          binding: 1,
          resource: state.gpu.sampler,
        },
        {
          binding: 2,
          resource: initTexture(state.gpuSky.snowTexture, rewgpu, 64),
        },
      ],
    });

    commandDescriptor.groups[1] = snowGroup;
  }

  function update(
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) {
    if (state.gpu.targetSizeDirty) {
      initCommonGroup(state, commonUniformEntries);
    }
    const url = state.environmentParams.snow.texture;
    if (url) {
      updateTexture(state.gpuSky.snowTexture, state, [url]);
    }

    if (state.gpuVoxelMesh.terrainTexDirty && state.gpu.emptyTexture) {
      commandDescriptor.groups[2]?.destroy();
      commandDescriptor.groups[2] = rewgpu.group({
        label: 'snow:terrainGroup',
        layout: pipeline.getBindGroupLayout(2),
        entries: [
          {
            binding: 0,
            resource:
              state.gpuVoxelMesh.terrainHeightTex || state.gpu.emptyTexture,
          },
        ],
      });
    }
  }

  return {
    init,
    update,
    hasSnow: (state: GameClientState) => {
      const n = Math.round(
        state.voxel.shape[0] *
          state.voxel.shape[1] *
          state.voxel.shape[2] *
          state.environmentParams.snow.density *
          DENSITY_BASE,
      );

      return (
        n > 0 &&
        !!state.environmentParams.snow.texture &&
        !!Math.max(
          state.environmentParams.snow.size.w,
          state.environmentParams.snow.size.h,
        )
      );
    },
    draw: (state: GameClientState, passEncoder: GPURenderPassEncoder) => {
      if (!snowUniformBuffer) {
        return;
      }
      commandDescriptor.instanceCount = Math.min(
        MAX_PARTICLES,
        Math.round(
          20 *
            state.voxel.shape[0] *
            state.voxel.shape[1] *
            state.voxel.shape[2] *
            state.environmentParams.snow.density *
            DENSITY_BASE,
        ),
      );
      const snow = state.environmentParams.snow;
      snowUniform.struct.time[0] = TICK_SCALE * state.clock.tick;
      snowUniform.struct.fallSpeed[0] = snow.fallSpeed;
      snowUniform.struct.spinSpeed[0] = snow.spinSpeed;
      // matrix让雪花一直朝向摄像机
      mat4.fromQuat(snowUniform.struct.matrix, state.camera.rotation);
      mat4.invert(snowUniform.struct.matrix, snowUniform.struct.matrix);

      vec3.set(snowUniform.struct.positionRange, ...state.voxel.shape);
      vec2.set(snowUniform.struct.size, snow.size.w, snow.size.h);
      vec4.set(
        snowUniform.struct.color,
        snow.color.r,
        snow.color.g,
        snow.color.b,
        snow.color.a,
      );

      snowUniformBuffer.update(snowUniform.data);

      command(passEncoder);
    },
  };
}
