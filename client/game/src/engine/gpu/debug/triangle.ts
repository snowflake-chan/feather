import { ReWGPU } from '@box/rewgpu';

export function gpuTriangle(rewgpu: ReWGPU) {
  const pipelineRed = rewgpu.createPipeline({
    struct: ``,
    frag: {
      content: `
    fn fragMain() -> @location(0) vec4<f32> {
        return vec4(1.0, 0.0, 0.0, 1.0);
    }`,
      entryPoint: 'fragMain',
    },
    vert: {
      content: `
    fn vertMain(
      @builtin(vertex_index) VertexIndex : u32
    ) -> @builtin(position) vec4<f32> {
      var pos = array<vec2<f32>, 3>(
        vec2(0.0, 0.5),
        vec2(-0.5, -0.5),
        vec2(0.5, -0.5)
    );
           return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
       }`,
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

  const commandRed = rewgpu.createCommand({
    pipeline: pipelineRed,
    count: 3,
  });

  const pipelineGreen = rewgpu.createPipeline({
    frag: {
      content: `
      fn fragMain() -> @location(0) vec4<f32> {
          return vec4(0.0, 1.0, 0.0, 1.0);
      }`,
      entryPoint: 'fragMain',
    },
    vert: {
      content: `
      fn vertMain(
        @builtin(vertex_index) VertexIndex : u32
      ) -> @builtin(position) vec4<f32> {
             var pos = array<vec2<f32>, 3>(
                 vec2(0.0, 0.2),
                 vec2(-0.2, -0.2),
                 vec2(0.8, -0.8)
             );
             return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
         }`,
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

  const commandGreen = rewgpu.createCommand({
    pipeline: pipelineGreen,
    count: 3,
  });

  return {
    commandRed,
    commandGreen,
  };
}
