fn fragmentMain(
  input: VertexOutput
) -> @location(0) vec4<f32> {
  let dist = textureSample(fontAtlas, fontSampler, input.uv, input.atlasIdx).r;

  let u_buffer = 192. / 256.;
  let gamma = 1.4142 / 26.;

  let alpha = smoothstep(u_buffer - gamma, u_buffer + gamma, dist);

  if (alpha < 0.01) {
    discard;
  }

  // TODO 文本颜色也应该通过storage传入
  return vec4(1.0, 1.0, 1.0, 1.0);
}