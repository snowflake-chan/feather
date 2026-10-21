import _REGL from 'regl';
import { vec3, mat4 } from 'gl-matrix';

import { REGLLoader, safeProp } from './regl';

import { ShadowState, GLShadowMap } from './schema/gl-shadow-schema';
import { GameClientState } from '../game-client-schema';

import {
  computeShadowMapMatrices,
  CASCADE_LAYOUT,
  BAKE_SIZE,
  BakeDataSchema,
} from '../utils/shadow';
import { updateTexture } from './texture';
import { getOSSResourceUrl } from '../resource/util';
import { MuReadStream } from '@box/mudb/stream';

const SHADOW_UP = vec3.fromValues(0, 0, 1);
const SHADOW_EYE = vec3.create();

export default function (regl: _REGL.Regl, loader: REGLLoader) {
  const shadowProp = safeProp<GLShadowMap>(regl);

  const setupShadow = loader.cache(
    'shadow:setup',
    {
      framebuffer: shadowProp('fbo').prop,

      colorMask: [false, false, false, false],

      viewport: shadowProp('shadowViewport').prop,

      scissor: {
        enable: true,
        box: <any>shadowProp('shadowViewport').prop,
      },

      context: {
        frustum: shadowProp('frustum').prop,
      },

      uniforms: {
        view: shadowProp('shadowViewMatrix').prop,
        projection: shadowProp('shadowProjMatrix').prop,
        viewProj: shadowProp('shadowViewProjMatrix').prop,
      },
    },
    false,
  );

  return {
    update: (state: GameClientState) => {
      const size = state.settings.shadowResolution;
      state.shadow.enable =
        size > 0 && regl.hasExtension('WEBGL_depth_texture');

      const { texture, data, chunkShift } =
        state.replica.environment.bakedShadow;
      state.shadow.enableBakedShadow = !!texture && !!data;

      if (state.shadow.enable) {
        if (!state.shadow.shadowMap) {
          state.shadow.shadowMapTexture = regl.texture({
            radius: size,
            format: 'depth stencil',
            type: <any>'depth stencil',
            min: 'linear',
            mag: 'linear',
          });
          state.shadow.shadowMap = regl.framebuffer({
            color: regl.renderbuffer({
              radius: size,
            }),
            depthStencil: state.shadow.shadowMapTexture,
          });
        } else {
          state.shadow.shadowMap.resize(size, size);
        }

        const { cascade, cascadeZ, cascadeSplits } = state.shadow;

        // update view matrix
        const sunDirection = state.environment.sunDirection;
        SHADOW_UP[0] = 0;
        SHADOW_UP[1] = 0;
        SHADOW_UP[2] = 1;
        mat4.lookAt(
          state.shadow.shadowView,
          vec3.scaleAndAdd(SHADOW_EYE, state.camera.eye, sunDirection, 512),
          state.camera.eye,
          SHADOW_UP,
        );

        // update cascade z splits
        cascadeZ[0] = state.camera.zNear;
        cascadeZ[4] = state.camera.zFar + 1;
        cascadeZ[1] = 16;
        cascadeZ[3] = Math.min(128, 0.5 * (cascadeZ[1] + cascadeZ[4]));
        cascadeZ[2] = Math.min(48, 0.5 * (cascadeZ[1] + cascadeZ[3]));

        // exclude near and far cascade cut
        cascadeSplits[0] = cascadeZ[1];
        cascadeSplits[1] = cascadeZ[2];
        cascadeSplits[2] = cascadeZ[3];

        const layout = CASCADE_LAYOUT;
        for (let i = 0; i < 4; ++i) {
          computeShadowMapMatrices(
            cascade[i],
            cascadeZ[i],
            cascadeZ[i + 1],
            state.shadow.shadowView,
            state.camera,
            layout[i],
            size,
          );
        }
      } else {
        if (state.shadow.shadowMap) {
          const color = (<any>state.shadow.shadowMap).color[0];
          state.shadow.shadowMap.destroy();
          state.shadow.shadowMap = null;
          color.destroy();
        }
        if (state.shadow.shadowMapTexture) {
          state.shadow.shadowMapTexture.destroy();
          state.shadow.shadowMapTexture = null;
        }
      }

      for (let i = 0; i < state.shadow.cascade.length; ++i) {
        state.shadow.cascade[i].fbo = state.shadow.shadowMap;
      }

      if (state.shadow.enableBakedShadow) {
        state.shadow.bakeChunkShift = chunkShift;
        state.shadow.chunkDimX = state.voxel.shape[0] >> chunkShift;
        state.shadow.chunkDimY = state.voxel.shape[1] >> chunkShift;
        state.shadow.chunkDimZ = state.voxel.shape[2] >> chunkShift;

        if (!state.shadow.bakedDataTexture) {
          state.shadow.bakedDataTexture = regl.texture();
        }

        updateTexture(
          state.shadow.bakedShadowTexture,
          state,
          BAKE_SIZE,
          [getOSSResourceUrl(texture)],
          'nearest',
          'nearest',
          'clamp',
          'rgba',
        );

        if (state.shadow.bakedDataHash !== data) {
          state.content.retrieveFromS3(data).then((bufferArr) => {
            if (!bufferArr || !state.shadow.bakedDataTexture) {
              return;
            }

            const stream = new MuReadStream(new Uint8Array(bufferArr));
            const bakeShadowData = BakeDataSchema.patch(
              BakeDataSchema.identity,
              stream,
            );
            const { cascade, zScaleRatio } = bakeShadowData;

            state.shadow.bakedZRatio = zScaleRatio;

            // 一个像素点记录四个数字，四个像素点一组记录一个mat4
            // 一组data有一个mat4，一个mat3，一个vec2，一组data占用 4 + 3 + 1 = 8 个像素点
            // bakedDataTexture的 width 恒为8，height = chunk数量 = cascade.length
            const dataWidth = 8;

            // 一组data占用dataWidth个像素点，一个像素点有4个数字，一组data长度为dataWidth * 4
            const oneLen = dataWidth * 4;
            const textureData = new Float32Array(oneLen * cascade.length);
            cascade.forEach((data, idx) => {
              const oneData = textureData.subarray(
                oneLen * idx,
                oneLen * (idx + 1),
              );
              oneData.set(data.projection, 0);

              const normal = oneData.subarray(16, 16 + 12);
              normal[0] = data.normal[0];
              normal[1] = data.normal[1];
              normal[2] = data.normal[2];
              normal[3] = 0;
              normal[4] = data.normal[3];
              normal[5] = data.normal[4];
              normal[6] = data.normal[5];
              normal[7] = 0;
              normal[8] = data.normal[6];
              normal[9] = data.normal[7];
              normal[10] = data.normal[8];
              normal[11] = 0;

              oneData.set(data.bounds, 16 + 12);
            });

            state.shadow.bakedDataTexture({
              data: textureData,
              width: dataWidth,
              height: cascade.length,
            });
            state.shadow.bakedDataHash = data;
          });
        }
      }
    },
    setup: (state: ShadowState, block: (shadowMap: GLShadowMap) => void) => {
      if (!state.enable) {
        return;
      }
      regl.clear({
        depth: 1,
        framebuffer: state.shadowMap,
      });
      (<any>setupShadow)(state.cascade, block);
    },
  };
}
