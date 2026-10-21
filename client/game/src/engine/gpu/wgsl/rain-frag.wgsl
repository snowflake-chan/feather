fn fragMain(@builtin(position) position : vec4f,
@location(0) worldPos : vec3f,
@location(1) voxelXZ : vec2f,
@location(2) voxelY : f32,
) -> @location(0) vec4 < f32> {

  //apply height limit
  var heightLimit = uni.positionRange.y * textureSample(voxelHeight, rainSampler, voxelXZ).r;
  if (voxelY < heightLimit)
  {
    discard;
  }

  var frag : PostFrag;
  frag.color = vec4f(uni.color.rgb * commonUniform.color, uni.color.a);
  frag.eye = commonUniform.eye;
  frag.position = worldPos;

  var color = outputFragment(frag);
  return color;
}
