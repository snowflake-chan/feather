import { vec3, mat4 } from 'gl-matrix';
import { ChunkVisibilityFlags } from '../voxel/visibility-flags';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';
import { Frustum, FrustumSchema } from '@box/schema/utils/frustum-schema';

// huge epsilon, add a tolerance of +0.5 voxels to each axis
const EPSILON = 0.1;

const P = vec3.create();
function vert(f: Frustum, x: number, y: number, z: number) {
  P[0] = x;
  P[1] = y;
  P[2] = z;
  vec3.transformMat4(P, P, f.invMatrix);
  const tx = P[0];
  const ty = P[1];
  const tz = P[2];
  f.lox = Math.min(f.lox, tx);
  f.loy = Math.min(f.loy, ty);
  f.loz = Math.min(f.loz, tz);
  f.hix = Math.max(f.hix, tx);
  f.hiy = Math.max(f.hiy, ty);
  f.hiz = Math.max(f.hiz, tz);

  if (z < 0) {
    f.nearX0 = Math.min(f.nearX0, tx);
    f.nearY0 = Math.min(f.nearY0, ty);
    f.nearZ0 = Math.min(f.nearZ0, tz);
    f.nearX1 = Math.max(f.nearX1, tx);
    f.nearY1 = Math.max(f.nearY1, ty);
    f.nearZ1 = Math.max(f.nearZ1, tz);
  }
}

function hypot3(x: number, y: number, z: number) {
  const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  if (r > 0) {
    return 1 / r;
  }
  return 1;
}

export function setFrustumMatrix(f: Frustum, m: mat4, mInv?: mat4) {
  // update matrices
  mat4.copy(f.matrix, m);
  if (mInv) {
    mat4.copy(f.invMatrix, mInv);
  } else {
    mat4.invert(f.invMatrix, m);
  }

  // compute frustum planes
  const x = m[3];
  const y = m[7];
  const z = m[11];
  const w = m[15];

  f.h0x = x - m[0];
  f.h0y = y - m[4];
  f.h0z = z - m[8];
  f.h0w = w - m[12];
  const s0 = hypot3(f.h0x, f.h0y, f.h0z);
  f.h0x *= s0;
  f.h0y *= s0;
  f.h0z *= s0;
  f.h0w *= s0;
  f.h0w += EPSILON;

  f.h1x = x + m[0];
  f.h1y = y + m[4];
  f.h1z = z + m[8];
  f.h1w = w + m[12];
  const s1 = hypot3(f.h1x, f.h1y, f.h1z);
  f.h1x *= s1;
  f.h1y *= s1;
  f.h1z *= s1;
  f.h1w *= s1;
  f.h1w += EPSILON;

  f.h2x = x - m[1];
  f.h2y = y - m[5];
  f.h2z = z - m[9];
  f.h2w = w - m[13];
  const s2 = hypot3(f.h2x, f.h2y, f.h2z);
  f.h2x *= s2;
  f.h2y *= s2;
  f.h2z *= s2;
  f.h2w *= s2;
  f.h2w += EPSILON;

  f.h3x = x + m[1];
  f.h3y = y + m[5];
  f.h3z = z + m[9];
  f.h3w = w + m[13];
  const s3 = hypot3(f.h3x, f.h3y, f.h3z);
  f.h3x *= s3;
  f.h3y *= s3;
  f.h3z *= s3;
  f.h3w *= s3;
  f.h3w += EPSILON;

  f.h4x = x - m[2];
  f.h4y = y - m[6];
  f.h4z = z - m[10];
  f.h4w = w - m[14];
  const s4 = hypot3(f.h4x, f.h4y, f.h4z);
  f.h4x *= s4;
  f.h4y *= s4;
  f.h4z *= s4;
  f.h4w *= s4;
  f.h4w += EPSILON;

  f.h5x = x + m[2];
  f.h5y = y + m[6];
  f.h5z = z + m[10];
  f.h5w = w + m[14];
  const s5 = hypot3(f.h5x, f.h5y, f.h5z);
  f.h5x *= s5;
  f.h5y *= s5;
  f.h5z *= s5;
  f.h5w *= s5;
  f.h5w += EPSILON;

  // compute frustum vertices
  f.nearX0 = f.nearY0 = f.nearZ0 = f.lox = f.loy = f.loz = Infinity;
  f.nearX1 = f.nearY1 = f.nearZ1 = f.hix = f.hiy = f.hiz = -Infinity;

  vert(f, -1, -1, -1);
  f.p0x = P[0];
  f.p0y = P[1];
  f.p0z = P[2];

  vert(f, -1, -1, 1);
  f.p1x = P[0];
  f.p1y = P[1];
  f.p1z = P[2];

  vert(f, -1, 1, -1);
  f.p2x = P[0];
  f.p2y = P[1];
  f.p2z = P[2];

  vert(f, -1, 1, 1);
  f.p3x = P[0];
  f.p3y = P[1];
  f.p3z = P[2];

  vert(f, 1, -1, -1);
  f.p4x = P[0];
  f.p4y = P[1];
  f.p4z = P[2];

  vert(f, 1, -1, 1);
  f.p5x = P[0];
  f.p5y = P[1];
  f.p5z = P[2];

  vert(f, 1, 1, -1);
  f.p6x = P[0];
  f.p6y = P[1];
  f.p6z = P[2];

  vert(f, 1, 1, 1);
  f.p7x = P[0];
  f.p7y = P[1];
  f.p7z = P[2];

  // add tolerance
  f.lox -= EPSILON;
  f.loy -= EPSILON;
  f.loz -= EPSILON;
  f.hix += EPSILON;
  f.hiy += EPSILON;
  f.hiz += EPSILON;
}

