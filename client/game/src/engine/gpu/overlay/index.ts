import type { ReWGPU } from '@box/rewgpu/build/types';
import type { GameClientState } from '../../game-client-schema';
import type { CommonUniforms } from '../interface';
import { gpuTextOverlay } from './text';
import {
  GPUOverlayInstanceList,
  GPUOverlayStateSchema,
} from 'src/engine/overlay/gpu-overlay-schema';

export function gpuOverlays(rewgpu: ReWGPU, commonUniforms: CommonUniforms) {
  const textOverlay = gpuTextOverlay(rewgpu, commonUniforms);

  const init = (state: GameClientState) => {
    textOverlay.init(state);
  };

  const forward = (
    state: GameClientState,
    renderPassEncoder: GPURenderPassEncoder,
  ) => {
    if (state.gpuOverlays.list.length > 0) {
      const list = sortGPUOverlayList(state.gpuOverlays.list);

      // 目前只有text
      textOverlay.forward(
        state,
        renderPassEncoder,
        list,
        state.gpuOverlays.glyphsCount,
      );
    }

    GPUOverlayStateSchema.free(state.gpuOverlays);
    state.gpuOverlays.glyphsCount = 0;
  };

  return {
    init,
    forward,
  };
}

export function sortGPUOverlayList(
  list: GPUOverlayInstanceList,
): GPUOverlayInstanceList {
  return list.sort((a, b) => a.zIndex - b.zIndex);
}
