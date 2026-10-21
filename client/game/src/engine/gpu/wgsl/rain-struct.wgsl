struct Uniform {
  time : f32,
  velocity : vec3f,
  positionRange : vec3f,
  interference : f32,
  rainLength : vec2f,
  color : vec4f,
}

@group(0) @binding(1) var<uniform> uni : Uniform;

@group(1) @binding(0) var voxelHeight : texture_2d<f32>;
@group(1) @binding(1) var rainSampler : sampler;

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) worldPos : vec3f,
  @location(1) voxelXZ : vec2f,
  @location(2) voxelY : f32,
};
