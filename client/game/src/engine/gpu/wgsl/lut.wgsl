fn applyLUT(lut: texture_2d<f32>, lutSampler: sampler, color : vec3f) -> vec3f
{
  let uv = clamp(color.rg, vec2f(0.5 / 16.), vec2f(15.5 / 16.));

  let z = 16. * color.b;
  let zi = floor(z);
  let zf = fract(z);

  let c0 = textureSample(lut, lutSampler, vec2f((uv.r + zi) / 16., uv.g)).rgb;
  let c1 = textureSample(lut, lutSampler, vec2f((uv.r + min(zi + 1., 15.)) / 16., uv.g)).rgb;

  return mix(c0, c1, zf);
}
