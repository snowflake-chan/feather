import { mat4 } from 'gl-matrix';
import { createREWGPU } from '@box/rewgpu';

export async function cube(canvas: HTMLCanvasElement) {
  const rewgpu = await createREWGPU(canvas);
  if (!rewgpu) {
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  // img.src =
  //   'https://assets.box3.fun/avatar/img/AZLGmLoRhTrYG2aW7dFfmE5HMXocCkAs3fWRRloTy1w.png';
  // img.src =
  //   'https://assets.box3.fun/engine/m/ifLWbqeoayHwvicie3UN3NcOIPicKNWLDy-iROqaJC4';
  img.src =
    '	https://assets.box3.fun/engine/m/DoxZNZTQVbpvxkkLmO8wrhtxp76wicAUD4onf_8ZZwM';
  img.onload = () => {
    const cubeVertexSize = 4 * 10; // Byte size of one cube vertex.
    const cubePositionOffset = 0;
    const cubeColorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
    const cubeUVOffset = 4 * 8;
    const cubeVertexCount = 36;

    // prettier-ignore
    const cubeVertexArray = new Float32Array([
    // float4 position, float4 color, float2 uv,
    1, -1, 1, 1,   1, 0, 1, 1,  0, 1,
    -1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
    -1, -1, -1, 1, 0, 0, 0, 1,  1, 0,
    1, -1, -1, 1,  1, 0, 0, 1,  0, 0,
    1, -1, 1, 1,   1, 0, 1, 1,  0, 1,
    -1, -1, -1, 1, 0, 0, 0, 1,  1, 0,
  
    1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
    1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
    1, -1, -1, 1,  1, 0, 0, 1,  1, 0,
    1, 1, -1, 1,   1, 1, 0, 1,  0, 0,
    1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
    1, -1, -1, 1,  1, 0, 0, 1,  1, 0,
  
    -1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
    1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
    1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
    -1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
    -1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
    1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
  
    -1, -1, 1, 1,  0, 0, 1, 1,  0, 1,
    -1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
    -1, -1, -1, 1, 0, 0, 0, 1,  0, 0,
    -1, -1, 1, 1,  0, 0, 1, 1,  0, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
  
    1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
    -1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
    -1, -1, 1, 1,  0, 0, 1, 1,  1, 0,
    -1, -1, 1, 1,  0, 0, 1, 1,  1, 0,
    1, -1, 1, 1,   1, 0, 1, 1,  0, 0,
    1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
  
    1, -1, -1, 1,  1, 0, 0, 1,  0, 1,
    -1, -1, -1, 1, 0, 0, 0, 1,  1, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
    1, 1, -1, 1,   1, 1, 0, 1,  0, 0,
    1, -1, -1, 1,  1, 0, 0, 1,  0, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
  ]);

    const cube = rewgpu.cube({
      data: [img, img, img, img, img, img],
      size: Math.max(img.width, img.height),
      usage:
        GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
      format: 'rgba8unorm',
    });

    const pipelineRed = rewgpu.createPipeline({
      struct: `
      struct Camera {
        model: mat4x4<f32>,
        view: mat4x4<f32>,
        proj: mat4x4<f32>,
      }
      @binding(0) @group(0) var<uniform> camera : Camera;
      
      struct VertexOutput {
        @builtin(position) Position : vec4<f32>,
        @location(0) fragUV : vec2<f32>,
        @location(1) fragPosition: vec4<f32>,
      }
  
      @group(0) @binding(1) var mySampler: sampler;
      @group(0) @binding(2) var myTexture: texture_cube<f32>;
      `,
      frag: {
        content: `
        fn fragMain(
          @location(0) fragUV: vec2<f32>,
          @location(1) fragPosition: vec4<f32>
        ) -> @location(0) vec4<f32> {
          // Our camera and the skybox cube are both centered at (0, 0, 0)
          // so we can use the cube geomtry position to get viewing vector to sample the cube texture.
          // The magnitude of the vector doesn't matter.
          var cubemapVec = fragPosition.xyz - vec3(0.5);
          return textureSample(myTexture, mySampler, cubemapVec);
        }`,
        entryPoint: 'fragMain',
      },
      vert: {
        content: `
        fn vertMain(
          @location(0) position : vec4<f32>,
          @location(1) uv : vec2<f32>
        ) -> VertexOutput {
          var output : VertexOutput;
          output.Position = camera.proj * camera.view * camera.model * position;
          output.fragUV = uv;
          output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
          return output;
        }`,
        entryPoint: 'vertMain',
        buffers: [
          {
            arrayStride: cubeVertexSize,
            attributes: [
              {
                // position
                shaderLocation: 0,
                offset: cubePositionOffset,
                format: 'float32x4',
              },
              {
                // uv
                shaderLocation: 1,
                offset: cubeUVOffset,
                format: 'float32x2',
              },
            ],
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back',
      },
    });

    const vert = rewgpu.buffer({
      data: cubeVertexArray,
      size: cubeVertexArray.byteLength,
      usage: GPUBufferUsage.VERTEX,
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

    const group = rewgpu.group({
      layout: pipelineRed.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: uniformBuffer,
        },
        {
          binding: 1,
          resource: rewgpu.sampler({
            magFilter: 'linear',
            minFilter: 'linear',
          }),
        },
        { binding: 2, resource: cube },
      ],
    });
    const command = rewgpu.createCommand({
      pipeline: pipelineRed,
      count: cubeVertexCount,
      vertBuffers: [vert],
      groups: [group],
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

    function frame(tick: number) {
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

      mat4.perspective(
        projection,
        Math.PI / 4,
        canvas.width / canvas.height,
        0.01,
        50.0,
      );
      mat4.lookAt(view, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
      mat4.fromRotation(model, 0.001 * tick, [0.3, 0.5, -0.2]);

      rewgpu.render(renderPassDescriptor, (p) => {
        command(p);
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };
}
