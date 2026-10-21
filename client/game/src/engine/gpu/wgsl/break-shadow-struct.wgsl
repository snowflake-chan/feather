@group(0) @binding(0) var<uniform> shadowUniform : ShadowUniform;

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

@group(1) @binding(0) var<uniform> uni : Uniform;

const PI = 3.1415926535897932384626433832795;
const PI2 = PI * 2.;
const BLOCK_SIZE = 0.08;
const BLOCK_SPEED = 0.3;
const BLOCK_SHAPE = 1. - 2. * BLOCK_SIZE;
const SPIN_SPEED = 0.11;
const GRAVITY = 0.1;
const LIFETIME = 8.;

const BLOCK_COLOR_SIZE = 16.0;
