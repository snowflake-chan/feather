// TODO 仅因体积散射没有被抽离，为了方便后续查找，所以保留这个文件，实际已经没有使用到了
// 如果体积散射还原了，可以把这个文件删除

import type {
  IREWGPUGroup,
  ReWGPU,
  GroupEntry,
  RenderDescriptor,
} from '@box/rewgpu';
import { prevPow2 } from 'bit-twiddle';
import { CommonUniforms } from './interface';
import { GameClientState } from '../game-client-schema';
import triangle from './wgsl/triangle-pos.wgsl';
import vert from './wgsl/trivial-vert.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import oitStruct from './wgsl/oit-struct.wgsl';
import oitFrag from './wgsl/oit-frag.wgsl';

import fxaaStruct from './wgsl/fxaa-struct.wgsl';
import fxaaFrag from './wgsl/fxaa-frag.wgsl';

import postprocessStruct from './wgsl/postprocess-struct.wgsl';
import postprocessFrag from './wgsl/postprocess-frag.wgsl';

import ssaoStruct from './wgsl/ssao-struct.wgsl';
import ssaoFrag from './wgsl/ssao-frag.wgsl';

import scatterStruct from './wgsl/scatter-struct.wgsl';
import scatterFrag from './wgsl/scatter-frag.wgsl';

import lut from './wgsl/lut.wgsl';

import {
  UniformStructF32,
  F32,
  VEC2F,
  createUniformPool,
  VEC3F,
} from './uniform-pool';
import { initTexture, updateTexture } from './texture';

const NUM_BLURS = 4;

const LUT_WIDTH = 256;
const LUT_HEIGHT = 16;

