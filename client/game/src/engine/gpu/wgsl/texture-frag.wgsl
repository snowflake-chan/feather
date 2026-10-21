fn fragMain(input : VertexOutput) -> @location(0) vec4 < f32> {
  var color = textureSample(gameTexture, gameSampler, input.texcoord);

  var frag : PostFrag;
  frag.color = vec4f(color.rgb / commonUniform.exposure, 0.);
  frag.eye = commonUniform.eye;
  frag.position = vec3f(input.position.xyz);
  return vec4f(outputFragment(frag).rgb, 1.);
}
