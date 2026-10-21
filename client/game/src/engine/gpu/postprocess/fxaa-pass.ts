import type { IREWGPUGroup, IREWGPUTexture, ReWGPU } from '@box/rewgpu';
import { rootLogger } from 'src/utils/logger';
import fxaaFrag from '../wgsl/fxaa-frag.wgsl';
import fxaaStruct from '../wgsl/fxaa-struct.wgsl';
import trianglePosWgsl from '../wgsl/triangle-pos.wgsl';
import trivialVertWgsl from '../wgsl/trivial-vert.wgsl';
import type { OitResources } from './oit-pass';
import type { PostprocessResources } from './resources';
import { createPipelineWithLayoutFromShader } from './utils';
import { GameClientState } from 'src/engine/game-client-schema';

const logger = rootLogger.child({ caller: 'fxaa' });

export class FxaaResources {
  // 可被缓存的数据
  public readonly fxaaPipeline: GPURenderPipeline;
  private readonly fxaaBindGroupLayout: GPUBindGroupLayout;

  // 需要跟随destroy被销毁的资源数据
  public fxaaTarget: IREWGPUTexture | undefined;
  public fxaaTargetView: GPUTextureView | undefined;
  public fxaaBindGroup: IREWGPUGroup | undefined;

  constructor(private rewgpu: ReWGPU) {
    const label = 'postprocess:fxaa';
    const code = /*wgsl*/ `
      ${trianglePosWgsl}
      ${fxaaStruct}

      @group(0) @binding(0) var targetTexture : texture_2d<f32>;

      @fragment
      ${fxaaFrag}
      @vertex
      ${trivialVertWgsl}`;

    const shader = rewgpu.config.device.createShaderModule({
      label,
      code,
    });

    const pipelineResources = createPipelineWithLayoutFromShader(
      rewgpu.config.device,
      code,
      {
        label,
        fragment: {
          module: shader,
          entryPoint: 'fragMain',
          targets: [
            {
              format: this.rewgpu.config.presentationFormat,
            },
          ],
        },
        vertex: {
          module: shader,
          entryPoint: 'vertMain',
        },
      },
      label,
    );
    this.fxaaBindGroupLayout = pipelineResources.bindGroupLayouts[0];
    this.fxaaPipeline = pipelineResources.pipeline;
  }

  public update(state: GameClientState, oit: OitResources) {
    if (!state.gpuPostProcess.fxaaEnabled) {
      this.destroy(state);
      return;
    }

    if (!oit.targetTexture) {
      logger.warn('oit target not ready for fxaa update!');
      return;
    }

    if (!state.gpu.targetSizeDirty && !oit.targetViewDirty && this.fxaaTarget) {
      return;
    }

    const { width, height } = this.rewgpu.canvas;
    this.fxaaTarget = this.rewgpu.texture({
      label: 'postprocess:fxaa:target',
      size: [width, height],
      format: this.rewgpu.config.presentationFormat,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.fxaaTargetView = this.fxaaTarget?.texture?.createView();

    this.fxaaBindGroup = this.rewgpu.group({
      label: 'postprocess:fxaa:group',
      layout: this.fxaaBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: oit.targetTexture,
        },
      ],
    });
  }

  public destroy(state: GameClientState) {
    if (this.fxaaTarget) {
      this.fxaaTarget.destroy();
      this.fxaaTarget = undefined;
      this.fxaaTargetView = undefined;
      this.fxaaBindGroup?.destroy();
      this.fxaaBindGroup = undefined;
      state.gpuPostProcess.groupDirty = true;
    }
  }
}

export function recordFxaaPass(
  out: GPUCommandEncoder,
  resources: PostprocessResources,
) {
  if (!resources.fxaa || !resources.fxaa.fxaaBindGroup) {
    logger.warn('fxaa resources not ready!');
    return;
  }
  resources.colorOnlyPassDescriptor.colorAttachments[0].view =
    resources.fxaa.fxaaTargetView;
  const pass = out.beginRenderPass(resources.colorOnlyPassDescriptor);
  pass.setPipeline(resources.fxaa.fxaaPipeline);
  if (resources.fxaa.fxaaBindGroup.group) {
    pass.setBindGroup(0, resources.fxaa.fxaaBindGroup.group);
  }
  pass.draw(3);
  pass.end();

  return pass;
}
