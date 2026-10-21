fn vertMain(
@builtin(vertex_index) vertexIndex : u32,
@location(0) pos : vec4f,
) -> VertexOutput {
  var output : VertexOutput;

  var trajectory = uni.velocity + cos(pos.xyz) * uni.interference;
  var dropLen = 10. * step(pos.w, 0.) * (uni.rainLength.x + (pos.w - uni.rainLength.y * floor(pos.w / uni.rainLength.y)));

  var x = pos.xyz - uni.time * trajectory;
  var y = uni.positionRange;
  var posStart = x - y * floor(x / y);

  output.worldPos = posStart + dropLen * normalize(trajectory);
  output.position = commonUniform.viewProj * vec4f(output.worldPos, 1.);
  output.voxelXZ = posStart.xz / uni.positionRange.xz;
  output.voxelY = posStart.y;

  return output;
}
