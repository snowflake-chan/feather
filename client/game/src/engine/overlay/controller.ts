import { vec3, vec4 } from 'gl-matrix';
import type { GameClientState } from '../game-client-schema';
import { drawText3D } from './overlays';
import { pushGPUText } from './gpu-overlay-controller';

/**
 * 生成GL或者GPU的overlay数据，并存储至对应的缓存中
 */
export function drawOverlayText(
  state: GameClientState,
  text: string,
  position: vec3 | number[] | [number, number, number],
  options?: {
    size?: number;
    font?: string;
    color?: vec4 | vec3 | number[] | string;
    perspective?: boolean;
    // GPU中，通过uuid进行缓存数据的对比
    uuid?: string;
  },
) {
  if (state.gl.regl) {
    drawText3D(state, text, position, options);
    return;
  }

  if (state.gpu.rewgpu) {
    pushGPUText(state, text, position, options);
  }
}
