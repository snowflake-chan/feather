import { Regl, Texture, Texture2D } from 'regl';
import { REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import {
  UI3DLineSpec,
  UI3DTextSpec,
  UI3DSphereSpec,
  UI3DConeSpec,
  UI3DQuadSpec,
  UI3DRingSpec,
  UI3DBoxSpec,
  UI3DElement,
  UI3DCursorIndicatorSpec,
  UI3DTextureBoxSpec,
  UI3DDirectionSignSpec,
} from '../ui3d/ui3d-schema';
import { vec4, vec3 } from 'gl-matrix';
import { drawText3D } from '../overlay/overlays';

export enum CursorIndicatorType {
  add = 1,
  remove = 2,
  replace = 3,
}
const worldPos = vec4.create();
const clipPos = vec4.create();
let addCursorTexture: Texture2D;
let removeCursorTexture: Texture2D;
let paintCursorTexture: Texture2D;

function initCursorIndicatorTexture(regl: Regl) {
  const data1 = new Uint8Array(32 * 32 * 4);
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 2; j++) {
      data1[(i + j * 32) * 4 + 1] = data1[(i + j * 32) * 4 + 3] = 255;
      data1[(31 - i + j * 32) * 4 + 1] = data1[(31 - i + j * 32) * 4 + 3] = 255;
      data1[(j + i * 32) * 4 + 1] = data1[(j + i * 32) * 4 + 3] = 255;
      data1[(31 - j + i * 32) * 4 + 1] = data1[(31 - j + i * 32) * 4 + 3] = 255;

      data1[(i + (31 - j) * 32) * 4 + 1] = data1[
        (i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data1[(31 - i + (31 - j) * 32) * 4 + 1] = data1[
        (31 - i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data1[(j + (31 - i) * 32) * 4 + 1] = data1[
        (j + (31 - i) * 32) * 4 + 3
      ] = 255;
      data1[(31 - j + (31 - i) * 32) * 4 + 1] = data1[
        (31 - j + (31 - i) * 32) * 4 + 3
      ] = 255;
    }
  }
  for (let i = 15; i < 17; i++) {
    for (let j = 9; j < 23; j++) {
      data1[(i + j * 32) * 4 + 1] = data1[(i + j * 32) * 4 + 3] = 255;
      data1[(j + i * 32) * 4 + 1] = data1[(j + i * 32) * 4 + 3] = 255;
    }
  }
  addCursorTexture = regl.texture({
    width: 32,
    height: 32,
    format: 'rgba',
    type: 'uint8',
    data: data1,
    wrap: 'repeat',
  });

  const data2 = new Uint8Array(32 * 32 * 4);
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 2; j++) {
      data2[(i + j * 32) * 4 + 0] = data2[(i + j * 32) * 4 + 3] = 255;
      data2[(31 - i + j * 32) * 4 + 0] = data2[(31 - i + j * 32) * 4 + 3] = 255;
      data2[(j + i * 32) * 4 + 0] = data2[(j + i * 32) * 4 + 3] = 255;
      data2[(31 - j + i * 32) * 4 + 0] = data2[(31 - j + i * 32) * 4 + 3] = 255;

      data2[(i + (31 - j) * 32) * 4 + 0] = data2[
        (i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data2[(31 - i + (31 - j) * 32) * 4 + 0] = data2[
        (31 - i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data2[(j + (31 - i) * 32) * 4 + 0] = data2[
        (j + (31 - i) * 32) * 4 + 3
      ] = 255;
      data2[(31 - j + (31 - i) * 32) * 4 + 0] = data2[
        (31 - j + (31 - i) * 32) * 4 + 3
      ] = 255;
    }
  }
  for (let i = 15; i < 17; i++) {
    for (let j = 9; j < 23; j++) {
      data2[(i + j * 32) * 4 + 0] = data2[(i + j * 32) * 4 + 3] = 255;
    }
  }
  removeCursorTexture = regl.texture({
    width: 32,
    height: 32,
    format: 'rgba',
    type: 'uint8',
    data: data2,
    wrap: 'repeat',
  });

  const data3 = new Uint8Array(32 * 32 * 4);
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 2; j++) {
      data3[(i + j * 32) * 4 + 0] = data3[(i + j * 32) * 4 + 3] = 255;
      data3[(i + j * 32) * 4 + 1] = 100;
      data3[(31 - i + j * 32) * 4 + 0] = data3[(31 - i + j * 32) * 4 + 3] = 255;
      data3[(31 - i + j * 32) * 4 + 1] = 100;
      data3[(j + i * 32) * 4 + 0] = data3[(j + i * 32) * 4 + 3] = 255;
      data3[(j + i * 32) * 4 + 1] = 100;
      data3[(31 - j + i * 32) * 4 + 0] = data3[(31 - j + i * 32) * 4 + 3] = 255;
      data3[(31 - j + i * 32) * 4 + 1] = 100;

      data3[(i + (31 - j) * 32) * 4 + 0] = data3[
        (i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data3[(i + (31 - j) * 32) * 4 + 1] = 100;
      data3[(31 - i + (31 - j) * 32) * 4 + 0] = data3[
        (31 - i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data3[(31 - i + (31 - j) * 32) * 4 + 1] = 100;
      data3[(j + (31 - i) * 32) * 4 + 0] = data3[
        (j + (31 - i) * 32) * 4 + 3
      ] = 255;
      data3[(j + (31 - i) * 32) * 4 + 1] = 100;
      data3[(31 - j + (31 - i) * 32) * 4 + 0] = data3[
        (31 - j + (31 - i) * 32) * 4 + 3
      ] = 255;
      data3[(31 - j + (31 - i) * 32) * 4 + 1] = 100;
    }
  }

  for (let i = 11; i < 21; i++) {
    for (let j = 9; j < 11; j++) {
      data3[(i + j * 32) * 4 + 0] = data3[(i + j * 32) * 4 + 3] = 255;
      data3[(i + j * 32) * 4 + 1] = 100;
      data3[(i + (31 - j) * 32) * 4 + 0] = data3[
        (i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data3[(i + (31 - j) * 32) * 4 + 1] = 100;

      data3[(j + i * 32) * 4 + 0] = data3[(j + i * 32) * 4 + 3] = 255;
      data3[(j + i * 32) * 4 + 1] = 100;
      data3[(31 - j + i * 32) * 4 + 0] = data3[(31 - j + i * 32) * 4 + 3] = 255;
      data3[(31 - j + i * 32) * 4 + 1] = 100;
    }
  }
  for (let i = 11; i < 13; i++) {
    for (let j = 11; j < 13; j++) {
      data3[(i + j * 32) * 4 + 0] = data3[(i + j * 32) * 4 + 3] = 255;
      data3[(i + j * 32) * 4 + 1] = 100;
      data3[(31 - i + j * 32) * 4 + 0] = data3[(31 - i + j * 32) * 4 + 3] = 255;
      data3[(31 - i + j * 32) * 4 + 1] = 100;
      data3[(31 - i + (31 - j) * 32) * 4 + 0] = data3[
        (31 - i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data3[(31 - i + (31 - j) * 32) * 4 + 1] = 100;
      data3[(i + (31 - j) * 32) * 4 + 0] = data3[
        (i + (31 - j) * 32) * 4 + 3
      ] = 255;
      data3[(i + (31 - j) * 32) * 4 + 1] = 100;
    }
  }
  paintCursorTexture = regl.texture({
    width: 32,
    height: 32,
    format: 'rgba',
    type: 'uint8',
    data: data3,
    wrap: 'repeat',
  });
}

export default function (regl: Regl, loader: REGLLoader) {
  initCursorIndicatorTexture(regl);

  const SYMBOLS = {
    COLOR_LUT: (state: GameClientState) =>
      state.postProcess.lutEnabled && !state.postProcess.enabled,
    HDR: (state: GameClientState) => state.postProcess.enabled,
  };

  const lineProp = safeProp<UI3DLineSpec>(regl);
  const drawLine = loader.cache(
    'ui3d-lines',
    {
      frag: require('./glsl/ui3d_line_frag.glsl'),
      vert: `
            precision highp float;
            attribute vec2 weight;
            varying highp vec3 position;
            uniform mat4 projection, view;
            uniform vec3 start, end, eye;
            uniform float width, fixedSize;
            uniform bool screenSizeFixed;
            void main () {
                vec3 base = mix(start, end, weight.x);
                vec3 lineDir = end - start;
                vec3 eyeDir = eye - base;
                vec3 normalDir = normalize(cross(lineDir, eyeDir));
                vec3 translation = base;
                vec3 point = width * weight.y * normalDir;
                position = point + translation;

                if (screenSizeFixed) {
                    vec3 offset = base - start;
                    float scale = distance(eye, start);
                    point = width * weight.y * normalDir;
                    position = start + ((point + offset) * scale / fixedSize);
                    gl_Position = projection * view * vec4(position, 1);
                } else {
                    gl_Position = projection * view * vec4(position, 1);
                }
            }`,
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      uniforms: {
        fixedSize: lineProp('fixedSize').prop,
        screenSizeFixed: lineProp('screenSizeFixed').prop,
        start: lineProp('start').prop,
        end: lineProp('end').prop,
        color: lineProp('color').prop,
        width: lineProp('width').prop,
        opacity: lineProp('opacity').prop,
      },

      attributes: {
        weight: [
          [0, 1],
          [0, -1],
          [1, -1],
          [1, 1],
          [1, -1],
          [0, 1],
        ],
      },

      count: 6,
      primitive: 'triangles',
      elements: null,
    },
    true,
    SYMBOLS,
  );

  const dirSignProp = safeProp<UI3DDirectionSignSpec>(regl);
  const drawDirSign = loader.cache(
    'ui3d-dirSign',
    {
      frag: require('./glsl/ui3d_line_frag.glsl'),
      vert: `
            precision highp float;
            attribute vec2 weight;
            varying highp vec3 position;
            uniform mat4 projection, view;
            uniform vec3 start, end, eye, normal;
            uniform float width, faceToEye;
            void main () {
                vec3 base = mix(start, end, weight.x);
                vec3 lineDir = end - start;
                vec3 normalDir;
                if (faceToEye > 0.0) {
                    vec3 eyeDir = eye - base;
                    normalDir = normalize(cross(lineDir, eyeDir));
                } else {
                    normalDir = normalize(cross(lineDir, normal));
                }
                vec3 translation = base;
                vec3 point = width * weight.y * normalDir;
                position = point + translation;
                gl_Position = projection * view * vec4(position, 1);
            }`,
      depth: {
        enable: true,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      uniforms: {
        start: dirSignProp('start').prop,
        end: dirSignProp('end').prop,
        color: dirSignProp('color').prop,
        width: dirSignProp('width').prop,
        normal: dirSignProp('normal').prop,
        faceToEye: dirSignProp('faceToEye').prop,
        opacity: dirSignProp('opacity').prop,
      },

      attributes: {
        weight: [
          [1, 0],
          [-1, -1],
          [-1, 1],
        ],
      },

      count: 3,
      primitive: 'triangles',
      elements: null,
    },
    true,
    SYMBOLS,
  );

  // generate a sphere mesh
  const sphereProp = safeProp<UI3DSphereSpec>(regl);
  const drawSphere = loader.cache(
    'ui3d-spheres',
    {
      frag: require('./glsl/ui3d_point_frag.glsl'),
      vert: `
            precision highp float;
            attribute vec3 offset;
            varying highp vec3 position;
            uniform mat4 projection, view;
            uniform vec3 center;
            uniform float radius;
            uniform vec3 eye;
            void main () {
                vec3 P = center;
                position = center;
                gl_Position = projection * view * vec4(P, 1);
                gl_PointSize = radius * 1000.0 / (distance(eye, center));
            }`,

      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },

      uniforms: {
        center: sphereProp('position').prop,
        radius: sphereProp('radius').prop,
        color: sphereProp('color').prop,
      },

      attributes: {
        offset: [[1, 1, 1]],
      },

      count: 1,
      primitive: 'points',
      elements: null,
    },
    true,
    SYMBOLS,
  );

  const coneProp = safeProp<UI3DConeSpec>(regl);
  const drawTrivial = loader.cache(
    'ui3d-trivial',
    {
      frag: require('./glsl/ui3d_line_frag.glsl'),
      vert: `
            precision mediump float;
            uniform mat4 projection, view, translate, rotate;
            uniform bool screenSizeFixed;
            uniform highp vec3 eye, offset;
            uniform float fixedSize;
            attribute vec3 vertex;
            varying highp vec3 position;
            void main() {
                mat4 M = translate * rotate;
                if (screenSizeFixed) {
                    vec4 pos = M * vec4(vertex, 1);
                    float scale = distance(eye, pos.xyz);
                    vec3 pos2 = (M * vec4((vertex * scale / fixedSize), 1)).xyz;
                    position = pos2 + (offset * scale / fixedSize);
                    gl_Position = projection * view * vec4(position, 1);
                } else {
                    vec3 pos2 = (M * vec4(vertex, 1)).xyz;
                    position = pos2 + offset;
                    gl_Position = projection * view * vec4(position, 1);
                }
            }
            `,
      depth: {
        enable: false,
      },
      cull: {
        enable: true,
        face: 'back',
      },
      attributes: {
        vertex: coneProp('vertices').prop,
        normal: coneProp('normals').prop,
      },
      uniforms: {
        opacity: 1,
        fixedSize: coneProp('fixedSize').prop,
        color: coneProp('color').prop,
        offset: coneProp('offset').prop,
        translate: coneProp('translateMat').prop,
        rotate: coneProp('rotateMat').prop,
        screenSizeFixed: coneProp('screenSizeFixed').prop,
      },
      primitive: 'triangles',
      elements: coneProp('indices').prop,
    },
    true,
    SYMBOLS,
  );

  const indicatorProp = safeProp<UI3DCursorIndicatorSpec>(regl);
  const drawIndicator = loader.cache(
    'ui3d-indicator',
    {
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      frag: require('./glsl/ui3d_indicator_frag.glsl'),
      vert: require('./glsl/ui3d_quad_vert.glsl'),
      attributes: {
        vertex: indicatorProp('vertices').prop,
        uv: indicatorProp('uv').prop,
      },
      uniforms: {
        tRGBA: (context, props) => {
          if (props.type === CursorIndicatorType.add) {
            return addCursorTexture;
          } else if (props.type === CursorIndicatorType.remove) {
            return removeCursorTexture;
          } else {
            return paintCursorTexture;
          }
        },
        screenSizeFixed: false,
        fixedSize: 1,
        radius: indicatorProp('radius').prop,
        translate: indicatorProp('translateMat').prop,
        normal: indicatorProp('normal').prop,
        offset: indicatorProp('offset').prop,
        center: indicatorProp('center').prop,
      },
      primitive: 'triangles',
      elements: [
        [0, 1, 2],
        [1, 3, 2],
      ],
    },
    true,
    SYMBOLS,
  );

  const quadProp = safeProp<UI3DQuadSpec>(regl);
  const drawQuad = loader.cache(
    'ui3d-quad',
    {
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      frag: require('./glsl/ui3d_quad_frag.glsl'),
      vert: require('./glsl/ui3d_quad_vert.glsl'),
      attributes: {
        vertex: quadProp('vertices').prop,
        uv: quadProp('uv').prop,
      },
      uniforms: {
        fixedSize: quadProp('fixedSize').prop,
        color: quadProp('color').prop,
        opacity: quadProp('opacity').prop,
        translate: quadProp('translateMat').prop,
        normal: quadProp('normal').prop,
        offset: quadProp('offset').prop,
        center: quadProp('center').prop,
        radius: quadProp('radius').prop,
        screenSizeFixed: quadProp('screenSizeFixed').prop,
        fence: quadProp('fence').prop,
      },
      primitive: 'triangles',
      elements: [
        [0, 1, 2],
        [1, 3, 2],
      ],
    },
    true,
    SYMBOLS,
  );

  const ringProp = safeProp<UI3DRingSpec>(regl);
  const drawRing = loader.cache(
    'ui3d-ring',
    {
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      frag: require('./glsl/ui3d_ring_frag.glsl'),
      vert: require('./glsl/ui3d_ring_vert.glsl'),
      attributes: {
        vertex: ringProp('vertices').prop,
        uv: ringProp('uv').prop,
      },
      uniforms: {
        startRad: ringProp('startRad').prop,
        currentRad: ringProp('currentRad').prop,
        clockwise: ringProp('clockwise').prop,
        fixedSize: ringProp('fixedSize').prop,
        color: ringProp('color').prop,
        fillColor: ringProp('fillColor').prop,
        translate: ringProp('translateMat').prop,
        radius: ringProp('radius').prop,
        offset: ringProp('offset').prop,
        center: ringProp('center').prop,
        screenSizeFixed: ringProp('screenSizeFixed').prop,
        highlight: ringProp('highlight').prop,
      },
      primitive: 'triangles',
      elements: ringProp('indices').prop,
    },
    true,
    SYMBOLS,
  );

  const drawCylinder = loader.cache(
    'ui3d-ring',
    {
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      frag: require('./glsl/ui3d_cylinder_frag.glsl'),
      vert: require('./glsl/ui3d_ring_vert.glsl'),
      attributes: {
        vertex: ringProp('cylinderVertices').prop,
        uv: ringProp('cylinderUv').prop,
      },
      uniforms: {
        fixedSize: ringProp('fixedSize').prop,
        color: ringProp('color').prop,
        translate: ringProp('translateMat').prop,
        radius: ringProp('radius').prop,
        offset: ringProp('offset').prop,
        center: ringProp('center').prop,
        screenSizeFixed: ringProp('screenSizeFixed').prop,
      },
      primitive: 'triangles',
      elements: ringProp('cylinderIndices').prop,
    },
    true,
    SYMBOLS,
  );

  const boxProp = safeProp<UI3DBoxSpec>(regl);
  const drawBox = loader.cache(
    'ui3d-box',
    {
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      cull: {
        enable: false,
        face: 'back',
      },
      frag: require('./glsl/ui3d_quad_frag.glsl'),
      vert: require('./glsl/ui3d_box_vert.glsl'),
      attributes: {
        vertex: boxProp('vertices').prop,
        uv: boxProp('uv').prop,
      },
      uniforms: {
        centerAtBottom: boxProp('centerAtBottom').prop,
        dimension: boxProp('dimension').prop,
        color: boxProp('color').prop,
        opacity: boxProp('opacity').prop,
        translate: boxProp('translateMat').prop,
        offset: boxProp('offset').prop,
        center: boxProp('position').prop,
        fixedSize: boxProp('fixedSize').prop,
        screenSizeFixed: boxProp('screenSizeFixed').prop,
        fence: 0,
      },
      primitive: 'triangles',
      count: 36,
    },
    true,
    SYMBOLS,
  );

  const drawBoxWireFrame = loader.cache(
    'ui3d-box',
    {
      frag: require('./glsl/ui3d_box_frame_frag.glsl'),
      vert: `
            precision mediump float;
            uniform mat4 projection, view, translate;
            uniform bool screenSizeFixed, centerAtBottom;
            uniform highp vec3 eye;
            uniform vec3 center, offset, dimension;
            uniform float fixedSize;
            attribute vec4 vertex;
            varying highp vec3 position;

            void main() {
                mat4 M = translate;
                vec3 actualPos = vertex.xyz;
                if (centerAtBottom) {
                    actualPos.y = actualPos.y + 0.5;
                }
                if (screenSizeFixed) {
                    float scale = distance(eye, center);
                    vec3 pos2 = (M * vec4((actualPos * dimension * scale / fixedSize), 1)).xyz;
                    position = pos2 + (offset * scale / fixedSize);
                    gl_Position = projection * view * vec4(position, 1);
                } else {
                    vec3 pos2 = (M * vec4(actualPos * dimension, 1)).xyz;
                    position = pos2 + offset;
                    gl_Position = projection * view * vec4(position, 1);
                }
            }
            `,
      attributes: {
        vertex: boxProp('lines').prop,
      },
      uniforms: {
        centerAtBottom: boxProp('centerAtBottom').prop,
        dimension: boxProp('dimension').prop,
        wireFrameColor: boxProp('wireFrameColor').prop,
        opacity: boxProp('opacity').prop,
        translate: boxProp('translateMat').prop,
        offset: boxProp('offset').prop,
        center: boxProp('position').prop,
        fixedSize: boxProp('fixedSize').prop,
        screenSizeFixed: boxProp('screenSizeFixed').prop,
      },
      primitive: 'lines',
      count: 48,
    },
    true,
    SYMBOLS,
  );

  const textureBoxProp = safeProp<UI3DTextureBoxSpec>(regl);
  const drawTextureBox = loader.cache(
    'ui3d-texture-box',
    {
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [1, 1, 1, 1],
      },
      cull: {
        enable: true,
        face: 'back',
      },
      vert: require('./glsl/ui3d_texturebox_vert.glsl'),
      frag: require('./glsl/ui3d_texturebox_frag.glsl'),
      attributes: {
        vertex: textureBoxProp('vertices').prop,
      },
      uniforms: {
        dimension: textureBoxProp('dimension').prop,
        translate: textureBoxProp('translateMat').prop,
        offset: textureBoxProp('offset').prop,
        center: textureBoxProp('position').prop,
        opacity: textureBoxProp('opacity').prop,
        texCoordXPos: textureBoxProp('texCoordXPos').prop,
        texCoordXNeg: textureBoxProp('texCoordXNeg').prop,
        texCoordYPos: textureBoxProp('texCoordYPos').prop,
        texCoordYNeg: textureBoxProp('texCoordYNeg').prop,
        texCoordZPos: textureBoxProp('texCoordZPos').prop,
        texCoordZNeg: textureBoxProp('texCoordZNeg').prop,
        atlasRadius: textureBoxProp('atlasRadius').prop,
        rotation: textureBoxProp('rotation').prop,
        frameLeft: textureBoxProp('frameLeft').prop,
        frameRight: textureBoxProp('frameRight').prop,
        frameBottom: textureBoxProp('frameBottom').prop,
        frameTop: textureBoxProp('frameTop').prop,
        frameFront: textureBoxProp('frameFront').prop,
        frameBack: textureBoxProp('frameBack').prop,
      },
      primitive: 'triangles',
      count: 36,
    },
    true,
    {
      COLOR_LUT: (state: GameClientState) =>
        state.postProcess.lutEnabled && !state.postProcess.enabled,
      HDR: (state: GameClientState) => state.postProcess.enabled,
    },
  );

  return {
    forward: (state: GameClientState, seedList: UI3DElement[]) => {
      // split into subtypes
      const line: UI3DLineSpec[] = [];
      const point: UI3DSphereSpec[] = [];
      const cone: UI3DConeSpec[] = [];
      const quad: UI3DQuadSpec[] = [];
      const indicator: UI3DCursorIndicatorSpec[] = [];
      const ring: UI3DRingSpec[] = [];
      const ringCylinder: UI3DRingSpec[] = [];
      const box: UI3DBoxSpec[] = [];
      const boxWireFrame: UI3DBoxSpec[] = [];
      const textureBoxs: UI3DTextureBoxSpec[] = [];
      const dirSigns: UI3DDirectionSignSpec[] = [];

      for (let i = 0; i < seedList.length; ++i) {
        const e = seedList[i];
        switch (e.type) {
          case 'line':
            if ((<UI3DLineSpec>e.data).visiable) {
              line.push(<UI3DLineSpec>e.data);
            }
            break;
          case 'text':
            const textData = <UI3DTextSpec>e.data;
            drawText3D(state, textData.text, textData.position, {
              cameraDistanceScale: textData.scale,
              font: textData.font,
              color: textData.fill,
              perspective: textData.perspective,
            });
            break;
          case 'point':
            point.push(<UI3DSphereSpec>e.data);
            break;
          case 'cone':
            cone.push(<UI3DConeSpec>e.data);
            break;
          case 'quad':
            quad.push(<UI3DQuadSpec>e.data);
            break;
          case 'ring':
            const ringData = <UI3DRingSpec>e.data;
            ring.push(ringData);
            ringCylinder.push(ringData);
            break;
          case 'box':
            const boxData = <UI3DBoxSpec>e.data;
            box.push(boxData);
            if (boxData.wireFrame) {
              boxWireFrame.push(boxData);
            }
            break;
          case 'cursorIndicator':
            const indicatorData = <UI3DCursorIndicatorSpec>e.data;
            indicator.push(indicatorData);
            break;
          case 'textureBox':
            const textureBoxData = <UI3DTextureBoxSpec>e.data;
            textureBoxs.push(textureBoxData);
            break;
          case 'directionSign':
            const dirSignData = <UI3DDirectionSignSpec>e.data;
            dirSigns.push(dirSignData);
            break;
        }
      }

      // draw line
      drawLine(state)(line);
      drawSphere(state)(point);
      drawTrivial(state)(cone);
      drawQuad(state)(quad);
      drawCylinder(state)(ringCylinder);
      drawRing(state)(ring);

      drawBoxWireFrame(state)(boxWireFrame);
      drawBox(state)(box);
      drawTextureBox(state)(textureBoxs);
      drawIndicator(state)(indicator);
      drawDirSign(state)(dirSigns);
    },
  };
}
