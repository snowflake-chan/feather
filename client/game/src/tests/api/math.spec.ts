import { expect, test } from '@jest/globals';

import {
  GameBounds3,
  GameQuaternion,
  GameRGBAColor,
  GameRGBColor,
  GameVector3,
} from '@box/schema/api/js/math';

function approxEqual(a, b) {
  return Math.abs(a - b) < 0.0000001;
}

function wxyzApproxEq(a, b) {
  return approxEqual(a.w, b.w) && xyzApproxEq(a, b);
}

function xyzApproxEq(a, b) {
  return (
    approxEqual(a.x, b.x) && approxEqual(a.y, b.y) && approxEqual(a.z, b.z)
  );
}

function rgbApproxEq(a, b) {
  // console.log(a, b);
  return (
    approxEqual(a.r, b.r) && approxEqual(a.g, b.g) && approxEqual(a.b, b.b)
  );
}

function rgbaApproxEq(a, b) {
  // console.log(a, b);
  return rgbApproxEq(a, b) && approxEqual(a.a, b.a);
}

test('approxEq test', function () {
  expect(approxEqual(0.99999999, 1)).toBeTruthy();
  expect(approxEqual(0.9999, 1)).toBeFalsy();

  expect(
    xyzApproxEq({ x: 1, y: 1, z: 1 }, { x: 0.999999999, y: 1.000000001, z: 1 }),
  ).toBeTruthy();
  expect(
    xyzApproxEq({ x: 1, y: 1, z: 1 }, { x: 0.9999, y: 1.000000001, z: 1 }),
  ).toBeFalsy();

  expect(
    wxyzApproxEq(
      { w: 1, x: 1, y: 1, z: 1 },
      { w: 1, x: 0.999999999, y: 1.000000001, z: 1 },
    ),
  ).toBeTruthy();
  expect(
    wxyzApproxEq(
      { w: 1, x: 1, y: 1, z: 1 },
      { w: 1, x: 0.9999, y: 1.000000001, z: 1 },
    ),
  ).toBeFalsy();

  expect(
    rgbApproxEq({ r: 1, g: 1, b: 1 }, { r: 0.999999999, g: 1.000000001, b: 1 }),
  ).toBeTruthy();
  expect(
    rgbApproxEq({ r: 1, g: 1, b: 1 }, { r: 0.9999, g: 1.000000001, b: 1 }),
  ).toBeFalsy();

  expect(
    rgbApproxEq(
      { r: 1, g: 1, b: 1, a: 1 },
      { r: 0.999999999, g: 1.000000001, b: 1, a: 1 },
    ),
  ).toBeTruthy();
  expect(
    rgbApproxEq(
      { r: 1, g: 1, b: 1, a: 1 },
      { r: 0.9999, g: 1.000000001, b: 1, a: 1 },
    ),
  ).toBeFalsy();
});

