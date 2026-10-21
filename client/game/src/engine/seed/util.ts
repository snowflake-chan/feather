import { vec3, mat3, quat } from 'gl-matrix';
import { isGLMesh, isGPUMesh, Renderable } from '../mesh/renderable-schema';

const _bounds = vec3.create();
const _M = mat3.create();

export type SeedSpec = {
  position: vec3;
  orientation: quat;
  scale: vec3;
  renderBoxBounds: vec3;
  renderBoxOffset: vec3;
};

export type RenderBoxResult = {
  position: vec3;
  dimension: vec3;
};

const TEMP_POS: vec3 = [0, 0, 0];
const HALF_BOUNDS: vec3 = [0, 0, 0];

/**
 * 计算外观框中心的世界坐标
 */
function getWorldRenderBoxPosition(
  out: vec3,
  seed: SeedSpec,
  orientationMatrix: mat3,
) {
  const M = orientationMatrix;
  const { scale, renderBoxOffset } = seed;

  // Step 1: 应用缩放
  TEMP_POS[0] = renderBoxOffset[0] * scale[0];
  TEMP_POS[1] = renderBoxOffset[1] * scale[1];
  TEMP_POS[2] = renderBoxOffset[2] * scale[2];

  // Step 2: 应用旋转
  out[0] = TEMP_POS[0] * M[0] + TEMP_POS[1] * M[3] + TEMP_POS[2] * M[6];
  out[1] = TEMP_POS[0] * M[1] + TEMP_POS[1] * M[4] + TEMP_POS[2] * M[7];
  out[2] = TEMP_POS[0] * M[2] + TEMP_POS[1] * M[5] + TEMP_POS[2] * M[8];

  out[0] += seed.position[0];
  out[1] += seed.position[1];
  out[2] += seed.position[2];

  return out;
}

function computeRenderBoxDimension(
  out: vec3,
  seed: SeedSpec,
  orientationMatrix: mat3,
  halfBounds: vec3,
) {
  const { scale } = seed;

  const M = orientationMatrix;
  const bounds = _bounds;
  bounds[0] = bounds[1] = bounds[2] = 0;

  for (let j = 0; j < 8; ++j) {
    const x = (j & 1 ? scale[0] : -scale[0]) * halfBounds[0];
    const y = (j & 2 ? scale[1] : -scale[1]) * halfBounds[1];
    const z = (j & 4 ? scale[2] : -scale[2]) * halfBounds[2];

    bounds[0] = Math.max(bounds[0], Math.abs(x * M[0] + y * M[3] + z * M[6]));
    bounds[1] = Math.max(bounds[1], Math.abs(x * M[1] + y * M[4] + z * M[7]));
    bounds[2] = Math.max(bounds[2], Math.abs(x * M[2] + y * M[5] + z * M[8]));
  }

  out[0] = bounds[0] * 2;
  out[1] = bounds[1] * 2;
  out[2] = bounds[2] * 2;

  return out;
}

/**
 * 计算世界坐标下，单个节点的外观框的维度，以及位置
 * - 受entity的锚点、缩放、旋转、位移影响
 */
export function computeRenderBox(seed: SeedSpec): RenderBoxResult {
  const dimension: vec3 = [0, 0, 0];
  const position: vec3 = [0, 0, 0];

  const M = _M;
  const bounds = _bounds;

  bounds[0] = bounds[1] = bounds[2] = 0;

  HALF_BOUNDS[0] = seed.renderBoxBounds[0] * 0.5;
  HALF_BOUNDS[1] = seed.renderBoxBounds[1] * 0.5;
  HALF_BOUNDS[2] = seed.renderBoxBounds[2] * 0.5;

  // https://en.wikipedia.org/wiki/Rotation_matrix
  mat3.fromQuat(M, seed.orientation);

  computeRenderBoxDimension(dimension, seed, M, HALF_BOUNDS);

  getWorldRenderBoxPosition(position, seed, M);

  return {
    dimension,
    position,
  };
}

/**
 * 从渲染实例中取出外观框的尺寸（bounds）以及偏移量（renderBoxOffset）
 */
export function renderBoxFromRenderable(
  out: {
    bounds: vec3;
    offset: vec3;
  },
  renderable: Renderable,
) {
  const { bounds, offset } = out;

  if (isGLMesh(renderable) || isGPUMesh(renderable)) {
    vec3.set(
      bounds,
      renderable.hix - renderable.lox,
      renderable.hiy - renderable.loy,
      renderable.hiz - renderable.loz,
    );
    vec3.copy(offset, renderable.renderBoxOffset);
  } else {
    vec3.set(bounds, renderable.width, renderable.height, 0);
    vec3.zero(offset);
  }

  return {
    bounds,
    offset,
  };
}
