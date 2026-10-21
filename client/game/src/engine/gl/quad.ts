import { GameClientState } from '../game-client-schema';
import { GLState } from './schema/gl-schema';

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

export function getQuadElements(glState: GLState, count: number) {
  if (count <= SMALL_ELEMENT_SIZE) {
    return glState.smallElements;
  } else if (count <= BIG_ELEMENT_SIZE) {
    return glState.bigElements;
  } else {
    return null;
  }
}

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

// reuse quad element buffers across chunks and geometry.
// for small objects can use 16 bit vertices
export function initializeElements(state: GameClientState) {
  const regl = state.gl.regl;
  if (!regl) {
    return;
  }

  if (regl.hasExtension('OES_element_index_uint')) {
    state.gl.bigElements = regl.elements(
      initQuad(new Uint32Array(BIG_ELEMENT_SIZE)),
    );
  }
  state.gl.smallElements = regl.elements(
    initQuad(new Uint16Array(SMALL_ELEMENT_SIZE)),
  );

  regl.on('restore', () => {
    if (state.gl.bigElements) {
      state.gl.bigElements(initQuad(new Uint32Array(BIG_ELEMENT_SIZE)));
    }
    if (state.gl.smallElements) {
      state.gl.smallElements(initQuad(new Uint16Array(SMALL_ELEMENT_SIZE)));
    }
  });
}
