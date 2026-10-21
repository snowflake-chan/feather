import type {
  GroupEntry,
  IREWGPUBuffer,
  IREWGPUGroup,
  IREWGPUTexture,
  ReWGPU,
} from '@box/rewgpu';
import { prevPow2 } from 'bit-twiddle';
import type { GameClientState } from 'src/engine/game-client-schema';
import { rootLogger } from 'src/utils/logger';
import { F32, UniformStructF32, VEC2F } from '../uniform-pool';
import toneMappingWgsl from '../wgsl/tone-mapping.wgsl';
import trianglePosWgsl from '../wgsl/triangle-pos.wgsl';
import trivialVertWgsl from '../wgsl/trivial-vert.wgsl';
import type { OitResources } from './oit-pass';
import type { PostprocessResources } from './resources';
import { createPipelineWithLayoutFromShader } from './utils';

const NUM_BLURS = 4;
const logger = rootLogger.child({ caller: 'gpu:postprocess:bloom' });
const uniformType = {
  shape: VEC2F,
};

export class BloomResources {
  // 可被缓存的数据
  public readonly initializeBrightsGroupLayout: GPUBindGroupLayout;
  public readonly initializeBrightsPipeline: GPURenderPipeline;

  public readonly downSampleGroupLayout: GPUBindGroupLayout;
  public readonly downSamplePipeline: GPURenderPipeline;
  public readonly downSampleUniformData: UniformStructF32<
    typeof uniformType
  >[] = [];
  public readonly accumulatePipeline: GPURenderPipeline;
  public readonly accumulateGroupLayout: GPUBindGroupLayout;

  public readonly renderTargetUniformView = new UniformStructF32({
    gamma: F32,
    shape: VEC2F,
  });

  // 需要跟随destroy被销毁的资源数据
  public downSampleUniformViews: IREWGPUBuffer[] = [];
  public downSampleBindGroups: IREWGPUGroup[] = [];
  public downSampleTargets: IREWGPUTexture[] = [];
  public downSampleTargetViews: GPUTextureView[] = [];

  /**
   * 随渲染尺寸变更
   */
  public accumulateGroup: IREWGPUGroup | undefined;
  public renderTargetUniform?: IREWGPUBuffer;

  constructor(private rewgpu: ReWGPU) {
    // initialize brights pass
    const initializeBrightsShaderCode = /*wgsl*/ `
      ${trianglePosWgsl}
      ${toneMappingWgsl}

      struct Uniform {
        gamma : f32,
        shape: vec2f,
      }
      
      @group(0) @binding(0) var pixels : texture_2d<f32>;
      @group(0) @binding(1) var bloomSampler : sampler;
      @group(0) @binding(2) var<uniform> uni : Uniform;

      @fragment
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
      
      @vertex
      ${trivialVertWgsl}
    `;

    const initializeBrightsShader = rewgpu.config.device.createShaderModule({
      label: 'postprocess:bloom:initializeBrights',
      code: initializeBrightsShaderCode,
    });

    const initializeBrightsPipelineResources =
      createPipelineWithLayoutFromShader(
        rewgpu.config.device,
        initializeBrightsShaderCode,
        {
          vertex: {
            module: initializeBrightsShader,
            entryPoint: 'vertMain',
          },
          fragment: {
            module: initializeBrightsShader,
            entryPoint: 'fragMain',
            targets: [
              {
                format: rewgpu.config.presentationFormat,
              },
            ],
          },
        },
        'postprocess:bloom:initializeBrights',
      );

    this.initializeBrightsGroupLayout =
      initializeBrightsPipelineResources.bindGroupLayouts[0];
    this.initializeBrightsPipeline =
      initializeBrightsPipelineResources.pipeline;

    // down sample passes
    const downSampleShaderCode = /*wgsl*/ `
      ${trianglePosWgsl}

      struct Uniform {
        shape: vec2f,
      }
      
      @group(0) @binding(0) var pixels : texture_2d<f32>;
      @group(0) @binding(1) var bloomSampler : sampler;
      @group(0) @binding(2) var<uniform> uni : Uniform;

      @fragment
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

      @vertex
      ${trivialVertWgsl}
    `;
    const downSampleShader = rewgpu.config.device.createShaderModule({
      label: 'postprocess:bloom:downSample',
      code: downSampleShaderCode,
    });

    const downSamplePipelineResources = createPipelineWithLayoutFromShader(
      rewgpu.config.device,
      downSampleShaderCode,
      {
        vertex: {
          module: downSampleShader,
          entryPoint: 'vertMain',
        },
        fragment: {
          module: downSampleShader,
          entryPoint: 'fragMain',
          targets: [
            {
              format: rewgpu.config.presentationFormat,
            },
          ],
        },
      },
      'postprocess:bloom:downSample',
    );

    this.downSampleGroupLayout =
      downSamplePipelineResources.bindGroupLayouts[0];
    this.downSamplePipeline = downSamplePipelineResources.pipeline;

    for (let i = 0; i < NUM_BLURS - 1; i++) {
      this.downSampleUniformData.push(
        new UniformStructF32({
          shape: VEC2F,
        }),
      );
    }
    // init accumulate pass

    let accumulateDownSampleStruct = ``;
    let accumulateDownSampleFragment = ``;
    for (let i = 1; i < NUM_BLURS; i++) {
      accumulateDownSampleStruct += `@group(0) @binding(${
        i + 1
      }) var blur${i} : texture_2d<f32>;\n`;
      accumulateDownSampleFragment += `
        duv *= 4.0;
        color = 4.0 * textureSample(blur${i}, bloomSampler, uv);
        color += textureSample(blur${i}, bloomSampler, uv + vec2f(duv.x, duv.y));
        color += textureSample(blur${i}, bloomSampler, uv + vec2f(-duv.x, duv.y));
        color += textureSample(blur${i}, bloomSampler, uv + vec2f(duv.x, -duv.y));
        color += textureSample(blur${i}, bloomSampler, uv + vec2f(-duv.x, -duv.y));
        result += color / 8.0;\n
        `;
    }

    const accumulateShaderCode = /*wgsl*/ `
      ${trianglePosWgsl}

      struct Uniform {
        gamma : f32,
        shape: vec2f,
      }
      
      @group(0) @binding(0) var<uniform> uni : Uniform;
      @group(0) @binding(1) var bloomSampler : sampler;
      ${accumulateDownSampleStruct}

      @fragment
      fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
          var result = vec4f(0.);
          var uv = position.xy / uni.shape;
          var duv = 0.5 / uni.shape;
          var color: vec4f;
          ${accumulateDownSampleFragment}
          return result;
        }

      @vertex
      ${trivialVertWgsl}
    `;

    const accumulateShader = rewgpu.config.device.createShaderModule({
      label: 'postprocess:bloom:accumulate',
      code: accumulateShaderCode,
    });

    const accumulatePipelineResources = createPipelineWithLayoutFromShader(
      rewgpu.config.device,
      accumulateShaderCode,
      {
        vertex: {
          module: accumulateShader,
          entryPoint: 'vertMain',
        },
        fragment: {
          module: accumulateShader,
          entryPoint: 'fragMain',
          targets: [
            {
              format: rewgpu.config.presentationFormat,
            },
          ],
        },
      },
      'postprocess:bloom:accumulate',
    );

    this.accumulateGroupLayout =
      accumulatePipelineResources.bindGroupLayouts[0];
    this.accumulatePipeline = accumulatePipelineResources.pipeline;
  }

