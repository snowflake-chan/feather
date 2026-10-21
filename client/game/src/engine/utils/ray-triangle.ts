import { vec3 } from 'gl-matrix';

// Möller-Trumbore algorithm
export function rayTriangle (tri:vec3[]|number[][], ray:{origin:vec3|number[], dir:vec3|number[]}) {
  const EPSILON = 0.000001;
  const edge1 = vec3.create();
  const edge2 = vec3.create();
  const tvec = vec3.create();
  const pvec = vec3.create();
  const qvec = vec3.create();

  vec3.subtract(edge1, tri[1], tri[0]);
  vec3.subtract(edge2, tri[2], tri[0]);

  vec3.cross(pvec, ray.dir, edge2);

  const det = vec3.dot(edge1, pvec);
  if (det < EPSILON) {
    return null;
  }
  vec3.subtract(tvec, ray.origin, tri[0]);
  const u = vec3.dot(tvec, pvec);
  if (u < 0 || u > det) {
    return null;
  }
  vec3.cross(qvec, tvec, edge1);
  const v = vec3.dot(ray.dir, qvec);
  if (v < 0 || u + v > det) {
    return null;
  }

  const t = vec3.dot(edge2, qvec) / det;

  return t;
}