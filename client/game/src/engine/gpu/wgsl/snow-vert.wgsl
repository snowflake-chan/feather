fn vertMain(
@builtin(vertex_index) vertexIndex : u32,
@location(0) freqSeed : vec4f,
@location(1) phaseSeed : vec4f
) -> VertexOutput {
  var output : VertexOutput;

  var t = uni.time * 0.2;
  var phase = (2. * 3.14159265) * phaseSeed;
  var freq = 10. * freqSeed;

  //first compute snow position
  var positionXZ = 0.5 * (1. + cos(freq.xz * t * 0.1 + phase.xz));
  var x = (t * uni.fallSpeed + phase.y) * -1000.0;
  var y = uni.positionRange.y;
  var positionY = x - y * floor(x / y);

  output.voxelY = positionY;
  output.voxelXZ = positionXZ;

  //calcualte position
  var position = vec3f(uni.positionRange.x * positionXZ.x, positionY, uni.positionRange.z * positionXZ.y);
  var size = (uni.size.x + uni.size.y * freqSeed.w) / 2.;

  //spin
  var angle = uni.spinSpeed * (t + phase.w);
  var spin = vec2f(cos(angle), sin(angle));

  //根据转速旋转顶点
  var p = points[vertexIndex];
  p = vec2f(p.x * spin.x - p.y * spin.y, p.x * spin.y + p.y * spin.x);

  var pos = uni.matrix * vec4f(p, 0., 1.);
  output.worldPos = vec3f(position + pos.xyz * size);
  output.position = commonUniform.viewProj * vec4f(output.worldPos, 1.);
  output.uv = uvs[vertexIndex];

  return output;
}
