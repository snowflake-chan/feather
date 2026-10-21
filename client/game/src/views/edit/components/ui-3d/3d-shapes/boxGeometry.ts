import { vec4, vec2 } from 'gl-matrix';

export function BoxGeometry() {
  const r = 0.5;
  const vertices: vec4[] = []; // x,y,z,normalCode
  const uvs: vec2[] = [];
  // -y
  vertices.push(
    vec4.clone([r, -r, r, 2]),
    vec4.clone([-r, -r, r, 2]),
    vec4.clone([-r, -r, -r, 2]),
    vec4.clone([r, -r, r, 2]),
    vec4.clone([-r, -r, -r, 2]),
    vec4.clone([r, -r, -r, 2]),
  );
  uvs.push(
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
  );
  // x
  vertices.push(
    vec4.clone([r, -r, r, 1]),
    vec4.clone([r, -r, -r, 1]),
    vec4.clone([r, r, -r, 1]),
    vec4.clone([r, -r, r, 1]),
    vec4.clone([r, r, -r, 1]),
    vec4.clone([r, r, r, 1]),
  );
  uvs.push(
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
  );
  // z
  vertices.push(
    vec4.clone([r, -r, r, 5]),
    vec4.clone([-r, r, r, 5]),
    vec4.clone([-r, -r, r, 5]),
    vec4.clone([r, -r, r, 5]),
    vec4.clone([r, r, r, 5]),
    vec4.clone([-r, r, r, 5]),
  );
  uvs.push(
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
  );
  // y
  vertices.push(
    vec4.clone([-r, r, -r, 3]),
    vec4.clone([-r, r, r, 3]),
    vec4.clone([r, r, r, 3]),
    vec4.clone([-r, r, -r, 3]),
    vec4.clone([r, r, r, 3]),
    vec4.clone([r, r, -r, 3]),
  );
  uvs.push(
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
  );
  // -x
  vertices.push(
    vec4.clone([-r, r, -r, 0]),
    vec4.clone([-r, -r, -r, 0]),
    vec4.clone([-r, -r, r, 0]),
    vec4.clone([-r, r, -r, 0]),
    vec4.clone([-r, -r, r, 0]),
    vec4.clone([-r, r, r, 0]),
  );
  uvs.push(
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
  );
  // -z
  vertices.push(
    vec4.clone([-r, r, -r, 4]),
    vec4.clone([r, r, -r, 4]),
    vec4.clone([r, -r, -r, 4]),
    vec4.clone([-r, r, -r, 4]),
    vec4.clone([r, -r, -r, 4]),
    vec4.clone([-r, -r, -r, 4]),
  );
  uvs.push(
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
  );
  return {
    vertices,
    uvs,
  };
}

export function BoxWireFrameGeometry() {
  const lines: vec4[] = []; // x, y, z, normalCode
  const r = 0.5;
  // -y
  lines.push(
    vec4.clone([r, -r, r, 2]),
    vec4.clone([-r, -r, r, 2]),
    vec4.clone([-r, -r, r, 2]),
    vec4.clone([-r, -r, -r, 2]),
    vec4.clone([-r, -r, -r, 2]),
    vec4.clone([r, -r, -r, 2]),
    vec4.clone([r, -r, -r, 2]),
    vec4.clone([r, -r, r, 2]),
  );
  // x
  lines.push(
    vec4.clone([r, -r, r, 1]),
    vec4.clone([r, -r, -r, 1]),
    vec4.clone([r, -r, -r, 1]),
    vec4.clone([r, r, -r, 1]),
    vec4.clone([r, r, -r, 1]),
    vec4.clone([r, r, r, 1]),
    vec4.clone([r, r, r, 1]),
    vec4.clone([r, -r, r, 1]),
  );
  // z
  lines.push(
    vec4.clone([r, -r, r, 5]),
    vec4.clone([-r, -r, r, 5]),
    vec4.clone([-r, -r, r, 5]),
    vec4.clone([-r, r, r, 5]),
    vec4.clone([-r, r, r, 5]),
    vec4.clone([r, r, r, 5]),
    vec4.clone([r, r, r, 5]),
    vec4.clone([r, -r, r, 5]),
  );
  // y
  lines.push(
    vec4.clone([-r, r, -r, 3]),
    vec4.clone([-r, r, r, 3]),
    vec4.clone([-r, r, r, 3]),
    vec4.clone([r, r, r, 3]),
    vec4.clone([r, r, r, 3]),
    vec4.clone([r, r, -r, 3]),
    vec4.clone([r, r, -r, 3]),
    vec4.clone([-r, r, -r, 3]),
  );
  // -x
  lines.push(
    vec4.clone([-r, r, -r, 0]),
    vec4.clone([-r, r, r, 0]),
    vec4.clone([-r, r, r, 0]),
    vec4.clone([-r, -r, r, 0]),
    vec4.clone([-r, -r, r, 0]),
    vec4.clone([-r, -r, -r, 0]),
    vec4.clone([-r, -r, -r, 0]),
    vec4.clone([-r, r, -r, 0]),
  );
  // -z
  lines.push(
    vec4.clone([-r, r, -r, 4]),
    vec4.clone([r, r, -r, 4]),
    vec4.clone([r, r, -r, 4]),
    vec4.clone([r, -r, -r, 4]),
    vec4.clone([r, -r, -r, 4]),
    vec4.clone([-r, -r, -r, 4]),
    vec4.clone([-r, -r, -r, 4]),
    vec4.clone([-r, r, -r, 4]),
  );
  return lines;
}
