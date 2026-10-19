import { vec2, vec3, mat3 } from 'gl-matrix';

const abs = Math.abs;
const max = Math.max;
const min = Math.min;
const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;
const pow = Math.pow;
const exp = Math.exp;
const log = Math.log;

const PI = 3.14159265359;
const PI2 = 6.28318530718;
export const DEG_TO_RAD = PI / 180.0;

function clamp(a, J, L) {
  if (J > L) {
    const t = J;
    J = L;
    L = t;
  }
  return min(max(a, J), L);
}

function sign(n: number) {
  return n < 0 ? -1 : n > 0 ? 1 : 0;
}

function mix(x: number, y: number, a: number) {
  a = max(0, a);
  a = min(1, a);
  return x * (1 - a) + y * a;
}
// primitive functions
// these all return the distance to the surface from a given point
function sminp(a: number, b: number, k: number) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
/***********************************************/
function smine(a: number, b: number, k: number) {
  const res = exp(-k * a) + exp(-k * b);
  return -log(res) / k;
}

export function length2(p: number[] | vec2): number {
  return sqrt(p[0] * p[0] + p[1] * p[1]);
}

export function length6(p: number[] | vec2): number {
  p = [p[0] * p[0] * p[0], p[1] * p[1] * p[1]];
  p = [p[0] * p[0], p[1] * p[1]];
  return pow(p[0] + p[1], 1.0 / 6.0);
}

export function length8(p: number[] | vec2): number {
  p = [p[0] * p[0], p[1] * p[1]];
  p = [p[0] * p[0], p[1] * p[1]];
  p = [p[0] * p[0], p[1] * p[1]];
  return pow(p[0] + p[1], 1.0 / 8.0);
}

function rotateX(p: vec3, a: number): vec3 {
  const sa = sin(a);
  const ca = cos(a);
  const r: vec3 = [0, 0, 0];
  r[0] = p[0];
  r[1] = ca * p[1] - sa * p[2];
  r[2] = sa * p[1] + ca * p[2];
  return r;
}

export function rotateY(p: vec3, a: number): vec3 {
  const sa = sin(a);
  const ca = cos(a);
  const r: vec3 = [0, 0, 0];
  r[0] = ca * p[0] + sa * p[2];
  r[1] = p[1];
  r[2] = -sa * p[0] + ca * p[2];
  return r;
}

export function sdBox(p: vec3, b: vec3): number {
  const d: vec3 = [abs(p[0]) - b[0], abs(p[1]) - b[1], abs(p[2]) - b[2]];
  return (
    min(max(d[0], max(d[1], d[2])), 0) +
    vec3.len([max(d[0], 0), max(d[1], 0), max(d[2], 0)])
  );
}

export function sdRoundBox(p: vec3, b: vec3, r: number): number {
  const q: vec3 = [abs(p[0]) - b[0], abs(p[1]) - b[1], abs(p[2]) - b[2]];
  return (
    min(max(q[0], max(q[1], q[2])), 0) +
    vec3.len([max(q[0], 0), max(q[1], 0), max(q[2], 0)]) -
    r
  );
}

export function sdSphere(p: vec3, r: number): number {
  return vec3.len(p) - r;
}

export function sdCone(p: vec3, c: vec3): number {
  const q: vec2 = [vec2.len([p[0], p[2]]), p[1]];
  const d1 = -q[1] - c[2];
  const d2 = max(vec2.dot(q, [c[0], c[1]]), q[1]);
  return vec2.len([max(d1, 0), max(d2, 0)]) + min(max(d1, d2), 0);
}

export function sdEllipsoid(p: vec3, r: vec3): number {
  const k0 = vec3.len([p[0] / r[0], p[1] / r[1], p[2] / r[2]]);
  const k1 = vec3.len([
    p[0] / (r[0] * r[0]),
    p[1] / (r[1] * r[1]),
    p[2] / (r[2] * r[2]),
  ]);
  return (k0 * (k0 - 1.0)) / k1;
}

