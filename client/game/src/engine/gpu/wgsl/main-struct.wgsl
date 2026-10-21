struct CommonUniform {
  eye : vec3f,
  view : mat4x4 < f32>,
  projection : mat4x4 < f32>,
  viewProj : mat4x4 < f32>,
  invView : mat4x4 < f32>,
  invProjection : mat4x4 < f32>,
  invViewProj : mat4x4 < f32>,
  viewport : vec2f,
  timeOfDay : f32,
  now : f32,

  direction : vec3f,
  color : vec3f,
  skyLeft : vec3f,
  skyRight : vec3f,
  skyTop : vec3f,
  skyBottom : vec3f,
  skyFront : vec3f,
  skyBack : vec3f,
  globalLight : f32,

  gamma : f32,
  exposure : f32,
  fogParams : vec4f,
  fogParams2 : vec4f,
  fogParams3 : vec4f,

  invExposure : f32,

  atlasRadius : f32,

  oitNodesBufferSize : f32,
}

struct FragmentData {
  color : u32,
  depth : f32,
}

struct StaticNode {
  data : FragmentData,
  next : u32,
}

@group(0) @binding(0) var<uniform> commonUniform : CommonUniform;

struct SurfaceProperties {
  position : vec3f,
  normal : vec3f,
  faceU : vec3f,
  faceV : vec3f,
  albedo : vec3f,
  light00 : vec4f,
  light01 : vec4f,
  light10 : vec4f,
  light11 : vec4f,
  emissive : f32,
  ao : f32,
  shadow : f32
};

struct PostFrag {
  eye : vec3f,
  position : vec3f,
  color : vec4f,
};