test('vector3 test', function () {
  const a = new GameVector3(11, 23, 37);
  const b = new GameVector3(2, 3, 7);

  expect(a.distance(b)).toBe(37.16180835212409);
  expect(a.lerp(b, 0.5)).toEqual(new GameVector3(6.5, 13, 22));
  expect(a.add(b)).toEqual(new GameVector3(13, 26, 44));
  expect(a.sub(b)).toEqual(new GameVector3(9, 20, 30));
  expect(a.mul(b)).toEqual(new GameVector3(22, 69, 259));
  expect(a.div(b)).toEqual(new GameVector3(11 / 2, 23 / 3, 37 / 7));
  expect(a.div(new GameVector3(0, 0, 0))).toEqual(new GameVector3(0, 0, 0));
  expect(a.towards(b)).toEqual(new GameVector3(-9, -20, -30));
  expect(a.clone()).toEqual(new GameVector3(11, 23, 37));
  expect(new GameVector3(3, 4, 5).mag()).toBe(Math.sqrt(50));
  expect(new GameVector3(3, 4, 5).sqrMag()).toBe(50);
  expect(new GameVector3(3, 4, 5).toString()).toBe('{ x:3, y:4, z:5 }');

  const n = new GameVector3(11, 23, 37).normalize();
  expect(approxEqual(n.x * n.x + n.y * n.y + n.z * n.z, 1)).toBeTruthy();

  let c: GameVector3;
  c = new GameVector3(11, 23, 37);
  c.addEq(b);
  expect(c).toEqual(new GameVector3(13, 26, 44));

  c = new GameVector3(11, 23, 37);
  c.subEq(b);
  expect(c).toEqual(new GameVector3(9, 20, 30));

  c = new GameVector3(11, 23, 37);
  c.mulEq(b);
  expect(c).toEqual(new GameVector3(22, 69, 259));

  c = new GameVector3(11, 23, 37);
  c.divEq(b);
  expect(c).toEqual(new GameVector3(11 / 2, 23 / 3, 37 / 7));

  c = new GameVector3(11, 23, 37);
  c.divEq(new GameVector3(0, 0, 0));
  expect(c).toEqual(new GameVector3(0, 0, 0));

  c = new GameVector3(11, 23, 37);
  c.copy(b);
  expect(c).toEqual(new GameVector3(2, 3, 7));

  c = new GameVector3(11, 23, 37);
  c.set(2, 3, 7);
  expect(c).toEqual(new GameVector3(2, 3, 7));

  expect(a.dot(b)).toBe(350);
  expect(new GameVector3(0, 0, 2).cross(new GameVector3(2, 0, 0))).toEqual(
    new GameVector3(0, 4, 0),
  );
  expect(new GameVector3(0, 2, 0).cross(new GameVector3(0, 0, 2))).toEqual(
    new GameVector3(4, 0, 0),
  );
  expect(new GameVector3(2, 0, 0).cross(new GameVector3(0, 2, 0))).toEqual(
    new GameVector3(0, 0, 4),
  );

  expect(a.scale(2)).toEqual(new GameVector3(22, 46, 74));

  expect(
    approxEqual(
      new GameVector3(1, 0, 1).angle(new GameVector3(0, 0, 1)),
      Math.PI / 4,
    ),
  ).toBeTruthy();
  expect(
    approxEqual(
      new GameVector3(0, 1, 1).angle(new GameVector3(0, 0, 1)),
      Math.PI / 4,
    ),
  ).toBeTruthy();
  expect(
    approxEqual(
      new GameVector3(0, 3, 3).angle(new GameVector3(0, 0, 2)),
      Math.PI / 4,
    ),
  ).toBeTruthy();
  expect(new GameVector3(1, 1, 1).angle(new GameVector3(1, 1, 1))).toBe(0);
  expect(new GameVector3(1, 1, 1).angle(new GameVector3(-1, -1, -1))).toBe(
    Math.PI,
  );

  expect(new GameVector3(7, 3, 13).max(new GameVector3(2, 23, 17))).toEqual(
    new GameVector3(7, 23, 17),
  );
  expect(new GameVector3(7, 3, 13).min(new GameVector3(2, 23, 17))).toEqual(
    new GameVector3(2, 3, 13),
  );

  expect(
    new GameVector3(2, 3, 13).exactEquals(new GameVector3(2, 3, 13)),
  ).toBeTruthy();
  expect(
    new GameVector3(2, 3, 13).exactEquals(new GameVector3(1, 3, 13)),
  ).toBeFalsy();
  expect(
    new GameVector3(2, 3, 13).equals(new GameVector3(2.00000001, 3, 13)),
  ).toBeTruthy();
  expect(
    new GameVector3(2, 3, 13).equals(new GameVector3(2.0001, 3, 13)),
  ).toBeFalsy();

  expect(
    xyzApproxEq(
      GameVector3.fromPolar(2, Math.PI / 4, Math.PI / 4),
      new GameVector3(1, Math.sqrt(2), 1),
    ),
  ).toBeTruthy();
});

