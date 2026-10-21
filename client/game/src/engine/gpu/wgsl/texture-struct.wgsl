struct Uniform {
  m : mat4x4 < f32>,
  width : f32,
  height : f32,
}

@group(1) @binding(0) var<uniform> model : Uniform;

@group(2) @binding(0) var gameSampler : sampler;
@group(2) @binding(1) var gameTexture : texture_2d<f32>;

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) texcoord : vec2f,
};
