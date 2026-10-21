import { vec3, mat4, mat3 } from 'gl-matrix';
import type { IREWGPUBuffer, IREWGPUGroup, ReWGPU } from '@box/rewgpu';
import { GameClientState } from '../game-client-schema';

import {
  computeShadowMapMatrices,
  CASCADE_LAYOUT,
  BAKE_SIZE,
  BakeDataSchema,
} from '../utils/shadow';
import {
  F32,
  MAT3X3F32,
  MAT4X4F32,
  UniformStructF32,
  VEC3F,
  VEC4F,
  mat3x3fromMat3,
} from './uniform-pool';
import { GPUShadowState } from './schema/gpu-shadow-schema';
import { Frustum } from '@box/schema/utils/frustum-schema';
import triangle from './wgsl/triangle-pos.wgsl';
import vert from './wgsl/trivial-vert.wgsl';
import shadowComposeFrag from './wgsl/shadow-compose-frag.wgsl';
import { getOSSResourceUrl } from '../resource/util';
import {
  Mat4Schema,
  Vec4Schema,
  Vec3Schema,
} from '@box/schema/utils/math-schema';
import { MuReadStream } from '@box/mudb/stream';

const SHADOW_UP = vec3.fromValues(0, 0, 1);
const SHADOW_EYE = vec3.create();

const TEMP_MAT3 = mat3.create();

/**
 * shadow不负责产生pipeline，只负责更新级联阴影所所使用的数据
 * - 各个平截头体的数据更新，以及buffer更新
 * - shadowMapTexture的更新
 */
