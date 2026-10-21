import type { ReWGPU } from '@box/rewgpu';
import { GameClientState } from '../game-client-schema';

export function gpuOutline(rewgpu: ReWGPU) {
  return {
    update: (state: GameClientState) => {
      const { width, height } = rewgpu.canvas;
      if (state.gpu.targetSizeDirty) {
        state.gpuOutline.outlineDepth?.destroy();
        state.gpuOutline.outlineDepth = rewgpu.texture({
          size: [width, height],
          format: 'depth24plus',
          usage:
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });

        state.gpuOutline.outlineTarget?.destroy();
        state.gpuOutline.outlineTarget = rewgpu.texture({
          size: [width, height],
          format: rewgpu.config.presentationFormat,
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
      }
    },
  };
}