export function sdTorus(p: vec3, t: number[] | vec2): number {
  const q: vec2 = [vec2.len([p[0], p[2]]) - t[0], p[1]];
  return vec2.len(q) - t[1];
}

export function sdTorus82(p: vec3, t: number[] | vec2) {
  const q = [length2([p[0], p[2]]) - t[0], p[1]];
  return length8(q) - t[1];
}

export function sdTorus88(p: vec3, t: number[] | vec2) {
  const q = [length8([p[0], p[2]]) - t[0], p[1]];
  return length8(q) - t[1];
}

// h = { cos a, sin a, height }
export function sdPryamid4(p: vec3, h: vec3): number {
  // Tetrahedron = Octahedron - Cube
  const box = sdBox(
    [p[0], p[1] + 2 * h[2], p[2]],
    [2 * h[2], 2 * h[2], 2 * h[2]],
  );
  let d = 0;
  d = max(d, abs(vec3.dot(p, [-h[0], h[1], 0])));
  d = max(d, abs(vec3.dot(p, [h[0], h[1], 0])));
  d = max(d, abs(vec3.dot(p, [0, h[1], h[0]])));
  d = max(d, abs(vec3.dot(p, [0, h[1], -h[0]])));
  const octa = d - h[2];
  // return octa;

  return max(-box, octa);
}

export function sdHexPrism_2(p: vec3, h: vec2 | number[]) {
  const k: vec3 = [-0.8660254, 0.5, 0.57735];
  p = [abs(p[0]), abs(p[1]), abs(p[2])];
  p[0] -= 2 * min(vec2.dot([k[0], k[1]], [p[0], p[1]]), 0) * k[0];
  p[1] -= 2 * min(vec2.dot([k[0], k[1]], [p[0], p[1]]), 0) * k[1];
  const d = [
    vec2.len(
      vec2.sub(
        vec2.create(),
        [p[0], p[1]],
        [clamp(p[0], -k[2] * h[0], k[2] * h[0]), h[0]],
      ),
    ) * sign(p[1] - h[0]),
    p[2] - h[1],
  ];
  return min(max(d[0], d[1]), 0) + vec2.len([max(d[0], 0), max(d[1], 0)]);
}

export function sdHexPrism(p: vec3, h: vec2 | number[]) {
  const q = [abs(p[0]), abs(p[1]), abs(p[2])];
  return max(q[2] - h[1], max(q[0] * 0.866025 + q[1] * 0.5, q[1]) - h[0]);
}

export function sdTriPrism(p: vec3, h: vec2 | number[]) {
  const q = [abs(p[0]), abs(p[1]), abs(p[2])];
  return max(
    q[2] - h[1],
    max(q[0] * 0.866025 + p[1] * 0.5, -p[1]) - h[0] * 0.5,
  );
}

// h : [radius, tall]
export function sdCylinder(p: vec3, h: number[] | vec2) {
  const d = [vec2.len([p[0], p[2]]) - h[0], abs(p[1]) - h[1]];
  return min(max(d[0], d[1]), 0.0) + vec2.len([max(d[0], 0), max(d[1], 0)]);
}