export function gpuPostprocess(rewgpu: ReWGPU, commonUniforms: CommonUniforms) {
  const renderTargetUniform = new UniformStructF32({
    gamma: F32,
    shape: VEC2F,
  });

  const renderTargetUniformBuffer = rewgpu.buffer({
    label: 'renderTargetUniform',
    data: renderTargetUniform.data,
    size: renderTargetUniform.data.byteLength,
    usage: GPUBufferUsage.UNIFORM,
    isDynamic: true,
  });

  const pipeline = rewgpu.createPipeline({
    label: 'postprocess',
    struct: `
    ${commonUniforms.structCode}

    ${triangle}
    ${toneMapping}
    ${lut}

    ${postprocessStruct}
    `,
    frag: {
      content: postprocessFrag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  const { data, struct } = new UniformStructF32({
    enabled: F32,
    ssao: F32,
    depthOfField: F32,
    playerDepth: F32,
    zNear: F32,
    zFar: F32,
    scattering: F32,
    screenLightPos: VEC3F,
    eyeFogExtinction: F32,
    bloom: F32,
    underwater: F32,
    /**
     * 当前渲染的帧的总数 * 0.01
     * 对应regl内部提供的context变量'tick'，The number of frames rendered
     */
    tick: F32,
    lutEnabled: F32,
  });

  const uniformBuffer = rewgpu.buffer({
    label: 'postprocessUniform',
    data,
    size: data.byteLength,
    usage: GPUBufferUsage.UNIFORM,
    isDynamic: true,
  });

  const EMPTY_TEXTURE = rewgpu.texture({
    size: [1],
    format: rewgpu.config.presentationFormat,
    usage: GPUTextureUsage.TEXTURE_BINDING,
  });

  const commonGroup = rewgpu.group({
    label: 'postprocess:commonGroup',
    entries: [
      ...commonUniforms.entries,
      {
        binding: commonUniforms.entries.length,
        resource: uniformBuffer,
      },
    ],
    layout: pipeline.getBindGroupLayout(0),
  });

  const commandDescriptor = {
    pipeline,
    count: 3,
    groups: [commonGroup],
  };
  const command = rewgpu.createCommand(commandDescriptor);

  const oitPipeline = rewgpu.createPipeline({
    label: 'oit',
    struct: `
    ${triangle}
    ${oitStruct}
    `,
    frag: {
      content: oitFrag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
  });

  const oitCommandDescriptor = {
    pipeline: oitPipeline,
    count: 3,
    groups: <IREWGPUGroup[]>[],
  };
  const oitCommand = rewgpu.createCommand(oitCommandDescriptor);

  function initOITBuffer(state: GameClientState) {
    if (
      !state.gpu.target ||
      !state.gpu.oitStaticNodeBuffer0 ||
      !state.gpu.oitOffsetBuffer0
    ) {
      return;
    }
    const { width, height } = rewgpu.canvas;

    state.gpuPostProcess.oitTarget?.destroy();
    state.gpuPostProcess.oitTarget = rewgpu.texture({
      size: [width, height],
      format: rewgpu.config.presentationFormat,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });

    state.gpuPostProcess.oitGroup?.destroy();
    state.gpuPostProcess.oitGroup = rewgpu.group({
      label: 'oit:group',
      layout: oitPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: state.gpu.target,
        },
        {
          binding: 1,
          resource: state.gpu.oitStaticNodeBuffer0,
        },
        {
          binding: 2,
          resource: state.gpu.oitOffsetBuffer0,
        },
      ],
    });
  }

  function drawOIT(state: GameClientState) {
    if (
      !state.gpuPostProcess.oitGroup ||
      !state.gpuPostProcess.oitTarget?.texture
    ) {
      return;
    }
    oitCommandDescriptor.groups[0] = state.gpuPostProcess.oitGroup;
    rewgpu.render(
      {
        colorAttachments: [
          {
            view: state.gpuPostProcess.oitTarget?.texture.createView(),
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      },
      oitCommand,
    );
  }

  const fxaaPipeline = rewgpu.createPipeline({
    label: 'fxaa',
    struct: `
    ${triangle}
    ${fxaaStruct}
    `,
    frag: {
      content: fxaaFrag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
  });

  const fxaaCommandDescriptor = {
    pipeline: fxaaPipeline,
    count: 3,
    groups: <IREWGPUGroup[]>[],
  };
  const fxaaCommand = rewgpu.createCommand(fxaaCommandDescriptor);

  function initFxaaBuffer(state: GameClientState) {
    if (!state.gpuPostProcess.oitTarget) {
      return;
    }
    const { width, height } = rewgpu.canvas;
    state.gpuPostProcess.fxaaTarget?.destroy();
    state.gpuPostProcess.fxaaTarget = rewgpu.texture({
      size: [width, height],
      format: rewgpu.config.presentationFormat,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });

    state.gpuPostProcess.fxaaGroup?.destroy();
    state.gpuPostProcess.fxaaGroup = rewgpu.group({
      label: 'fxaa:group',
      layout: fxaaPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: state.gpuPostProcess.oitTarget,
        },
      ],
    });
  }

  function updateFxaaBuffer(state: GameClientState) {
    if (!state.gpuPostProcess.fxaaTarget || !state.gpuPostProcess.fxaaGroup) {
      initFxaaBuffer(state);
      state.gpuPostProcess.groupDirty = true;
    }
  }

  function destroyFxaaBuffer(state: GameClientState) {
    if (state.gpuPostProcess.fxaaTarget) {
      state.gpuPostProcess.fxaaTarget.destroy();
      state.gpuPostProcess.fxaaTarget = null;
      state.gpuPostProcess.groupDirty = true;
    }

    if (state.gpuPostProcess.fxaaGroup) {
      state.gpuPostProcess.fxaaGroup.destroy();
      state.gpuPostProcess.fxaaGroup = null;
      state.gpuPostProcess.groupDirty = true;
    }
  }

  function drawFxaa(out: RenderDescriptor[], state: GameClientState) {
    if (
      state.gpuPostProcess.fxaaEnabled &&
      state.gpuPostProcess.fxaaGroup &&
      state.gpuPostProcess.fxaaTarget?.texture
    ) {
      fxaaCommandDescriptor.groups[0] = state.gpuPostProcess.fxaaGroup;
      out.push({
        renderPassDescriptor: {
          colorAttachments: [
            {
              view: state.gpuPostProcess.fxaaTarget.texture.createView(),
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        },
        draw: fxaaCommand,
      });
    }
  }

  const ssaoPipeline = rewgpu.createPipeline({
    label: 'ssao',
    struct: `
    ${triangle}
    ${ssaoStruct}
    `,
    frag: {
      content: ssaoFrag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
  });

  const ssaoCommandDescriptor = {
    pipeline: ssaoPipeline,
    count: 3,
    groups: <IREWGPUGroup[]>[],
  };
  const ssaoCommand = rewgpu.createCommand(ssaoCommandDescriptor);

  function initSSAOBuffer(state: GameClientState) {
    if (!state.gpu.depth || !state.gpu.transparentDepth) {
      return;
    }
    const { width, height } = rewgpu.canvas;
    state.gpuPostProcess.ssaoTarget?.destroy();
    state.gpuPostProcess.ssaoTarget = rewgpu.texture({
      size: [width, height],
      format: rewgpu.config.presentationFormat,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });

    state.gpuPostProcess.ssaoGroup?.destroy();
    state.gpuPostProcess.ssaoGroup = rewgpu.group({
      label: 'ssao:group',
      layout: ssaoPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: state.gpu.depth,
        },
        {
          binding: 1,
          resource: state.gpu.transparentDepth,
        },
      ],
    });
  }

  function updateSSAOBuffer(state: GameClientState) {
    if (!state.gpuPostProcess.ssaoTarget || !state.gpuPostProcess.ssaoGroup) {
      initSSAOBuffer(state);
      state.gpuPostProcess.groupDirty = true;
    }
  }

  function destroySSAOBuffer(state: GameClientState) {
    if (state.gpuPostProcess.ssaoTarget) {
      state.gpuPostProcess.ssaoTarget.destroy();
      state.gpuPostProcess.ssaoTarget = null;
      state.gpuPostProcess.groupDirty = true;
    }

    if (state.gpuPostProcess.ssaoGroup) {
      state.gpuPostProcess.ssaoGroup.destroy();
      state.gpuPostProcess.ssaoGroup = null;
      state.gpuPostProcess.groupDirty = true;
    }
  }

  function drawSSAO(out: RenderDescriptor[], state: GameClientState) {
    if (
      state.gpuPostProcess.ssaoEnabled &&
      state.gpuPostProcess.ssaoGroup &&
      state.gpuPostProcess.ssaoTarget &&
      state.gpuPostProcess.ssaoTarget.texture
    ) {
      ssaoCommandDescriptor.groups[0] = state.gpuPostProcess.ssaoGroup;
      out.push({
        renderPassDescriptor: {
          colorAttachments: [
            {
              view: state.gpuPostProcess.ssaoTarget.texture.createView(),
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        },
        draw: ssaoCommand,
      });
    }
  }

  const initializeBrightsPipeline = rewgpu.createPipeline({
    label: 'bloom:init',
    struct: `
    ${triangle}
    ${toneMapping}

    struct Uniform {
      gamma : f32,
      shape: vec2f,
    }
    
    @group(0) @binding(0) var<uniform> uni : Uniform;
    @group(1) @binding(0) var pixels : texture_2d<f32>;
    @group(1) @binding(1) var bloomSampler : sampler;
    `,
    frag: {
      content: `
      fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
        var color = textureSample(pixels, bloomSampler, position.xy / uni.shape).rgb;
        color = revertToneMapping(pow(color, vec3f(uni.gamma)));
        color = 0.5 * color;
        var bright = smoothstep(vec3f(1.0), vec3f(5.), color);
        var weight = max(max(bright.r, bright.g), bright.b) * ${
          1 / (NUM_BLURS - 1)
        };
        return vec4f(color * weight, 1.);
      }
      `,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
  });

  const initializeBrightsCommonGroup = rewgpu.group({
    layout: initializeBrightsPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: renderTargetUniformBuffer,
      },
    ],
  });

  const initializeBrightsCommandDescriptor = {
    pipeline: initializeBrightsPipeline,
    count: 3,
    groups: [initializeBrightsCommonGroup],
  };
  const initializeBrightsCommand = rewgpu.createCommand(
    initializeBrightsCommandDescriptor,
  );

  const downsamplePipeline = rewgpu.createPipeline({
    label: 'bloom:downsample',
    struct: `
    ${triangle}

    struct Uniform {
      shape: vec2f,
    }
    
    @group(0) @binding(0) var<uniform> uni : Uniform;
  
    @group(1) @binding(0) var pixels : texture_2d<f32>;
    @group(1) @binding(1) var bloomSampler : sampler;
    `,
    frag: {
      content: `
      fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
        var uv =  position.xy / uni.shape;
        var duv = 0.5 / uni.shape;
        var color = 4.0 * textureSample(pixels, bloomSampler, uv);
        color += textureSample(pixels, bloomSampler, uv + vec2f(duv.x, duv.y));
        color += textureSample(pixels, bloomSampler, uv + vec2f(-duv.x, duv.y));
        color += textureSample(pixels, bloomSampler, uv + vec2f(duv.x, -duv.y));
        color += textureSample(pixels, bloomSampler, uv + vec2f(-duv.x, -duv.y));
        return color / 8.0;
      }
      `,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
  });

  const downsampleCommandDescriptor = {
    pipeline: downsamplePipeline,
    count: 3,
    groups: <IREWGPUGroup[]>[],
  };
  const downsampleCommand = rewgpu.createCommand(downsampleCommandDescriptor);
  const downsampleUniformPool = createUniformPool(
    rewgpu,
    downsamplePipeline.getBindGroupLayout(0),
    {
      shape: VEC2F,
    },
  );

  const getBlursStruct = () => {
    let struct = ``;
    for (let i = 1; i < NUM_BLURS; i++) {
      struct += `@group(1) @binding(${i}) var blur${i} : texture_2d<f32>;\n`;
    }
    return struct;
  };

  const getBlursFrag = () => {
    let code = ``;
    for (let i = 1; i < NUM_BLURS; i++) {
      code += `
      duv *= 4.0;
      color = 4.0 * textureSample(blur${i}, bloomSampler, uv);
      color += textureSample(blur${i}, bloomSampler, uv + vec2f(duv.x, duv.y));
      color += textureSample(blur${i}, bloomSampler, uv + vec2f(-duv.x, duv.y));
      color += textureSample(blur${i}, bloomSampler, uv + vec2f(duv.x, -duv.y));
      color += textureSample(blur${i}, bloomSampler, uv + vec2f(-duv.x, -duv.y));
      result += color / 8.0;\n
      `;
    }
    return code;
  };

  const accumulateBloomPipeline = rewgpu.createPipeline({
    label: 'bloom:accumulate',
    struct: `
    ${triangle}

    struct Uniform {
      gamma : f32,
      shape: vec2f,
    }
    
    @group(0) @binding(0) var<uniform> uni : Uniform;

    @group(1) @binding(0) var bloomSampler : sampler;
    ${getBlursStruct()}
    `,
    frag: {
      content: `
      fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
        var result = vec4f(0.);
        var uv = position.xy / uni.shape;
        var duv = 0.5 / uni.shape;
        var color: vec4f;
        ${getBlursFrag()}
        return result;
      }
      `,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
  });

  const accumulateBloomCommonGroup = rewgpu.group({
    layout: accumulateBloomPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: renderTargetUniformBuffer,
      },
    ],
  });

  const accumulateBloomCommandDescriptor = {
    pipeline: accumulateBloomPipeline,
    count: 3,
    groups: [accumulateBloomCommonGroup],
  };
  const accumulateBloomCommand = rewgpu.createCommand(
    accumulateBloomCommandDescriptor,
  );

  const getBlursGroupEntries = (state: GameClientState) => {
    const entries: GroupEntry[] = [];
    for (let i = 1; i < NUM_BLURS; i++) {
      const buffer = state.gpuPostProcess.blurBuffers[i];
      if (!buffer) {
        continue;
      }
      entries.push({
        binding: i,
        resource: buffer,
      });
    }
    return entries;
  };

  function initBlurBuffer(state: GameClientState) {
    if (!state.gpuPostProcess.oitTarget || !state.gpu.linearSampler) {
      return;
    }
    const { width, height } = rewgpu.canvas;
    let targetWidth = prevPow2(width);
    let targetHeight = prevPow2(height);

    state.gpuPostProcess.blurShape[0] = targetWidth;
    state.gpuPostProcess.blurShape[1] = targetHeight;

    state.gpuPostProcess.blurBuffers.length = NUM_BLURS;
    state.gpuPostProcess.blurGroups.length = NUM_BLURS;
    for (let i = 0; i < NUM_BLURS; ++i) {
      state.gpuPostProcess.blurBuffers[i]?.destroy();
      state.gpuPostProcess.blurBuffers[i] = rewgpu.texture({
        size: [targetWidth, targetHeight],
        format: rewgpu.config.presentationFormat,
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });

      if (i === 0) {
        state.gpuPostProcess.blurGroups[i]?.destroy();
        state.gpuPostProcess.blurGroups[i] = rewgpu.group({
          layout: initializeBrightsPipeline.getBindGroupLayout(1),
          entries: [
            {
              binding: 0,
              resource: state.gpuPostProcess.oitTarget,
            },
            {
              binding: 1,
              resource: state.gpu.linearSampler,
            },
          ],
        });
      } else {
        const pixels = state.gpuPostProcess.blurBuffers[i - 1];
        if (pixels) {
          state.gpuPostProcess.blurGroups[i]?.destroy();
          state.gpuPostProcess.blurGroups[i] = rewgpu.group({
            layout: downsamplePipeline.getBindGroupLayout(1),
            entries: [
              {
                binding: 0,
                resource: pixels,
              },
              {
                binding: 1,
                resource: state.gpu.linearSampler,
              },
            ],
          });
        }
      }

      targetHeight = Math.max(
        1,
        Math.floor(targetHeight / state.gpuPostProcess.blurScale),
      );
      targetWidth = Math.max(
        1,
        Math.floor(targetWidth / state.gpuPostProcess.blurScale),
      );
    }

    state.gpuPostProcess.accumulateGroup?.destroy();
    state.gpuPostProcess.accumulateGroup = rewgpu.group({
      layout: accumulateBloomPipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: state.gpu.linearSampler,
        },
        ...getBlursGroupEntries(state),
      ],
    });
  }

  function updateBlurBuffers(state: GameClientState) {
    if (
      state.gpuPostProcess.blurBuffers.length ||
      state.gpuPostProcess.blurGroups.length
    ) {
      return;
    }
    initBlurBuffer(state);
    state.gpuPostProcess.groupDirty = true;
  }

  function destroyBlurBuffers(state: GameClientState) {
    if (state.gpuPostProcess.blurBuffers.length) {
      state.gpuPostProcess.blurBuffers.forEach((b) => b?.destroy());
      state.gpuPostProcess.blurBuffers.length = 0;
      state.gpuPostProcess.groupDirty = true;
    }

    if (state.gpuPostProcess.blurGroups.length) {
      state.gpuPostProcess.blurGroups.forEach((b) => b?.destroy());
      state.gpuPostProcess.blurGroups.length = 0;
      state.gpuPostProcess.groupDirty = true;
    }
  }

  function drawBloom(state: GameClientState) {
    if (!state.gpuPostProcess.blurEnabled) {
      return;
    }

    const renderDes: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: {} as any, // 后面每个renderPass都会给view重新赋值
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    renderTargetUniform.struct.gamma[0] = state.environment.gamma;

    renderTargetUniform.struct.shape[0] = state.gpuPostProcess.blurShape[0];
    renderTargetUniform.struct.shape[1] = state.gpuPostProcess.blurShape[1];
    if (
      state.gpuPostProcess.blurGroups[0] &&
      state.gpuPostProcess.blurBuffers[0]?.texture
    ) {
      initializeBrightsCommandDescriptor.groups[1] =
        state.gpuPostProcess.blurGroups[0];
      renderDes.colorAttachments[0].view =
        state.gpuPostProcess.blurBuffers[0].texture.createView();
      rewgpu.render(renderDes, initializeBrightsCommand);
    }

    const unis = downsampleUniformPool.allocUniform(NUM_BLURS - 1);
    for (let i = 1; i < NUM_BLURS; i++) {
      const group = state.gpuPostProcess.blurGroups[i];
      const textureView = state.gpuPostProcess.blurBuffers[i]?.texture;
      const uniform = unis[i - 1];
      if (!group || !textureView) {
        continue;
      }
      uniform.struct.shape[0] = textureView.width;
      uniform.struct.shape[1] = textureView.height;
      downsampleCommandDescriptor.groups[0] = uniform.group;
      downsampleCommandDescriptor.groups[1] = group;

      renderDes.colorAttachments[0].view = textureView.createView();
      rewgpu.render(renderDes, downsampleCommand);
    }
    downsampleUniformPool.updateUniform(unis);
    downsampleUniformPool.freeUniform(unis);

    if (
      state.gpuPostProcess.accumulateGroup &&
      state.gpuPostProcess.blurBuffers[0]?.texture
    ) {
      accumulateBloomCommandDescriptor.groups[1] =
        state.gpuPostProcess.accumulateGroup;

      renderDes.colorAttachments[0].view =
        state.gpuPostProcess.blurBuffers[0].texture.createView();
      rewgpu.render(renderDes, accumulateBloomCommand);
    }
  }

  const scatterPipeline = rewgpu.createPipeline({
    label: 'scatter',
    struct: `
    ${triangle}
    ${toneMapping}
    ${scatterStruct}
    `,
    frag: {
      content: scatterFrag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
  });

  const scatterCommonGroup = rewgpu.group({
    layout: scatterPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: renderTargetUniformBuffer,
      },
    ],
  });

  const scatterCommandDescriptor = {
    pipeline: scatterPipeline,
    count: 3,
    groups: [scatterCommonGroup],
  };
  const scatterCommand = rewgpu.createCommand(scatterCommandDescriptor);

  function initScatter(state: GameClientState) {
    if (
      !state.gpuPostProcess.scatteringEnabled ||
      !state.gpu.linearSampler ||
      !state.gpuPostProcess.oitTarget
    ) {
      return;
    }
    const { width, height } = rewgpu.canvas;
    const targetWidth = prevPow2(width / 8);
    const targetHeight = prevPow2(height / 8);
    state.gpuPostProcess.scatteringTarget?.destroy();
    state.gpuPostProcess.scatteringTarget = rewgpu.texture({
      label: 'scatter:renderTarget',
      size: [targetWidth, targetHeight],
      format: rewgpu.config.presentationFormat,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });

    state.gpuPostProcess.scatteringGroup?.destroy();
    state.gpuPostProcess.scatteringGroup = rewgpu.group({
      label: 'scatter:group',
      layout: scatterPipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: state.gpuPostProcess.oitTarget,
        },
        {
          binding: 1,
          resource: state.gpu.linearSampler,
        },
      ],
    });
  }

  function updateScatter(state: GameClientState) {
    if (state.gpuPostProcess.scatteringTarget) {
      return;
    }
    initScatter(state);
    state.gpuPostProcess.groupDirty = true;
  }

  function destroyScatter(state: GameClientState) {
    if (state.gpuPostProcess.scatteringTarget) {
      state.gpuPostProcess.scatteringTarget.destroy();
      state.gpuPostProcess.scatteringTarget = null;
      state.gpuPostProcess.groupDirty = true;
    }
    if (state.gpuPostProcess.scatteringGroup) {
      state.gpuPostProcess.scatteringGroup.destroy();
      state.gpuPostProcess.scatteringGroup = null;
      state.gpuPostProcess.groupDirty = true;
    }
  }

  function drawScatter(out: RenderDescriptor[], state: GameClientState) {
    if (
      state.gpuPostProcess.scatteringGroup &&
      state.gpuPostProcess.scatteringTarget &&
      state.gpuPostProcess.scatteringTarget.texture
    ) {
      renderTargetUniform.struct.gamma[0] = state.environment.gamma;

      renderTargetUniform.struct.shape[0] =
        state.gpuPostProcess.scatteringTarget.texture.width;
      renderTargetUniform.struct.shape[1] =
        state.gpuPostProcess.scatteringTarget.texture.height;

      scatterCommandDescriptor.groups[1] = state.gpuPostProcess.scatteringGroup;

      out.push({
        renderPassDescriptor: {
          colorAttachments: [
            {
              view: state.gpuPostProcess.scatteringTarget.texture.createView(),
              clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        },
        draw: scatterCommand,
      });
    }
  }

  const updateLUT = (state: GameClientState) => {
    const { lutTexture } = state.gpuPostProcess;

    if (!lutTexture.texture) {
      const texture = initTexture(lutTexture, rewgpu, [LUT_WIDTH, LUT_HEIGHT]);

      const lutData = new Uint8Array(LUT_WIDTH * LUT_HEIGHT * 4);

      // 填充默认数据，避免未加载完成图片影响渲染效果
      for (let r = 0; r < 16; ++r) {
        for (let g = 0; g < 16; ++g) {
          for (let b = 0; b < 16; ++b) {
            const ptr = 4 * (r + 16 * b + 256 * g);
            lutData[ptr] = r * 16;
            lutData[ptr + 1] = g * 16;
            lutData[ptr + 2] = b * 16;
            lutData[ptr + 3] = 255;
          }
        }
      }

      texture.update(lutData, {
        size: [LUT_WIDTH, LUT_HEIGHT],
        dataLayout: {
          /**
           * 数据不止一行，需要显示声明该值，表示每行的字节数
           * 详见：https://developer.mozilla.org/en-US/docs/Web/API/GPUQueue/writeTexture#bytesperrow
           */
          bytesPerRow: LUT_WIDTH * 4,
        },
      });

      state.gpuPostProcess.groupDirty = true;
    }

    updateTexture(lutTexture, state, [state.secret.replica.colorLUT]);
  };

  const destroyLUT = (state: GameClientState) => {
    if (!state.gpuPostProcess.lutTexture.texture) {
      return;
    }

    state.gpuPostProcess.lutTexture.texture?.destroy();
    state.gpuPostProcess.lutTexture.texture = null;
    state.gpuPostProcess.lutTexture.hashes.length = 0;

    state.gpuPostProcess.groupDirty = true;
  };

  function initGroup(state: GameClientState) {
    if (
      !state.gpuPostProcess.oitTarget ||
      !state.gpu.depth ||
      !state.gpu.linearSampler ||
      !state.gpu.transparentDepth ||
      !state.gpuOutline.outlineDepth
    ) {
      return;
    }
    state.gpuPostProcess.group?.destroy();
    state.gpuPostProcess.group = rewgpu.group({
      label: 'postprocess:group',
      layout: pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource:
            state.gpuPostProcess.fxaaTarget || state.gpuPostProcess.oitTarget,
        },
        {
          binding: 1,
          resource: state.gpu.depth,
        },
        {
          binding: 2,
          resource: state.gpu.transparentDepth,
        },
        {
          binding: 3,
          resource: state.gpu.linearSampler,
        },
        {
          binding: 4,
          resource: state.gpuPostProcess.ssaoTarget || EMPTY_TEXTURE,
        },
        {
          binding: 5,
          resource: state.gpuPostProcess.scatteringTarget || EMPTY_TEXTURE,
        },
        {
          binding: 6,
          resource: state.gpuPostProcess.blurBuffers[0] || EMPTY_TEXTURE,
        },
        {
          binding: 7,
          resource: state.gpuPostProcess.lutTexture.texture || EMPTY_TEXTURE,
        },
        {
          binding: 8,
          resource: state.gpuOutline.outlineDepth,
        },
      ],
    });

    state.gpuPostProcess.groupDirty = false;
  }

  function initCommonGroup(state: GameClientState) {
    initOITBuffer(state);

    if (state.gpuPostProcess.fxaaEnabled) {
      initFxaaBuffer(state);
    }
    if (state.gpuPostProcess.ssaoEnabled) {
      initSSAOBuffer(state);
    }
    if (state.gpuPostProcess.scatteringEnabled) {
      initScatter(state);
    }
    if (state.gpuPostProcess.blurEnabled) {
      initBlurBuffer(state);
    }

    initGroup(state);
  }

  return {
    init: (state: GameClientState) => {
      initCommonGroup(state);

      struct.tick[0] = 0;
      state.camera.screenLightPos = struct.screenLightPos;
    },
    update: (state: GameClientState) => {
      state.gpuPostProcess.enabled = state.settings.postprocess;

      struct.tick[0] += 0.01;

      // Allocate fxaa buffer
      state.gpuPostProcess.fxaaEnabled =
        state.gpuPostProcess.enabled && state.settings.fxaa;
      if (state.gpuPostProcess.fxaaEnabled) {
        updateFxaaBuffer(state);
      } else {
        destroyFxaaBuffer(state);
      }

      // Allocate blur buffers
      state.gpuPostProcess.blurEnabled =
        state.gpuPostProcess.enabled && state.settings.bloom;

      if (state.gpuPostProcess.blurEnabled) {
        updateBlurBuffers(state);
      } else {
        destroyBlurBuffers(state);
      }

      // volumetric scattering 体积散射
      state.gpuPostProcess.scatteringEnabled =
        state.gpuPostProcess.enabled &&
        state.settings.volumetricScattering &&
        state.camera.eyeFogAmount > 0.01;
      if (state.gpuPostProcess.scatteringEnabled) {
        updateScatter(state);
      } else {
        destroyScatter(state);
      }

      // ssao
      state.gpuPostProcess.ssaoEnabled =
        state.gpuPostProcess.enabled &&
        !state.camera.underwater &&
        state.settings.ambientOcclusion;

      if (state.gpuPostProcess.ssaoEnabled) {
        updateSSAOBuffer(state);
      } else {
        destroySSAOBuffer(state);
      }

      // allocate/update LUT
      state.gpuPostProcess.lutEnabled = state.secret.replica.colorLUT !== '';

      if (state.gpuPostProcess.lutEnabled) {
        updateLUT(state);
      } else {
        destroyLUT(state);
      }

      if (state.gpu.targetSizeDirty) {
        initCommonGroup(state);
      }

      if (state.gpuPostProcess.groupDirty) {
        initGroup(state);
      }
    },
    draw: (state: GameClientState, passEncoder: GPURenderPassEncoder) => {
      if (!state.gpuPostProcess.group) {
        return;
      }

      struct.enabled[0] = +state.gpuPostProcess.enabled;
      struct.ssao[0] = +state.gpuPostProcess.ssaoEnabled;
      struct.depthOfField[0] = state.settings.depthOfField;
      struct.playerDepth[0] = state.camera.focalDistance;
      struct.zNear[0] = state.camera.zNear;
      struct.zFar[0] = state.camera.zFar;
      struct.scattering[0] = +(
        state.gpuPostProcess.scatteringEnabled &&
        state.camera.eyeFogAmount > 0.01
      );
      struct.eyeFogExtinction[0] = state.camera.eyeFogAmount;
      struct.bloom[0] = +state.gpuPostProcess.blurEnabled;
      struct.underwater[0] = +state.camera.underwater;
      struct.lutEnabled[0] = +state.gpuPostProcess.lutEnabled;

      // 必须保证OIT先绘制，后面的绘制是依赖于OIT的输出
      // 后面绘制的顺序可以随意
      drawOIT(state);

      // Bloom中四次绘制，每一次的绘制结果依赖于上一次的输出
      // 需要按顺序依次绘制
      drawBloom(state);

      // 以下三个特效不需要按顺序绘制，统一绘制
      const renderMultiDes: RenderDescriptor[] = [];
      drawFxaa(renderMultiDes, state);
      drawScatter(renderMultiDes, state);
      drawSSAO(renderMultiDes, state);
      rewgpu.renderMulti(renderMultiDes);

      commandDescriptor.groups[1] = state.gpuPostProcess.group;
      command(passEncoder);
    },
  };
}
