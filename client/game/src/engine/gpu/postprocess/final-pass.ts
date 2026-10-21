import type { IREWGPUGroup, ReWGPU } from '@box/rewgpu';
import type { GameClientState } from 'src/engine/game-client-schema';
import { rootLogger } from 'src/utils/logger';
import commonUniformWgsl from '../common/common-uniform.wgsl';
import finalStructWgsl from '../wgsl/final-struct.wgsl';
import lutWgsl from '../wgsl/lut.wgsl';
import postprocessFragWgsl from '../wgsl/postprocess-frag.wgsl';
import toneMappingStructWgsl from '../wgsl/tone-mapping.wgsl';
import trianglePosWgsl from '../wgsl/triangle-pos.wgsl';
import trivialVertWgsl from '../wgsl/trivial-vert.wgsl';
import type { PostprocessResources } from './resources';
import { createPipelineWithLayoutFromShader } from './utils';

const logger = rootLogger.child({ caller: 'gpu/postprocess/final' });

export class FinalResources {
  // 可被缓存的数据
  public readonly finalBindGroupLayout: GPUBindGroupLayout;
  public readonly finalPipeline: GPURenderPipeline;

  // 需要跟随destroy被销毁的资源数据
  /**
   * 当渲染尺寸变化或画面设置修改时变更
   */
  public finalGroup: IREWGPUGroup | undefined;

  public destroy() {
    this.finalGroup?.destroy();
    this.finalGroup = undefined;
  }

  constructor(private rewgpu: ReWGPU) {
    const code = /*wgsl*/ `
    ${trianglePosWgsl}
    ${toneMappingStructWgsl}
    ${lutWgsl}
    
    ${finalStructWgsl}
    @group(0) @binding(0) var targetTexture : texture_2d<f32>;
    @group(0) @binding(1) var depthTexture : texture_depth_2d;
    @group(0) @binding(2) var transparentDepthTexture : texture_depth_2d;
    @group(0) @binding(3) var postSampler : sampler;
    @group(0) @binding(4) var ssaoTarget : texture_2d<f32>;
    @group(0) @binding(5) var scatteringTarget : texture_2d<f32>;
    @group(0) @binding(6) var bloom : texture_2d<f32>;
    @group(0) @binding(7) var lut : texture_2d<f32>;
    @group(0) @binding(8) var outlineDepth : texture_depth_2d;
    @group(0) @binding(9) var<uniform> uni : Uniform;

    ${commonUniformWgsl}
    @group(0) @binding(10) var<uniform> commonUniform : CommonUniform;

    @fragment
    ${postprocessFragWgsl}
    @vertex
    ${trivialVertWgsl}`;

    const finalPassShader = rewgpu.config.device.createShaderModule({
      label: 'postprocess:final:shader',
      code,
    });

    const { bindGroupLayouts, pipeline } = createPipelineWithLayoutFromShader(
      rewgpu.config.device,
      code,
      {
        label: 'postprocess:final',
        vertex: {
          module: finalPassShader,
          entryPoint: 'vertMain',
        },
        fragment: {
          module: finalPassShader,
          entryPoint: 'fragMain',
          targets: [
            {
              format: rewgpu.config.presentationFormat,
            },
          ],
        },
        primitive: {
          topology: 'triangle-list',
        },
      },
      'postprocess:final',
    );

    this.finalBindGroupLayout = bindGroupLayouts[0];
    this.finalPipeline = pipeline;
  }

  public update(state: GameClientState, postprocess: PostprocessResources) {
    if (
      !state.gpu.linearSampler ||
      !state.gpu.emptyTexture ||
      !state.gpu.depth ||
      !state.gpu.depth.texture ||
      !state.gpu.transparentDepth ||
      !state.gpu.transparentDepth.texture ||
      !state.gpuOutline.outlineDepth ||
      !state.gpuOutline.outlineDepth.texture ||
      !postprocess.oit.targetTexture ||
      !postprocess.postprocessUniform ||
      !postprocess.commonUniform
    ) {
      logger.warn('final pass resources not ready for update!');
      return;
    }

    if (
      state.gpuPostProcess.groupDirty ||
      postprocess.oit.targetViewDirty ||
      !this.finalGroup
    ) {
      this.finalGroup = this.rewgpu.group({
        label: 'postprocess:final',
        layout: this.finalBindGroupLayout,
        entries: [
          {
            binding: 0,
            resource:
              postprocess.fxaa?.fxaaTarget || postprocess.oit.targetTexture,
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
            resource: postprocess.ssao?.target || state.gpu.emptyTexture,
          },
          {
            binding: 5,
            resource:
              // TODO scatter 有一天可能会回来
              state.gpu.emptyTexture,
          },
          {
            binding: 6,
            resource:
              postprocess.bloom?.downSampleTargets[0] || state.gpu.emptyTexture,
          },
          {
            binding: 7,
            resource: postprocess.lutTexture || state.gpu.emptyTexture,
          },
          {
            binding: 8,
            resource: state.gpuOutline.outlineDepth,
          },
          {
            binding: 9,
            resource: postprocess.postprocessUniform,
          },
          {
            binding: 10,
            resource: postprocess.commonUniform,
          },
        ],
      });
      state.gpuPostProcess.groupDirty = false;
      postprocess.oit.targetViewDirty = false;
    }
  }
}

export function recordFinalPass(
  out: GPUCommandEncoder,
  rewgpu: ReWGPU,
  postprocess: PostprocessResources,
) {
  if (!postprocess.final || !postprocess.final.finalGroup) {
    const missing = {
      finalResources: !postprocess.final,
      finalGroup: !postprocess.final?.finalGroup,
    };
    throw new Error(
      `final pass resources not ready for record! missing: ${Object.keys(
        missing,
      ).filter((value) => missing[value])}`,
    );
  }

  postprocess.colorOnlyPassDescriptor.colorAttachments[0].view = rewgpu.context
    .getCurrentTexture()
    .createView();

  const pass = out.beginRenderPass(postprocess.colorOnlyPassDescriptor);
  pass.setPipeline(postprocess.final.finalPipeline);
  if (postprocess.final.finalGroup.group) {
    pass.setBindGroup(0, postprocess.final.finalGroup.group);
  }
  pass.draw(3);
  pass.end();

  return pass;
}
