import { MASS, HSX, HSY, HSZ } from '../../prepare-bodies';

export type SerializedVec3 = [number, number, number];

export function ALLOC(size: number) {
  return new Float32Array(size);
}
export type ArrayType = ReturnType<typeof ALLOC>;

export type Vec3 = SerializedVec3 | ArrayType;

export function calcRotation(
  out: ArrayType,
  qx: number,
  qy: number,
  qz: number,
  qw: number,
) {
  // get bounding axes from quaternion
  const x2 = qx + qx;
  const y2 = qy + qy;
  const z2 = qz + qz;

  const xx = qx * x2;
  const yx = qy * x2;
  const yy = qy * y2;
  const zx = qz * x2;
  const zy = qz * y2;
  const zz = qz * z2;
  const wx = qw * x2;
  const wy = qw * y2;
  const wz = qw * z2;

  const m0 = 1 - yy - zz;
  const m1 = yx + wz;
  const m2 = zx - wy;
  const m3 = yx - wz;
  const m4 = 1 - xx - zz;
  const m5 = zy + wx;

  const m6 = zx + wy;
  const m7 = zy - wx;
  const m8 = 1 - xx - yy;

  out.set([m0, m1, m2, m3, m4, m5, m6, m7, m8]);
}

const TMP_M = ALLOC(9);
/**
 * 惯性张量的计算
 * https://wuli.wiki/online/ITensr.html
 * @param out 输出的惯性张量
 * @param id 刚体ID
 * @param rot 刚体的旋转矩阵
 */
export function getInverseInertia(out: ArrayType, id: number, rot: ArrayType) {
  out.set([
    (MASS[id] * (HSY[id] * 2 * HSY[id] * 2 + HSZ[id] * 2 * HSZ[id] * 2)) / 12,
    0,
    0,
    0,
    (MASS[id] * (HSX[id] * 2 * HSX[id] * 2 + HSZ[id] * 2 * HSZ[id] * 2)) / 12,
    0,
    0,
    0,
    (MASS[id] * (HSX[id] * 2 * HSX[id] * 2 + HSY[id] * 2 * HSY[id] * 2)) / 12,
  ]);

  // mat3.mul(TMP_M, rot, out);
  TMP_M[0] = out[0] * rot[0] + out[1] * rot[3] + out[2] * rot[6];
  TMP_M[1] = out[0] * rot[1] + out[1] * rot[4] + out[2] * rot[7];
  TMP_M[2] = out[0] * rot[2] + out[1] * rot[5] + out[2] * rot[8];
  TMP_M[3] = out[3] * rot[0] + out[4] * rot[3] + out[5] * rot[6];
  TMP_M[4] = out[3] * rot[1] + out[4] * rot[4] + out[5] * rot[7];
  TMP_M[5] = out[3] * rot[2] + out[4] * rot[5] + out[5] * rot[8];
  TMP_M[6] = out[6] * rot[0] + out[7] * rot[3] + out[8] * rot[6];
  TMP_M[7] = out[6] * rot[1] + out[7] * rot[4] + out[8] * rot[7];
  TMP_M[8] = out[6] * rot[2] + out[7] * rot[5] + out[8] * rot[8];

  // mat3.transpose(TMP_M1, rot);
  // mat3.mul(out, TMP_M, TMP_M1);
  out[0] = rot[0] * TMP_M[0] + rot[3] * TMP_M[3] + rot[6] * TMP_M[6];
  out[1] = rot[0] * TMP_M[1] + rot[3] * TMP_M[4] + rot[6] * TMP_M[7];
  out[2] = rot[0] * TMP_M[2] + rot[3] * TMP_M[5] + rot[6] * TMP_M[8];
  out[3] = rot[1] * TMP_M[0] + rot[4] * TMP_M[3] + rot[7] * TMP_M[6];
  out[4] = rot[1] * TMP_M[1] + rot[4] * TMP_M[4] + rot[7] * TMP_M[7];
  out[5] = rot[1] * TMP_M[2] + rot[4] * TMP_M[5] + rot[7] * TMP_M[8];
  out[6] = rot[2] * TMP_M[0] + rot[5] * TMP_M[3] + rot[8] * TMP_M[6];
  out[7] = rot[2] * TMP_M[1] + rot[5] * TMP_M[4] + rot[8] * TMP_M[7];
  out[8] = rot[2] * TMP_M[2] + rot[5] * TMP_M[5] + rot[8] * TMP_M[8];

  // mat3.invert(out, out);
  const a00 = out[0],
    a01 = out[1],
    a02 = out[2];
  const a10 = out[3],
    a11 = out[4],
    a12 = out[5];
  const a20 = out[6],
    a21 = out[7],
    a22 = out[8];
  const b01 = a22 * a11 - a12 * a21;
  const b11 = -a22 * a10 + a12 * a20;
  const b21 = a21 * a10 - a11 * a20; // Calculate the determinant

  let det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return;
  }

  det = 1.0 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
}
