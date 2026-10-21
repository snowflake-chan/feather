fn fragMain(@builtin(position) position : vec4f,
@location(0) worldPos : vec3f,
@location(1) fragColor : vec3f,
) -> @location(0) vec4 < f32> {

  var frag : PostFrag;
  frag.color = vec4f(fragColor, 0.);
  frag.eye = commonUniform.eye;
  frag.position = worldPos;

  var color = outputFragment(frag);
  color.a = 0.;
  return color;
}
