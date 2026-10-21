override IS_GLTF = false;

@group(0) @binding(0) var<uniform> shadowUniform : ShadowUniform;

@group(1) @binding(0) var<uniform> model : mat4x4 < f32>;

struct Matrix {
  m : mat4x4 < f32>,
}

@group(2) @binding(0) var<storage, read> nodesMatrix : array<Matrix>;
