fn outputFragment(frag : PostFrag) -> vec4f {
  var fragColor = applyFog(frag);
  var rgb = toneMapping(commonUniform.exposure * fragColor.rgb);
  rgb = pow(rgb, vec3f(1. / commonUniform.gamma));
  return vec4f(rgb, fragColor.a);
}
