fn vertMain(
@location(0) pos : vec2f,
@location(1) uv : vec2f
) -> VertexOutput {
  var output : VertexOutput;
  output.position = commonUniform.viewProj * model.m * vec4f(pos.x * model.width, pos.y * model.height, 0., 1.0);
  output.texcoord = uv;
  return output;
}
