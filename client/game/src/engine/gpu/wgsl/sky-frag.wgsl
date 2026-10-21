fn fragMain(input : VertexOutput) -> @location(0) vec4 < f32> {
  let farRay = commonUniform.invViewProj * vec4f(input.uv, 1., 1.);
  let nearRay = commonUniform.invViewProj * vec4f(input.uv, 0., 1.);
  let viewDir = normalize(farRay.xyz * nearRay.w - nearRay.xyz * farRay.w);

  let color = sampleAtmosphere(
  viewDir,
  commonUniform.timeOfDay,
  commonUniform.now,
  nightSampler,
  cloudSamplerCube);

  var frag : PostFrag;
  frag.color = vec4f(revertToneMapping(color) / commonUniform.exposure / 1.5, 1.0);
  frag.position = farRay.xyz / farRay.w;
  frag.eye = commonUniform.eye;

  return outputFragment(frag);
}
