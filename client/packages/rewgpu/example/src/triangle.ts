import { createREWGPU } from '@box/rewgpu';

export async function triangle(canvas: HTMLCanvasElement) {
  const rewgpu = await createREWGPU(canvas);
  if (!rewgpu) {
    return;
  }

  const pipelineRed = rewgpu.createPipeline({
    struct: `
    const pos = array<vec2<f32>, 3>(
      vec2(0.0, 0.5),
      vec2(-0.5, -0.5),
      vec2(0.5, -0.5)
  );`,
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
           return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
       }`,
      entryPoint: 'vertMain',
    },
    primitive: {
      topology: 'triangle-list',
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
  });

  const commandGreen = rewgpu.createCommand({
    pipeline: pipelineGreen,
    count: 3,
  });

  const resizeObserver = new ResizeObserver(() => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.max(
      1,
      Math.min(width, rewgpu.config.device.limits.maxTextureDimension2D),
    );
    canvas.height = Math.max(
      1,
      Math.min(height, rewgpu.config.device.limits.maxTextureDimension2D),
    );
  });

  resizeObserver.observe(canvas);

  function frame() {
    if (!rewgpu) {
      return;
    }
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: rewgpu.context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.8, b: 0.5, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };
    rewgpu.render(renderPassDescriptor, (p) => {
      commandGreen(p);
      commandRed(p);
    });
    requestAnimationFrame(frame);
  }
  frame();
}
