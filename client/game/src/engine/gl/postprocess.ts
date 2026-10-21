import { REGLLoader, safeProp } from './regl';
import { prevPow2 } from 'bit-twiddle';
import _REGL from 'regl';
import { GameClientState } from '../game-client-schema';
import { hashURL } from '../../utils/hash-url';
import getTriangle from './triangle';

const NUM_BLURS = 4;

export default function (regl: _REGL.Regl, loader: REGLLoader) {
  const triangle = loader.require(getTriangle);

  function init(state: GameClientState) {
    state.postProcess.supported =
      loader.floatBuffer.type !== 'uint8' &&
      regl.hasExtension('WEBGL_depth_texture');
  }

  function update(state: GameClientState) {
    const { type, filter } = loader.floatBuffer;

    // Allocate/resize fbo
    state.postProcess.enabled =
      state.postProcess.supported && state.settings.postprocess;
    if (state.postProcess.enabled) {
      if (!state.postProcess.fbo) {
        state.postProcess.fboColor = regl.texture({
          shape: [state.camera.viewport[0], state.camera.viewport[1], 4],
          type,
          format: 'rgba',
          min: filter,
          mag: filter,
        });
        state.postProcess.fboDepth = regl.texture({
          shape: [state.camera.viewport[0], state.camera.viewport[1], 2],
          format: 'depth stencil',
          type: <any>'depth stencil',
        });
        state.postProcess.fbo = regl.framebuffer({
          color: state.postProcess.fboColor,
          depthStencil: <any>state.postProcess.fboDepth,
        });
      } else {
        state.postProcess.fbo.resize(
          state.camera.viewport[0],
          state.camera.viewport[1],
        );
      }
    } else {
      if (state.postProcess.fbo) {
        state.postProcess.fbo.destroy();
        state.postProcess.fbo = null;
      }
      if (state.postProcess.fboColor) {
        state.postProcess.fboColor.destroy();
        state.postProcess.fboColor = null;
      }
      if (state.postProcess.fboDepth) {
        state.postProcess.fboDepth.destroy();
        state.postProcess.fboDepth = null;
      }
    }

    // Allocate/resize fxaa buffer
    state.postProcess.fxaaEnabled =
      state.postProcess.enabled && state.settings.fxaa;
    if (state.postProcess.fxaaEnabled) {
      if (!state.postProcess.fxaaFBO) {
        state.postProcess.fxaaColor = regl.texture({
          shape: [state.camera.viewport[0], state.camera.viewport[1], 4],
          type,
          format: 'rgba',
        });
        state.postProcess.fxaaFBO = regl.framebuffer({
          color: state.postProcess.fxaaColor,
          depthStencil: false,
        });
      } else {
        state.postProcess.fxaaFBO.resize(
          state.camera.viewport[0],
          state.camera.viewport[1],
        );
      }
    } else {
      if (state.postProcess.fxaaFBO) {
        state.postProcess.fxaaFBO.destroy();
        state.postProcess.fxaaFBO = null;
      }
      if (state.postProcess.fxaaColor) {
        state.postProcess.fxaaColor.destroy();
        state.postProcess.fxaaColor = null;
      }
    }

    // Allocate/resize blur buffers
    state.postProcess.blurEnabled =
      state.postProcess.enabled && state.settings.bloom;
    if (state.postProcess.blurEnabled) {
      let targetWidth = prevPow2(state.camera.viewport[0]);
      let targetHeight = prevPow2(state.camera.viewport[1]);

      state.postProcess.blurShape[0] = targetWidth;
      state.postProcess.blurShape[1] = targetHeight;

      while (state.postProcess.blurBuffers.length > NUM_BLURS) {
        const b = state.postProcess.blurBuffers.pop();
        if (b) {
          const color = (<any>b).color;
          b.destroy();
          color.destroy();
        }
      }

      state.postProcess.blurBuffers.length = NUM_BLURS;
      for (let i = 0; i < NUM_BLURS; ++i) {
        const buffer = state.postProcess.blurBuffers[i];
        if (buffer) {
          buffer.resize(targetWidth, targetHeight);
        } else {
          state.postProcess.blurBuffers[i] = regl.framebuffer({
            color: regl.texture({
              shape: [targetWidth, targetHeight, 4],
              format: 'rgba',
              type: 'uint8',
              min: 'linear',
              mag: 'linear',
              wrap: 'clamp',
            }),
            depthStencil: false,
          });
        }
        targetHeight = Math.max(
          1,
          Math.floor(targetHeight / state.postProcess.blurScale),
        );
        targetWidth = Math.max(
          1,
          Math.floor(targetWidth / state.postProcess.blurScale),
        );
      }
    } else {
      for (let i = 0; i < state.postProcess.blurBuffers.length; ++i) {
        const blur = state.postProcess.blurBuffers[i];
        if (blur) {
          blur.destroy();
        }
      }
      state.postProcess.blurBuffers.length = 0;
    }

    state.postProcess.scatteringEnabled =
      state.postProcess.enabled && state.settings.volumetricScattering;
    if (state.postProcess.scatteringEnabled) {
      const targetWidth = prevPow2(state.camera.viewport[0] / 8);
      const targetHeight = prevPow2(state.camera.viewport[1] / 8);
      if (!state.postProcess.scatteringBuffer) {
        state.postProcess.scatteringBuffer = regl.framebuffer({
          color: regl.texture({
            shape: [targetWidth, targetHeight, 4],
            format: 'rgba',
            type,
            min: filter,
            mag: filter,
            wrap: 'clamp',
          }),
          depthStencil: false,
        });
      } else {
        state.postProcess.scatteringBuffer.resize(targetWidth, targetHeight);
      }
    } else {
      if (state.postProcess.scatteringBuffer) {
        state.postProcess.scatteringBuffer.destroy();
        state.postProcess.scatteringBuffer = null;
      }
    }

    // allocate/update LUT
    state.postProcess.lutEnabled =
      state.postProcess.lutSupported && state.secret.replica.colorLUT !== '';

    if (state.postProcess.lutEnabled) {
      if (!state.postProcess.lut) {
        const lutData = new Uint8Array(16 * 16 * 16 * 4);
        for (let r = 0; r < 16; ++r) {
          for (let g = 0; g < 16; ++g) {
            for (let b = 0; b < 16; ++b) {
              const ptr = 4 * (r + 16 * b + 256 * g);
              lutData[ptr] = r * 16;
              lutData[ptr + 1] = g * 16;
              lutData[ptr + 2] = b * 16;
              lutData[ptr + 3] = 255;
            }
          }
        }
        state.postProcess.lut = regl.texture({
          format: 'rgba',
          data: lutData,
          shape: [256, 16, 4],
          min: 'linear',
          mag: 'linear',
        });
      }

      const lutURL = state.secret.replica.colorLUT;
      if (state.postProcess.lutURL !== lutURL) {
        state.postProcess.lutURL = lutURL;
        if (state.postProcess.lutImage) {
          state.postProcess.lutImage.onload = null;
        }
        const img = (state.postProcess.lutImage = new Image());
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          if (state.postProcess.lut && state.postProcess.lutURL === lutURL) {
            state.postProcess.lut.subimage(img);
          }
        };
        img.src = hashURL(lutURL);
      }
    } else {
      if (state.postProcess.lut) {
        state.postProcess.lut.destroy();
        state.postProcess.lut = null;
      }
      if (state.postProcess.lutImage) {
        state.postProcess.lutImage.onload = null;
        state.postProcess.lutImage = null;
      }
      state.postProcess.lutURL = '';
    }

    // ssao
    state.postProcess.ssaoEnabled =
      state.postProcess.enabled &&
      !state.camera.underwater &&
      state.settings.ambientOcclusion;
    if (state.postProcess.ssaoEnabled) {
      if (!state.postProcess.ssaoBuffer) {
        state.postProcess.ssaoBuffer = regl.framebuffer({
          color: regl.texture({
            shape: [state.camera.viewport[0], state.camera.viewport[1], 3],
            format: 'rgb',
            type: 'uint8',
          }),
          depthStencil: false,
        });
      } else {
        state.postProcess.ssaoBuffer.resize(
          state.camera.viewport[0],
          state.camera.viewport[1],
        );
      }
    } else {
      if (state.postProcess.ssaoBuffer) {
        state.postProcess.ssaoBuffer.destroy();
        state.postProcess.ssaoBuffer = null;
      }
    }
  }

  function lost(state: GameClientState) {
    if (state.postProcess.lut) {
      state.postProcess.lut.destroy();
      state.postProcess.lut = null;
    }
    state.postProcess.lutImage = null;
    state.postProcess.lutURL = '';
  }

  const stateProp = safeProp<GameClientState>(regl);

  const initializeBrights = loader.cache(
    'bloom:init',
    {
      frag: `
            precision mediump float;
            varying vec2 uv;
            uniform sampler2D pixels;
            struct POST {
                float exposure;
            };
            uniform POST post;
            void main () {
                vec3 color = 0.5 * post.exposure * texture2D(pixels, uv).rgb;
                vec3 bright = smoothstep(vec3(1.0), vec3(5.), color);
                float weight = max(max(bright.r, bright.g), bright.b) * ${
                  1 / (NUM_BLURS - 1)
                };
                gl_FragColor = vec4(color * weight, 1);
            }`,

      vert: `
            precision mediump float;
            attribute vec2 position;
            varying vec2 uv;
            void main () {
                uv = 0.5 * (position + 1.);
                gl_Position = vec4(position, 0, 1);
            }`,

      uniforms: {
        pixels: stateProp('postProcess')('fboColor').prop,
      },

      attributes: {
        position: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',

      framebuffer: stateProp('postProcess')('blurBuffers')(0).prop,
    },
    true,
  );

  const downsampleBlur = loader.cache<{}, { level: number }>(
    'bloom:downsample',
    {
      framebuffer: <any>(
        ((
          { state }: { state: GameClientState },
          { level }: { level: number },
        ) => <any>state.postProcess.blurBuffers[level + 1])
      ),

      frag: `
            precision mediump float;
            uniform sampler2D pixels;
            uniform vec2 shape;
            void main () {
                vec2 uv = gl_FragCoord.xy / shape;
                vec2 duv = 0.5 / shape;
                vec4 color = 4.0 * texture2D(pixels, uv);
                color += texture2D(pixels, uv + vec2(duv.x, duv.y));
                color += texture2D(pixels, uv + vec2(-duv.x, duv.y));
                color += texture2D(pixels, uv + vec2(duv.x, -duv.y));
                color += texture2D(pixels, uv + vec2(-duv.x, -duv.y));
                gl_FragColor = color / 8.0;
            }
            `,

      vert: `
            precision mediump float;
            attribute vec2 position;
            void main () {
                gl_Position = vec4(position, 0, 1);
            }
            `,

      uniforms: {
        pixels: ({ state }: { state: GameClientState }, { level }) =>
          state.postProcess.blurBuffers[level],
        shape: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
      },

      attributes: {
        position: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',
    },
    true,
  );

  const accumulateBloom = loader.cache(
    'bloom:accumulate',
    {
      frag: `
            precision mediump float;
            varying vec2 uv;
            uniform sampler2D blur[${NUM_BLURS - 1}];
            uniform vec2 shape;
            void main () {
                vec4 result = vec4(0.);
                vec2 duv = 0.5 / shape;
                for (int i = 0; i < ${NUM_BLURS - 1}; ++i) {
                    duv *= 4.0;
                    vec4 color = 4.0 * texture2D(blur[i], uv);
                    color += texture2D(blur[i], uv + vec2(duv.x, duv.y));
                    color += texture2D(blur[i], uv + vec2(-duv.x, duv.y));
                    color += texture2D(blur[i], uv + vec2(duv.x, -duv.y));
                    color += texture2D(blur[i], uv + vec2(-duv.x, -duv.y));
                    result += color / 8.0;
                }
                gl_FragColor = result;
            }`,

      vert: `
            precision mediump float;
            attribute vec2 position;
            varying vec2 uv;
            void main () {
                uv = 0.5 * (position + 1.);
                gl_Position = vec4(position, 0, 1);
            }`,

      uniforms: (() => {
        const props = {
          shape: stateProp('postProcess')('blurShape').prop,
        };
        for (let i = 1; i < NUM_BLURS; ++i) {
          props[`blur[${i - 1}]`] =
            stateProp('postProcess')('blurBuffers')(i).prop;
        }
        return props;
      })(),

      attributes: {
        position: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',

      blend: {
        enable: true,
        func: { src: 1, dst: 1 },
        equation: <'add'>'add',
      },

      framebuffer: stateProp('postProcess')('blurBuffers')(0).prop,
    },
    true,
  );

  function bloom(state: GameClientState) {
    initializeBrights(state);
    for (let i = 1; i < NUM_BLURS; ++i) {
      downsampleBlur({ level: i - 1 });
    }
    accumulateBloom(state);
  }

  const initScatter = loader.cache(
    'initScatter',
    {
      framebuffer: stateProp('postProcess')('scatteringBuffer').prop,

      frag: `
            precision mediump float;
            uniform sampler2D pixels;
            uniform vec2 shape;
            void main () {
                vec4 sample = texture2D(pixels, gl_FragCoord.xy / shape);
                gl_FragColor = vec4(sample.rgb * sample.a, 1.);
            }
            `,

      vert: `
            precision mediump float;
            attribute vec2 position;
            void main () {
                gl_Position = vec4(position, 0, 1);
            }
            `,

      uniforms: {
        pixels: stateProp('postProcess')('fboColor').prop,
        shape: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
      },

      attributes: {
        position: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',
    },
    true,
  );

  function scatter(state: GameClientState) {
    if (
      state.postProcess.scatteringEnabled &&
      state.camera.eyeFogAmount > 0.01
    ) {
      initScatter(state);
    }
  }

  const applyFxaa = loader.cache(
    'fxaa',
    {
      framebuffer: stateProp('postProcess')('fxaaFBO').prop,

      frag: require('./glsl/fxaa_frag.glsl'),
      vert: require('./glsl/fxaa_vert.glsl'),

      uniforms: {
        color: stateProp('postProcess')('fboColor').prop,
        shape: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
      },

      attributes: {
        p: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',
    },
    true,
  );

  const ssao = loader.cache(
    'ssao',
    {
      framebuffer: stateProp('postProcess')('ssaoBuffer').prop,
      frag: require('./glsl/ssao_frag.glsl'),
      vert: require('./glsl/trivial_vert.glsl'),
      uniforms: {
        depthStencil: stateProp('postProcess')('fboDepth').prop,
        shape: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
      },
      attributes: {
        p: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',
    },
    true,
  );
  const applyPostProcess = loader.cache(
    'postprocess',
    {
      framebuffer: null,

      frag: require('./glsl/postprocess_frag.glsl'),
      vert: require('./glsl/trivial_vert.glsl'),

      uniforms: {
        'tick': ({ tick }) => 0.01 * tick,
        'underwater': stateProp('camera')('underwater').prop,
        'color': (_, state: GameClientState) => {
          return state.postProcess.fxaaEnabled
            ? state.postProcess.fxaaColor
            : state.postProcess.fboColor;
        },
        'depthStencil': stateProp('postProcess')('fboDepth').prop,
        'scatterColor': stateProp('postProcess')('scatteringBuffer').prop,
        'screenLightPos': stateProp('camera')('screenLightPos').prop,
        'eyeFogExtinction': stateProp('camera')('eyeFogAmount').prop,
        'light.direction': stateProp('environment')('sunDirection').prop,
        'light.color': stateProp('environment')('sunColor').prop,
        'light.skyLeft': stateProp('environment')('skyLeft').prop,
        'light.skyRight': stateProp('environment')('skyRight').prop,
        'light.skyTop': stateProp('environment')('skyTop').prop,
        'light.skyBottom': stateProp('environment')('skyBottom').prop,
        'light.skyFront': stateProp('environment')('skyFront').prop,
        'light.skyBack': stateProp('environment')('skyBack').prop,
        'post.gamma': stateProp('environment')('gamma').prop,
        'post.exposure': stateProp('camera')('currentExposure').prop,
        'post.fogParams': stateProp('environment')('fogParams').prop,
        'post.fogParams2': stateProp('environment')('fogParams2').prop,
        'post.fogParams3': stateProp('environment')('fogParams3').prop,
        'lut': stateProp('postProcess')('lut').prop,
        'shape': ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
        'projection': stateProp('camera')('projection').prop,
        'playerDepth': stateProp('camera')('focalDistance').prop,
        'zNear': stateProp('camera')('zNear').prop,
        'zFar': stateProp('camera')('zFar').prop,
        'depthOfField': stateProp('settings')('depthOfField').prop,
        'bloom': stateProp('postProcess')('blurBuffers')(0).prop,
        'ssao': stateProp('postProcess')('ssaoBuffer').prop,
      },

      attributes: {
        p: 0,
      },
      vao: triangle,
      count: 3,
      offset: 0,
      primitive: <'triangles'>'triangles',

      depth: {
        enable: false,
        mask: false,
      },
    },
    true,
    {
      COLOR_LUT: (state: GameClientState) => state.postProcess.lutEnabled,
      BLOOM: (state: GameClientState) => state.postProcess.blurEnabled,
      DEPTH_OF_FIELD: (state: GameClientState) =>
        state.settings.depthOfField > 0,
      VOLUMETRIC_SCATTERING: (state: GameClientState) =>
        state.postProcess.scatteringEnabled && state.camera.eyeFogAmount > 0.01,
      SSAO: (state: GameClientState) => state.postProcess.ssaoEnabled,
    },
  );

  function draw(state: GameClientState) {
    if (state.postProcess.enabled) {
      if (state.postProcess.fxaaEnabled) {
        applyFxaa(state);
      }
      if (state.postProcess.ssaoEnabled) {
        ssao(state);
      }
      applyPostProcess(state)(state);
    }
  }

  return {
    init,
    update,
    bloom,
    scatter,
    draw,
    lost,
  };
}
