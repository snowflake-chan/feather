import type { mat3, mat4 } from 'gl-matrix';
import { LightProbe } from 'src/engine/voxel/light-schema';

export function updateProbeGeometry(
  probe: LightProbe,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  m0: number,
  m1: number,
  m2: number,
  m4: number,
  m5: number,
  m6: number,
  m8: number,
  m9: number,
  m10: number,
  m12: number,
  m13: number,
  m14: number,
) {
  const tx = (probe.X0 = m0 * ax + m4 * ay + m8 * az + m12);
  const ty = (probe.Y0 = m1 * ax + m5 * ay + m9 * az + m13);
  const tz = (probe.Z0 = m2 * ax + m6 * ay + m10 * az + m14);

  let lox = tx;
  let loy = ty;
  let loz = tz;

  let hix = tx;
  let hiy = ty;
  let hiz = tz;

  {
    const x = (probe.X1 = m0 * bx + m4 * ay + m8 * az + m12);
    const y = (probe.Y1 = m1 * bx + m5 * ay + m9 * az + m13);
    const z = (probe.Z1 = m2 * bx + m6 * ay + m10 * az + m14);

    lox = Math.min(lox, x);
    loy = Math.min(loy, y);
    loz = Math.min(loz, z);

    hix = Math.max(hix, x);
    hiy = Math.max(hiy, y);
    hiz = Math.max(hiz, z);
  }

  {
    const x = (probe.X2 = m0 * ax + m4 * by + m8 * az + m12);
    const y = (probe.Y2 = m1 * ax + m5 * by + m9 * az + m13);
    const z = (probe.Z2 = m2 * ax + m6 * by + m10 * az + m14);

    lox = Math.min(lox, x);
    loy = Math.min(loy, y);
    loz = Math.min(loz, z);

    hix = Math.max(hix, x);
    hiy = Math.max(hiy, y);
    hiz = Math.max(hiz, z);
  }

  {
    const x = (probe.X3 = m0 * bx + m4 * by + m8 * az + m12);
    const y = (probe.Y3 = m1 * bx + m5 * by + m9 * az + m13);
    const z = (probe.Z3 = m2 * bx + m6 * by + m10 * az + m14);

    lox = Math.min(lox, x);
    loy = Math.min(loy, y);
    loz = Math.min(loz, z);

    hix = Math.max(hix, x);
    hiy = Math.max(hiy, y);
    hiz = Math.max(hiz, z);
  }

  {
    const x = (probe.X4 = m0 * ax + m4 * ay + m8 * bz + m12);
    const y = (probe.Y4 = m1 * ax + m5 * ay + m9 * bz + m13);
    const z = (probe.Z4 = m2 * ax + m6 * ay + m10 * bz + m14);

    lox = Math.min(lox, x);
    loy = Math.min(loy, y);
    loz = Math.min(loz, z);

    hix = Math.max(hix, x);
    hiy = Math.max(hiy, y);
    hiz = Math.max(hiz, z);
  }

  {
    const x = (probe.X5 = m0 * bx + m4 * ay + m8 * bz + m12);
    const y = (probe.Y5 = m1 * bx + m5 * ay + m9 * bz + m13);
    const z = (probe.Z5 = m2 * bx + m6 * ay + m10 * bz + m14);

    lox = Math.min(lox, x);
    loy = Math.min(loy, y);
    loz = Math.min(loz, z);

    hix = Math.max(hix, x);
    hiy = Math.max(hiy, y);
    hiz = Math.max(hiz, z);
  }

  {
    const x = (probe.X6 = m0 * ax + m4 * by + m8 * bz + m12);
    const y = (probe.Y6 = m1 * ax + m5 * by + m9 * bz + m13);
    const z = (probe.Z6 = m2 * ax + m6 * by + m10 * bz + m14);

    lox = Math.min(lox, x);
    loy = Math.min(loy, y);
    loz = Math.min(loz, z);

    hix = Math.max(hix, x);
    hiy = Math.max(hiy, y);
    hiz = Math.max(hiz, z);
  }

  {
    const x = (probe.X7 = m0 * bx + m4 * by + m8 * bz + m12);
    const y = (probe.Y7 = m1 * bx + m5 * by + m9 * bz + m13);
    const z = (probe.Z7 = m2 * bx + m6 * by + m10 * bz + m14);

    lox = Math.min(lox, x);
    loy = Math.min(loy, y);
    loz = Math.min(loz, z);

    hix = Math.max(hix, x);
    hiy = Math.max(hiy, y);
    hiz = Math.max(hiz, z);
  }

  // update bounds
  probe.lox = lox;
  probe.loy = loy;
  probe.loz = loz;

  probe.hix = hix;
  probe.hiy = hiy;
  probe.hiz = hiz;
}

export function updateMeshInstanceMatrices(
  mesh: { normalMatrix: mat3; model: mat4 },
  a00: number,
  a01: number,
  a02: number,
  a10: number,
  a11: number,
  a12: number,
  a20: number,
  a21: number,
  a22: number,
  a30: number,
  a31: number,
  a32: number,
) {
  const { normalMatrix, model } = mesh;

  // copy entries into old matrix
  model[0] = a00;
  model[1] = a01;
  model[2] = a02;
  model[3] = 0;
  model[4] = a10;
  model[5] = a11;
  model[6] = a12;
  model[7] = 0;
  model[8] = a20;
  model[9] = a21;
  model[10] = a22;
  model[11] = 0;
  model[12] = a30;
  model[13] = a31;
  model[14] = a32;
  model[15] = 1;

  // output normal matrix (not scaled by determinant)
  normalMatrix[0] = a11 * a22 - a12 * a21;
  normalMatrix[1] = a12 * a20 - a10 * a22;
  normalMatrix[2] = a10 * a21 - a11 * a20;
  normalMatrix[3] = a02 * a21 - a01 * a22;
  normalMatrix[4] = a00 * a22 - a02 * a20;
  normalMatrix[5] = a01 * a20 - a00 * a21;
  normalMatrix[6] = a01 * a12 - a02 * a11;
  normalMatrix[7] = a02 * a10 - a00 * a12;
  normalMatrix[8] = a00 * a11 - a01 * a10;
}
