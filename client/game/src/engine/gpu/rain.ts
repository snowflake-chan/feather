import type { ReWGPU, IREWGPUBuffer, IREWGPUGroup } from '@box/rewgpu';
import { vec2, vec3, vec4 } from 'gl-matrix';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { GameClientState } from '../game-client-schema';
import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import postOut from './wgsl/post-out.wgsl';
import struct from './wgsl/rain-struct.wgsl';
import vert from './wgsl/rain-vert.wgsl';
import frag from './wgsl/rain-frag.wgsl';
import { F32, UniformStructF32, VEC2F, VEC3F, VEC4F } from './uniform-pool';

const MAX_PARTICLES = 1e5;
const DENSITY_BASE = 0.01;
const MAX_LENGTH = 1000;

function getVelocity(out: vec3, dir: any, speed: number) {
  vec3.normalize(out, [dir.x, dir.y, dir.z]);
  vec3.scale(out, out, speed);
  return out;
}

export function gpuRain(
  rewgpu: ReWGPU,
  commonUniformLayout: CommonUniformLayout,
) {
  const pipeline = rewgpu.createPipeline({
    label: 'rain-forward',
    struct: `
    ${commonUniformLayout.structCode}

    ${fog}
    ${toneMapping}
    ${postOut}

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
          arrayStride: 4 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x4',
            },
          ],
        },
      ],
    },
    primitive: {
      topology: 'line-list',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const rainData = new Float32Array(MAX_PARTICLES * 8);
  for (let i = 0; i < rainData.length; i += 8) {
    for (let j = 0; j < 3; ++j) {
      rainData[i + j] = rainData[i + j + 4] = Math.random() * MAX_LENGTH;
    }
    rainData[i + 3] = 0;
    rainData[i + 7] = Math.random() * MAX_LENGTH;
  }

  const rainUniform = new UniformStructF32({
    time: F32,
    velocity: VEC3F,
    positionRange: VEC3F,
    interference: F32,
    rainLength: VEC2F,
    color: VEC4F,
  });

  const commandDescriptor = {
    pipeline,
    count: 0,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
  };
  const command = rewgpu.createCommand(commandDescriptor);

  function update(state: GameClientState) {
    if (
      !state.gpu.emptyTexture ||
      !state.gpu.sampler ||
      !state.gpuVoxelMesh.terrainTexDirty
    ) {
      return;
    }
    commandDescriptor.groups[1]?.destroy();
    commandDescriptor.groups[1] = rewgpu.group({
      label: 'rain:terrainGroup',
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource:
            state.gpuVoxelMesh.terrainHeightTex || state.gpu.emptyTexture,
        },
        {
          binding: 1,
          resource: state.gpu.sampler,
        },
      ],
    });
  }

  let rainUniformBuffer: IREWGPUBuffer | undefined;

  return {
    init: (commonUniformEntries: CommonUniformEntries) => {
      rainUniformBuffer = rewgpu.buffer({
        label: 'rainUniformBuffer',
        data: rainUniform.data,
        size: rainUniform.data.byteLength,
        usage: GPUBufferUsage.UNIFORM,
      });

      commandDescriptor.vertBuffers[0] = rewgpu.buffer({
        size: rainData.byteLength,
        data: rainData,
        usage: GPUBufferUsage.VERTEX,
      });
      commandDescriptor.groups[0] = rewgpu.group({
        label: 'rain:commonGroup',
        entries: [
          ...commonUniformEntries.entries,
          {
            binding: commonUniformEntries.entries.length,
            resource: rainUniformBuffer,
          },
        ],
        layout: pipeline.getBindGroupLayout(0),
      });
    },
    update,
    draw: (state: GameClientState, passEncoder: GPURenderPassEncoder) => {
      if (!rainUniformBuffer) {
        return;
      }
      const n = Math.round(
        state.voxel.shape[0] *
          state.voxel.shape[1] *
          state.voxel.shape[2] *
          state.environmentParams.rain.density *
          DENSITY_BASE,
      );
      if (n > 0) {
        commandDescriptor.count = Math.min(
          MAX_PARTICLES,
          Math.round(
            state.voxel.shape[0] *
              state.voxel.shape[1] *
              state.voxel.shape[2] *
              state.environmentParams.rain.density *
              DENSITY_BASE,
          ),
        );

        rainUniform.struct.time[0] = state.clock.tick;
        getVelocity(
          rainUniform.struct.velocity,
          state.environmentParams.rain.direction,
          state.environmentParams.rain.speed,
        );
        vec3.set(rainUniform.struct.positionRange, ...state.voxel.shape);
        rainUniform.struct.interference[0] =
          state.environmentParams.rain.interference;
        const size = state.environmentParams.rain.size;
        vec2.set(
          rainUniform.struct.rainLength,
          size.w,
          Math.max(0.0001, size.h - size.w),
        );
        const color = state.environmentParams.rain.color;
        vec4.set(rainUniform.struct.color, color.r, color.g, color.b, color.a);

        rainUniformBuffer.update(rainUniform.data);

        command(passEncoder);
      }
    },
  };
}
