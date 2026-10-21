import { useEffect, useRef } from 'react';
import { mat4, vec4 } from 'gl-matrix';
import { createREWGPU } from '@box/rewgpu';
import style from './style.module.css';
import fontAtlas from './sdf.png';
import fontAtlasJson from './sdf.json';

export async function renderSDFText(canvas: HTMLCanvasElement) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error('WebGPU not supported');
    return;
  }
  const device = await adapter.requestDevice();
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  const rewgpu = await createREWGPU(canvas, {
    device,
    presentationFormat,
  });

  if (!rewgpu) {
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = fontAtlas.src;

  img.onload = () => {
    const texture = rewgpu.texture({
      size: [img.width, img.height],
      usage:
        GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
      format: 'rgba8unorm',
    });

    if (!texture.texture) {
      return;
    }

    rewgpu.config.device.queue.copyExternalImageToTexture(
      {
        source: img,
      },
      {
        texture: texture.texture,
        premultipliedAlpha: true,
      },
      { width: img.width, height: img.height },
    );

    const scale = 100;
    const buffer = 0.2;
    const angle = -0.001592;
    const translateX = 0;
    const gamma = 1;
    const debug = 0;

    const pMatrix = mat4.create();
    mat4.ortho(pMatrix, 0, canvas.width, canvas.height, 0, 0, -1);

    const mvMatrix = mat4.create();
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [
      canvas.width / 2,
      canvas.height / 2,
      0,
    ]);
    mat4.rotateZ(mvMatrix, mvMatrix, angle);
    mat4.translate(mvMatrix, mvMatrix, [
      -canvas.width / 2,
      -canvas.height / 2,
      0,
    ]);
    mat4.translate(mvMatrix, mvMatrix, [translateX, 0, 0]);

    const mvpMatrix = mat4.create();
    mat4.mul(mvpMatrix, pMatrix, mvMatrix);

    const mvpMatrixArrayBuffer = new Float32Array(mvpMatrix);
    const mvpMatrixBuffer = rewgpu.buffer({
      data: mvpMatrixArrayBuffer,
      size: mvpMatrixArrayBuffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const texSize = new Float32Array([img.width, img.height]);

    const texSizeBuffer = rewgpu.buffer({
      data: texSize,
      size: texSize.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const aPositions: number[] = [];
    const aTexCoords: number[] = [];

    const dimensions = measureText('C', scale);
    const pen = {
      x: canvas.width / 2 - dimensions.advance / 2,
      y: canvas.height / 2,
    };

    drawGlyph('H', pen, scale, aPositions, aTexCoords);
    drawGlyph('e', pen, scale, aPositions, aTexCoords);
    drawGlyph('l', pen, scale, aPositions, aTexCoords);
    drawGlyph('l', pen, scale, aPositions, aTexCoords);
    drawGlyph('o', pen, scale, aPositions, aTexCoords);

    const aPositionsArrayBuffer = new Float32Array(aPositions);
    const aTexCoordsArrayBuffer = new Float32Array(aTexCoords);

    for (let i = 0; i < 6; i += 2) {
      const temp = vec4.create();
      vec4.transformMat4(
        temp,
        [aPositions[i], aPositions[i + 1], 0, 1],
        mvpMatrix,
      );
    }

    const aPositionsBuffer = rewgpu.buffer({
      data: aPositionsArrayBuffer,
      size: aPositionsArrayBuffer.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    const aTexCoordsBuffer = rewgpu.buffer({
      data: aTexCoordsArrayBuffer,
      size: aTexCoordsArrayBuffer.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const sampler = rewgpu.sampler({
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
    });

    const pipeline = rewgpu.createPipeline({
      label: 'pipeline',
      struct: `
        @group(0) @binding(0) var fontSampler: sampler;
        @group(0) @binding(1) var fontAtlas: texture_2d<f32>;
        @group(0) @binding(2) var<uniform> uTexSize: vec2<f32>;
        @group(0) @binding(3) var<uniform> uMatrix: mat4x4<f32>;

        struct VertexOutput {
          @builtin(position) position : vec4f,
          @location(0) vTexCoord : vec2f,
        };
      `,
      vert: {
        content: `
          fn vertexMain(
              @location(0) aPosition: vec2<f32>,
              @location(1) aTexCoord: vec2<f32>,
            ) -> VertexOutput {
              var result: VertexOutput;

              let temp = uMatrix * vec4(aPosition.xy, 0., 1.);
              result.position = vec4(temp.xy, 0., 1.);
              result.vTexCoord = aTexCoord / uTexSize;

              return result;
            }
        `,
        entryPoint: 'vertexMain',
        buffers: [
          {
            arrayStride: 2 * 4,
            attributes: [
              {
                format: 'float32x2',
                offset: 0,
                shaderLocation: 0, // Position, see vertex shader
              },
            ],
          },
          {
            arrayStride: 2 * 4,
            attributes: [
              {
                format: 'float32x2',
                offset: 0,
                shaderLocation: 1, // Position, see vertex shader
              },
            ],
          },
        ],
      },
      frag: {
        content: `
          fn fragmentMain(
              input: VertexOutput
            ) -> @location(0) vec4<f32> {
              let dist = textureSample(fontAtlas, fontSampler, input.vTexCoord).r;
              
              let u_buffer = 192. / 256.;
              let gamma = 1.4142 / 26.;
              let alpha = smoothstep(u_buffer - gamma, u_buffer + gamma, dist);

              if (alpha < 0.01) {
                discard;
              }

              return vec4(0.0, 0.8, 0.8, alpha);
            }
        `,
        entryPoint: 'fragmentMain',
      },
      primitive: {
        topology: 'triangle-list',
      },
    });

    const layout = pipeline.getBindGroupLayout(0);

    const group = rewgpu.group({
      layout,
      entries: [
        {
          binding: 0,
          resource: sampler,
        },
        {
          binding: 1,
          resource: texture,
        },
        {
          binding: 2,
          resource: texSizeBuffer,
        },
        {
          binding: 3,
          resource: mvpMatrixBuffer,
        },
      ],
    });

    const command = rewgpu.createCommand({
      pipeline,
      count: aPositions.length / 2,
      vertBuffers: [aPositionsBuffer, aTexCoordsBuffer],
      groups: [group],
    });

    function frame(tick: number) {
      if (!rewgpu) {
        return;
      }

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: rewgpu.context.getCurrentTexture().createView(),
            clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      };

      rewgpu.render(renderPassDescriptor, (p) => {
        command(p);
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  return rewgpu;
}

export default function RewgpuView() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvas.current) {
        canvas.current.width = window.innerWidth;
        canvas.current.height = window.innerHeight;
        renderSDFText(canvas.current);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={style.canvasContainer} style={{ background: 'skyblue' }}>
      <canvas ref={canvas} width={1024} height={512} />
    </div>
  );
}

function drawGlyph(
  chr: keyof typeof fontAtlasJson.chars,
  pen: { x: number; y: number },
  size: number,
  vertexElements: number[],
  textureElements: number[],
) {
  var metric = fontAtlasJson.chars[chr];

  if (!metric) return;

  var scale = size / fontAtlasJson.size;

  var factor = 1;

  var width = metric[0];
  var height = metric[1];
  var horiBearingX = metric[2];
  var horiBearingY = metric[3];
  var horiAdvance = metric[4];
  var posX = metric[5];
  var posY = metric[6];

  if (width > 0 && height > 0) {
    width += fontAtlasJson.buffer * 2;
    height += fontAtlasJson.buffer * 2;

    // Add a quad (= two triangles) per glyph.
    vertexElements.push(
      // Top Left (0, 0)
      factor * (pen.x + (horiBearingX - fontAtlasJson.buffer) * scale),
      factor * (pen.y - horiBearingY * scale),

      // Top Right (1, 0)
      factor * (pen.x + (horiBearingX - fontAtlasJson.buffer + width) * scale),
      factor * (pen.y - horiBearingY * scale),

      // Bottom Left (0, 1)
      factor * (pen.x + (horiBearingX - fontAtlasJson.buffer) * scale),
      factor * (pen.y + (height - horiBearingY) * scale),

      // Top Right (1, 1)
      factor * (pen.x + (horiBearingX - fontAtlasJson.buffer + width) * scale),
      factor * (pen.y - horiBearingY * scale),

      // Bottom Left (0, 1)
      factor * (pen.x + (horiBearingX - fontAtlasJson.buffer) * scale),
      factor * (pen.y + (height - horiBearingY) * scale),

      // Top Right (1, 0)
      factor * (pen.x + (horiBearingX - fontAtlasJson.buffer + width) * scale),
      factor * (pen.y + (height - horiBearingY) * scale),
    );

    textureElements.push(
      posX,
      posY,

      posX + width,
      posY,

      posX,
      posY + height,

      posX + width,
      posY,

      posX,
      posY + height,

      posX + width,
      posY + height,
    );
  }

  pen.x = pen.x + horiAdvance * scale;
}

function measureText(text: string, size: number) {
  const dimensions = {
    advance: 0,
  };

  const scale = size / fontAtlasJson.size;
  for (var i = 0; i < text.length; i++) {
    const char = text[i];
    const data: number[] = (fontAtlasJson.chars as any)[char];
    var horiAdvance = data[4];
    dimensions.advance += horiAdvance * scale;
  }

  return dimensions;
}