export function gpuShadow(rewgpu: ReWGPU) {
  const uniform = new UniformStructF32({
    enabled: F32,
    cascadeSplits: VEC3F,
    projection: {
      align: MAT4X4F32.align,
      size: MAT4X4F32.size * 4,
    },
    normal: {
      align: MAT3X3F32.align,
      size: MAT3X3F32.size * 4,
    },
    bounds: {
      align: VEC4F.align,
      size: VEC4F.size * 4,
    },
    enabledBakedShadow: F32,
    bakeChunkShift: F32,
    bakedZRatio: F32,
    chunkDimX: F32,
    chunkDimY: F32,
    chunkDimZ: F32,
  });

  const { struct, data } = uniform;

  const normals: Float32Array[] = [];

  const shadowViewProjData = new UniformStructF32({
    viewProj: MAT4X4F32,
  });

  const composePipeline = rewgpu.createPipeline({
    label: 'shadowCompose',
    struct: `
    ${triangle}
    @group(0) @binding(0) var<uniform> useCacheIdx : f32;
    @group(0) @binding(1) var shadowDepth : texture_depth_2d;
    `,
    frag: {
      content: shadowComposeFrag,
      entryPoint: 'fragMain',
      format: 'r16float',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  const useCacheIdxData = new Float32Array(1).fill(0);
  let useCacheIdxBuffer: IREWGPUBuffer | undefined;

  let composeGroup: IREWGPUGroup | undefined;
  const commandDescriptor = {
    pipeline: composePipeline,
    count: 3,
    groups: <IREWGPUGroup[]>[],
  };
  const composeCmd = rewgpu.createCommand(commandDescriptor);

  const updateBakedShadow = (
    state: GameClientState,
    chunkDimX: number,
    chunkDimZ: number,
  ) => {
    if (state.gpuShadow.enableBakedShadow) {
      if (!state.gpuShadow.bakedShadowTexture) {
        state.gpuShadow.bakedShadowTexture = rewgpu.texture({
          size: [BAKE_SIZE, BAKE_SIZE],
          format: 'rgba8unorm',
          usage:
            GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        state.gpuShadow.bakedShadowMapDirty = true;
      }

      // 一组数据的长度：一个project mat4 + normal mat3 + bounds vec4
      const oneDataSize = MAT4X4F32.size + MAT3X3F32.size + VEC4F.size;
      if (!state.gpuShadow.bakedShadowData) {
        state.gpuShadow.bakedShadowData = rewgpu.buffer({
          size: oneDataSize * chunkDimX * chunkDimZ,
          usage: GPUBufferUsage.STORAGE,
        });
        state.gpuShadow.bakedShadowMapDirty = true;
      }

      const { texture, data } = state.replica.environment.bakedShadow;

      if (state.gpuShadow.bakedTextureHash !== texture) {
        const req = state.content.fetchImage(getOSSResourceUrl(texture));
        if (req.loaded && req.image) {
          state.gpuShadow.bakedShadowTexture.update(req.image);
          state.gpuShadow.bakedTextureHash = texture;
        }
      }

      if (state.gpuShadow.bakedDataHash !== data) {
        state.content.retrieveFromS3(data).then((bufferArr) => {
          if (!bufferArr || !state.gpuShadow.bakedShadowData) {
            return;
          }

          const stream = new MuReadStream(new Uint8Array(bufferArr));
          const bakeShadowData = BakeDataSchema.patch(
            BakeDataSchema.identity,
            stream,
          );
          const { cascade, zScaleRatio } = bakeShadowData;

          struct.bakedZRatio[0] = zScaleRatio;

          const oneDataLen = oneDataSize / 4;
          const bakeData = new Float32Array(oneDataLen * cascade.length);

          cascade.forEach((data, idx) => {
            const oneData = bakeData.subarray(
              oneDataLen * idx,
              oneDataLen * (idx + 1),
            );
            oneData.set(data.projection, 0);
            mat3.set(
              TEMP_MAT3,
              data.normal[0],
              data.normal[1],
              data.normal[2],
              data.normal[3],
              data.normal[4],
              data.normal[5],
              data.normal[6],
              data.normal[7],
              data.normal[8],
            );
            mat3x3fromMat3(
              oneData.subarray(
                MAT4X4F32.size / 4,
                MAT4X4F32.size / 4 + MAT3X3F32.size / 4,
              ),
              TEMP_MAT3,
            );
            oneData.set(data.bounds, MAT4X4F32.size / 4 + MAT3X3F32.size / 4);
          });

          state.gpuShadow.bakedShadowData.update(bakeData);
          state.gpuShadow.bakedDataHash = data;
        });
      }
    } else {
      if (state.gpuShadow.bakedShadowTexture) {
        state.gpuShadow.bakedShadowTexture.destroy();
        state.gpuShadow.bakedShadowTexture = null;
        state.gpuShadow.bakedTextureHash = '';
        state.gpuShadow.bakedDataHash = '';
        state.gpuShadow.bakedShadowMapDirty = true;
      }

      if (state.gpuShadow.bakedShadowData) {
        state.gpuShadow.bakedShadowData.destroy();
        state.gpuShadow.bakedShadowData = null;
        state.gpuShadow.bakedTextureHash = '';
        state.gpuShadow.bakedDataHash = '';
        state.gpuShadow.bakedShadowMapDirty = true;
      }
    }
  };
  return {
    init: (state: GameClientState) => {
      useCacheIdxBuffer = rewgpu.buffer({
        label: 'shadowCompose:useCacheIdxBuffer',
        data: useCacheIdxData,
        size: useCacheIdxData.byteLength,
        usage: GPUBufferUsage.UNIFORM,
      });
      state.gpuShadow.shadowViewProjectionBuffer = rewgpu.buffer({
        data: shadowViewProjData.data,
        size: shadowViewProjData.data.byteLength,
        usage: GPUBufferUsage.UNIFORM,
      });

      state.gpuShadow.shadowViewProjectionLayout = rewgpu.createBindGroupLayout(
        {
          label: 'shadowViewProjectionLayout:layout',
          entries: [
            {
              binding: 0,
              visibility: GPUShaderStage.VERTEX,
              buffer: {},
            },
          ],
        },
      );

      state.gpuShadow.shadowViewProjectionGroup = rewgpu.group({
        layout: state.gpuShadow.shadowViewProjectionLayout,
        entries: [
          {
            binding: 0,
            resource: state.gpuShadow.shadowViewProjectionBuffer,
          },
        ],
      });

      state.gpuShadow.shadowDataBuffer = rewgpu.buffer({
        size: data.byteLength,
        data,
        usage: GPUBufferUsage.UNIFORM,
        isDynamic: true,
      });

      // 替换掉
      Vec3Schema.free(state.gpuShadow.cascadeSplits);
      state.gpuShadow.cascadeSplits = struct.cascadeSplits;

      for (let i = 0; i < state.gpuShadow.cascade.length; i++) {
        const cascade = state.gpuShadow.cascade[i];

        Mat4Schema.free(cascade.shadowViewProjMatrix);
        cascade.shadowViewProjMatrix = struct.projection.subarray(
          (MAT4X4F32.size / 4) * i,
          (MAT4X4F32.size / 4) * (i + 1),
        );

        /**
         * 不能直接替换cascade.shadowNormalMatrix
         * 因为shadowNormalMatrix是mat3x3，在wgsl中会在每一行末尾填充padding
         *
         * 先按mat3x3切段，然后在uniform.update()前，手动更新下这部分数据
         */
        normals[i] = struct.normal.subarray(
          (MAT3X3F32.size / 4) * i,
          (MAT3X3F32.size / 4) * (i + 1),
        );

        Vec4Schema.free(cascade.shaderBounds);
        cascade.shaderBounds = struct.bounds.subarray(
          (VEC4F.size / 4) * i,
          (VEC4F.size / 4) * (i + 1),
        );
      }
    },
    update: (state: GameClientState) => {
      if (!useCacheIdxBuffer) {
        return;
      }
      const size = state.settings.shadowResolution;
      state.gpuShadow.enable = size > 0;

      const { texture, data, chunkShift } =
        state.replica.environment.bakedShadow;
      state.gpuShadow.enableBakedShadow = !!texture && !!data;

      struct.enabled[0] = +state.gpuShadow.enable;
      struct.enabledBakedShadow[0] = +state.gpuShadow.enableBakedShadow;
      struct.bakeChunkShift[0] = chunkShift;
      struct.chunkDimX[0] = state.voxel.shape[0] >> chunkShift;
      struct.chunkDimY[0] = state.voxel.shape[1] >> chunkShift;
      struct.chunkDimZ[0] = state.voxel.shape[2] >> chunkShift;

      if (state.gpuShadow.enable) {
        if (state.gpuShadow.shadowMapSize !== size) {
          state.gpuShadow.shadowMapDepth?.destroy();
          state.gpuShadow.shadowMapDepth = rewgpu.texture({
            size: [size, size],
            format: 'depth24plus',
            usage:
              GPUTextureUsage.RENDER_ATTACHMENT |
              GPUTextureUsage.TEXTURE_BINDING,
          });

          state.gpuShadow.shadowMapTarget?.destroy();
          state.gpuShadow.shadowMapTarget = rewgpu.texture({
            size: [size, size],
            format: 'r16float',
            usage:
              GPUTextureUsage.RENDER_ATTACHMENT |
              GPUTextureUsage.TEXTURE_BINDING,
          });

          state.gpuShadow.shadowMapSize = size;
          state.gpuShadow.shadowMapDirty = true;
        }

        const { cascade, cascadeZ, cascadeSplits } = state.gpuShadow;

        // update view matrix
        const sunDirection = state.environment.sunDirection;
        SHADOW_UP[0] = 0;
        SHADOW_UP[1] = 0;
        SHADOW_UP[2] = 1;
        mat4.lookAt(
          state.gpuShadow.shadowView,
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
          // 隔帧渲染第三，四张深度图，同时需要隔帧更新平截头体数据
          if (i === state.gpuShadow.useCacheIdx + 2) {
            continue;
          }
          computeShadowMapMatrices(
            cascade[i],
            cascadeZ[i],
            cascadeZ[i + 1],
            state.gpuShadow.shadowView,
            state.camera,
            layout[i],
            size,
            true,
          );

          mat3x3fromMat3(normals[i], cascade[i].shadowNormalMatrix);
        }
      } else {
        if (state.gpuShadow.shadowMapDepth) {
          state.gpuShadow.shadowMapDepth.destroy();
          state.gpuShadow.shadowMapDepth = null;
          state.gpuShadow.shadowMapSize = 0;
          state.gpuShadow.shadowMapDirty = true;
        }

        if (state.gpuShadow.shadowMapTarget) {
          state.gpuShadow.shadowMapTarget.destroy();
          state.gpuShadow.shadowMapTarget = null;
          state.gpuShadow.shadowMapSize = 0;
          state.gpuShadow.shadowMapDirty = true;
        }
      }

      if (state.gpuShadow.shadowMapDirty && state.gpuShadow.shadowMapDepth) {
        composeGroup?.destroy();
        composeGroup = rewgpu.group({
          label: 'shadowCompose',
          entries: [
            {
              binding: 0,
              resource: useCacheIdxBuffer,
            },
            {
              binding: 1,
              resource: state.gpuShadow.shadowMapDepth,
            },
          ],
          layout: composePipeline.getBindGroupLayout(0),
        });
      }

      updateBakedShadow(state, struct.chunkDimX[0], struct.chunkDimZ[0]);
    },
    setup: (
      gpuResources: object[],
      shadowState: GPUShadowState,
      draw: (
        passEncoder: GPURenderPassEncoder,
        shadowFrustum: Frustum,
        idx: number,
      ) => void,
    ) => {
      if (!useCacheIdxBuffer || !shadowState.enable) {
        return;
      }
      const { shadowMapDepth, shadowMapTarget } = shadowState;

      if (shadowMapDepth?.texture && shadowMapTarget?.texture) {
        const textureView = shadowMapDepth.texture.createView();

        gpuResources.push(textureView);

        const shadowRenderPassDes: GPURenderPassDescriptor = {
          colorAttachments: [],
          depthStencilAttachment: {
            view: textureView,
            depthClearValue: 1,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
          },
        };

        shadowState.cascade.forEach((s, idx) => {
          if (idx === shadowState.useCacheIdx + 2) {
            return;
          }

          const { x, y, width, height } = s.shadowViewport;

          if (idx !== 0 && shadowRenderPassDes.depthStencilAttachment) {
            shadowRenderPassDes.depthStencilAttachment.depthLoadOp = 'load';
          }
          mat4.copy(shadowViewProjData.struct.viewProj, s.shadowViewProjMatrix);
          shadowState.shadowViewProjectionBuffer?.update(
            shadowViewProjData.data,
          );

          const ce = rewgpu.config.device.createCommandEncoder();
          const renderPass = ce.beginRenderPass(shadowRenderPassDes);
          // webGPU的图片y轴坐标与gl相反，在这里取heigh - y，让绘制出来的图片与webgl完全一致
          renderPass.setViewport(x, height - y, width, height, 0, 1);
          renderPass.setScissorRect(x, height - y, width, height);
          draw(renderPass, s.frustum, idx);
          renderPass.end();

          const cmdBuffer = ce.finish();

          rewgpu.config.device.queue.submit([cmdBuffer]);

          gpuResources.push(ce, renderPass, cmdBuffer);
        });

        const commandEncoder = rewgpu.config.device.createCommandEncoder();
        if (composeGroup) {
          useCacheIdxData[0] = shadowState.useCacheIdx;
          useCacheIdxBuffer.update(useCacheIdxData);

          const textureView = shadowMapTarget.texture.createView();

          const composeRenderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
              {
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                loadOp: 'load',
                storeOp: 'store',
              },
            ],
          });

          commandDescriptor.groups[0] = composeGroup;
          composeCmd(composeRenderPass);
          composeRenderPass.end();

          gpuResources.push(textureView, composeRenderPass);
        }

        const cmdBuffer = commandEncoder.finish();

        rewgpu.config.device.queue.submit([cmdBuffer]);

        gpuResources.push(commandEncoder, cmdBuffer);

        shadowState.useCacheIdx++;
        shadowState.useCacheIdx = shadowState.useCacheIdx % 2;
      }
    },
    clear: (state: GameClientState) => {
      state.gpuShadow.cascadeSplits = Vec3Schema.alloc();
      for (let i = 0; i < state.gpuShadow.cascade.length; i++) {
        const cascade = state.gpuShadow.cascade[i];
        cascade.shadowViewProjMatrix = Mat4Schema.alloc();
        cascade.shaderBounds = Vec4Schema.alloc();
      }
    },
  };
}
