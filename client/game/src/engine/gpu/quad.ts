import { GameClientState } from '../game-client-schema';
import { GPUState } from './schema/gpu-schema';

export const BIG_ELEMENT_SIZE = 3 << 20;
export const SMALL_ELEMENT_SIZE = 3 << 15;

function initQuad(buffer: Uint16Array | Uint32Array) {
  for (let i = 0, ptr = 0; ptr < buffer.length; i += 4) {
    buffer[ptr++] = i;
    buffer[ptr++] = i + 1;
    buffer[ptr++] = i + 2;
    buffer[ptr++] = i + 2;
    buffer[ptr++] = i + 1;
    buffer[ptr++] = i + 3;
  }
  return buffer;
}

export function getQuadIndexBuffer(gpuState: GPUState, count: number) {
  if (count <= SMALL_ELEMENT_SIZE) {
    return gpuState.smallIndexBuffer;
  } else if (count <= BIG_ELEMENT_SIZE) {
    return gpuState.bigIndexBuffer;
  } else {
    return null;
  }
}

/**
 * 当极少数情况下，count数量大于BIG_ELEMENT_SIZE时，直接拓展原本的buffer数据绘制
 * 不用indexBuffer了
 * @param buffer 原本数据
 * @param vertexSize 绘制尺寸
 * @returns 拓展后的数据
 */
export function expandQuad(buffer: Uint8Array, vertexSize: number) {
  const result = new Uint8Array((buffer.length * 3) >>> 1);
  for (let i = 0, ptr = 0; ptr < result.length; i += 4 * vertexSize) {
    for (let j = 0; j < vertexSize; ++j) {
      result[ptr++] = buffer[j + i];
    }
    for (let j = 0; j < vertexSize; ++j) {
      result[ptr++] = buffer[j + i + vertexSize];
    }
    for (let j = 0; j < vertexSize; ++j) {
      result[ptr++] = buffer[j + i + 2 * vertexSize];
    }
    for (let j = 0; j < vertexSize; ++j) {
      result[ptr++] = buffer[j + i + 2 * vertexSize];
    }
    for (let j = 0; j < vertexSize; ++j) {
      result[ptr++] = buffer[j + i + vertexSize];
    }
    for (let j = 0; j < vertexSize; ++j) {
      result[ptr++] = buffer[j + i + 3 * vertexSize];
    }
  }
  return result;
}

export function initializeIndexBuffer(state: GameClientState) {
  const rewgpu = state.gpu.rewgpu;
  if (!rewgpu) {
    return;
  }

  const smallIndexData = initQuad(new Uint16Array(SMALL_ELEMENT_SIZE));
  state.gpu.smallIndexBuffer = {
    reBuffer: rewgpu.buffer({
      data: smallIndexData,
      size: smallIndexData.byteLength,
      usage: GPUBufferUsage.INDEX,
    }),
    indexFormat: 'uint16',
  };

  const bigIndexData = initQuad(new Uint32Array(BIG_ELEMENT_SIZE));
  state.gpu.bigIndexBuffer = {
    reBuffer: rewgpu.buffer({
      data: bigIndexData,
      size: bigIndexData.byteLength,
      usage: GPUBufferUsage.INDEX,
    }),
    indexFormat: 'uint32',
  };
}
