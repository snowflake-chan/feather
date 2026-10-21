struct Uniform {
  enabled : f32,
  ssao : f32,
  depthOfField : f32,
  playerDepth : f32,
  zNear : f32,
  zFar : f32,
  scattering : f32,
  screenLightPos : vec3f,
  eyeFogExtinction : f32,
  bloom : f32,
  underwater : f32,
  tick : f32,
  lutEnabled : f32,
}

const MAX_BLUR_SIZE = 10.;
const RAD_STEP = 0.5;
const ANGLE_STEP = 2.39996323;
const NUM_RADIAL_BLUR_STEPS = 32;
const OUTLINE_COLOR = vec4f(1., 1., 1., 1.);
