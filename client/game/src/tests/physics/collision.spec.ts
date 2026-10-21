import { expect, test } from '@jest/globals';
import {
  boxRayIntersect,
  sweepSweepIntersect,
  boxSweepIntersect,
} from '@box/schema/physics/box-collide';
import { vec3 } from 'gl-matrix';

const TOLERANCE = 4096;

test('box-ray intersect', function () {
  function testBox({
    lo,
    hi,
    d,
    o,
    hit,
    ...info
  }: {
    lo: number[];
    hi: number[];
    d: number[];
    o: number[];
    hit: boolean;
    axis?: number;
    t?: number;
  }) {
    const x = boxRayIntersect(
      lo[0],
      lo[1],
      lo[2],
      hi[0],
      hi[1],
      hi[2],
      d[0],
      d[1],
      d[2],
      o[0],
      o[1],
      o[2],
    );
    if (hit) {
      expect(x.collides).toBeTruthy();
      expect(x.axis).toBe(info.axis);
      expect(x.t).toEqual(info.t);
    } else {
      expect(x.collides).toBeFalsy();
      expect(x.axis).toBe(-1);
      expect(x.t).toBe(0);
    }
  }

  testBox({
    lo: [0, 0, 0],
    hi: [1, 1, 1],
    d: [1, 0, 0],
    o: [-1, 0.5, 0.5],
    hit: true,
    axis: 0,
    t: 1,
  });

  testBox({
    lo: [0, 0, 0],
    hi: [1, 1, 1],
    d: [0, 1, 0],
    o: [0.5, -1, 0.5],
    hit: true,
    axis: 1,
    t: 1,
  });

  testBox({
    lo: [0, 0, 0],
    hi: [1, 1, 1],
    d: [0, 0, 1],
    o: [0.5, 0.5, -1],
    hit: true,
    axis: 2,
    t: 1,
  });

  testBox({
    lo: [0, 0, 0],
    hi: [1, 1, 1],
    d: [1, 0, 0],
    o: [0.5, 0.5, 0.5],
    hit: true,
    axis: -1,
    t: 0,
  });

  testBox({
    lo: [0, 0, 0],
    hi: [1, 1, 1],
    d: [1, 0, 0],
    o: [0.5, -1, 0.5],
    hit: false,
  });

  testBox({
    lo: [0, 0, 0],
    hi: [1, 1, 1],
    d: [1, 1, 1],
    o: [-1, -0.5, -0.5],
    hit: true,
    axis: 0,
    t: 1,
  });

  function testRay({ lo, hi, o, d }: { lo: vec3; hi: vec3; o: vec3; d: vec3 }) {
    const hit = boxRayIntersect(
      lo[0],
      lo[1],
      lo[2],
      hi[0],
      hi[1],
      hi[2],
      d[0],
      d[1],
      d[2],
      o[0],
      o[1],
      o[2],
    );

    if (hit.collides) {
      if (
        o[0] < lo[0] ||
        o[0] > hi[0] ||
        o[1] < lo[1] ||
        o[1] > hi[1] ||
        o[2] < lo[2] ||
        o[2] > hi[2]
      ) {
        const p = vec3.scaleAndAdd(vec3.create(), o, d, hit.t);
        expect(
          Math.min(
            Math.abs(p[hit.axis] - lo[hit.axis]),
            Math.abs(p[hit.axis] - hi[hit.axis]),
          ),
        ).toEqual(0);
      } else {
        expect(hit.t).toBe(0);
        expect(hit.axis).toBe(-1);
      }
    } else {
      for (let j = 0; j < 10; ++j) {
        const p = vec3.scaleAndAdd(vec3.create(), o, d, j);
        expect(
          p[0] < lo[0] ||
            p[0] > hi[0] ||
            p[1] < lo[1] ||
            p[1] > hi[1] ||
            p[2] < lo[2] ||
            p[2] > hi[2],
        ).toBeTruthy();
      }
    }
  }

  for (let i = 0; i < 1000; ++i) {
    const lo = vec3.fromValues(Math.random(), Math.random(), Math.random());
    vec3.scale(lo, lo, 10);
    const hi = vec3.fromValues(Math.random(), Math.random(), Math.random());
    vec3.scaleAndAdd(hi, lo, hi, 20);

    const o = vec3.fromValues(Math.random(), Math.random(), Math.random());
    vec3.scale(o, o, 10);
    const d = vec3.random(vec3.create());

    testRay({ lo, hi, o, d });
  }
});

function testBoxBox(ax: vec3, ar: vec3, bx: vec3, br: vec3) {
  return (
    Math.abs(ax[0] - bx[0]) <= ar[0] + br[0] + 1 / 256 &&
    Math.abs(ax[1] - bx[1]) <= ar[1] + br[1] + 1 / 256 &&
    Math.abs(ax[2] - bx[2]) <= ar[2] + br[2] + 1 / 256
  );
}

function looserEquals(a, b, msg) {
  expect(Math.abs(a - b) < 1 / 1024).toBeTruthy();
}

