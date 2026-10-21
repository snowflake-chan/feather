fn vertMain(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4 < f32> {
  return vec4 < f32 > (pos[VertexIndex], 0.0, 1.0);
}