test('Bounds3 test', function () {
  const p1 = new GameVector3(6, 6, 6);
  const p2 = new GameVector3(4.5, 4.5, 4.5);
  const p3 = new GameVector3(3, 3, 3);

  const a = new GameBounds3(new GameVector3(2, 2, 2), new GameVector3(4, 4, 4));
  const b = new GameBounds3(new GameVector3(1, 1, 1), new GameVector3(5, 5, 5));
  const c = new GameBounds3(new GameVector3(3, 3, 3), new GameVector3(6, 6, 6));
  const d = new GameBounds3(
    new GameVector3(5.5, 5.5, 5.5),
    new GameVector3(8, 8, 8),
  );

  expect(b.contains(p2)).toBeTruthy();
  expect(b.contains(p3)).toBeTruthy();
  expect(a.contains(p3)).toBeTruthy();

  expect(b.contains(p1)).toBeFalsy();
  expect(a.contains(p1)).toBeFalsy();
  expect(a.contains(p2)).toBeFalsy();

  expect(b.containsBounds(a)).toBeTruthy();
  expect(a.containsBounds(b)).toBeFalsy();
  expect(c.containsBounds(a)).toBeFalsy();
  expect(c.containsBounds(b)).toBeFalsy();
  expect(a.containsBounds(c)).toBeFalsy();
  expect(b.containsBounds(c)).toBeFalsy();

  expect(c.intersects(a)).toBeTruthy();
  expect(c.intersects(b)).toBeTruthy();
  expect(c.intersects(d)).toBeTruthy();
  expect(d.intersects(b)).toBeFalsy();
  expect(d.intersects(a)).toBeFalsy();

  const h = new GameBounds3(new GameVector3(2, 2, 2), new GameVector3(4, 4, 4));
  h.set(1, 1, 1, 3, 3, 3);
  expect(h).toEqual({ lo: { x: 1, y: 1, z: 1 }, hi: { x: 3, y: 3, z: 3 } });

  const i = new GameBounds3(new GameVector3(2, 2, 2), new GameVector3(4, 4, 4));
  i.copy(a);
  expect(i).toEqual({ lo: { x: 2, y: 2, z: 2 }, hi: { x: 4, y: 4, z: 4 } });

  expect(a.toString()).toBe('{ lo:{ x:2, y:2, z:2 }, hi:{ x:4, y:4, z:4 } }');
});

test('RGB test', function () {
  const rnd = GameRGBColor.random();
  expect(0 <= rnd.r && rnd.r < 1).toBeTruthy();
  expect(0 <= rnd.g && rnd.g < 1).toBeTruthy();
  expect(0 <= rnd.b && rnd.b < 1).toBeTruthy();

  const a = new GameRGBColor(0.5, 0.6, 0.7);
  const b = new GameRGBColor(0.1, 0.2, 0.3);

  expect(rgbApproxEq(a.add(b), new GameRGBColor(0.6, 0.8, 1))).toBeTruthy();
  expect(rgbApproxEq(a.sub(b), new GameRGBColor(0.4, 0.4, 0.4))).toBeTruthy();
  expect(
    rgbApproxEq(a.mul(b), new GameRGBColor(0.05, 0.12, 0.21)),
  ).toBeTruthy();
  expect(rgbApproxEq(a.div(b), new GameRGBColor(5, 3, 7 / 3))).toBeTruthy();
  expect(
    rgbApproxEq(a.div(new GameRGBColor(0, 0, 0)), new GameRGBColor(0, 0, 0)),
  ).toBeTruthy();
  expect(a.clone()).toEqual(new GameRGBColor(0.5, 0.6, 0.7));
  expect(a.toString()).toBe('{ r:0.5, g:0.6, b:0.7 }');
  expect(a.toRGBA()).toEqual(new GameRGBAColor(0.5, 0.6, 0.7, 1));

  let c: GameRGBColor;
  c = new GameRGBColor(0.5, 0.6, 0.7);
  c.addEq(b);
  expect(rgbApproxEq(c, new GameRGBColor(0.6, 0.8, 1))).toBeTruthy();

  c = new GameRGBColor(0.5, 0.6, 0.7);
  c.subEq(b);
  expect(rgbApproxEq(c, new GameRGBColor(0.4, 0.4, 0.4))).toBeTruthy();

  c = new GameRGBColor(0.5, 0.6, 0.7);
  c.mulEq(b);
  expect(rgbApproxEq(c, new GameRGBColor(0.05, 0.12, 0.21))).toBeTruthy();

  c = new GameRGBColor(0.5, 0.6, 0.7);
  c.divEq(b);
  expect(rgbApproxEq(c, new GameRGBColor(5, 3, 7 / 3))).toBeTruthy();

  c = new GameRGBColor(0.5, 0.6, 0.7);
  c.divEq(new GameRGBColor(0, 0, 0));
  expect(rgbApproxEq(c, new GameRGBColor(0, 0, 0))).toBeTruthy();

  c = new GameRGBColor(0.5, 0.6, 0.7);
  c.copy(b);
  expect(c).toEqual(new GameRGBColor(0.1, 0.2, 0.3));

  c = new GameRGBColor(0.5, 0.6, 0.7);
  c.set(0.1, 0.2, 0.3);
  expect(c).toEqual(new GameRGBColor(0.1, 0.2, 0.3));

  expect(a.lerp(b, 0.5)).toEqual(new GameRGBColor(0.3, 0.4, 0.5));

  expect(
    new GameRGBColor(0.5, 0.2, 0.7).equals(
      new GameRGBColor(0.50000001, 0.2, 0.7),
    ),
  ).toBeTruthy();
  expect(
    new GameRGBColor(0.5, 0.2, 0.7).equals(new GameRGBColor(0.4998, 0.2, 0.7)),
  ).toBeFalsy();
});

