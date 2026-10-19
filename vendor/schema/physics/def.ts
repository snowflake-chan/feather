export const MAX_BODIES = 3500;
export const MAX_VELOCITY = 128;
export const VELOCITY_CUTOFF = 1 / 256;
export const MIN_MASS = 1 / 16;
export const MAX_MASS = 256;
export const CONTACT_BLOCK_SIZE = 1024;
export const MIN_RADIUS = 1 / 256;
export const MAX_RADIUS = 256;
export const ACTIVE_ITER_COUNT = 2;
export const FRICTION_CUTOFF = 1 / 1024;
export const CONTACT_CUTOFF = 1 / 1024;
export const VOXEL_EPSILON = 1 / 256;

export function combineFriction(mu0: number, mu1: number) {
  return mu0 * mu1;
}

export function combineRestitution(r0: number, r1: number) {
  return r0 * r1;
}

export function calcQuatByVelocity(
  out: [number, number, number, number],
  ax: number,
  ay: number,
  az: number,
  dt: number,
) {
  const qw = out[3],
    qx = out[0],
    qy = out[1],
    qz = out[2];
  dt *= 0.5;
  out[0] += dt * (ax * qw + ay * qz - az * qy);
  out[1] += dt * (ay * qw + az * qx - ax * qz);
  out[2] += dt * (az * qw + ax * qy - ay * qx);
  out[3] += dt * (-ax * qx - ay * qy - az * qz);

  const x = out[0];
  const y = out[1];
  const z = out[2];
  const w = out[3];
  let len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
}

export function clampVelocityAndSleep(v: number) {
  if (Math.abs(v) < VELOCITY_CUTOFF) {
    return 0;
  }
  return Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, v));
}
