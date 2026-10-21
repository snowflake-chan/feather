const PI = 3.1415926535897932384626433832795;
const PI2 = PI * 2.;
const BLOCK_SIZE = 0.08;
const BLOCK_SPEED = 0.3;
const BLOCK_SHAPE = 1. - 2. * BLOCK_SIZE;
const SPIN_SPEED = 0.11;
const GRAVITY = 0.1;
const LIFETIME = 8.;

const BLOCK_COLOR_SIZE = 16.0;

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) worldPos : vec3f,
  @location(1) normal : vec3f,
  @location(2) tangentU : vec3f,
  @location(3) tangentV : vec3f,
  @location(4) texCoord : vec2f,
  @location(5) ambientLight : vec4f,
};

struct Uniform {
  time : f32,
  rand : vec2f,
  pos : vec3f,
  texCoordXPos : vec2f,
  texCoordXNeg : vec2f,
  texCoordYPos : vec2f,
  texCoordYNeg : vec2f,
  texCoordZPos : vec2f,
  texCoordZNeg : vec2f,
  ambient : array<vec4f, 8>,
}

@group(0) @binding(1) var breakSampler : sampler;
@group(0) @binding(2) var colorAtlasTexture : texture_2d<f32>;
@group(0) @binding(3) var materialAtlasTexture : texture_2d<f32>;
@group(0) @binding(4) var shadowMap : texture_2d<f32>;
@group(0) @binding(5) var<uniform> shadowData : ShadowData;

@group(1) @binding(0) var<uniform> uni : Uniform;
