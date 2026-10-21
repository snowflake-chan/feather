override IS_GLTF = false;

@group(0) @binding(0) var<uniform> viewProj : mat4x4 < f32>;

@group(1) @binding(0) var<uniform> model : mat4x4 < f32>;

struct Matrix {
  m : mat4x4 < f32>,
}

@group(2) @binding(0) var<storage, read> nodesMatrix : array<Matrix>;

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) fShadow : vec2f,
}
