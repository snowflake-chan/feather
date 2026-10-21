struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) fog : vec4f,
  @location(1) faceNormalAmbient : vec4f,
  @location(2) worldPos : vec3f,
};

struct Uniform {
  chunkId : vec3f,
}

@group(1) @binding(0) var voxelSampler : sampler;
@group(1) @binding(1) var waterBumpTexture : texture_2d<f32>;

@group(2) @binding(0) var<uniform> uni : Uniform;

const PI = 3.14159265;
