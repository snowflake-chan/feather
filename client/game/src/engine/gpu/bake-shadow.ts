import { mat4 } from 'gl-matrix';
import type { IREWGPUGroup, ReWGPU } from '@box/rewgpu';
import { GameClientState } from '../game-client-schema';

import { BAKE_SIZE, computeBakedShadowViewAndCascade } from '../utils/shadow';
import { MAT4X4F32, UniformStructF32 } from './uniform-pool';
import {
  GPUBakeShadowMap,
  GPUBakeShadowMapSchema,
} from './schema/gpu-shadow-schema';
import { Frustum } from '@box/schema/utils/frustum-schema';
import triangle from './wgsl/triangle-pos.wgsl';
import vert from './wgsl/trivial-vert.wgsl';

export function gpuBakeShadow(rewgpu: ReWGPU) {
  const shadowViewProjData = new UniformStructF32({
    viewProj: MAT4X4F32,
  });

  const composeCanvasPipeline = rewgpu.createPipeline({
    label: 'shadowComposeCanvas',
    struct: `
    ${triangle}
    @group(0) @binding(0) var shadowDepth : texture_depth_2d;
    `,
    frag: {
      content: `fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
      var uv = position.xy;
      var depth = textureLoad(shadowDepth, vec2u(uv), 0);
      
      return vec4f(depth, depth, depth, 1.);
      }
      `,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  const composeCanvasCommandDescriptor = {
    pipeline: composeCanvasPipeline,
    count: 3,
    groups: <IREWGPUGroup[]>[],
  };
  const composeCanvasCmd = rewgpu.createCommand(composeCanvasCommandDescriptor);

  return {
    init: (state: GameClientState) => {
      state.gpuShadow.bakeShadowMapDepth = rewgpu.texture({
        size: [BAKE_SIZE, BAKE_SIZE],
        format: 'depth24plus',
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });

      composeCanvasCommandDescriptor.groups[0] = rewgpu.group({
        label: 'shadowComposeCanvas',
        entries: [
          {
            binding: 0,
            resource: state.gpuShadow.bakeShadowMapDepth,
          },
        ],
        layout: composeCanvasPipeline.getBindGroupLayout(0),
      });
    },
    update: (state: GameClientState) => {
      computeBakedShadowViewAndCascade<GPUBakeShadowMap>(
        state.gpuShadow,
        state.environment.sunDirection,
        state.voxel.shape,
        GPUBakeShadowMapSchema,
      );
    },
    setup: (
      state: GameClientState,
      draw: (
        passEncoder: GPURenderPassEncoder,
        shadowFrustum: Frustum,
        idx: number,
      ) => void,
    ) => {
      const { bakeShadowMapDepth } = state.gpuShadow;
      if (!bakeShadowMapDepth?.texture) {
        return;
      }
      const shadowRenderPassDes: GPURenderPassDescriptor = {
        colorAttachments: [],
        depthStencilAttachment: {
          view: bakeShadowMapDepth.texture.createView(),
          depthClearValue: 1,
          depthLoadOp: 'clear',
          depthStoreOp: 'store',
        },
      };

      state.gpuShadow.bakeCascade.forEach((s, idx) => {
        const { x, y, width, height } = s.shadowViewport;

        if (idx !== 0 && shadowRenderPassDes.depthStencilAttachment) {
          shadowRenderPassDes.depthStencilAttachment.depthLoadOp = 'load';
        }

        mat4.copy(shadowViewProjData.struct.viewProj, s.shadowViewProjMatrix);
        state.gpuShadow.shadowViewProjectionBuffer?.update(
          shadowViewProjData.data,
        );

        const ce = rewgpu.config.device.createCommandEncoder();
        const renderPass = ce.beginRenderPass(shadowRenderPassDes);
        // webGPU的图片y轴坐标与gl相反，在这里取heigh - y，让绘制出来的图片与webgl完全一致
        renderPass.setViewport(
          x,
          BAKE_SIZE - (y + height),
          width,
          height,
          0,
          1,
        );
        renderPass.setScissorRect(x, BAKE_SIZE - (y + height), width, height);
        draw(renderPass, s.frustum, idx);
        renderPass.end();
        rewgpu.config.device.queue.submit([ce.finish()]);
      });

      const commandEncoder = rewgpu.config.device.createCommandEncoder();

      if (!state.dom.bakeCanvas || !state.gpuShadow.bakeContext) {
        state.dom.bakeCanvas = document.createElement('canvas');
        state.dom.bakeCanvas.width = BAKE_SIZE;
        state.dom.bakeCanvas.height = BAKE_SIZE;
        state.gpuShadow.bakeContext = state.dom.bakeCanvas.getContext('webgpu');
        state.gpuShadow.bakeContext?.configure({
          format: rewgpu.config.presentationFormat,
          ...rewgpu.config,
        });
      }

      if (!state.gpuShadow.bakeContext) {
        return;
      }

      const composeCanvasPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: state.gpuShadow.bakeContext.getCurrentTexture().createView(),
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: 'load',
            storeOp: 'store',
          },
        ],
      });

      composeCanvasCmd(composeCanvasPass);
      composeCanvasPass.end();
      rewgpu.config.device.queue.submit([commandEncoder.finish()]);
    },
  };
}
