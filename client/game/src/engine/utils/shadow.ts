import _REGL from 'regl';
import { vec3, mat4, vec4, vec2, mat3 } from 'gl-matrix';

import { Camera } from '@box/schema/camera/camera-schema';

import { initArray } from '../utils/init-array';
import { setFrustumMatrix } from '../utils/frustum';
import { GLBakeShadowMap, GLShadowMap } from '../gl/schema/gl-shadow-schema';
import {
  GPUBakeShadowMap,
  GPUShadowMap,
} from '../gpu/schema/gpu-shadow-schema';
import { GameClientState } from '../game-client-schema';
import { MuArray, MuFloat32, MuSchema, MuStruct } from '@box/mudb/schema';
import {
  Mat4Schema,
  Mat3Schema,
  Vec4Schema,
} from '@box/schema/utils/math-schema';
import { MuWriteStream } from '@box/mudb/stream';

// x, y, w, h
export const CASCADE_LAYOUT = [
  vec4.fromValues(0, 0, 0.5, 0.5),
  vec4.fromValues(0, 0.5, 0.5, 0.5),
  vec4.fromValues(0.5, 0, 0.5, 0.5),
  vec4.fromValues(0.5, 0.5, 0.5, 0.5),
];

/**
 * 静态阴影烘焙图的尺寸
 * 默认为4096 * 4096分辨率的图
 */
export const BAKE_SIZE = 4096;

/**
 * 静态阴影烘焙图的chunk切分
 * 默认为6，即切分为64的尺寸
 */
export const BAKE_CHUNK_SHIFT = 6;
/**
 * 静态阴影烘焙图的切分尺寸
 */
export const BAKE_CHUNK_SIZE = 1 << BAKE_CHUNK_SHIFT;

const FRUSTUM_POINTS = initArray(8, () => vec3.create());

const MIN_AXIS = vec2.create();
const MIN_BOUNDS = vec4.create();
function computeRectBounds() {
  let minArea = Infinity;
  for (let i = 0; i < 8; ++i) {
    const A = FRUSTUM_POINTS[i];
    const AX = A[0];
    const AY = A[1];
    for (let j = 0; j < i; ++j) {
      const B = FRUSTUM_POINTS[j];
      let UX = B[0] - AX;
      let UY = B[1] - AY;
      const UL = 1 / Math.sqrt(Math.pow(UX, 2) + Math.pow(UY, 2));
      UX *= UL;
      UY *= UL;

      let u0 = Infinity;
      let u1 = -Infinity;
      let v0 = Infinity;
      let v1 = -Infinity;
      for (let k = 0; k < 8; ++k) {
        const P = FRUSTUM_POINTS[k];
        const PX = P[0];
        const PY = P[1];
        const u = UX * PX + UY * PY;
        const v = -UY * PX + UX * PY;
        u0 = Math.min(u0, u);
        u1 = Math.max(u1, u);
        v0 = Math.min(v0, v);
        v1 = Math.max(v1, v);
      }

      const area = (u1 - u0) * (v1 - v0);
      if (area < minArea) {
        minArea = area;
        MIN_AXIS[0] = UX;
        MIN_AXIS[1] = UY;
        MIN_BOUNDS[0] = u0;
        MIN_BOUNDS[1] = u1;
        MIN_BOUNDS[2] = v0;
        MIN_BOUNDS[3] = v1;
      }
    }
  }

  MIN_BOUNDS[0] -= 1;
  MIN_BOUNDS[1] += 1;
  MIN_BOUNDS[2] -= 1;
  MIN_BOUNDS[3] += 1;
}

const SCRATCH = vec3.create();
function xform(out: vec3, m: mat4, x: number, y: number, z: number) {
  SCRATCH[0] = x;
  SCRATCH[1] = y;
  SCRATCH[2] = z;
  vec3.transformMat4(out, SCRATCH, m);
}

