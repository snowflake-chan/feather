fn vertMain(
@builtin(vertex_index) VertexIndex : u32
) -> VertexOutput {
  var output : VertexOutput;
  output.position = vec4 < f32 > (pos[VertexIndex], 0.999, 1.0);
  output.uv = pos[VertexIndex];
  return output;
}
