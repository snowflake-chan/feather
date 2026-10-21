import { TextureManager } from './texture';
import { BufferManager } from './buffer';
import { SamplerManager } from './sampler';
import { GroupManager } from './group';
import {
  CreateCommand,
  CreatePipeline,
  GPUConfig,
  RenderContext,
  RenderDescriptor,
  ReWGPU,
} from './interface';

export * from './interface';

export async function createREWGPU(
  canvas: HTMLCanvasElement,
  config?: GPUConfig,
): Promise<ReWGPU> {
  let configuration = config;
  if (!configuration) {
    configuration = await initWebGPU();
  }

  const context = canvas.getContext('webgpu');

  if (!context) {
    return Promise.reject('WebGPU context is null');
  }

  const { device, presentationFormat, ...configs } = configuration;

  context.configure({
    ...configs,
    device,
    format: presentationFormat,
  });

  const bufferManager = new BufferManager(device);
  const textureManager = new TextureManager(device);
  const samplerManager = new SamplerManager(device);
  const groupManager = new GroupManager(device);

  const createPipeline: CreatePipeline = ({
    label,
    struct,
    frag,
    vert,
    primitive,
    depthStencil,
    layout = 'auto',
  }) => {
    const shaderModule = device.createShaderModule({
      label,
      code: `
    ${struct ? struct : ''}
    ${
      frag
        ? `
    @fragment
    ${frag.content}
    `
        : ''
    }
    @vertex
    ${vert.content}
    `,
    });

    return device.createRenderPipeline({
      label,
      layout,
      vertex: {
        module: shaderModule,
        entryPoint: vert.entryPoint,
        buffers: vert.buffers,
        constants: vert.constants,
      },
      fragment: frag && {
        module: shaderModule,
        entryPoint: frag.entryPoint,
        targets: [
          {
            format: frag.format || presentationFormat,
            blend: frag.blend,
          },
        ],
        constants: frag.constants,
      },
      primitive,
      depthStencil,
    });
  };

  const createCommand: CreateCommand = (props) => {
    return (passEncoder) => {
      passEncoder.setPipeline(props.pipeline);

      props.groups?.forEach((reGroup, idx) => {
        if (reGroup.group) {
          passEncoder.setBindGroup(idx, reGroup.group, reGroup.dynamicOffsets);
        }
      });

      props.vertBuffers?.forEach((reBuffer, idx) => {
        if (reBuffer.buffer) {
          passEncoder.setVertexBuffer(idx, reBuffer.buffer);
        }
      });

      if (props.indexBuffer && props.indexBuffer.reBuffer.buffer) {
        passEncoder.setIndexBuffer(
          props.indexBuffer.reBuffer.buffer,
          props.indexBuffer.indexFormat,
          props.indexBuffer.offset,
          props.indexBuffer.size,
        );
      }
      props.indexBuffer
        ? passEncoder.drawIndexed(
            props.count,
            props.instanceCount,
            props.first,
            props.baseVertex,
            props.firstInstance,
          )
        : passEncoder.draw(
            props.count,
            props.instanceCount,
            props.first,
            props.firstInstance,
          );
    };
  };

  const clear = () => {
    bufferManager.destroy();
    textureManager.destroy();
    samplerManager.destroy();
    groupManager.destroy();
  };

  const renderMulti = (descriptors: RenderDescriptor[]) => {
    const commands: GPUCommandBuffer[] = [];
    const contexts: RenderContext[] = descriptors.map((des) => {
      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass(
        des.renderPassDescriptor,
      );
      des.draw(passEncoder);
      passEncoder.end();

      const commandBuffer = commandEncoder.finish();

      commands.push(commandBuffer);

      return {
        commandEncoder,
        passEncoder,
        commandBuffer,
      };
    });

    bufferManager.update();
    device.queue.submit(commands);

    return contexts;
  };

  return {
    config: configuration,
    canvas,
    context,
    clear,
    destroy: () => {
      clear();

      device.destroy();
    },
    render: (renderPassDescriptor, draw) =>
      renderMulti([{ renderPassDescriptor, draw }]),
    renderMulti,
    buffer: (described) => bufferManager.create(described),
    texture: (described) => textureManager.create(described),
    cube: (descriptor) => textureManager.createCube(descriptor),
    sampler: (described) => samplerManager.create(described),
    group: (described) => groupManager.create(described),
    createBindGroupLayout: (described) =>
      device.createBindGroupLayout(described),
    createPipelineLayout: (described) => device.createPipelineLayout(described),
    createPipeline: createPipeline,
    createCommand,
  };
}

export async function initWebGPU(): Promise<GPUConfig> {
  if (!navigator.gpu) {
    return Promise.reject('WebGPU not supported');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return Promise.reject(`Couldn't request WebGPU adapter.`);
  }
  const device = await adapter.requestDevice();
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  return {
    device,
    presentationFormat,
  };
}