const CONVERT_GPU_PROJ = mat4.create();
mat4.identity(CONVERT_GPU_PROJ);
CONVERT_GPU_PROJ[10] = 0.5;
CONVERT_GPU_PROJ[14] = 0.5;

export function computeShadowMapMatrices(
  cascade: GLShadowMap | GPUShadowMap,
  zNear: number,
  zFar: number,
  view: mat4,
  camera: Camera,
  uvBounds: vec4,
  size: number,
  isWebGPU: boolean = false,
) {
  // update viewport and zrange
  cascade.zRange[0] = zNear;
  cascade.zRange[1] = zFar;
  cascade.shadowViewport.x = uvBounds[0] * size;
  cascade.shadowViewport.y = uvBounds[1] * size;
  cascade.shadowViewport.width = uvBounds[2] * size;
  cascade.shadowViewport.height = uvBounds[3] * size;
  vec4.copy(cascade.uvBounds, uvBounds);

  mat4.copy(cascade.prevShadowViewProjMatrix, cascade.shadowViewProjMatrix);

  mat4.perspective(
    cascade.clippedCameraProj,
    camera.fovY,
    camera.viewport[0] / camera.viewport[1],
    cascade.zRange[0],
    cascade.zRange[1],
  );

  mat4.multiply(cascade.cameraViewProj, cascade.clippedCameraProj, camera.view);
  mat4.invert(cascade.invCameraViewProj, cascade.cameraViewProj);
  const cameraFrustum = cascade.cameraFrustum;
  setFrustumMatrix(
    cascade.cameraFrustum,
    cascade.cameraViewProj,
    cascade.invCameraViewProj,
  );

  mat4.copy(cascade.shadowViewMatrix, view);

  // calculate bounding matrix
  xform(
    FRUSTUM_POINTS[0],
    cascade.shadowViewMatrix,
    cameraFrustum.p0x,
    cameraFrustum.p0y,
    cameraFrustum.p0z,
  );
  xform(
    FRUSTUM_POINTS[1],
    cascade.shadowViewMatrix,
    cameraFrustum.p1x,
    cameraFrustum.p1y,
    cameraFrustum.p1z,
  );
  xform(
    FRUSTUM_POINTS[2],
    cascade.shadowViewMatrix,
    cameraFrustum.p2x,
    cameraFrustum.p2y,
    cameraFrustum.p2z,
  );
  xform(
    FRUSTUM_POINTS[3],
    cascade.shadowViewMatrix,
    cameraFrustum.p3x,
    cameraFrustum.p3y,
    cameraFrustum.p3z,
  );
  xform(
    FRUSTUM_POINTS[4],
    cascade.shadowViewMatrix,
    cameraFrustum.p4x,
    cameraFrustum.p4y,
    cameraFrustum.p4z,
  );
  xform(
    FRUSTUM_POINTS[5],
    cascade.shadowViewMatrix,
    cameraFrustum.p5x,
    cameraFrustum.p5y,
    cameraFrustum.p5z,
  );
  xform(
    FRUSTUM_POINTS[6],
    cascade.shadowViewMatrix,
    cameraFrustum.p6x,
    cameraFrustum.p6y,
    cameraFrustum.p6z,
  );
  xform(
    FRUSTUM_POINTS[7],
    cascade.shadowViewMatrix,
    cameraFrustum.p7x,
    cameraFrustum.p7y,
    cameraFrustum.p7z,
  );
  const zmax = Math.max(
    0,
    -FRUSTUM_POINTS[0][2],
    -FRUSTUM_POINTS[1][2],
    -FRUSTUM_POINTS[2][2],
    -FRUSTUM_POINTS[3][2],
    -FRUSTUM_POINTS[4][2],
    -FRUSTUM_POINTS[5][2],
    -FRUSTUM_POINTS[6][2],
    -FRUSTUM_POINTS[7][2],
  );
  computeRectBounds();

  const proj = cascade.shadowProjMatrix;
  const xs = 2 / (MIN_BOUNDS[1] - MIN_BOUNDS[0]);
  const ys = 2 / (MIN_BOUNDS[3] - MIN_BOUNDS[2]);

  const ur = 0.5 * (MIN_BOUNDS[0] + MIN_BOUNDS[1]);
  const vr = 0.5 * (MIN_BOUNDS[2] + MIN_BOUNDS[3]);
  proj[0] = xs * MIN_AXIS[0];
  proj[4] = xs * MIN_AXIS[1];
  proj[8] = 0;
  proj[12] = -xs * ur;

  proj[1] = -ys * MIN_AXIS[1];
  proj[5] = ys * MIN_AXIS[0];
  proj[9] = 0;
  proj[13] = -ys * vr;

  const zmin = 1;
  const zs = -1 / (zmax - zmin);
  proj[2] = 0;
  proj[7] = 0;
  proj[10] = 2 * zs;
  proj[14] = zs * (zmax + zmin);

  proj[3] = 0;
  proj[7] = 0;
  proj[11] = 0;
  proj[15] = 1;

  if (isWebGPU) {
    mat4.mul(proj, CONVERT_GPU_PROJ, proj);
  }

  mat4.multiply(
    cascade.shadowViewProjMatrix,
    cascade.shadowProjMatrix,
    cascade.shadowViewMatrix,
  );
  mat4.invert(cascade.invShadowViewProjMatrix, cascade.shadowViewProjMatrix);
  setFrustumMatrix(
    cascade.frustum,
    cascade.shadowViewProjMatrix,
    cascade.invShadowViewProjMatrix,
  );

  for (let i = 0; i < 2; ++i) {
    cascade.scaledZRange[i] =
      (cascade.zRange[i] - camera.zNear) / (camera.zFar - camera.zNear);
  }

  mat3.fromMat4(cascade.shadowNormalMatrix, cascade.invShadowViewProjMatrix);
  mat3.transpose(cascade.shadowNormalMatrix, cascade.shadowNormalMatrix);

  cascade.shaderBounds[0] = uvBounds[0];
  cascade.shaderBounds[1] = uvBounds[1];
  cascade.shaderBounds[2] = MIN_BOUNDS[1] - MIN_BOUNDS[0];
  cascade.shaderBounds[3] = MIN_BOUNDS[3] - MIN_BOUNDS[2];
}

