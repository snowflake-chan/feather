import { useEffect, useRef } from 'react';
import { mat4, vec3 } from 'gl-matrix';
import { IndexBufferDescriptor, createREWGPU } from '@box/rewgpu';
import style from './style.module.css';
// import fontAtlas from './roboto-regular.png';
// import fontAtlasJson from './roboto-regular.json';
import fontAtlas from './Rubik-Regular.png';
import fontAtlasJson from './Rubik-Regular-msdf.json';

type Char = {
  id: number;
  index: number;
  char: string;
  width: number;
  height: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
  chnl: number;
  x: number;
  y: number;
  page: number;
};

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
        premultipliedAlpha: false,
      },
      { width: img.width, height: img.height },
    );

    const camera = new Float32Array(3 * 16);
    const model = camera.subarray(0, 16);
    const view = camera.subarray(16, 32);
    const projection = camera.subarray(32, 48);

    mat4.identity(model);

    const isPerspective = true;

    if (isPerspective) {
      mat4.perspective(
        projection,
        Math.PI / 4,
        canvas.width / canvas.height,
        0.01,
        1000.0,
      );

      mat4.lookAt(view, [0, 0, 300], [0, 0, 0], [0, 1, 0]);
    } else {
      const dist = 600;
      const distance = vec3.distance([0, 0, dist], [0, 0, 0]);
      const frustumHeight = 2 * distance * Math.tan(Math.PI / 8);
      const aspect = 1.5;

      const dx = (frustumHeight * aspect) / (2 * 1);
      const dy = frustumHeight / (2 * 1);

      let left = -dx;
      let right = dx;
      let top = dy;
      let bottom = -dy;

      mat4.ortho(projection, left, right, bottom, top, -1, 1000);

      mat4.lookAt(view, [0, 400, 400], [0, 0, 0], [0, 1, 0]);
    }

    const cameraBuffer = rewgpu.buffer({
      data: camera,
      size: camera.byteLength,
      usage: GPUBufferUsage.UNIFORM,
      isDynamic: true,
    });

    // const str = 'Hello';
    const str = '你好';
    const glyphs: Char[] = [];

    str.split('').forEach((char) => {
      const glyph = fontAtlasJson.chars.find(
        (charData) => charData.char === char,
      );

      glyph && glyphs.push(glyph);
    });

    const positions: number[] = [];
    const uvs: number[] = [];

    const {
      lineHeight,
      base,
      scaleW: texWidth,
      scaleH: texHeight,
    } = fontAtlasJson.common;
    const descender = lineHeight - base;

    const height = lineHeight - descender;

    let x = 0;
    let y = -height;

    const pos = [x, y];
    const scale = 1;

    // const len = glyphs.length * 2;
    for (let count = 0, i = 0, j = 0; count < glyphs.length; count++) {
      const bitmap = glyphs[count];

      const bw = bitmap.x + bitmap.width;
      const bh = bitmap.y + bitmap.height;

      // top left position
      const u0 = bitmap.x / texWidth;
      let v1 = bitmap.y / texHeight;
      const u1 = bw / texWidth;
      let v0 = bh / texHeight;

      /**
       * 注释掉的是three-msdf-text的demo写法
       * 但实际按这种写法的话，会是反的。
       * demo里是把材质处理成flipY。
       */
      // // BL
      // uvs[i++] = u0;
      // uvs[i++] = v1;
      // // TL
      // uvs[i++] = u0;
      // uvs[i++] = v0;
      // // TR
      // uvs[i++] = u1;
      // uvs[i++] = v0;
      // // BR
      // uvs[i++] = u1;
      // uvs[i++] = v1;

      // 调整下uv顺序
      // TL
      uvs[i++] = u0;
      uvs[i++] = v0;
      // BL
      uvs[i++] = u0;
      uvs[i++] = v1;
      // BR
      uvs[i++] = u1;
      uvs[i++] = v1;
      // TR
      uvs[i++] = u1;
      uvs[i++] = v0;

      // bottom left position
      const curX = pos[0] + bitmap.xoffset;
      const curY = pos[1] + bitmap.yoffset;

      // quad size
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;

      // BL
      positions[j++] = curX;
      positions[j++] = curY;
      // TL
      positions[j++] = curX;
      positions[j++] = curY + h;
      // TR
      positions[j++] = curX + w;
      positions[j++] = curY + h;
      // BR
      positions[j++] = curX + w;
      positions[j++] = curY;

      pos[0] += 50;
    }

    const texSize = new Float32Array([img.width, img.height]);

    const texSizeBuffer = rewgpu.buffer({
      data: texSize,
      size: texSize.byteLength,
      usage: GPUBufferUsage.UNIFORM,
    });

    const positionData = new Float32Array(positions);
    const positionsBuffer = rewgpu.buffer({
      data: positionData,
      size: positionData.byteLength,
      usage: GPUBufferUsage.VERTEX,
    });
    const uvsData = new Float32Array(uvs);
    const uvsBuffer = rewgpu.buffer({
      data: uvsData,
      size: uvsData.byteLength,
      usage: GPUBufferUsage.VERTEX,
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
        struct Camera {
          model: mat4x4<f32>,
          view: mat4x4<f32>,
          proj: mat4x4<f32>,
        }
      
        @group(0) @binding(0) var fontSampler: sampler;
        @group(0) @binding(1) var fontAtlas: texture_2d<f32>;
        @group(0) @binding(2) var<uniform> uTexSize: vec2<f32>;
        @group(0) @binding(3) var<uniform> camera : Camera;

        struct VertexOutput {
          @builtin(position) position : vec4f,
          @location(0) vUv : vec2f,
        };

        fn median(
          r: f32,
          g: f32,
          b: f32,
        ) ->  f32{
          return max(min(r, g), min(max(r, g), b));
        }
      `,
      vert: {
        content: `
          fn vertexMain(
              @location(0) aPosition: vec2<f32>,
              @location(1) aUv: vec2<f32>,
            ) -> VertexOutput {
              var result: VertexOutput;

              result.position = camera.proj * camera.view * camera.model * vec4(aPosition.xy, 0., 1.);
              result.vUv = aUv;

              let a = uTexSize;

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
                shaderLocation: 1, // UV
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
              let s = textureSample(fontAtlas, fontSampler, input.vUv);
              let sigDist = median(s.r, s.g, s.b) - 0.5;

              let alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);

              /**
               * TODO alpha阈值太小的话，会出现白色描边
               * 
               * 不过同样的代码在three-msdf-text却表现正常？
               */
              if (alpha < 0.01) {
                discard;
              }

              // if (alpha < 0.8) {
              //   discard;
              // }

              return vec4(0.5, 0.5, 0.5, alpha);
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
          resource: cameraBuffer,
        },
      ],
    });

    console.log(positions.length);

    const indexes: number[] = [];
    for (let i = 0, j = 0; i < glyphs.length; i++) {
      indexes.push(j, j + 1, j + 2, j, j + 2, j + 3);

      j += 4;
    }

    const indexesData = new Uint16Array(indexes);
    const indexBuffer: IndexBufferDescriptor = {
      reBuffer: rewgpu.buffer({
        data: indexesData,
        size: indexesData.byteLength,
        usage: GPUBufferUsage.INDEX,
      }),
      indexFormat: 'uint16',
    };

    const command = rewgpu.createCommand({
      pipeline,
      count: indexes.length,
      vertBuffers: [positionsBuffer, uvsBuffer],
      groups: [group],
      indexBuffer,
    });

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

      mat4.fromRotation(model, 0.001 * tick, [0.3, 0.5, -0.2]);

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
    <div className={style.canvasContainer}>
      <canvas ref={canvas} width={1024} height={512} />
    </div>
  );
}
