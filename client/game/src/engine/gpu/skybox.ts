import type { ReWGPU, IREWGPUGroup } from '@box/rewgpu';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { GameClientState } from '../game-client-schema';
import { initCube, initTexture, updateTexture } from './texture';
import { ENGINE_RES } from '../../resource/engine';
import triangle from './wgsl/triangle-pos.wgsl';
import scatter from './wgsl/atmosphere-scatter.wgsl';
import ambientSky from './wgsl/ambient-sky.wgsl';
import atmosphere from './wgsl/atmosphere.wgsl';
import struct from './wgsl/sky-struct.wgsl';
import vert from './wgsl/sky-vert.wgsl';
import frag from './wgsl/sky-frag.wgsl';
import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import postOut from './wgsl/post-out.wgsl';

export function gpuSkybox(
  rewgpu: ReWGPU,
  commonUniformLayout: CommonUniformLayout,
) {
  const pipeline = rewgpu.createPipeline({
    label: 'sky:render-forward',
    struct: `
    ${commonUniformLayout.structCode}

    ${fog}
    ${toneMapping}
    ${postOut}

    ${struct}
    ${triangle}
    `,
    frag: {
      content: `
      ${frag}
      ${scatter}
      ${ambientSky}
      ${atmosphere}
      `,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
    primitive: {
      topology: 'triangle-list',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const commandDescriptor = {
    pipeline,
    count: 3,
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
      label: 'skybox:commonGroup',
      layout: pipeline.getBindGroupLayout(0),
      entries: commonUniformEntries.entries,
    });
    commandDescriptor.groups[0] = commonGroup;
    const skyGroup = rewgpu.group({
      label: 'skybox:group',
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: state.gpu.linearRepeatSampler,
        },
        {
          binding: 1,
          resource: initTexture(state.gpuSky.nightSampler, rewgpu),
        },
        {
          binding: 2,
          resource: initCube(state.gpuSky.cloudSamplerCube, rewgpu, 1024),
        },
      ],
    });
    commandDescriptor.groups[1] = skyGroup;
  }

  function update(state: GameClientState) {
    updateTexture(state.gpuSky.nightSampler, state, [ENGINE_RES.sky.stars]);
    updateTexture(state.gpuSky.cloudSamplerCube, state, [
      ENGINE_RES.sky.cloud_px,
      ENGINE_RES.sky.cloud_nx,
      ENGINE_RES.sky.cloud_py,
      ENGINE_RES.sky.cloud_ny,
      ENGINE_RES.sky.cloud_pz,
      ENGINE_RES.sky.cloud_nz,
    ]);
  }

  return {
    init,
    update,
    sky: command,
  };
}
