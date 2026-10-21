fn vertMain(@location(0) s0 : vec4f) -> VertexOutput {
  var result : VertexOutput;

  var blockPos = s0.xyz * 255.;
  var lodPos = CHUNK_SIZE * uni.chunkId + blockPos;

  result.position = shadowUniform.viewProj * vec4f(lodPos, 1.);

  result.fShadow = result.position.zw;

  return result;
}