const SHADOW_UP = vec3.fromValues(0, 0, 1);

const SUN_DIRECTION = vec3.create();
const SUN_RIGHT = vec3.create();
const SUN_UP = vec3.create();
const SUN_POS = vec3.create();

const TEMP_MAT3 = mat3.create();

export function computeBakedShadowViewAndCascade<
  T extends GLBakeShadowMap | GPUBakeShadowMap,
>(
  out: {
    shadowView: mat4;
    bakeCascade: T[];
    bakeZScaleRatio: number;
  },
  sunDirection: vec3,
  voxelShape: [number, number, number],
  schema: MuSchema<T>,
) {
  const { bakeCascade, shadowView } = out;

  // update view matrix
  vec3.normalize(SUN_DIRECTION, sunDirection);

  vec3.normalize(SUN_RIGHT, vec3.cross(SUN_RIGHT, SHADOW_UP, SUN_DIRECTION));

  vec3.normalize(SUN_UP, vec3.cross(SUN_UP, SUN_DIRECTION, SUN_RIGHT));

  mat4.identity(shadowView);

  // 太阳光角度不一致的时候，需要的阴影偏移（shadow bias）数值不一样
  // 这里通过光照方向数值来调整bias的比例
  // 数值上没什么道理，就是一边调参一边看效果
  out.bakeZScaleRatio = 1 / sunDirection[1] - 0.9;

  shadowView[0] = SUN_RIGHT[0];
  shadowView[4] = SUN_RIGHT[1];
  shadowView[8] = SUN_RIGHT[2];

  shadowView[1] = SUN_UP[0];
  shadowView[5] = SUN_UP[1];
  shadowView[9] = SUN_UP[2];

  shadowView[2] = SUN_DIRECTION[0];
  shadowView[6] = SUN_DIRECTION[1];
  shadowView[10] = SUN_DIRECTION[2];

  const xCount = voxelShape[0] >> BAKE_CHUNK_SHIFT;
  const zCount = voxelShape[2] >> BAKE_CHUNK_SHIFT;

  const w = 1 / xCount;
  const h = 1 / zCount;

  mat3.fromMat4(TEMP_MAT3, shadowView);
  const sunPosY = voxelShape[1];

  for (let z = 0; z < zCount; z++) {
    for (let x = 0; x < xCount; x++) {
      const index = xCount * z + x;
      const currLayout = vec4.fromValues(w * x, h * z, w, h);

      const sunPosX = BAKE_CHUNK_SIZE * x + BAKE_CHUNK_SIZE / 2;
      const sunPosZ = BAKE_CHUNK_SIZE * z + BAKE_CHUNK_SIZE / 2;
      vec3.set(SUN_POS, sunPosX, sunPosY, sunPosZ);

      vec3.transformMat3(SUN_POS, SUN_POS, TEMP_MAT3);

      shadowView[12] = -SUN_POS[0];
      shadowView[13] = -SUN_POS[1];
      shadowView[14] = -SUN_POS[2];

      const max = [
        BAKE_CHUNK_SIZE * x + BAKE_CHUNK_SIZE,
        voxelShape[1],
        BAKE_CHUNK_SIZE * z + BAKE_CHUNK_SIZE,
      ];
      const min = [BAKE_CHUNK_SIZE * x, 0, BAKE_CHUNK_SIZE * z];

      if (!bakeCascade[index]) {
        bakeCascade[index] = schema.alloc();
      }

      computeBakeShadowMapMatrices(
        bakeCascade[index],
        shadowView,
        currLayout,
        max,
        min,
      );
    }
  }
}

