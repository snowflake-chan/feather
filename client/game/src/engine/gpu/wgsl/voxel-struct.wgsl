struct Uniform {
  chunkId : vec3f,
}

@group(1) @binding(0) var voxelSampler : sampler;
@group(1) @binding(1) var colorAtlasTexture : texture_2d<f32>;
@group(1) @binding(2) var materialAtlasTexture : texture_2d<f32>;

@group(2) @binding(0) var<uniform> uni : Uniform;

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) worldPos : vec4f,
  @location(1) texCoordBase : vec2f,
  @location(2) faceNormal : vec3f,
  @location(3) light00 : vec4f,
  @location(4) light01 : vec4f,
  @location(5) light10 : vec4f,
  @location(6) light11 : vec4f,
  @location(7) edgeInfo : vec4f,
};

const BLOCK_BUMP_SIZE = 64.0;
const BLOCK_BUMP_SHIFT = 6.0;
const BLOCK_COLOR_SIZE = 16.0;
const BLOCK_COLOR_SHIFT = 4.0;

const CHUNK_SIZE = 32.;