test('RGBA test', function () {
  const a = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  const b = new GameRGBAColor(0.1, 0.2, 0.3, 0.5);

  expect(
    rgbaApproxEq(a.add(b), new GameRGBAColor(0.6, 0.8, 1, 1)),
  ).toBeTruthy();
  expect(
    rgbaApproxEq(a.sub(b), new GameRGBAColor(0.4, 0.4, 0.4, 0)),
  ).toBeTruthy();
  expect(
    rgbaApproxEq(a.mul(b), new GameRGBAColor(0.05, 0.12, 0.21, 0.25)),
  ).toBeTruthy();
  expect(
    rgbaApproxEq(a.div(b), new GameRGBAColor(5, 3, 7 / 3, 1)),
  ).toBeTruthy();
  expect(
    rgbaApproxEq(
      a.div(new GameRGBAColor(0, 0, 0, 0)),
      new GameRGBAColor(0, 0, 0, 0),
    ),
  ).toBeTruthy();
  expect(a.clone()).toEqual(new GameRGBAColor(0.5, 0.6, 0.7, 0.5));
  expect(a.blendEq(new GameRGBColor(0.1, 0.2, 0.3))).toEqual(
    new GameRGBColor(0.3, 0.4, 0.5),
  );

  expect(a.toString()).toBe('{ r:0.5, g:0.6, b:0.7, a:0.5 }');

  let c: GameRGBAColor;
  c = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  c.addEq(b);
  expect(rgbaApproxEq(c, new GameRGBAColor(0.6, 0.8, 1, 1))).toBeTruthy();

  c = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  c.subEq(b);
  expect(rgbaApproxEq(c, new GameRGBAColor(0.4, 0.4, 0.4, 0))).toBeTruthy();

  c = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  c.mulEq(b);
  expect(
    rgbaApproxEq(c, new GameRGBAColor(0.05, 0.12, 0.21, 0.25)),
  ).toBeTruthy();

  c = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  c.divEq(b);
  expect(rgbaApproxEq(c, new GameRGBAColor(5, 3, 7 / 3, 1))).toBeTruthy();

  c = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  c.divEq(new GameRGBAColor(0, 0, 0, 0));
  expect(rgbaApproxEq(c, new GameRGBAColor(0, 0, 0, 0))).toBeTruthy();

  c = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  c.copy(b);
  expect(c).toEqual(new GameRGBAColor(0.1, 0.2, 0.3, 0.5));

  c = new GameRGBAColor(0.5, 0.6, 0.7, 0.5);
  c.set(0.1, 0.2, 0.3, 0.5);
  expect(c).toEqual(new GameRGBAColor(0.1, 0.2, 0.3, 0.5));

  expect(a.lerp(b, 0.5)).toEqual(new GameRGBAColor(0.3, 0.4, 0.5, 0.5));

  expect(
    new GameRGBAColor(0.5, 0.2, 0.7, 0.5).equals(
      new GameRGBAColor(0.50000001, 0.2, 0.7, 0.5),
    ),
  ).toBeTruthy();
  expect(
    new GameRGBAColor(0.5, 0.2, 0.7, 0.5).equals(
      new GameRGBAColor(0.4998, 0.2, 0.7, 0.5),
    ),
  ).toBeFalsy();
});
