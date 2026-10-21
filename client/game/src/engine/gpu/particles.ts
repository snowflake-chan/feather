import type { IREWGPUBuffer, IREWGPUGroup, ReWGPU } from '@box/rewgpu';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { GameClientState } from '../game-client-schema';
import { initTexture, updateTexture } from './texture';
import { ENGINE_RES } from '../../resource/engine';
import struct from './wgsl/particle-struct.wgsl';
import vert from './wgsl/particle-vert.wgsl';
import frag from './wgsl/particle-frag.wgsl';
import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import postOut from './wgsl/post-out.wgsl';
import { createUniformPool, MAT4X4F32, VEC4F } from './uniform-pool';
import { mat4 } from 'gl-matrix';

const TEMP_MAT4 = mat4.create();

export function gpuParticles(
  rewgpu: ReWGPU,
  commonUniformLayout: CommonUniformLayout,
) {
  const pipeline = rewgpu.createPipeline({
    label: 'particles',
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
          arrayStride: 8 * 4,
          stepMode: 'instance',
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x4',
            },
            {
              shaderLocation: 1,
              offset: 16,
              format: 'float32x4',
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

  const commandDescriptor = {
    pipeline,
    count: 6,
    instanceCount: 0,
    firstInstance: 0,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
  };

  const command = rewgpu.createCommand(commandDescriptor);

  function init(
    state: GameClientState,
    commonUniformEntries: CommonUniformEntries,
  ) {
    if (!state.gpu.linearRepeatSampler) {
      return;
    }

    const commonGroup = rewgpu.group({
      label: 'particles:commonGroup',
      layout: pipeline.getBindGroupLayout(0),
      entries: commonUniformEntries.entries,
    });

    commandDescriptor.groups[0] = commonGroup;

    const particlesGroup = rewgpu.group({
      label: 'particles:group',
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: state.gpu.linearRepeatSampler,
        },
        {
          binding: 1,
          resource: initTexture(state.gpuParticles.noiseSampler, rewgpu),
        },
      ],
    });
    commandDescriptor.groups[1] = particlesGroup;
  }

  function update(state: GameClientState) {
    updateTexture(state.gpuParticles.noiseSampler, state, [
      ENGINE_RES.sky.perlin,
    ]);
  }

  const pool = createUniformPool(rewgpu, pipeline.getBindGroupLayout(2), {
    colorSize: {
      align: 16,
      size: 16 * 5,
    },
    forceNoise: VEC4F,
    miscVector: VEC4F,
    targetVector: VEC4F,
    matrix: MAT4X4F32,
  });

  return {
    init,
    update,
    draw: (state: GameClientState, passEncoder: GPURenderPassEncoder) => {
      if (!state.gpuParticles.particleBuffer) {
        return;
      }

      if (state.particles.particleGroups.length > 0) {
        // matrix让粒子一直朝向摄像机
        mat4.fromQuat(TEMP_MAT4, state.camera.rotation);
        mat4.invert(TEMP_MAT4, TEMP_MAT4);
        commandDescriptor.vertBuffers[0] = state.gpuParticles.particleBuffer;

        const unis = pool.allocUniform(state.particles.particleGroups.length);
        for (let i = 0; i < state.particles.particleGroups.length; i++) {
          const group = state.particles.particleGroups[i];

          if (!group.count) {
            continue;
          }

          commandDescriptor.instanceCount = group.count;
          commandDescriptor.firstInstance = group.offset;

          const uni = unis[i];
          uni.struct.colorSize.set([
            ...group.rgbSize0,
            ...group.rgbSize1,
            ...group.rgbSize2,
            ...group.rgbSize3,
            ...group.rgbSize4,
          ]);
          uni.struct.forceNoise.set(group.forceNoise);
          uni.struct.miscVector.set(group.miscVector);
          uni.struct.targetVector.set(group.targetVector);
          uni.struct.matrix.set(TEMP_MAT4);
          commandDescriptor.groups[2] = uni.group;

          command(passEncoder);
        }
        pool.updateUniform(unis);
        pool.freeUniform(unis);
      }

      if (state.particles.swapNeeded) {
        const backBuffer = state.gpuParticles.particleBackBuffer;
        state.gpuParticles.particleBackBuffer =
          state.gpuParticles.particleBuffer;
        state.gpuParticles.particleBuffer = backBuffer;

        const backGroups = state.particles.particleBackGroups;
        state.particles.particleBackGroups = state.particles.particleGroups;
        state.particles.particleGroups = backGroups;

        state.particles.swapNeeded = false;
      }
    },
    clear: () => {
      pool.destroy();
    },
  };
}
