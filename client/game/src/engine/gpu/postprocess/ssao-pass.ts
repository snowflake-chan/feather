import type { IREWGPUTexture, ReWGPU } from '@box/rewgpu';
import type { GameClientState } from 'src/engine/game-client-schema';
import { rootLogger } from 'src/utils/logger';
import ssaoFragWgsl from '../wgsl/ssao-frag.wgsl';
import ssaoStructWgsl from '../wgsl/ssao-struct.wgsl';
import trianglePosWgsl from '../wgsl/triangle-pos.wgsl';
import trivialVertWgsl from '../wgsl/trivial-vert.wgsl';
import type { PostprocessResources } from './resources';
import { createPipelineWithLayoutFromShader } from './utils';

const logger = rootLogger.child({ caller: 'ssao' });

export class SsaoResources {
  // 可被缓存的数据
  private readonly ssaoBindGroupLayout: GPUBindGroupLayout;
  public readonly ssaoPipeline: GPURenderPipeline;

  // 需要跟随destroy被销毁的资源数据
  public target: IREWGPUTexture | undefined;
  public targetView: GPUTextureView | undefined;
  constructor(private rewgpu: ReWGPU) {
    const label = 'postprocess:ssao';

    const code = /*wgsl*/ `
        ${trianglePosWgsl}
        ${ssaoStructWgsl}

        @group(0) @binding(0) var depthTexture : texture_depth_2d;
        @group(0) @binding(1) var transparentDepthTexture : texture_depth_2d;

        @fragment
        ${ssaoFragWgsl}
        @vertex
        ${trivialVertWgsl}`;

    const ssaoPassShader = rewgpu.config.device.createShaderModule({
      label,
      code,
    });

    const pipelineResources = createPipelineWithLayoutFromShader(
      rewgpu.config.device,
      code,
      {
        label: 'postprocess:ssao:pipeline',
        vertex: {
          module: ssaoPassShader,
          entryPoint: 'vertMain',
        },
        fragment: {
          module: ssaoPassShader,
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
      label,
    );

    this.ssaoBindGroupLayout = pipelineResources.bindGroupLayouts[0];
    this.ssaoPipeline = pipelineResources.pipeline;
  }

  public update(state: GameClientState) {
    if (!state.gpuPostProcess.ssaoEnabled) {
      this.destroy(state);
      return;
    }

    if (
      !state.gpu.depth ||
      !state.gpu.transparentDepth ||
      (!state.gpu.targetSizeDirty && this.target)
    ) {
      return;
    }

    this.target?.destroy();
    this.target = this.createSsaoTarget();
    this.targetView = this.target.texture?.createView();

    state.gpuPostProcess.groupDirty = true;

    state.gpuPostProcess.ssaoGroup?.destroy();
    state.gpuPostProcess.ssaoGroup = this.rewgpu.group({
      label: 'ssao:group',
      layout: this.ssaoBindGroupLayout,
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

  private createSsaoTarget() {
    return this.rewgpu.texture({
      label: 'postprocess:ssao:target',
      size: [this.rewgpu.canvas.width, this.rewgpu.canvas.height],
      format: this.rewgpu.config.presentationFormat,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
  }

  public destroy(state: GameClientState) {
    if (this.target) {
      this.target.destroy();
      this.target = undefined;
      this.targetView = undefined;
      state.gpuPostProcess.groupDirty = true;
    }
  }
}

export function recordSsaoPass(
  out: GPUCommandEncoder,
  state: GameClientState,
  resources: PostprocessResources,
) {
  if (!state.gpuPostProcess.ssaoGroup || !resources.ssao) {
    const missing = {
      ssaoGroup: !state.gpuPostProcess.ssaoGroup,
      ssaoResources: !resources.ssao,
    };
    logger.debug('skip record ssao: %o', missing);
    return;
  }
  resources.colorOnlyPassDescriptor.colorAttachments[0].view =
    resources.ssao.targetView;
  const pass = out.beginRenderPass(resources.colorOnlyPassDescriptor);

  pass.setPipeline(resources.ssao.ssaoPipeline);
  pass.setBindGroup(0, state.gpuPostProcess.ssaoGroup.group!);
  pass.draw(3);

  pass.end();

  return pass;
}