  /**
   * 资源数据需要跟随init重新初始化
   */
  public init() {
    this.downSampleUniformViews.length = 0;

    this.downSampleUniformData.forEach(({ data }) => {
      this.downSampleUniformViews.push(
        this.rewgpu.buffer({
          data,
          size: data.byteLength,
          usage: GPUBufferUsage.UNIFORM,
        }),
      );
    });

    this.renderTargetUniform = this.rewgpu.buffer({
      label: 'postprocess:renderTargetUniform',
      size: this.renderTargetUniformView.data.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  public update(state: GameClientState, oit: OitResources) {
    if (!state.gpuPostProcess.blurEnabled) {
      this.destroy(state);
      return;
    }

    if (
      !oit.targetTexture ||
      !state.gpu.linearSampler ||
      !this.renderTargetUniform ||
      !this.downSampleUniformViews
    ) {
      throw new Error('oit target not ready for bloom update!');
    }

    let targetWidth = prevPow2(this.rewgpu.canvas.width);
    let targetHeight = prevPow2(this.rewgpu.canvas.height);

    const { data, struct } = this.renderTargetUniformView;
    struct.gamma[0] = state.environment.gamma; // TODO 考虑加个dirty处理？

    // 如果没脏且已初始化
    if (
      !state.gpu.targetSizeDirty &&
      !oit.targetViewDirty &&
      this.accumulateGroup &&
      this.downSampleTargets.length
    ) {
      // 应用上面的更新
      this.renderTargetUniform.update(data);
      return;
    }

    this.downSampleBindGroups.map((group) => group.destroy());
    this.downSampleBindGroups.length = 0;
    this.downSampleBindGroups[0] = this.rewgpu.group({
      label: `postprocess:bloom:target0`,
      layout: this.initializeBrightsGroupLayout,
      entries: [
        {
          binding: 0,
          resource: oit.targetTexture,
        },
        {
          binding: 1,
          resource: state.gpu.linearSampler,
        },
        {
          binding: 2,
          resource: this.renderTargetUniform,
        },
      ],
    });

    // update buffer content for accumulate pass
    struct.shape[0] = targetWidth;
    struct.shape[1] = targetHeight;
    this.renderTargetUniform.update(data);

    for (let i = 0; i < NUM_BLURS; ++i) {
      this.downSampleTargets[i]?.destroy();
      this.downSampleTargets[i] = this.rewgpu.texture({
        label: `postprocess:bloom:blur:target${i}`,
        size: [targetWidth, targetHeight],
        format: this.rewgpu.config.presentationFormat,
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      const view = this.downSampleTargets[i]?.texture?.createView();
      // texture都是新建出来的，理论上view都有，这里只为类型推断
      if (view) {
        this.downSampleTargetViews[i] = view;
      }

      // Update groups
      if (i > 0) {
        const lastTarget = this.downSampleTargets[i - 1];
        const downSampleUniform = this.downSampleUniformViews[i - 1];
        if (!lastTarget || !downSampleUniform) {
          throw new Error(`target${i - 1} view is not ready!`);
        }
        this.downSampleBindGroups[i] = this.rewgpu.group({
          label: `postprocess:bloom:blur:group${i}`,
          layout: this.downSampleGroupLayout,
          entries: [
            {
              binding: 0,
              resource: lastTarget,
            },
            {
              binding: 1,
              resource: state.gpu.linearSampler,
            },
            {
              binding: 2,
              resource: downSampleUniform,
            },
          ],
        });

        // update buffer content
        this.downSampleUniformData[i - 1].struct.shape[0] =
          this.downSampleTargets[i].texture?.width || 0;
        this.downSampleUniformData[i - 1].struct.shape[1] =
          this.downSampleTargets[i].texture?.height || 0;
        downSampleUniform.update(this.downSampleUniformData[i - 1].data);
      }

      // prepare next texture
      targetHeight = Math.max(
        1,
        Math.floor(targetHeight / 4), // 4 as blur scale
      );
      targetWidth = Math.max(1, Math.floor(targetWidth / 4)); // 4 as blur scale
    }
    state.gpuPostProcess.groupDirty = true; // down sample target0 作为最后的 accumulate target 被 final group 使用了

    const bindGroupEntries: GroupEntry[] = [
      {
        binding: 0,
        resource: this.renderTargetUniform,
      },
      {
        binding: 1,
        resource: state.gpu.linearSampler,
      },
    ];
    for (let i = 1; i < NUM_BLURS; i++) {
      bindGroupEntries.push({
        binding: i + 1,
        resource: this.downSampleTargets[i],
      });
    }
    this.accumulateGroup = this.rewgpu.group({
      label: 'postprocess:bloom:accumulate',
      layout: this.accumulateGroupLayout,
      entries: bindGroupEntries,
    });
  }

  public destroy(state: GameClientState) {
    if (this.downSampleTargets.length) {
      this.downSampleTargets.map((t) => t.destroy());
      this.downSampleTargets.length = 0;
      this.downSampleTargetViews.length = 0;
      this.downSampleBindGroups.map((group) => group.destroy());
      this.downSampleBindGroups.length = 0;
      this.accumulateGroup?.destroy();
      this.accumulateGroup = undefined;
      state.gpuPostProcess.groupDirty = true;
    }
  }
}

export function recordBloomPass(
  out: GPUCommandEncoder,
  resources: PostprocessResources,
) {
  if (!resources.bloom || !resources.bloom.accumulateGroup) {
    logger.warn('resources is not ready to record bloom pass!');
    return;
  }

  const passEncoders: GPURenderPassEncoder[] = [];

  resources.colorOnlyPassDescriptor.colorAttachments[0].view =
    resources.bloom.downSampleTargetViews[0];
  const initialBrightsPass = out.beginRenderPass(
    resources.colorOnlyPassDescriptor,
  );

  passEncoders.push(initialBrightsPass);

  initialBrightsPass.setPipeline(resources.bloom.initializeBrightsPipeline);
  if (resources.bloom.downSampleBindGroups[0].group) {
    initialBrightsPass.setBindGroup(
      0,
      resources.bloom.downSampleBindGroups[0].group,
    );
  }
  initialBrightsPass.draw(3);

  initialBrightsPass.end();

  for (let i = 1; i < NUM_BLURS; i++) {
    resources.colorOnlyPassDescriptor.colorAttachments[0].view =
      resources.bloom.downSampleTargetViews[i];
    const downSamplePass = out.beginRenderPass(
      resources.colorOnlyPassDescriptor,
    );

    downSamplePass.setPipeline(resources.bloom.downSamplePipeline);
    const group = resources.bloom.downSampleBindGroups[i].group;
    if (group) {
      downSamplePass.setBindGroup(0, group);
    }

    downSamplePass.draw(3);
    downSamplePass.end();

    passEncoders.push(downSamplePass);
  }

  resources.colorOnlyPassDescriptor.colorAttachments[0].view =
    resources.bloom.downSampleTargetViews[0];
  const accumulatePass = out.beginRenderPass(resources.colorOnlyPassDescriptor);
  accumulatePass.setPipeline(resources.bloom.accumulatePipeline);
  if (resources.bloom.accumulateGroup.group) {
    accumulatePass.setBindGroup(0, resources.bloom.accumulateGroup.group);
  }

  accumulatePass.draw(3);
  accumulatePass.end();

  passEncoders.push(accumulatePass);

  return passEncoders;
}
