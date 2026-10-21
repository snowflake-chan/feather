@group(1) @binding(0) var particleSampler : sampler;
@group(1) @binding(1) var noiseSampler : texture_2d<f32>;

struct Uniform {
  colorSize : array<vec4f, 5>,
  forceNoise : vec4f,
  miscVector : vec4f,
  targetVector : vec4f,
  matrix : mat4x4 < f32>,
}

@group(2) @binding(0) var<uniform> uni : Uniform;

var<private> points: array<vec2f, 6> = array<vec2f, 6> (
vec2f(-1., 1.),
vec2f(1., 1.),
vec2f(-1., -1.),
vec2f(-1., -1.),
vec2f(1., 1.),
vec2f(1., -1.),
);

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) worldPos : vec3f,
  @location(1) fragColor : vec3f,
};
