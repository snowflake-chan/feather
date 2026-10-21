import { createREWGPU } from '@box/rewgpu';
import { mat4, vec4 } from 'gl-matrix';

const NUM_SPRITES = 1000;

const PALETTE = [
  [0.19215686274509805, 0.2235294117647059, 0.23529411764705882, 1],
  [0.12941176470588237, 0.4627450980392157, 1, 1],
  [0.2, 0.6313725490196078, 0.9921568627450981, 1],
  [0.9921568627450981, 0.792156862745098, 0.25098039215686274, 1],
  [0.9686274509803922, 0.596078431372549, 0.1411764705882353, 1],
];

export async function sprites(canvas: HTMLCanvasElement) {
  const rewgpu = await createREWGPU(canvas);
  if (!rewgpu) {
    return;
  }

  const spriteParams = new Float32Array(NUM_SPRITES * 3 * 4);
  for (let i = 0; i < NUM_SPRITES; ++i) {
    const color = PALETTE[1 + (i % (PALETTE.length - 1))];
    const shape = [
      (3 + (i % 10)) / (2.0 * Math.PI),
      (1 + (i % 3)) / 3,
      (1 + (i % 7)) / 7,
      Math.random() - 0.5,
    ];
    for (let j = 0; j < 4; ++j) {
      spriteParams[3 * 4 * i + j] = Math.random();
      spriteParams[3 * 4 * i + 4 + j] = color[j];
      spriteParams[3 * 4 * i + 8 + j] = shape[j];
    }
  }
  const spriteParamBuffer = rewgpu.buffer({
    data: spriteParams,
    size: spriteParams.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });

  const spriteQuadUV = new Float32Array(2 * 4);
  spriteQuadUV.set([-1, -1, -1, 1, 1, -1, 1, 1]);
  const spriteQuadUVBuffer = rewgpu.buffer({
    data: spriteQuadUV,
    size: spriteQuadUV.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  const uniformData = new Float32Array(256);
  const model = uniformData.subarray(0, 16);
  const view = uniformData.subarray(16, 32);
  const projection = uniformData.subarray(32, 48);
  const fog = uniformData.subarray(48, 52);
  const uniformBuffer = rewgpu.buffer({
    data: uniformData,
    size: uniformData.byteLength,
    usage: GPUBufferUsage.UNIFORM,
    isDynamic: true,
  });

  const pipeline = rewgpu.createPipeline({
    struct: `
    struct Uniforms {
      model : mat4x4<f32>,
      view : mat4x4<f32>,
      proj : mat4x4<f32>,
      fog : vec4<f32>,
      tick : f32,
    }
    @binding(0) @group(0) var<uniform> uniforms : Uniforms;
    
    struct SpriteParameters {
      seed : vec4<f32>,
      color : vec4<f32>,
      shape : vec4<f32>,
    }
    @binding(0) @group(1) var<storage, read> spriteParams : array<SpriteParameters>;
    
    struct VertexOutput {
      @builtin(position) clipPosition : vec4<f32>,
      @location(0) color : vec4<f32>,
      @location(1) pointCoord : vec2<f32>,
      @location(2) shape : vec4<f32>,
    }
    `,
    frag: {
      content: `
      fn fragMain(
        @location(0) color : vec4<f32>,
        @location(1) pointCoord : vec2<f32>,
        @location(2) shape : vec4<f32>,
      ) -> @location(0) vec4<f32> {
        let t = fract(atan2(pointCoord.y, pointCoord.x) * shape.x + shape.w * uniforms.tick);
        let r = length(pointCoord);
        let tri = abs(t - floor(t + 0.5));
        let cut = mix(shape.y, shape.z, tri);
        if r > cut {
          discard;
        }
        return color;
      }`,
      entryPoint: 'fragMain',
    },
    vert: {
      content: `
      fn vertMain(
        @builtin(instance_index) instanceIdx : u32,
        @location(0) uv : vec2<f32>,
      ) -> VertexOutput {
        var params = spriteParams[instanceIdx];
      
        var seed = params.seed;
        var tick = 0.25 * uniforms.tick + 10. * (seed.x + seed.y + seed.z + seed.w);
        var dotPosition = cos(seed.w * tick + 1.5766) * normalize(vec3(
          sin(seed.x * tick + 3.),
          sin(seed.y * tick + 1.5),
          sin(seed.z * tick + 33.)
        ));
        var dotPositionView = uniforms.view * uniforms.model * vec4(dotPosition, 1.)
          + vec4(0.1 * seed.w * uv, 0., 0.);
      
        var result : VertexOutput;
        result.clipPosition = uniforms.proj * dotPositionView;
        result.color = mix(uniforms.fog, params.color, exp(0.02 * dotPositionView.z));
        result.pointCoord = uv;
        result.shape = params.shape;
        return result;
      }`,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: 2 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    primitive: {
      topology: 'triangle-strip',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

  const layout = pipeline.getBindGroupLayout(0);

  const uniformGroup = rewgpu.group({
    entries: [
      {
        binding: 0,
        resource: uniformBuffer,
      },
    ],
    layout,
  });
  const spriteGroupLayout = pipeline.getBindGroupLayout(1);
  const spriteGroup = rewgpu.group({
    entries: [
      {
        binding: 0,
        resource: spriteParamBuffer,
      },
    ],
    layout: spriteGroupLayout,
  });

  const command = rewgpu.createCommand({
    pipeline,
    count: 4,
    instanceCount: NUM_SPRITES,
    vertBuffers: [spriteQuadUVBuffer],
    groups: [uniformGroup, spriteGroup],
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
          clearValue: {
            r: PALETTE[0][0],
            g: PALETTE[0][1],
            b: PALETTE[0][2],
            a: 1.0,
          },
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

    rewgpu.render(renderPassDescriptor, command);
    mat4.perspective(
      projection,
      Math.PI / 4,
      canvas.width / canvas.height,
      0.01,
      50.0,
    );
    mat4.lookAt(view, [0, 1, -3], [0, 0, 0], [0, 1, 0]);
    mat4.fromRotation(model, 0.0005 * tick, [0, 1, 0]);
    vec4.copy(fog, PALETTE[0] as vec4);
    uniformData[52] = 0.001 * tick;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
