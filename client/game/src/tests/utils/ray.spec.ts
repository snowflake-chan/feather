import { expect, test } from '@jest/globals';
import { raySphere } from 'src/engine/utils/ray-sphere';

test('ray-sphere', () => {
  // shoot a grid of rays
  function rayMarchSphere(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    cx: number,
    cy: number,
    cz: number,
    r: number,
    dt: number,
    steps: number,
  ) {
    for (let i = 0, d = 0; i < steps; ++i, d += dt) {
      const px = ox + d * dx;
      const py = oy + d * dy;
      const pz = oz + d * dz;
      if (
        Math.pow(px - cx, 2) + Math.pow(py - cy, 2) + Math.pow(pz - cz, 2) <
        Math.pow(r, 2)
      ) {
        return d;
      }
    }
    return Infinity;
  }

  function testRayBruteForce(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    cx: number,
    cy: number,
    cz: number,
    r: number,
    dt: number,
    steps: number,
  ) {
    const actual = raySphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, r);
    const marched = rayMarchSphere(
      ox,
      oy,
      oz,
      dx,
      dy,
      dz,
      cx,
      cy,
      cz,
      r,
      dt,
      steps,
    );

    if (actual < Infinity) {
      // test if hit point is on sphere
      const px = ox + dx * actual;
      const py = oy + dy * actual;
      const pz = oz + dz * actual;

      const d2 =
        Math.pow(px - cx, 2) + Math.pow(py - cy, 2) + Math.pow(cz - pz, 2);
      const r2 = Math.pow(r, 2);
      expect(d2 <= r2 + 0.001).toBeTruthy();
    }

    if (Math.abs(actual - marched) < 2 * dt) {
      return;
    }
    if (marched < Infinity) {
      expect(actual).toBe(marched);
      return;
    } else if (actual >= Infinity) {
      return;
    }
  }

  // shoot 100 random rays
  for (let i = 0; i < 500; ++i) {
    const ox = 2 * Math.random() - 1;
    const oy = 2 * Math.random() - 1;
    const oz = 2 * Math.random() - 1;

    const dx = 2 * Math.random() - 1;
    const dy = 2 * Math.random() - 1;
    const dz = 2 * Math.random() - 1;

    const cx = 0.1;
    const cy = 0.3;
    const cz = -0.5;

    const r = 0.5;

    testRayBruteForce(ox, oy, oz, dx, dy, dz, cx, cy, cz, r, 0.1, 30);
  }
});
