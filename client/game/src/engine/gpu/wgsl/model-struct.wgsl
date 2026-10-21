struct Uniform {
  m : mat4x4 < f32>,
  normalMat : mat3x3 < f32>,
  lo : vec3f,
  hi : vec3f,
  ambientLight : array<vec4f, 8>,
  colorMod : vec4f,
  pbrMod : vec3f,
}
struct Matrix {
  m : mat4x4 < f32>,
}

override IS_GLTF = false;

@group(1) @binding(0) var<uniform> model : Uniform;

@group(2) @binding(0) var<storage, read> nodesMatrix : array<Matrix>;
@group(2) @binding(1) var<storage, read> nodesAlpha : array<f32>;
@group(2) @binding(2) var modelSampler : sampler;
@group(2) @binding(3) var modelTexture : texture_2d<f32>;

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) texcoord : vec2f,
  @location(1) normal : vec3f,
  @location(2) ambient : vec4f,
  @location(3) alpha : f32,
  @location(4) worldPos : vec3f,
};
