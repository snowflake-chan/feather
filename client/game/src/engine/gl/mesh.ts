import REGL from 'regl';
import { REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import {
  GLMeshInstance,
  GLMeshInstanceList,
} from '../mesh/gl-controller/gl-mesh-schema';

let NODE_SIZE = 0;
let NODES_MATRIX_UNIFORMS = {};
let IS_GLTF_FLAG = false;

export default function (regl: REGL.Regl, loader: REGLLoader) {
  const MODEL_FORWARD_FRAG = require('./glsl/model_frag.glsl');
  const MODEL_FORWARD_VERT = require('./glsl/model_vert.glsl');
  const MODEL_ALPHA_FRAG = require('./glsl/model_alpha_frag.glsl');
  const MODEL_ALPHA_PRE_VERT = require('./glsl/model_alpha_pre_vert.glsl');
  const MODEL_ALPHA_VERT = require('./glsl/model_alpha_vert.glsl');

  const instanceProp = safeProp<GLMeshInstance>(regl);

  const setNodesMatrixUniforms = (nodeSize: number) => {
    NODES_MATRIX_UNIFORMS = {};

    for (let i = 0; i < nodeSize; i++) {
      NODES_MATRIX_UNIFORMS[`nodesMatrix[${i}]`] = (
        context,
        props: GLMeshInstance,
      ) => {
        return props.nodesMatrix[i];
      };
    }
  };

  const SYMBOLS = {
    COLOR_LUT: (state: GameClientState) =>
      state.postProcess.lutEnabled && !state.postProcess.enabled,
    SHADOW: (state: GameClientState) => state.shadow.enable,
    BAKED_SHADOW: (state: GameClientState) => state.shadow.enableBakedShadow,
    HDR: (state: GameClientState) => state.postProcess.enabled,
    PCF: (state: GameClientState) => state.settings.shadowFilter,
    SAFE: (state: GameClientState) => state.settings.safeShaders,
    UINT8_TEXTURE: () => loader.floatBuffer.type === 'uint8',
  };

  const _baseModel = {
    frag: MODEL_FORWARD_FRAG,
    vert: MODEL_FORWARD_VERT,

    vao: instanceProp('part')('vao').prop,

    attributes: {
      s0: 0,
      s1: 1,
      uv: 2,
      normals: 3,
    },

    depth: {
      enable: true,
      mask: true,
      func: <'<='>'<=',
    },

    cull: {
      enable: true,
      face: <'back'>'back',
    },

    uniforms: {
      'texture': instanceProp('part')('texture').prop,
      'textureShape': instanceProp('part')('textureShape').prop,
      'shape': ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight,
      ],
      'matrixTextureSize': instanceProp('part')('matrixTextureSize').prop,
      'alphaTextureSize': instanceProp('part')('alphaTextureSize').prop,

      'matrixTexture': instanceProp('matrixTexture').prop,
      'alphaTexture': instanceProp('alphaTexture').prop,
      'model': instanceProp('model').prop,
      'normalMat': instanceProp('normalMatrix').prop,
      'lo': [
        instanceProp('part')('lox').prop,
        instanceProp('part')('loy').prop,
        instanceProp('part')('loz').prop,
      ],
      'hi': [
        instanceProp('part')('hix').prop,
        instanceProp('part')('hiy').prop,
        instanceProp('part')('hiz').prop,
      ],
      'ambientLight[0]': [
        instanceProp('ambient')('R0').prop,
        instanceProp('ambient')('G0').prop,
        instanceProp('ambient')('B0').prop,
        instanceProp('ambient')('A0').prop,
      ],
      'ambientLight[1]': [
        instanceProp('ambient')('R1').prop,
        instanceProp('ambient')('G1').prop,
        instanceProp('ambient')('B1').prop,
        instanceProp('ambient')('A1').prop,
      ],
      'ambientLight[2]': [
        instanceProp('ambient')('R2').prop,
        instanceProp('ambient')('G2').prop,
        instanceProp('ambient')('B2').prop,
        instanceProp('ambient')('A2').prop,
      ],
      'ambientLight[3]': [
        instanceProp('ambient')('R3').prop,
        instanceProp('ambient')('G3').prop,
        instanceProp('ambient')('B3').prop,
        instanceProp('ambient')('A3').prop,
      ],
      'ambientLight[4]': [
        instanceProp('ambient')('R4').prop,
        instanceProp('ambient')('G4').prop,
        instanceProp('ambient')('B4').prop,
        instanceProp('ambient')('A4').prop,
      ],
      'ambientLight[5]': [
        instanceProp('ambient')('R5').prop,
        instanceProp('ambient')('G5').prop,
        instanceProp('ambient')('B5').prop,
        instanceProp('ambient')('A5').prop,
      ],
      'ambientLight[6]': [
        instanceProp('ambient')('R6').prop,
        instanceProp('ambient')('G6').prop,
        instanceProp('ambient')('B6').prop,
        instanceProp('ambient')('A6').prop,
      ],
      'ambientLight[7]': [
        instanceProp('ambient')('R7').prop,
        instanceProp('ambient')('G7').prop,
        instanceProp('ambient')('B7').prop,
        instanceProp('ambient')('A7').prop,
      ],
      'colorMod': [
        instanceProp('red').prop,
        instanceProp('green').prop,
        instanceProp('blue').prop,
        instanceProp('alpha').prop,
      ],
      'pbrMod': [
        instanceProp('metalness').prop,
        instanceProp('shininess').prop,
        instanceProp('emissive').prop,
      ],
    },

    offset: 0,
    primitive: <'triangles'>'triangles',
  };

  const _model = Object.assign({}, _baseModel);
  const _drawPart = loader.cache('model:forward', _model, true, {
    ...SYMBOLS,
    NODE_SIZE: () => {
      for (const key in NODES_MATRIX_UNIFORMS) {
        _model.uniforms[key] = NODES_MATRIX_UNIFORMS[key];
      }
      return NODE_SIZE;
    },
    IS_GLTF: () => IS_GLTF_FLAG,
  });

  const _preModel = Object.assign({}, _baseModel, {
    frag: `void main () { gl_FragColor = vec4(1); }`,
    vert: MODEL_ALPHA_PRE_VERT,

    uniforms: {
      model: _baseModel.uniforms.model,
      lo: _baseModel.uniforms.lo,
      hi: _baseModel.uniforms.hi,
      matrixTexture: _baseModel.uniforms.matrixTexture,
      matrixTextureSize: _baseModel.uniforms.matrixTextureSize,
    },

    vao: _baseModel.vao,

    attributes: {
      s0: 0,
      s1: 1,
    },

    colorMask: <any>[false, false, false, false],

    blend: {
      enable: false,
    },
    cull: {
      enable: true,
      face: 'front',
    },
  });
  const _drawPreModel = loader.cache(
    'model:transparentForward',
    _preModel,
    true,
    {
      ...SYMBOLS,
      NODE_SIZE: () => {
        for (const key in NODES_MATRIX_UNIFORMS) {
          _preModel.uniforms[key] = NODES_MATRIX_UNIFORMS[key];
        }
        return NODE_SIZE;
      },
    },
  );

  const _transparentModel = Object.assign({}, _baseModel, {
    frag: MODEL_ALPHA_FRAG,
    vert: MODEL_ALPHA_VERT,

    blend: {
      enable: true,
      func: <any>{
        src: <'1'>'1',
        dst: <'one minus src alpha'>'one minus src alpha',
      },
      equation: <'add'>'add',
    },
  });

  const _drawTransparentModel = loader.cache(
    'model:transparentForward',
    _transparentModel,
    true,
    {
      ...SYMBOLS,
      NODE_SIZE: () => {
        for (const key in NODES_MATRIX_UNIFORMS) {
          _transparentModel.uniforms[key] = NODES_MATRIX_UNIFORMS[key];
        }
        return NODE_SIZE;
      },
      IS_GLTF: () => IS_GLTF_FLAG,
    },
  );

  const _partShadow = {
    frag: require('./glsl/shadow_frag.glsl'),
    vert: require('./glsl/model_shadow_vert.glsl'),

    vao: _baseModel.vao,

    attributes: {
      s0: 0,
      s1: 1,
    },

    cull: {
      enable: true,
      face: <'back'>'back',
    },

    uniforms: {
      model: _baseModel.uniforms.model,
      matrixTexture: _baseModel.uniforms.matrixTexture,
      matrixTextureSize: _baseModel.uniforms.matrixTextureSize,
    },
  };
  const _drawPartShadow = loader.cache('model:shadow', _partShadow, true, {
    ...SYMBOLS,
    NODE_SIZE: () => {
      for (const key in NODES_MATRIX_UNIFORMS) {
        _partShadow.uniforms[key] = NODES_MATRIX_UNIFORMS[key];
      }
      return NODE_SIZE;
    },
  });

  return {
    forward: (state: GameClientState, pass: GLMeshInstanceList) => {
      for (let i = 0; i < pass.length; i++) {
        NODE_SIZE = pass[i].nodesMatrix.length;
        setNodesMatrixUniforms(NODE_SIZE);

        IS_GLTF_FLAG = pass[i].part.isGLTF;

        _drawPart(state)(pass[i]);
      }
    },

    shadow: (state: GameClientState, pass: GLMeshInstanceList) => {
      for (let i = 0; i < pass.length; i++) {
        NODE_SIZE = pass[i].nodesMatrix.length;
        setNodesMatrixUniforms(NODE_SIZE);

        _drawPartShadow(state)(pass[i]);
      }
    },

    prePass: (state: GameClientState, pass: GLMeshInstanceList) => {
      for (let i = 0; i < pass.length; i++) {
        NODE_SIZE = pass[i].nodesMatrix.length;
        setNodesMatrixUniforms(NODE_SIZE);

        _drawPreModel(state)(pass[i]);
      }
    },

    transparentForward: (state: GameClientState, pass: GLMeshInstanceList) => {
      for (let i = 0; i < pass.length; i++) {
        NODE_SIZE = pass[i].nodesMatrix.length;
        setNodesMatrixUniforms(NODE_SIZE);

        IS_GLTF_FLAG = pass[i].part.isGLTF;

        _drawTransparentModel(state)(pass[i]);
      }
    },
  };
}