test('sweep-sweep intersect', function () {
  function testSweep({
    a0,
    a1,
    ar,
    b0,
    b1,
    br,
  }: {
    a0: vec3;
    a1: vec3;
    ar: vec3;
    b0: vec3;
    b1: vec3;
    br: vec3;
  }) {
    const x = sweepSweepIntersect(
      a0[0],
      a0[1],
      a0[2],
      a1[0],
      a1[1],
      a1[2],
      ar[0],
      ar[1],
      ar[2],
      b0[0],
      b0[1],
      b0[2],
      b1[0],
      b1[1],
      b1[2],
      br[0],
      br[1],
      br[2],
    );
    if (x.collides) {
      const axis = x.axis;
      if (testBoxBox(<vec3>a0, <vec3>ar, <vec3>b0, <vec3>br)) {
        expect(x.t).toBe(0);
      } else {
        expect(0 < x.t && x.t <= 1).toBeTruthy();

        const ap = vec3.lerp(vec3.create(), a0, a1, x.t);
        const bp = vec3.lerp(vec3.create(), b0, b1, x.t);

        if (!x.flip) {
          looserEquals(
            ap[axis] + ar[axis],
            bp[axis] - br[axis],
            'hit ok - flip: ' + x.t,
          );
        } else {
          looserEquals(
            ap[axis] - ar[axis],
            bp[axis] + br[axis],
            'hit ok - no flip',
          );
        }
      }
      looserEquals(
        x.depth,
        ar[axis] + br[axis] - Math.abs(a0[axis] - b0[axis]),
        'depth ok',
      );
    } else {
      for (let i = 0; i < 10; ++i) {
        const ap = vec3.lerp(vec3.create(), a0, a1, i / 10);
        const bp = vec3.lerp(vec3.create(), b0, b1, i / 10);
        expect(testBoxBox(ap, <any>ar, bp, <any>br)).toBeFalsy();
      }
    }
  }

  function testCollideAxis(axis: number) {
    const p0 = vec3.fromValues(
      100 * Math.random(),
      100 * Math.random(),
      100 * Math.random(),
    );
    const p1 = vec3.fromValues(
      100 * Math.random(),
      100 * Math.random(),
      100 * Math.random(),
    );
    p0[axis] *= -1;
    const ar = vec3.fromValues(
      10 * Math.random(),
      10 * Math.random(),
      10 * Math.random(),
    );
    const br = vec3.fromValues(
      10 * Math.random(),
      10 * Math.random(),
      10 * Math.random(),
    );

    testSweep({
      a0: p0,
      a1: p1,
      ar,
      b0: p1,
      b1: p0,
      br,
    });
  }

  for (let i = 0; i < 200; ++i) {
    testCollideAxis(0);
    testCollideAxis(1);
    testCollideAxis(2);
  }

  for (let i = 0; i < 1000; ++i) {
    testSweep({
      a0: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      a1: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      ar: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      b0: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      b1: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      br: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
    });
  }
});

function testSweepBox(
  x: vec3 | number[],
  r: vec3 | number[],
  l: vec3 | number[],
  h: vec3 | number[],
) {
  for (let i = 0; i < 3; ++i) {
    const alo = x[i] - r[i];
    const ahi = x[i] + r[i];
    const blo = l[i];
    const bhi = h[i];

    if (alo > bhi || ahi < blo) {
      return false;
    }
  }
  return true;
}

test('box-sweep intersect', function () {
  function testSweep({
    a0,
    a1,
    ar,
    l,
    h,
    ...info
  }: {
    a0: vec3;
    a1: vec3;
    ar: vec3;
    l: vec3;
    h: vec3;
  }) {
    const x = boxSweepIntersect(
      a0[0],
      a0[1],
      a0[2],
      a1[0],
      a1[1],
      a1[2],
      ar[0],
      ar[1],
      ar[2],
      l[0],
      l[1],
      l[2],
      h[0],
      h[1],
      h[2],
      0xff,
    );
    if (x.collides) {
      const axis = x.axis;
      if (testSweepBox(<any>a0, <any>ar, l, h)) {
        expect(x.t).toBe(0);
      } else {
        expect(0 <= x.t && x.t <= 1).toBeTruthy();

        const ap = vec3.lerp(vec3.create(), a0, a1, x.t);

        if (!x.flip) {
          looserEquals(ap[axis] - ar[axis], h[axis], 'hit ok - no flip');
        } else {
          looserEquals(ap[axis] + ar[axis], l[axis], 'hit ok - flip');
        }
      }
    } else {
      for (let i = 0; i < 10; ++i) {
        const ap = vec3.lerp(vec3.create(), a0, a1, i / 10);
        expect(testSweepBox(ap, ar, l, h)).toBeFalsy();
      }
    }
  }

  testSweep({
    a0: [2.4903905391693115, 8.867325782775879, 1.093316674232483],
    a1: [9.2584810256958, 7.300598621368408, 6.4381256103515625],
    ar: [8.346336364746094, 4.492673873901367, 4.283938407897949],
    l: [2.742072820663452, 2.798696994781494, 3.5783815383911133],
    h: [12.032404899597168, 3.570998430252075, 10.691427230834961],
  });

  for (let i = 0; i < 1000; ++i) {
    const l = vec3.fromValues(
      10 * Math.random(),
      10 * Math.random(),
      10 * Math.random(),
    );
    testSweep({
      a0: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      a1: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      ar: vec3.fromValues(
        10 * Math.random(),
        10 * Math.random(),
        10 * Math.random(),
      ),
      l,
      h: vec3.add(
        vec3.create(),
        l,
        vec3.fromValues(
          10 * Math.random(),
          10 * Math.random(),
          10 * Math.random(),
        ),
      ),
    });
  }
});
