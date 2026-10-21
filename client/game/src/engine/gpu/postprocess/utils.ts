import {
  makeShaderDataDefinitions,
  makeBindGroupLayoutDescriptors,
} from 'webgpu-utils';

export interface PipelineResources {
  bindGroupLayouts: GPUBindGroupLayout[];
  pipeline: GPURenderPipeline;
}

/**
 * 从 Shader 中生成 Layout 从而创建 Pipeline。
 * 不建议在初始化之外的环节调用
 * @param device
 * @param code
 * @param pipelineDescriptor
 * @param label
 * @returns
 */
export function createPipelineWithLayoutFromShader(
  device: GPUDevice,
  code: string,
  pipelineDescriptor: Omit<GPURenderPipelineDescriptor, 'layout'>,
  label: string,
): PipelineResources {
  const shaderDefs = makeShaderDataDefinitions(code);
  const bindingDescriptors = makeBindGroupLayoutDescriptors(
    shaderDefs,
    pipelineDescriptor,
  );

  const bindGroupLayouts = bindingDescriptors.map((desc, i) =>
    device.createBindGroupLayout({ label: `${label}${i}`, ...desc }),
  );

  const pipelineLayout = device.createPipelineLayout({
    label,
    bindGroupLayouts: bindGroupLayouts,
  });

  return {
    bindGroupLayouts,
    pipeline: device.createRenderPipeline({
      label,
      layout: pipelineLayout,
      ...pipelineDescriptor,
    }),
  };
}