function computeBakeShadowMapMatrices<
  T extends GLBakeShadowMap | GPUBakeShadowMap,
>(cascade: T, view: mat4, uvBounds: vec4, max: number[], min: number[]) {
  // update viewport and zrange
  cascade.shadowViewport.x = uvBounds[0] * BAKE_SIZE;
  cascade.shadowViewport.y = uvBounds[1] * BAKE_SIZE;
  cascade.shadowViewport.width = uvBounds[2] * BAKE_SIZE;
  cascade.shadowViewport.height = uvBounds[3] * BAKE_SIZE;

  mat4.copy(cascade.shadowViewMatrix, view);

  // calculate bounding matrix
  xform(FRUSTUM_POINTS[0], cascade.shadowViewMatrix, min[0], min[1], min[2]);
  xform(FRUSTUM_POINTS[1], cascade.shadowViewMatrix, min[0], min[1], max[2]);
  xform(FRUSTUM_POINTS[2], cascade.shadowViewMatrix, min[0], max[1], min[2]);
  xform(FRUSTUM_POINTS[3], cascade.shadowViewMatrix, min[0], max[1], max[2]);
  xform(FRUSTUM_POINTS[4], cascade.shadowViewMatrix, max[0], min[1], min[2]);
  xform(FRUSTUM_POINTS[5], cascade.shadowViewMatrix, max[0], min[1], max[2]);
  xform(FRUSTUM_POINTS[6], cascade.shadowViewMatrix, max[0], max[1], min[2]);
  xform(FRUSTUM_POINTS[7], cascade.shadowViewMatrix, max[0], max[1], max[2]);

  const zmax = Math.max(
    0,
    -FRUSTUM_POINTS[0][2],
    -FRUSTUM_POINTS[1][2],
    -FRUSTUM_POINTS[2][2],
    -FRUSTUM_POINTS[3][2],
    -FRUSTUM_POINTS[4][2],
    -FRUSTUM_POINTS[5][2],
    -FRUSTUM_POINTS[6][2],
    -FRUSTUM_POINTS[7][2],
  );
  computeRectBounds();

  const proj = cascade.shadowProjMatrix;
  mat4.identity(proj);
  const xs = 2 / (MIN_BOUNDS[1] - MIN_BOUNDS[0]);
  const ys = 2 / (MIN_BOUNDS[3] - MIN_BOUNDS[2]);

  const ur = 0.5 * (MIN_BOUNDS[0] + MIN_BOUNDS[1]);
  const vr = 0.5 * (MIN_BOUNDS[2] + MIN_BOUNDS[3]);
  proj[0] = xs * MIN_AXIS[0];
  proj[4] = xs * MIN_AXIS[1];
  proj[8] = 0;
  proj[12] = -xs * ur;

  proj[1] = -ys * MIN_AXIS[1];
  proj[5] = ys * MIN_AXIS[0];
  proj[9] = 0;
  proj[13] = -ys * vr;

  const zmin = 1;
  const zs = -1 / (zmax - zmin);

  proj[2] = 0;
  proj[7] = 0;
  proj[10] = 2 * zs;
  proj[14] = zs * (zmax + zmin);

  proj[3] = 0;
  proj[7] = 0;
  proj[11] = 0;
  proj[15] = 1;

  mat4.mul(proj, CONVERT_GPU_PROJ, proj);

  mat4.multiply(
    cascade.shadowViewProjMatrix,
    cascade.shadowProjMatrix,
    cascade.shadowViewMatrix,
  );

  mat4.invert(cascade.invShadowViewProjMatrix, cascade.shadowViewProjMatrix);
  setFrustumMatrix(
    cascade.frustum,
    cascade.shadowViewProjMatrix,
    cascade.invShadowViewProjMatrix,
  );

  mat3.fromMat4(cascade.shadowNormalMatrix, cascade.invShadowViewProjMatrix);
  mat3.transpose(cascade.shadowNormalMatrix, cascade.shadowNormalMatrix);

  cascade.shaderBounds[0] = uvBounds[0];
  cascade.shaderBounds[1] = uvBounds[1];
  cascade.shaderBounds[2] = MIN_BOUNDS[1] - MIN_BOUNDS[0];
  cascade.shaderBounds[3] = MIN_BOUNDS[3] - MIN_BOUNDS[2];
}

