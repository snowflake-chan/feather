struct Uniform {
  chunkId : vec3f,
}

@group(0) @binding(0) var<uniform> shadowUniform : ShadowUniform;

@group(1) @binding(0) var<uniform> uni : Uniform;

const CHUNK_SIZE = 32.;
