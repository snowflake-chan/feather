import { mat4 } from 'gl-matrix';
import { createREWGPU } from '@box/rewgpu';

export async function icosahedron(canvas: HTMLCanvasElement) {
  const rewgpu = await createREWGPU(canvas);
  if (!rewgpu) {
    return;
  }

  const VERTS = new Float32Array(3 * 12);
  for (let i = 0, v = 0; i < 3; ++i)
    for (let b = -1; b <= 1; b += 2)
      for (let a = -1; a <= 1; a += 2) {
        VERTS[v + i] = a;
        VERTS[v + ((i + 1) % 3)] = b * 0.5 * (1 + Math.sqrt(5));
        v += 3;
      }
  const vertBuffer = rewgpu.buffer({
    data: VERTS,
    size: VERTS.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  const INDEX = new Uint16Array(3 * 20);
  INDEX.set([
    5, 2, 3, 6, 0, 1, 8, 2, 5, 9, 0, 6, 9, 6, 7, 9, 2, 8, 10, 1, 4, 10, 4, 5,
    11, 3, 7, 11, 1, 10, 4, 1, 0, 7, 3, 2, 8, 4, 0, 8, 5, 4, 9, 7, 2, 9, 8, 0,
    10, 5, 3, 11, 6, 1, 11, 7, 6, 11, 10, 3,
  ]);

  const idBuffer = rewgpu.buffer({
    data: INDEX,
    size: INDEX.byteLength,
    usage: GPUBufferUsage.INDEX,
  });

  const matrixData = new Float32Array(3 * 16);
  const model = matrixData.subarray(0, 16);
  const view = matrixData.subarray(16, 32);
  const projection = matrixData.subarray(32, 48);

  const uniformBuffer = rewgpu.buffer({
    data: matrixData,
    size: matrixData.byteLength,
    usage: GPUBufferUsage.UNIFORM,
    isDynamic: true,
  });

  const pipeline = rewgpu.createPipeline({
    struct: `
    struct Camera {
      model: mat4x4<f32>,
      view: mat4x4<f32>,
      proj: mat4x4<f32>,
    }
    @binding(0) @group(0) var<uniform> camera : Camera;
    struct VertexOutput {
      @builtin(position) clipPosition : vec4<f32>,
      @location(0) fragColor : vec3<f32>,
    }`,
    frag: {
      content: `
      fn fragMain(@location(0) fragColor : vec3<f32>) -> @location(0) vec4<f32> {
        return vec4(fragColor, 1.0);
      }`,
      entryPoint: 'fragMain',
    },
    vert: {
      content: `
      fn vertMain(
        @location(0) meshPosition : vec3<f32>
      ) -> VertexOutput {
        var result : VertexOutput;
        result.clipPosition = camera.proj * camera.view * camera.model * vec4(meshPosition, 1.);
        result.fragColor = 0.25 * (2. + meshPosition);
        return result;
      }`,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: 3 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3',
            },
          ],
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const layout = pipeline.getBindGroupLayout(0);

  const group = rewgpu.group({
    entries: [
      {
        binding: 0,
        resource: uniformBuffer,
      },
    ],
    layout,
  });

  const command = rewgpu.createCommand({
    pipeline,
    count: 60,
    vertBuffers: [vertBuffer],
    groups: [group],
    indexBuffer: {
      reBuffer: idBuffer,
      indexFormat: 'uint16',
    },
  });
  let depthTextureBuffer = rewgpu.texture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
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

    depthTextureBuffer.destroy();
    depthTextureBuffer = rewgpu.texture({
      size: [canvas.width, canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  });

  resizeObserver.observe(canvas);

  function frame(tick: number) {
    if (!rewgpu || !depthTextureBuffer.texture) {
      return;
    }

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: rewgpu.context.getCurrentTexture().createView(),
          clearValue: { r: 0.2, g: 0.3, b: 0.1, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: depthTextureBuffer.texture.createView(),
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    };
    mat4.perspective(
      projection,
      Math.PI / 4,
      canvas.width / canvas.height,
      0.01,
      50.0,
    );
    mat4.lookAt(view, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
    mat4.fromRotation(model, 0.001 * tick, [0.3, 0.5, -0.2]);
    rewgpu.render(renderPassDescriptor, command);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
