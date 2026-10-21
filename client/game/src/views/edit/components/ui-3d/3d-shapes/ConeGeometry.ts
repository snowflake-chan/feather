import { vec3, vec2 } from 'gl-matrix';
export function ConeGeometry(
  cosA: number,
  height: number,
  radialSegments: number,
) {
  const indices: vec3[] = [];
  const vertices: vec3[] = [];
  const normals: vec3[] = [];

  const h = height;
  const l = h / cosA;
  const r = Math.sqrt(l * l - h * h);

  const theta = (2 * Math.PI) / radialSegments;
  const slope = r / h;
  vertices.push(vec3.clone([0, h, 0]));
  vertices.push(vec3.clone([0, 0, 0]));
  normals.push(vec3.clone([0, 1, 0]));
  normals.push(vec3.clone([0, -1, 0]));
  for (let i = 0; i < radialSegments; i++) {
    const sinThetaR = Math.sin(theta * i) * r;
    const cosThetaR = Math.cos(theta * i) * r;

    vertices.push(vec3.clone([sinThetaR, 0, cosThetaR]));
    normals.push(vec3.clone([sinThetaR, slope, cosThetaR]));
  }

  for (let i = 2; i < vertices.length; i++) {
    if (i + 1 < vertices.length) {
      indices.push(vec3.clone([i, i + 1, 0]));
    } else {
      indices.push(vec3.clone([i, 2, 0]));
    }
  }
  for (let i = 2; i < vertices.length; i++) {
    if (i + 1 < vertices.length) {
      indices.push(vec3.clone([i, 1, i + 1]));
    } else {
      indices.push(vec3.clone([i, 1, 2]));
    }
  }

  return {
    vertices,
    normals,
    indices,
  };
}