export const BakeCascadeDataSchema = new MuStruct({
  projection: Mat4Schema,
  normal: Mat3Schema,
  bounds: Vec4Schema,
});

export const BakeDataSchema = new MuStruct({
  zScaleRatio: new MuFloat32(),
  cascade: new MuArray(BakeCascadeDataSchema, Infinity),
});

export async function bakeShadow(state: GameClientState): Promise<{
  texture: Blob;
  data: Blob;
}> {
  return new Promise((resolve, reject) => {
    state.dom.bakeShadow = true;

    const timer = setInterval(() => {
      if (!state.dom.bakeShadow) {
        clearInterval(timer);

        if (!state.dom.bakeCanvas) {
          reject(new Error(`Error in bakeShadow: bakeCanvas is null`));
          return;
        }

        const bakeData = BakeDataSchema.alloc();
        const { bakeCascade, bakeZScaleRatio } = state.gl.regl
          ? state.shadow
          : state.gpuShadow;

        bakeData.zScaleRatio = bakeZScaleRatio;
        bakeCascade.forEach((c) => {
          bakeData.cascade.push(
            BakeCascadeDataSchema.clone({
              projection: c.shadowViewProjMatrix,
              normal: c.shadowNormalMatrix,
              bounds: c.shaderBounds,
            }),
          );
        });

        const ws = new MuWriteStream(1);
        BakeDataSchema.diff(BakeDataSchema.identity, bakeData, ws);
        const bytes = ws.bytes();

        ws.destroy();
        BakeDataSchema.free(bakeData);

        state.dom.bakeCanvas.toBlob((blob) => {
          if (blob) {
            resolve({
              texture: blob,
              data: new Blob([bytes]),
            });
          } else {
            reject(new Error(`Error in bakeCanvasToBlob: blob is null`));
          }
        });
      }
    });
  });
}
