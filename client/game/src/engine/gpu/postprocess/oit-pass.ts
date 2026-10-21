import type { IREWGPUTexture, ReWGPU } from '@box/rewgpu';
import type { GameClientState } from 'src/engine/game-client-schema';
import type { PostprocessResources } from './resources';
import oitFrag from '../wgsl/oit-frag.wgsl';
import oitStruct from '../wgsl/oit-struct.wgsl';
import triangle from '../wgsl/triangle-pos.wgsl';
import vert from '../wgsl/trivial-vert.wgsl';
import { createPipelineWithLayoutFromShader } from './utils';

export class OitResources {
  // 可被缓存的数据
  public readonly pipeline: GPURenderPipeline;
  public readonly oitGroupLayout: GPUBindGroupLayout;

  // 需要跟随destroy被销毁的资源数据
  public oitTargetTexture: IREWGPUTexture | undefined;
  public targetTexture: IREWGPUTexture | undefined;
  public targetViewDirty = true;
  public passDescriptor: GPURenderPassDescriptor | undefined;
  private useOIT = false;

  public destroy() {
    this.oitTargetTexture = undefined;
    this.targetTexture = undefined;
    this.passDescriptor = undefined;
  }

  constructor(private rewgpu: ReWGPU) {
    const label = 'postprocess:oit';

    const code = /*wgsl*/ `
      ${triangle}
      ${oitStruct}

      @group(0) @binding(0) var targetTexture : texture_2d<f32>;
      @group(0) @binding(1) var<storage, read_write> nodes0 : array<StaticNode>;
      @group(0) @binding(2) var<storage, read_write> offsets0 : array<u32>;
      @group(0) @binding(3) var<storage, read_write> nodes1 : array<StaticNode>;
      @group(0) @binding(4) var<storage, read_write> offsets1 : array<u32>;
      @group(0) @binding(5) var<storage, read_write> nodes2 : array<StaticNode>;
      @group(0) @binding(6) var<storage, read_write> offsets2 : array<u32>;

      @fragment
      ${oitFrag}

      @vertex
      ${vert}
    `;

    const shader = rewgpu.config.device.createShaderModule({
      label,
      code,
    });

    const pipelineResources = createPipelineWithLayoutFromShader(
      rewgpu.config.device,
      code,
      {
        label,
        vertex: {
          module: shader,
          entryPoint: 'vertMain',
        },
        fragment: {
          module: shader,
          entryPoint: 'fragMain',
          targets: [
            {
              format: rewgpu.config.presentationFormat,
            },
          ],
        },
      },
      label,
    );

    this.oitGroupLayout = pipelineResources.bindGroupLayouts[0];
    this.pipeline = pipelineResources.pipeline;
  }

  public update(state: GameClientState) {
    if (this.useOIT !== state.gpu.useOIT) {
      this.targetViewDirty = true;
      this.targetTexture = state.gpu.useOIT
        ? this.oitTargetTexture
        : state.gpu.target || undefined;
      this.useOIT = state.gpu.useOIT;
    }

    if (
      !state.gpu.target ||
      !state.gpu.oitStaticNodeBuffer0 ||
      !state.gpu.oitOffsetBuffer0 ||
      !state.gpu.oitStaticNodeBuffer1 ||
      !state.gpu.oitOffsetBuffer1 ||
      !state.gpu.oitStaticNodeBuffer2 ||
      !state.gpu.oitOffsetBuffer2 ||
      (!state.gpu.targetSizeDirty && this.oitTargetTexture)
    ) {
      return;
    }

    if (this.useOIT) {
      this.oitTargetTexture = this.rewgpu.texture({
        label: 'postprocess:oit:target',
        size: [this.rewgpu.canvas.width, this.rewgpu.canvas.height],
        format: this.rewgpu.config.presentationFormat,
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
    }

    this.targetTexture = this.useOIT
      ? this.oitTargetTexture
      : state.gpu.target || undefined;
    const targetView = this.targetTexture?.texture?.createView();

    if (this.useOIT && targetView) {
      this.passDescriptor = {
        label: 'oit',
        colorAttachments: [
          {
            view: targetView,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      };
    }

    if (state.gpu.targetSizeDirty) {
      state.gpuPostProcess.oitGroup?.destroy();
      state.gpuPostProcess.oitGroup = this.rewgpu.group({
        label: 'oit:group',
        layout: this.oitGroupLayout,
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
          {
            binding: 3,
            resource: state.gpu.oitStaticNodeBuffer1,
          },
          {
            binding: 4,
            resource: state.gpu.oitOffsetBuffer1,
          },
          {
            binding: 5,
            resource: state.gpu.oitStaticNodeBuffer2,
          },
          {
            binding: 6,
            resource: state.gpu.oitOffsetBuffer2,
          },
        ],
      });

      state.gpuPostProcess.groupDirty = true;
    }
  }
}

export function recordOitPass(
  out: GPUCommandEncoder,
  state: GameClientState,
  resource: PostprocessResources,
) {
  if (
    !state.gpuPostProcess.oitGroup ||
    !state.gpuPostProcess.oitGroup.group ||
    !resource.oit.passDescriptor
  ) {
    return;
  }

  const pass = out.beginRenderPass(resource.oit.passDescriptor);
  pass.setPipeline(resource.oit.pipeline);
  pass.setBindGroup(0, state.gpuPostProcess.oitGroup.group);

  pass.draw(3);
  pass.end();

  // 用完了要清掉
  out.clearBuffer(state.gpu.oitOffsetBuffer0!.buffer!);
  out.clearBuffer(state.gpu.oitOffsetBuffer1!.buffer!);
  out.clearBuffer(state.gpu.oitOffsetBuffer2!.buffer!);

  return pass;
}