function testBoxPlane(
  px: number,
  py: number,
  pz: number,
  pw: number,
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
) {
  return (
    px * lox + py * loy + pz * loz < -pw &&
    px * hix + py * loy + pz * loz < -pw &&
    px * lox + py * hiy + pz * loz < -pw &&
    px * hix + py * hiy + pz * loz < -pw &&
    px * lox + py * loy + pz * hiz < -pw &&
    px * hix + py * loy + pz * hiz < -pw &&
    px * lox + py * hiy + pz * hiz < -pw &&
    px * hix + py * hiy + pz * hiz < -pw
  );
}

export function testFrustumBox(
  f: typeof FrustumSchema.identity,
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
) {
  // test bounding box
  if (
    f.hix < lox ||
    hix < f.lox ||
    f.hiy < loy ||
    hiy < f.loy ||
    f.hiz < loz ||
    hiz < f.loz
  ) {
    return false;
  }
  // test planes
  if (testBoxPlane(f.h0x, f.h0y, f.h0z, f.h0w, lox, loy, loz, hix, hiy, hiz)) {
    return false;
  }
  if (testBoxPlane(f.h1x, f.h1y, f.h1z, f.h1w, lox, loy, loz, hix, hiy, hiz)) {
    return false;
  }
  if (testBoxPlane(f.h2x, f.h2y, f.h2z, f.h2w, lox, loy, loz, hix, hiy, hiz)) {
    return false;
  }
  if (testBoxPlane(f.h3x, f.h3y, f.h3z, f.h3w, lox, loy, loz, hix, hiy, hiz)) {
    return false;
  }
  if (testBoxPlane(f.h4x, f.h4y, f.h4z, f.h4w, lox, loy, loz, hix, hiy, hiz)) {
    return false;
  }
  if (testBoxPlane(f.h5x, f.h5y, f.h5z, f.h5w, lox, loy, loz, hix, hiy, hiz)) {
    return false;
  }
  return true;
}

export function testPointFrustum(
  frustum: Frustum,
  px: number,
  py: number,
  pz: number,
) {
  if (
    px < frustum.lox ||
    frustum.hix < px ||
    py < frustum.loy ||
    frustum.hiy < py ||
    pz < frustum.loz ||
    frustum.hiz < pz
  ) {
    return false;
  }
  const m = frustum.matrix;
  const w = m[3] * px + m[7] * py + m[11] * pz + m[15] + EPSILON;
  const x = m[0] * px + m[4] * py + m[8] * pz + m[12];
  if (x < -w || w < x) {
    return false;
  }
  const y = m[1] * px + m[5] * py + m[9] * pz + m[13];
  if (y < -w || w < y) {
    return false;
  }
  const z = m[2] * px + m[6] * py + m[10] * pz + m[14];
  if (z < -w || w < z) {
    return false;
  }
  return true;
}

// initial chunk flags computed by testing bounding box
function getChunkBoxFlags(
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
  nx: number,
  ny: number,
  nz: number,
) {
  const px = nx + CHUNK_SIZE;
  const py = ny + CHUNK_SIZE;
  const pz = nz + CHUNK_SIZE;

  const lnx = nx < lox;
  const lpx = px < lox;
  const lny = ny < loy;
  const lpy = py < loy;
  const lnz = nz < loz;
  const lpz = pz < loz;

  const hnx = hix < nx;
  const hpx = hix < px;
  const hny = hiy < ny;
  const hpy = hiy < py;
  const hnz = hiz < nz;
  const hpz = hiz < pz;

  return (
    (lnx || hnx || lpy || hny || lpz || hnz ? 0 : ChunkVisibilityFlags.NEG_X) |
    (lpx || hnx || lny || hny || lpz || hnz ? 0 : ChunkVisibilityFlags.NEG_Y) |
    (lpx || hnx || lpy || hny || lnz || hnz ? 0 : ChunkVisibilityFlags.NEG_Z) |
    (lpx || hpx || lpy || hny || lpz || hnz ? 0 : ChunkVisibilityFlags.POS_X) |
    (lpx || hnx || lpy || hpy || lpz || hnz ? 0 : ChunkVisibilityFlags.POS_Y) |
    (lpx || hnx || lpy || hny || lpz || hpz ? 0 : ChunkVisibilityFlags.POS_Z)
  );
}

