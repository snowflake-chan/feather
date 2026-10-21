
struct Uniform {
  gamma : f32,
  shape : vec2f,
}
@group(0) @binding(0) var<uniform> uni : Uniform;

@group(1) @binding(0) var targetTexture : texture_2d<f32>;
@group(1) @binding(1) var scatterSampler : sampler;
