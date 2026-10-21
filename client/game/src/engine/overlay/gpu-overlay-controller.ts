import { vec3, vec4 } from 'gl-matrix';
import type { GameClientState } from 'src/engine/game-client-schema';
import { GPUOverlayInstanceSchema } from './gpu-overlay-schema';

export function pushGPUText(
  state: GameClientState,
  text: string,
  position: vec3 | number[] | [number, number, number],
  options?: {
    size?: number;
    font?: string;
    color?: vec4 | vec3 | number[] | string;
    perspective?: boolean;
  },
) {
  if (!state.gpu.overlay.text.fontsManager || !state.gpu.rewgpu) {
    return;
  }

  const overlayInstance = GPUOverlayInstanceSchema.alloc();

  vec3.set(overlayInstance.position, position[0], position[1], position[2]);

  overlayInstance.glyphs = state.gpu.overlay.text.fontsManager.getGlyphs(
    state,
    {
      text,
    },
  );

  state.gpuOverlays.list.push(overlayInstance);
  state.gpuOverlays.glyphsCount += overlayInstance.glyphs.length;
}