const I_000 =
  ChunkVisibilityFlags.NEG_X |
  ChunkVisibilityFlags.NEG_Y |
  ChunkVisibilityFlags.NEG_Z;
const I_100 =
  ChunkVisibilityFlags.POS_X |
  ChunkVisibilityFlags.NEG_Y |
  ChunkVisibilityFlags.NEG_Z;
const I_010 =
  ChunkVisibilityFlags.NEG_X |
  ChunkVisibilityFlags.POS_Y |
  ChunkVisibilityFlags.NEG_Z;
const I_110 =
  ChunkVisibilityFlags.POS_X |
  ChunkVisibilityFlags.POS_Y |
  ChunkVisibilityFlags.NEG_Z;
const I_001 =
  ChunkVisibilityFlags.NEG_X |
  ChunkVisibilityFlags.NEG_Y |
  ChunkVisibilityFlags.POS_Z;
const I_101 =
  ChunkVisibilityFlags.POS_X |
  ChunkVisibilityFlags.NEG_Y |
  ChunkVisibilityFlags.POS_Z;
const I_011 =
  ChunkVisibilityFlags.NEG_X |
  ChunkVisibilityFlags.POS_Y |
  ChunkVisibilityFlags.POS_Z;
const I_111 =
  ChunkVisibilityFlags.POS_X |
  ChunkVisibilityFlags.POS_Y |
  ChunkVisibilityFlags.POS_Z;

function getChunkVertexFlags(
  px: number,
  py: number,
  pz: number,
  pw: number,
  cx: number,
  cy: number,
  cz: number,
) {
  const h = px * cx + py * cy + pz * cz + pw;
  const dx = px * CHUNK_SIZE;
  const dy = py * CHUNK_SIZE;
  const dz = pz * CHUNK_SIZE;
  return (
    (h >= 0 ? I_000 : 0) |
    (h + dx >= 0 ? I_100 : 0) |
    (h + dy >= 0 ? I_010 : 0) |
    (h + dx + dy >= 0 ? I_110 : 0) |
    (h + dz >= 0 ? I_001 : 0) |
    (h + dx + dz >= 0 ? I_101 : 0) |
    (h + dy + dz >= 0 ? I_011 : 0) |
    (h + dx + dy + dz >= 0 ? I_111 : 0)
  );
}

// approximate chunk visibility test
export function testFrustumChunkFaces(
  frustum: Frustum,
  cx: number,
  cy: number,
  cz: number,
) {
  let flags = getChunkBoxFlags(
    frustum.lox,
    frustum.loy,
    frustum.loz,
    frustum.hix,
    frustum.hiy,
    frustum.hiz,
    cx,
    cy,
    cz,
  );
  if (!flags) {
    return 0;
  }
  flags &= getChunkVertexFlags(
    frustum.h0x,
    frustum.h0y,
    frustum.h0z,
    frustum.h0w,
    cx,
    cy,
    cz,
  );
  if (!flags) {
    return 0;
  }
  flags &= getChunkVertexFlags(
    frustum.h1x,
    frustum.h1y,
    frustum.h1z,
    frustum.h1w,
    cx,
    cy,
    cz,
  );
  if (!flags) {
    return 0;
  }
  flags &= getChunkVertexFlags(
    frustum.h2x,
    frustum.h2y,
    frustum.h2z,
    frustum.h2w,
    cx,
    cy,
    cz,
  );
  if (!flags) {
    return 0;
  }
  flags &= getChunkVertexFlags(
    frustum.h3x,
    frustum.h3y,
    frustum.h3z,
    frustum.h3w,
    cx,
    cy,
    cz,
  );
  if (!flags) {
    return 0;
  }
  flags &= getChunkVertexFlags(
    frustum.h4x,
    frustum.h4y,
    frustum.h4z,
    frustum.h4w,
    cx,
    cy,
    cz,
  );
  if (!flags) {
    return 0;
  }
  flags &= getChunkVertexFlags(
    frustum.h5x,
    frustum.h5y,
    frustum.h5z,
    frustum.h5w,
    cx,
    cy,
    cz,
  );
  return flags;
}
