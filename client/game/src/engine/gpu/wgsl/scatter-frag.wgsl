fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
  var targetColor = textureSample(targetTexture, scatterSampler, position.xy / uni.shape);

  var sample = revertToneMapping(pow(targetColor.rgb, vec3f(uni.gamma)));

  sample = sample * targetColor.a;

  return vec4f(pow(toneMapping(sample), vec3f(1. / uni.gamma)), 1.);
}
