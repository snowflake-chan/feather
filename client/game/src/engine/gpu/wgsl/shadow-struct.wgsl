struct ShadowUniform {
  viewProj : mat4x4 < f32>,
}

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) fShadow : vec2f,
}
