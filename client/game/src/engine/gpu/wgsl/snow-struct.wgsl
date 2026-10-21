struct Uniform {
  time : f32,
  positionRange : vec3f,
  fallSpeed : f32,
  spinSpeed : f32,
  color : vec4f,
  size : vec2f,
  matrix : mat4x4 < f32>,
}

@group(1) @binding(0) var<uniform> uni : Uniform;
@group(1) @binding(1) var snowSampler : sampler;
@group(1) @binding(2) var snowTexture : texture_2d<f32>;

@group(2) @binding(0) var voxelHeight : texture_2d<f32>;

var<private> points: array<vec2f, 6> = array<vec2f, 6> (
vec2f(-1., 1.),
vec2f(1., 1.),
vec2f(-1., -1.),
vec2f(-1., -1.),
vec2f(1., 1.),
vec2f(1., -1.),
);

var<private> uvs: array<vec2f, 6> = array<vec2f, 6> (
vec2f(0., 0.),
vec2f(1., 0.),
vec2f(0., 1.),
vec2f(0., 1.),
vec2f(1., 0.),
vec2f(1., 1.),
);

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) worldPos : vec3f,
  @location(1) uv : vec2f,
  @location(2) voxelXZ: vec2f,
  @location(3) voxelY: f32,
};
