struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) uv : vec2f,
};

@group(1) @binding(0) var skySampler : sampler;
@group(1) @binding(1) var nightSampler : texture_2d<f32>;
@group(1) @binding(2) var cloudSamplerCube : texture_cube < f32>;

const PI = 3.1415926535;

fn normalToParaboloid(n : vec3f) -> vec2f {
  return n.xz * (0.5 / (1. + n.y)) + 0.5;
}
fn lerp(x : vec3f, y : vec3f, t : f32) -> vec3f {
  return (1.0 - t) * x + t * y;
}
