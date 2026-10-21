import REGL from 'regl';
import { REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import { BreakEffect } from '../effect/effect-schema';
import { testFrustumBox } from '../utils/frustum';
import { GLShadowMap } from './schema/gl-shadow-schema';
import { testChunkVisibility } from '../voxel/voxel-controller';

const INSTANCE_NUM = 30;

export default (regl: REGL.Regl, loader: REGLLoader) => {
  const SYMBOLS = {
    COLOR_LUT: (state: GameClientState) =>
      state.postProcess.lutEnabled && !state.postProcess.enabled,
    HDR: (state: GameClientState) => state.postProcess.enabled,
    PCF: (state: GameClientState) => state.settings.shadowFilter,
    MIPMAP: (state: GameClientState) => state.gl.mipmapEnabled,
    SHADOW: (state: GameClientState) => state.shadow.enable,
    SAFE: (state: GameClientState) => state.settings.safeShaders,
    ATLAS_RADIUS: (state: GameClientState) => state.blockInfo.atlasRadius << 4,
  };

  const attributeData: number[] = [];
  const elementData: number[][] = [];

  let vertexCount = 0;
  for (let instanceId = 0; instanceId < INSTANCE_NUM; ++instanceId) {
    for (let faceId = 0; faceId < 6; ++faceId) {
      const base = vertexCount;
      elementData.push(
        [base, base + 1, base + 2],
        [base + 2, base + 1, base + 3],
      );
      for (let du = -1; du <= 1; du += 2) {
        for (let dv = -1; dv <= 1; dv += 2) {
          attributeData.push(du, dv, faceId, instanceId);
          vertexCount += 1;
        }
      }
    }
  }

  const attributeBuffer = regl.buffer(attributeData);
  const elementBuffer = regl.elements(elementData);
  regl.on('restore', () => {
    attributeBuffer(attributeData);
    elementBuffer(elementData);
  });

  const breakProp = safeProp<BreakEffect>(regl);

  const uniforms = {
    'time': breakProp('animTick').prop,
    'rand': breakProp('rand').prop,
    'pos': breakProp('position').prop,

    'ambient[0]': [
      breakProp('probe')('R0').prop,
      breakProp('probe')('G0').prop,
      breakProp('probe')('B0').prop,
      breakProp('probe')('A0').prop,
    ],
    'ambient[1]': [
      breakProp('probe')('R1').prop,
      breakProp('probe')('G1').prop,
      breakProp('probe')('B1').prop,
      breakProp('probe')('A1').prop,
    ],
    'ambient[2]': [
      breakProp('probe')('R2').prop,
      breakProp('probe')('G2').prop,
      breakProp('probe')('B2').prop,
      breakProp('probe')('A2').prop,
    ],
    'ambient[3]': [
      breakProp('probe')('R3').prop,
      breakProp('probe')('G3').prop,
      breakProp('probe')('B3').prop,
      breakProp('probe')('A3').prop,
    ],
    'ambient[4]': [
      breakProp('probe')('R4').prop,
      breakProp('probe')('G4').prop,
      breakProp('probe')('B4').prop,
      breakProp('probe')('A4').prop,
    ],
    'ambient[5]': [
      breakProp('probe')('R5').prop,
      breakProp('probe')('G5').prop,
      breakProp('probe')('B5').prop,
      breakProp('probe')('A5').prop,
    ],
    'ambient[6]': [
      breakProp('probe')('R6').prop,
      breakProp('probe')('G6').prop,
      breakProp('probe')('B6').prop,
      breakProp('probe')('A6').prop,
    ],
    'ambient[7]': [
      breakProp('probe')('R7').prop,
      breakProp('probe')('G7').prop,
      breakProp('probe')('B7').prop,
      breakProp('probe')('A7').prop,
    ],

    'texCoordXPos': breakProp('texCoordXPos').prop,
    'texCoordXNeg': breakProp('texCoordXNeg').prop,
    'texCoordYPos': breakProp('texCoordYPos').prop,
    'texCoordYNeg': breakProp('texCoordYNeg').prop,
    'texCoordZPos': breakProp('texCoordZPos').prop,
    'texCoordZNeg': breakProp('texCoordZNeg').prop,
  };

  const baseOptions = {
    uniforms,

    vert: require('./glsl/break_vert.glsl'),

    cull: {
      enable: true,
      face: <'back'>'back',
    },

    depth: {
      enable: true,
      mask: true,
      func: <'<='>'<=',
    },

    attributes: {
      s0: {
        buffer: attributeBuffer,
        offset: 0,
        size: 4,
        type: 'float',
      },
    },
    elements: elementBuffer,
    offset: 0,
  };

  const drawBreakShadow = loader.cache(
    'effect:break-shadow',
    {
      frag: require('./glsl/shadow_frag.glsl'),
      ...baseOptions,
    },
    true,
  );

  const drawBreak = loader.cache(
    'effect:break',
    Object.assign({}, baseOptions, {
      frag: require('./glsl/break_frag.glsl'),
      vert: `#define FORWARD 1\n${baseOptions.vert}`,
    }),
    true,
    SYMBOLS,
  );

  const breakEffectList: BreakEffect[] = [];

  return {
    shadow: (state: GameClientState, shadowMap: GLShadowMap) => {
      if (state.effects.break.length > 0) {
        breakEffectList.length = 0;
        for (let i = 0; i < state.effects.break.length; ++i) {
          const b = state.effects.break[i];
          const probe = b.probe;
          if (
            testFrustumBox(
              shadowMap.frustum,
              probe.lox,
              probe.loy,
              probe.loz,
              probe.hix,
              probe.hiy,
              probe.hiz,
            )
          ) {
            breakEffectList.push(b);
          }
        }
        if (breakEffectList.length > 0) {
          drawBreakShadow(breakEffectList);
        }
      }
    },

    forward: (state: GameClientState) => {
      if (state.effects.break.length > 0) {
        breakEffectList.length = 0;
        for (let i = 0; i < state.effects.break.length; ++i) {
          const b = state.effects.break[i];
          const probe = b.probe;
          if (
            testChunkVisibility(
              state,
              probe.lox,
              probe.loy,
              probe.loz,
              probe.hix,
              probe.hiy,
              probe.hiz,
            ) &&
            testFrustumBox(
              state.camera.frustum,
              probe.lox,
              probe.loy,
              probe.loz,
              probe.hix,
              probe.hiy,
              probe.hiz,
            )
          ) {
            breakEffectList.push(b);
          }
        }
        if (breakEffectList.length > 0) {
          drawBreak(state)(breakEffectList);
        }
      }
    },
  };
};