export function skull(p: vec3) {
  const q: vec3 = [p[0], p[1], p[2]];
  p[1] += sin(p[1] * 1.6) * 0.2;
  p[2] -= p[0] * 0.05;
  const e = sdTorus(rotateX([p[0] - 0.4, p[1], p[2]], 3.14 / 2.0), [0.3, 0.1]); //eye
  p[2] = q[2];
  p[2] += p[0] * 0.05;
  const f = sdTorus(rotateX([p[0] + 0.4, p[1], p[2]], 3.14 / 2.0), [0.3, 0.1]); //eye
  p[0] += sin(p[0]);
  const n = sdTorus([p[0], p[1] + 0.45, p[2] + 0.19], [0.2, 0.05]); //nose
  p[0] = q[0];
  p[1] = q[1];
  p[2] = q[2];
  p[0] += sin(p[0] * 0.07);
  p[0] *= cos(p[1] * 0.6 + abs(cos(3.7 + p[1]) * 0.2) * 1.1);
  let s = vec3.length([p[0], p[1] - 0.14, p[2] - 0.79]) - 0.98; //back
  p[0] = q[0];
  p[1] = q[1];
  p[2] = q[2];
  p[1] += sin(p[1] * 1.7) * 0.3;
  let d = vec3.length([p[0] - 0.4, p[1], p[2] + 0.1]) - 0.25; //eyehole
  s = max(s, -d);
  d = vec3.length([p[0] + 0.4, p[1], p[2] + 0.1]) - 0.25; //eyehole
  s = max(s, -d);
  p[0] = q[0];
  p[1] = q[1];
  p[2] = q[2];
  p[2] += p[2] - p[1] * 0.4;
  const v = sdRoundBox(
    [p[0], p[1] + 0.68, p[2] - 0.7],
    [0.02, 0.07, 0.8],
    0.27,
  ); //chin
  let o = sminp(e, f, 0.5);
  o = smine(o, n, 14.0);
  o = sminp(o, s, 0.09);
  return smine(o, v, 12.0);
}

export function heart(p: vec3) {
  const q: vec3 = [p[0], p[1], p[2]];
  let res = [q[1], 2.0];
  const r = 15.0;
  q[1] -= r;
  q[0] *= 1.0 - 0.2 * 1.0;
  q[1] *= 1.0 - 0.2 * 0.5;
  q[2] *= 1.0 - 0.2 * 1.0;
  q[1] -= 1.5;
  const x = abs(q[0]);
  let y = q[1];
  let z = q[2];
  y = 4.0 + y * 1.2 - x * sqrt(max((20.0 - x) / 15.0, 0.0));
  z *= 2.0 - y / 15.0;
  const d = sqrt(x * x + y * y + z * z) - r;
  // d = d / 2.0;
  if (d < res[0]) {
    res = [d, 1.0];
  }
  // res[0] /= 100.0;
  return d;
}

const tempMat3_1 = mat3.create();
const tempMat3_2 = mat3.create();
function rotationXY(angle: number[] | vec2) {
  const c = [cos(angle[0]), cos(angle[1])];
  const s = [sin(angle[0]), sin(angle[1])];
  return mat3.set(
    tempMat3_1,
    c[1],
    0.0,
    -s[1],
    s[1] * s[0],
    c[0],
    c[1] * s[0],
    s[1] * c[0],
    -s[0],
    c[1] * c[0],
  );
}

function sdPetal(pos: vec3, s: number) {
  const p = [pos[0] * 0.8 + 0.1, pos[1] * 1.1, pos[2] * 0.8];
  const q: vec2 = [vec2.length([p[0], p[2]]), p[1]];

  let lower = vec2.length(q) - 1.05;
  lower = max(-1 * (vec2.length(q) - 0.95), lower);
  lower = max(lower, q[1]);

  let upper = vec2.length([(q[0] - s) * 1.05, (q[1] - 0) * 1.25]) + 1.0 - s;
  upper = max(-upper, vec2.length([(q[0] - s) * 1, (q[1] - 0) * 1]) + 0.95 - s);
  upper = max(upper, -q[1]);
  upper = max(upper, q[0] - 2.0);

  const region = vec3.length([p[0] - 1, p[1], p[2]]) - 1.0;
  return max(min(upper, lower), region);
}

export function flower(p: vec3) {
  let d = 1000.0;
  let s = 2.0;
  let r = rotationXY([0.1, PI2 * 0.618034]);
  mat3.set(tempMat3_2, 1.08, 0.0, 0.0, 0.0, 0.995, 0.0, 0.0, 0.0, 1.08);
  r = mat3.mul(r, r, tempMat3_2);
  for (let i = 0; i < 19; i++) {
    d = min(d, sdPetal(p, s));
    p = vec3.transformMat3(p as vec3, p, r);
    p[1] += -0.03;
    s *= 1.05;
  }
  return d;
}
